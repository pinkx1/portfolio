'use strict';
const faqFiles = [...document.querySelectorAll('.faq-file')];
faqFiles.forEach(file => {
  const button = file.querySelector('.faq-question');
  button.addEventListener('click', () => {
    const opening = button.getAttribute('aria-expanded') !== 'true';
    faqFiles.forEach(item => {
      const expanded = item === file && opening;
      item.classList.toggle('is-open', expanded);
      item.querySelector('.faq-question').setAttribute('aria-expanded', String(expanded));
      item.querySelector('.faq-answer').inert = !expanded;
    });
  });
  const card = file.querySelector('.faq-card');
  new ResizeObserver(() => {
    file.querySelector('.faq-dim').textContent = `${Math.round(card.offsetWidth)} × ${Math.round(card.offsetHeight)}`;
  }).observe(card);
});
