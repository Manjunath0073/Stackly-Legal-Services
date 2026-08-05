/* ============================================================
   STACKLY LEGAL SERVICES — PRACTICE AREAS PAGE JAVASCRIPT
   Counters, accordion, timeline animation, testimonials slider
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

  var overviewSection = document.querySelector('.pa-overview');
  if (overviewSection) counterObserver.observe(overviewSection);

  var solutionsSection = document.querySelector('.pa-solutions');
  if (solutionsSection) counterObserver.observe(solutionsSection);

  /* ---------- FAQ Accordion ---------- */
  var faqItems = document.querySelectorAll('.pa-faq__item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.pa-faq__question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (i) {
        i.classList.remove('active');
        i.querySelector('.pa-faq__question').setAttribute('aria-expanded', 'false');
        var answer = i.querySelector('.pa-faq__answer');
        if (answer) answer.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        var answer = item.querySelector('.pa-faq__answer');
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

  /* ---------- Process Timeline Animation ---------- */
  var processTimeline = document.querySelector('.pa-process__timeline');
  if (processTimeline) {
    var timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          processTimeline.classList.add('animate');
          var steps = processTimeline.querySelectorAll('.pa-process__step');
          steps.forEach(function (step, i) {
            setTimeout(function () {
              step.classList.add('active');
            }, i * 300);
          });
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(processTimeline);
  }

  /* ---------- Testimonials Slider ---------- */
  var track = document.querySelector('.pa-testimonials__track');
  var dots = document.querySelectorAll('.pa-testimonials__dot');
  var slides = document.querySelectorAll('.pa-testimonials__card');
  var currentSlide = 0;
  var autoSlideInterval;

  function goToSlide(index) {
    if (!track || slides.length === 0) return;
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    dots.forEach(function (dot, i) {
      var active = i === currentSlide;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  if (dots.length > 0 && slides.length > 0) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
        resetAutoSlide();
      });
    });

    var prevBtn = document.querySelector('.pa-testimonials__prev');
    var nextBtn = document.querySelector('.pa-testimonials__next');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
      });
    }

    function startAutoSlide() {
      autoSlideInterval = setInterval(function () {
        goToSlide(currentSlide + 1);
      }, 6000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    startAutoSlide();
    goToSlide(0);
  }

  /* ---------- Touch swipe for testimonials ---------- */
  if (track) {
    var startX = 0;
    var isDragging = false;

    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      var endX = e.changedTouches[0].clientX;
      var diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
        resetAutoSlide();
      }
      isDragging = false;
    }, { passive: true });
  }

  /* ---------- Practice Card Keyboard Support ---------- */
  var paCards = document.querySelectorAll('.pa-card');
  paCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------- Industry Card Keyboard Support ---------- */
  var industryCards = document.querySelectorAll('.pa-industry');
  industryCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------- Case Card Keyboard Support ---------- */
  var caseCards = document.querySelectorAll('.pa-case');
  caseCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

})();
