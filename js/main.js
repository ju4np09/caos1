(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAGE_DURATION = prefersReducedMotion ? 10 : 720;

  const pageLayers = document.getElementById('page-layers');
  const hero = document.querySelector('.hero');
  const closing = document.querySelector('.closing');
  const nextBtn = document.getElementById('page-next');
  const prevBtn = document.getElementById('page-prev');
  const navLinks = document.querySelectorAll('[data-page]');

  let currentPage = 1;
  let isTransitioning = false;
  let closingRevealed = false;

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });

  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add('is-visible');
      hero.querySelectorAll('[data-scroll]').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-visible'), i * 120);
      });
    });
  }

  function revealClosingContent() {
    if (closingRevealed || !closing) return;
    closingRevealed = true;
    closing.querySelectorAll('[data-scroll]').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), i * 110);
    });
  }

  function applyPageState(page) {
    const onPage2 = page === 2;

    document.body.classList.toggle('is-page-2', onPage2);
    pageLayers.classList.toggle('is-page-2', onPage2);
    hero.setAttribute('aria-hidden', onPage2 ? 'true' : 'false');
    closing.setAttribute('aria-hidden', onPage2 ? 'false' : 'true');
    nextBtn.hidden = onPage2;
    prevBtn.hidden = !onPage2;

    navLinks.forEach((link) => {
      const linkPage = Number(link.dataset.page);
      link.classList.toggle('is-active', linkPage === page);
      link.setAttribute('aria-current', linkPage === page ? 'page' : 'false');
    });

    header.classList.toggle('is-page-2', onPage2);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goToPage(page) {
    if (isTransitioning || (page !== 1 && page !== 2) || page === currentPage) return;

    isTransitioning = true;
    currentPage = page;

    requestAnimationFrame(() => {
      applyPageState(page);
      if (page === 2) revealClosingContent();
      setTimeout(() => { isTransitioning = false; }, PAGE_DURATION);
    });
  }

  nextBtn?.addEventListener('click', () => goToPage(2));
  prevBtn?.addEventListener('click', () => goToPage(1));

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goToPage(Number(link.dataset.page));
    });
  });

  if (!prefersReducedMotion) {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);

      if (dy > 80) return;
      if (dx > 70) goToPage(2);
      if (dx < -70) goToPage(1);
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goToPage(2);
    if (e.key === 'ArrowLeft') goToPage(1);
  });

  applyPageState(1);
})();