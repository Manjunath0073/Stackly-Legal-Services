/* ============================================================
   STACKLY LEGAL SERVICES — ATTORNEYS PAGE JAVASCRIPT
   Counters, testimonial slider, animations, keyboard support
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

  var achievementsSection = document.querySelector('.at-achievements');
  if (achievementsSection) counterObserver.observe(achievementsSection);

  /* ---------- Testimonials Slider ---------- */
  var track = document.querySelector('.at-testimonials__track');
  var dots = document.querySelectorAll('.at-testimonials__dot');
  var slides = document.querySelectorAll('.at-testimonials__card');
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

    var prevBtn = document.querySelector('.at-testimonials__prev');
    var nextBtn = document.querySelector('.at-testimonials__next');
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

  /* ---------- Touch Swipe for Testimonials ---------- */
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

  /* ---------- Keyboard Support for Testimonials ---------- */
  var testimonialSlider = document.querySelector('.at-testimonials__slider');
  if (testimonialSlider) {
    testimonialSlider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
      }
    });
  }

  /* ---------- Leader Card Keyboard Support ---------- */
  var leaderCards = document.querySelectorAll('.at-leader');
  leaderCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var profileBtn = card.querySelector('.at-leader__btn');
        if (profileBtn) profileBtn.click();
      }
    });
  });

  /* ---------- Expert Card Keyboard Support ---------- */
  var expertCards = document.querySelectorAll('.at-expert');
  expertCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var contactBtn = card.querySelector('.at-expert__btn');
        if (contactBtn) contactBtn.click();
      }
    });
  });

  /* ---------- Badge Hover Animation ---------- */
  var badges = document.querySelectorAll('.at-badge');
  badges.forEach(function (badge) {
    badge.addEventListener('mouseenter', function () {
      badge.style.transform = 'translateY(-2px)';
    });
    badge.addEventListener('mouseleave', function () {
      badge.style.transform = 'translateY(0)';
    });
  });

  /* ---------- Achievement Card Hover Glow ---------- */
  var achievements = document.querySelectorAll('.at-achievement');
  achievements.forEach(function (achievement) {
    achievement.addEventListener('mouseenter', function () {
      achievement.style.boxShadow = '0 0 30px rgba(200, 169, 107, 0.15)';
    });
    achievement.addEventListener('mouseleave', function () {
      achievement.style.boxShadow = 'none';
    });
  });

  /* ---------- Smooth Parallax on Hero (reduced motion safe) ---------- */
  if (!prefersReducedMotion) {
    var heroBg = document.querySelector('.at-hero__bg img');
    if (heroBg) {
      window.addEventListener('scroll', function () {
        var scrolled = window.scrollY;
        if (scrolled < 800) {
          heroBg.style.transform = 'translateY(' + (scrolled * 0.15) + 'px) scale(1.05)';
        }
      }, { passive: true });
    }
  }

})();
