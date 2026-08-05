/* ============================================================
   STACKLY LEGAL SERVICES — HOMEPAGE JAVASCRIPT
   Counters, accordion, testimonials slider, process line, stats
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Counter Animation ---------- */
  function animateCounter(el, duration = 2000) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    if (isNaN(target)) return;

    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(ease * target);
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

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-counter]');
        counters.forEach(counter => animateCounter(counter, 2000));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) counterObserver.observe(statsSection);

  const heroStatsSection = document.querySelector('.hero__stats');
  if (heroStatsSection) counterObserver.observe(heroStatsSection);

  const spotlightBadge = document.querySelector('.spotlight__badge');
  if (spotlightBadge) counterObserver.observe(spotlightBadge);

  /* ---------- Circular Progress ---------- */
  const circleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circles = entry.target.querySelectorAll('.stats__circle-fill');
        circles.forEach(circle => {
          const value = parseInt(circle.getAttribute('data-value'), 10) || 0;
          const circumference = 2 * Math.PI * 60; // r=60
          const offset = circumference - (value / 100) * circumference;
          if (!prefersReducedMotion) {
            circle.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
          }
          circle.style.strokeDashoffset = offset;
        });
        circleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) circleObserver.observe(statsSection);

  /* ---------- Horizontal Progress Bars ---------- */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.stats__bar-fill');
        bars.forEach(bar => {
          const value = bar.getAttribute('data-width') || '0%';
          if (!prefersReducedMotion) {
            bar.style.width = value;
          } else {
            bar.style.width = value;
            bar.style.transition = 'none';
          }
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) barObserver.observe(statsSection);

  /* ---------- FAQ Accordion ---------- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        const answer = i.querySelector('.faq__answer');
        if (answer) answer.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq__answer');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ---------- Testimonials Slider ---------- */
  const track = document.querySelector('.testimonials__track');
  const dots = document.querySelectorAll('.testimonials__dot');
  const slides = document.querySelectorAll('.testimonials__card');
  let currentSlide = 0;
  let autoSlideInterval;

  function goToSlide(index) {
    if (!track || slides.length === 0) return;
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    dots.forEach((dot, i) => {
      const active = i === currentSlide;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });
    slides.forEach((slide, i) => {
      const active = i === currentSlide;
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (!active) {
        slide.setAttribute('tabindex', '-1');
      } else {
        slide.removeAttribute('tabindex');
      }
    });
  }

  if (dots.length > 0 && slides.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoSlide();
      });
    });

    const prevBtn = document.querySelector('.testimonials__prev');
    const nextBtn = document.querySelector('.testimonials__next');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
      });
    }

    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
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

  /* ---------- Process Timeline Line Animation ---------- */
  const processSection = document.querySelector('.process');
  const processLine = document.querySelector('.process__line');
  const processSteps = document.querySelectorAll('.process__step');

  if (processSection && processLine) {
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const isMobile = window.innerWidth <= 768;
          if (isMobile) {
            processLine.style.width = '3px';
            processLine.style.height = '80%';
          } else {
            processLine.style.width = '80%';
            processLine.style.height = '3px';
          }
          processSteps.forEach((step, i) => {
            setTimeout(() => {
              step.classList.add('active');
            }, i * 200);
          });
          processObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    processObserver.observe(processSection);
  }

  /* ---------- Mobile-friendly touch swipes for testimonials ---------- */
  if (track) {
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
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

  /* ---------- Trust Logos Slider Auto-scroll (CSS scroll-snap fallback) ---------- */
  const logosSlider = document.querySelector('.trust__logos');
  if (logosSlider && !prefersReducedMotion) {
    let logosScrollAmount = 0;
    let logosPaused = false;
    function scrollLogos() {
      if (!logosPaused) {
        logosScrollAmount += 0.5;
        if (logosScrollAmount >= logosSlider.scrollWidth - logosSlider.clientWidth) {
          logosScrollAmount = 0;
        }
        logosSlider.scrollLeft = logosScrollAmount;
      }
      requestAnimationFrame(scrollLogos);
    }
    logosSlider.addEventListener('mouseenter', () => logosPaused = true);
    logosSlider.addEventListener('mouseleave', () => logosPaused = false);
    scrollLogos();
  }

  /* ---------- Process vertical line on mobile ---------- */
  function handleProcessMobile() {
    if (!processLine) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      processLine.style.width = '3px';
      processLine.style.height = '80%';
      processLine.style.top = '26px';
      processLine.style.left = '35px';
    } else {
      processLine.style.width = '0';
      processLine.style.height = '3px';
      processLine.style.top = '74px';
      processLine.style.left = '10%';
    }
  }

  window.addEventListener('resize', handleProcessMobile);
  handleProcessMobile();
})();
