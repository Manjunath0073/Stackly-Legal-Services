/* ============================================================
   STACKLY LEGAL SERVICES — ABOUT PAGE JAVASCRIPT
   Counters, accordion, timeline animation, gallery interactions
   ============================================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Counter Animation ---------- */
  function animateCounter(el, duration) {
    duration = duration || 2000;
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if (isNaN(target)) return;

    var start = performance.now();
    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(ease * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + target.toLocaleString() + suffix;
    }
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var counters = entry.target.querySelectorAll('[data-counter]');
        counters.forEach(function (counter) {
          animateCounter(counter, 2000);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var heroSection = document.querySelector('.about-hero');
  if (heroSection) counterObserver.observe(heroSection);

  var awardsSection = document.querySelector('.awards');
  if (awardsSection) counterObserver.observe(awardsSection);

  /* ---------- FAQ Accordion ---------- */
  var faqItems = document.querySelectorAll('.about-faq__item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.about-faq__question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (i) {
        i.classList.remove('active');
        i.querySelector('.about-faq__question').setAttribute('aria-expanded', 'false');
        var answer = i.querySelector('.about-faq__answer');
        if (answer) answer.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        var answer = item.querySelector('.about-faq__answer');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });

    question.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ---------- Journey Timeline Line Animation ---------- */
  var journeyTimeline = document.querySelector('.journey__timeline');
  if (journeyTimeline) {
    var timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          journeyTimeline.classList.add('animate');
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(journeyTimeline);
  }

  /* ---------- Culture Gallery Touch Support ---------- */
  var cultureItems = document.querySelectorAll('.culture__item');
  cultureItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 768) return;
      var caption = item.querySelector('.culture__caption');
      if (caption) {
        caption.style.transform = 'translateY(0)';
        caption.style.opacity = '1';
      }
    });

    item.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 768) return;
      var caption = item.querySelector('.culture__caption');
      if (caption) {
        caption.style.transform = 'translateY(20px)';
        caption.style.opacity = '0';
      }
    });
  });

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var header = document.getElementById('header');
        var headerOffset = header ? header.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  /* ---------- Leadership Card Keyboard Support ---------- */
  var leadershipCards = document.querySelectorAll('.leadership__card');
  leadershipCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------- Values Card Keyboard Support ---------- */
  var valueCards = document.querySelectorAll('.values__card');
  valueCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

})();
