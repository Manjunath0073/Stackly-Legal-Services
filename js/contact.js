/* ============================================================
   STACKLY LEGAL SERVICES — CONTACT PAGE JAVASCRIPT
   Form validation, FAQ accordion, animations
   ============================================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Form Validation ---------- */
  var form = document.getElementById('consultationForm');
  var successMessage = document.getElementById('formSuccess');

  if (!form) return;

  var fields = {
    name: {
      el: document.getElementById('ct-name'),
      error: document.getElementById('ct-name-error'),
      validate: function (val) {
        if (!val.trim()) return 'Please enter your full name.';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val.trim())) return 'Please enter a valid name (letters only).';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
    },
    email: {
      el: document.getElementById('ct-email'),
      error: document.getElementById('ct-email-error'),
      validate: function (val) {
        if (!val.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email address.';
        return '';
      }
    },
    phone: {
      el: document.getElementById('ct-phone'),
      error: document.getElementById('ct-phone-error'),
      validate: function (val) {
        if (!val.trim()) return 'Please enter your phone number.';
        if (!/^[\d\s+\-().]{7,20}$/.test(val.trim())) return 'Please enter a valid phone number.';
        return '';
      }
    },
    practice: {
      el: document.getElementById('ct-practice'),
      error: document.getElementById('ct-practice-error'),
      validate: function (val) {
        if (!val) return 'Please select a practice area.';
        return '';
      }
    },
    contactMethod: {
      el: document.getElementById('ct-contact-method'),
      error: document.getElementById('ct-contact-method-error'),
      validate: function (val) {
        if (!val) return 'Please select a preferred contact method.';
        return '';
      }
    },
    message: {
      el: document.getElementById('ct-message'),
      error: document.getElementById('ct-message-error'),
      validate: function (val) {
        if (!val.trim()) return 'Please enter a message.';
        if (val.trim().length < 10) return 'Message must be at least 10 characters.';
        return '';
      }
    },
    privacy: {
      el: document.getElementById('ct-privacy'),
      error: document.getElementById('ct-privacy-error'),
      validate: function () {
        if (!document.getElementById('ct-privacy').checked) return 'You must consent to the privacy policy.';
        return '';
      }
    }
  };

  function showError(field, message) {
    var group = field.el.closest('.ct-form__group');
    if (!group) return;
    group.classList.add('has-error');
    group.classList.remove('is-valid');
    field.error.textContent = message;
    field.el.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    var group = field.el.closest('.ct-form__group');
    if (!group) return;
    group.classList.remove('has-error');
    field.error.textContent = '';
    field.el.removeAttribute('aria-invalid');
  }

  function markValid(field) {
    var group = field.el.closest('.ct-form__group');
    if (!group) return;
    group.classList.remove('has-error');
    group.classList.add('is-valid');
    field.error.textContent = '';
    field.el.removeAttribute('aria-invalid');
  }

  function validateField(key) {
    var field = fields[key];
    var value = field.el.type === 'checkbox' ? '' : field.el.value;
    var errorMsg = field.validate(value);

    if (errorMsg) {
      showError(field, errorMsg);
      return false;
    } else {
      markValid(field);
      return true;
    }
  }

  function validateAll() {
    var isValid = true;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) {
        isValid = false;
      }
    });
    return isValid;
  }

  /* Real-time validation on blur */
  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    var eventType = field.el.type === 'checkbox' ? 'change' : 'blur';

    field.el.addEventListener(eventType, function () {
      validateField(key);
    });

    /* Clear error on input for text/email/textarea */
    if (field.el.type !== 'checkbox' && field.el.tagName !== 'SELECT') {
      field.el.addEventListener('input', function () {
        var group = field.el.closest('.ct-form__group');
        if (group && group.classList.contains('has-error')) {
          validateField(key);
        }
      });
    }
  });

  /* Form submission */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = validateAll();

    if (!isValid) {
      /* Focus first error field */
      var firstError = form.querySelector('.has-error .ct-form__input');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    /* Simulate form submission */
    var submitBtn = form.querySelector('.ct-form__submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

    setTimeout(function () {
      form.style.display = 'none';
      successMessage.hidden = false;
      successMessage.setAttribute('aria-hidden', 'false');
      successMessage.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });

      /* Reset form after 3 seconds */
      setTimeout(function () {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Request Consultation</span> <i class="fas fa-arrow-right" aria-hidden="true"></i>';

        /* Clear all validation states */
        Object.keys(fields).forEach(function (key) {
          clearError(fields[key]);
          var group = fields[key].el.closest('.ct-form__group');
          if (group) group.classList.remove('is-valid');
        });
      }, 3000);
    }, 1500);
  });

  /* ---------- FAQ Accordion ---------- */
  var faqItems = document.querySelectorAll('.contact-faq__item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.contact-faq__question');
    var answer = item.querySelector('.contact-faq__answer');

    if (!question || !answer) return;

    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');

      /* Close all other items */
      faqItems.forEach(function (otherItem) {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.contact-faq__question').setAttribute('aria-expanded', 'false');
          var otherAnswer = otherItem.querySelector('.contact-faq__answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      /* Toggle current item */
      if (isActive) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    /* Keyboard support */
    question.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ---------- Smooth scroll for anchor links in CTA ---------- */
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

})();
