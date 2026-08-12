(() => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));

  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const success = form.querySelector('.form-success');
      success.classList.add('show');
      form.reset();
    });
  }

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }
})();
