/* Dynamic effects: scroll-reveal, sticky header shadow, smooth interactions.
   Respects prefers-reduced-motion. No inline styles (CSP safe). */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* --- Sticky header shadow on scroll --- */
  var top = document.querySelector('.top');
  if (top) {
    var onScroll = function () {
      if (window.scrollY > 10) top.classList.add('scrolled');
      else top.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Scroll-reveal for sections and cards --- */
  var revealEls = [];

  /* Mark all sections for reveal */
  document.querySelectorAll('.section').forEach(function (el) {
    el.classList.add('reveal');
    revealEls.push(el);
  });

  /* Mark card grids for stagger */
  document.querySelectorAll('.cells, .steps').forEach(function (el) {
    el.classList.add('stagger');
    revealEls.push(el);
  });

  /* Mark individual items */
  document.querySelectorAll('.types, .panel-box, table, .final .btn-primary').forEach(function (el) {
    el.classList.add('reveal');
    revealEls.push(el);
  });

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    /* Fallback: show everything */
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- Typing effect on hero heading (optional enhancement) --- */
  var heroH = document.getElementById('hero-h');
  if (heroH) {
    var caret = heroH.querySelector('.caret');
    if (caret) {
      /* Make caret yellow and blinking */
      caret.style.cssText = '';
    }
  }

  /* --- Smooth counter for "How it works" step numbers --- */
  document.querySelectorAll('.steps > li').forEach(function (li, i) {
    li.style.transitionDelay = (i * 0.12) + 's';
  });

})();
