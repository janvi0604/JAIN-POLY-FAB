import { access, cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(projectRoot, 'dist');
const expectedOutput = path.resolve(projectRoot, 'dist');

if (outputDirectory !== expectedOutput || !outputDirectory.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error(`Refusing to build outside the project: ${outputDirectory}`);
}

const coreFiles = ['index.html', 'styles.css', 'script.js'];
for (const file of coreFiles) await access(path.join(projectRoot, file));

await mkdir(outputDirectory, { recursive: true });
for (const file of coreFiles) await cp(path.join(projectRoot, file), path.join(outputDirectory, file));
await cp(path.join(projectRoot, 'public'), path.join(outputDirectory, 'public'), { recursive: true });

const html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
const allIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const ids = new Set(allIds);
if (ids.size !== allIds.length) throw new Error('Duplicate HTML id attributes found');
const fragmentLinks = [...html.matchAll(/\bhref="#([^"]+)"/g)].map(match => match[1]);
const brokenFragments = fragmentLinks.filter(fragment => !ids.has(fragment));
if (brokenFragments.length) throw new Error(`Broken section links: ${brokenFragments.join(', ')}`);

let checkedAssets = 0;
const assetAttributes = [...html.matchAll(/\b(?:src|href)="(public\/[^"#?]+|styles\.css|script\.js)"/g)];
for (const [, asset] of assetAttributes) {
  const assetPath = path.resolve(outputDirectory, asset);
  if (!assetPath.startsWith(`${outputDirectory}${path.sep}`)) throw new Error(`Unsafe asset path: ${asset}`);
  await access(assetPath);
  checkedAssets += 1;
}

const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
const missingAlt = images.filter(image => !/\balt="[^"]+"/.test(image));
if (missingAlt.length) throw new Error(`${missingAlt.length} image(s) are missing descriptive alt text`);

const imageDirectory = path.join(outputDirectory, 'public', 'images');
const imageFiles = [];
for (const name of await readdir(imageDirectory)) {
  if ((await stat(path.join(imageDirectory, name))).isFile()) imageFiles.push(name);
}
if (imageFiles.length === 0) throw new Error('The production build has no image assets');

await access(path.join(outputDirectory, 'styles.css'));
await access(path.join(outputDirectory, 'script.js'));
const css = await readFile(path.join(outputDirectory, 'styles.css'), 'utf8');
let braceDepth = 0;
for (const character of css) {
  if (character === '{') braceDepth += 1;
  if (character === '}') braceDepth -= 1;
  if (braceDepth < 0) throw new Error('CSS contains an unmatched closing brace');
}
if (braceDepth !== 0) throw new Error('CSS contains unmatched braces');
execFileSync(process.execPath, ['--check', path.join(outputDirectory, 'script.js')], { stdio: 'pipe' });
execFileSync(process.execPath, ['--check', path.join(projectRoot, 'server.mjs')], { stdio: 'pipe' });
process.stdout.write(`Build complete: ${outputDirectory}\nValidated ${checkedAssets} local assets, ${fragmentLinks.length} section links, and ${images.length} image descriptions.\n`);
