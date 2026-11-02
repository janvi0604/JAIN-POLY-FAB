(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const form = document.querySelector('#inquiry-form');
  const status = document.querySelector('#form-status');
  const productDialog = document.querySelector('#product-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogDescription = document.querySelector('#dialog-description');
  const dialogImage = document.querySelector('#dialog-image');

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
    nav.querySelectorAll('.nav-products[open]').forEach(menu => { menu.open = false; });
  };

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
    closeMenu();
  }));
  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  document.querySelectorAll('[data-product]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const select = form.elements.product;
    const product = link.dataset.product;
    for (const option of select.options) if (option.text === product) select.value = product;
    dialogTitle.textContent = product;
    dialogDescription.textContent = link.dataset.description;
    const cardImage = link.querySelector('img');
    dialogImage.src = cardImage.src;
    dialogImage.alt = cardImage.alt;
    if (typeof productDialog.showModal === 'function') productDialog.showModal();
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => productDialog.close());
  document.querySelector('#dialog-enquire').addEventListener('click', () => productDialog.close());
  productDialog.addEventListener('click', event => {
    if (event.target === productDialog) productDialog.close();
  });

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
