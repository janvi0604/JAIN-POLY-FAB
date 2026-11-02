# Jain Poly Fab

A responsive, static corporate website for Jain Poly Fab Private Limited.

## Run locally

Requires Node.js. Install no dependencies. From this folder, run:

```powershell
npm start
```

Then open <http://localhost:4173> in a browser. Set the `PORT` environment variable to use a different port.

## Production build

```powershell
npm run build
npm run preview
```

The build writes the static site to `dist/` and checks local assets, section links, and image alt text.

To preview from a phone on the same Wi-Fi, run `node server.mjs 0.0.0.0`, then open `http://<this-PC's-IPv4-address>:4173` on the phone. Windows Firewall may need to allow Node.js on private networks.

The inquiry form validates its fields and prepares an email addressed to the company. It does not require a server-side service.
