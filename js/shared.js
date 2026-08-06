/* ============================================================
   STACKLY LEGAL SERVICES — SHARED JAVASCRIPT
   Header, navigation, scroll utilities, accessibility, ripple
   ============================================================ */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-drawer__link');
  const mobileClose = document.getElementById('mobileDrawerClose');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky Header ---------- */
  function updateHeader() {
    const scrolled = window.scrollY > 50;
    if (!header) return;

    if (scrolled) {
      header.classList.remove('header--transparent');
      header.classList.add('header--solid');
    } else {
      header.classList.add('header--transparent');
      header.classList.remove('header--solid');
    }
  }

  /* ---------- Scroll Progress Bar ---------- */
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }

  /* ---------- Back to Top ---------- */
  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 500) {
      backToTop.classList.add('active');
    } else {
      backToTop.classList.remove('active');
    }
  }

  /* ---------- Mobile Drawer ---------- */
  function openDrawer() {
    hamburger.classList.add('active');
    mobileDrawer.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
    if (mobileClose) mobileClose.focus();
  }

  function closeDrawer() {
    hamburger.classList.remove('active');
    mobileDrawer.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    if (hamburger) hamburger.focus();
  }

  if (hamburger && mobileDrawer && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (mobileClose) {
      mobileClose.addEventListener('click', closeDrawer);
    }

    mobileOverlay.addEventListener('click', closeDrawer);
    mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
        closeDrawer();
      }
    });
  }

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  /* ---------- Back to Top Click ---------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Button Ripple Effect ---------- */
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ---------- Intersection Observer for Entrance Animations ---------- */
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 60);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
  }

  /* ---------- Active Nav Link on Scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');

  function setActiveNav() {
    let current = '';
    const headerOffset = header ? header.offsetHeight : 0;
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerOffset - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      } else if (href === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Throttled Scroll Handler ---------- */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        updateScrollProgress();
        updateBackToTop();
        setActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- Initialize ---------- */
  updateHeader();
  updateScrollProgress();
  updateBackToTop();
  setActiveNav();

  /* ---------- Newsletter Forms ---------- */
  function setupNewsletterForm(formSelector, successMessage) {
    const forms = document.querySelectorAll(formSelector);
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailInput.style.borderColor = '#ef4444';
          setTimeout(function() { emailInput.style.borderColor = ''; }, 2000);
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
        submitBtn.disabled = true;

        setTimeout(function() {
          form.innerHTML = '<div style="display:flex;align-items:center;gap:10px;color:#22c55e;font-weight:600;padding:12px 0;"><i class="fas fa-check-circle" aria-hidden="true"></i><span>' + (successMessage || 'Subscribed successfully!') + '</span></div>';
          
          setTimeout(function() {
            form.innerHTML = '<label for="' + emailInput.id + '" class="sr-only">Email address</label><input type="email" id="' + emailInput.id + '" name="email" placeholder="' + (emailInput.placeholder || 'Your email') + '" required><button type="submit" aria-label="Subscribe"><i class="fas fa-paper-plane" aria-hidden="true"></i></button>';
            setupNewsletterForm(formSelector, successMessage);
          }, 3000);
        }, 1000);
      });
    });
  }

  setupNewsletterForm('.newsletter__form', 'Subscribed successfully!');
  setupNewsletterForm('.pa-newsletter__form', 'Subscribed successfully!');
  setupNewsletterForm('.footer__newsletter', 'Subscribed successfully!');
})();
