(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const form = document.querySelector('#inquiry-form');
  const status = document.querySelector('#form-status');

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
  }));

  document.querySelectorAll('[data-product]').forEach(link => link.addEventListener('click', () => {
    const select = form.elements.product;
    const product = link.dataset.product;
    for (const option of select.options) if (option.text === product) select.value = product;
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Packaging enquiry${data.get('product') ? ` - ${data.get('product')}` : ''}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Company: ${data.get('company') || 'Not provided'}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone') || 'Not provided'}`,
      `Product interest: ${data.get('product') || 'Not specified'}`,
      '',
      'Message:',
      data.get('message')
    ].join('\n');
    status.textContent = 'Opening your email app with the enquiry details. If it does not open, email jainpolyfab12@gmail.com.';
    window.location.href = `mailto:jainpolyfab12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
})();
