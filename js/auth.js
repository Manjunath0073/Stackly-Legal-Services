/* ============================================================
   STACKLY LEGAL SERVICES — AUTH PAGES JAVASCRIPT
   Login & Signup form validation, password strength, UX
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Detect Page ---------- */
  var isSignup = !!document.getElementById('signupForm');
  var isLogin = !!document.getElementById('loginForm');
  var form = document.getElementById('signupForm') || document.getElementById('loginForm');

  if (!form) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utility: Show / Clear Error ---------- */
  function showError(field, message) {
    var group = field.closest('.auth__field') || field.closest('.auth__roles') || field.closest('.auth__terms');
    if (!group) return;
    group.classList.add('has-error');
    group.classList.remove('is-valid');
    var errorEl = group.querySelector('.auth__field-error, .auth__roles-error, .auth__terms-error');
    if (errorEl) errorEl.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    var group = field.closest('.auth__field') || field.closest('.auth__roles') || field.closest('.auth__terms');
    if (!group) return;
    group.classList.remove('has-error');
    var errorEl = group.querySelector('.auth__field-error, .auth__roles-error, .auth__terms-error');
    if (errorEl) errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function markValid(field) {
    var group = field.closest('.auth__field');
    if (!group) return;
    group.classList.remove('has-error');
    group.classList.add('is-valid');
    var errorEl = group.querySelector('.auth__field-error');
    if (errorEl) errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  /* ---------- Validators ---------- */
  var validators = {
    name: function (val) {
      var trimmed = val.trim();
      if (!trimmed) return 'Full name is required.';
      if (trimmed.length < 3) return 'Name must be at least 3 characters.';
      if (trimmed.length > 50) return 'Name must not exceed 50 characters.';
      if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Name must contain only letters and spaces.';
      return '';
    },
    email: function (val) {
      if (!val.trim()) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email address.';
      return '';
    },
    phone: function (val) {
      var trimmed = val.trim();
      if (!trimmed) return 'Phone number is required.';
      if (!/^\d+$/.test(trimmed)) return 'Phone must contain only digits.';
      if (trimmed.length < 10) return 'Phone must be at least 10 digits.';
      if (trimmed.length > 15) return 'Phone must not exceed 15 digits.';
      return '';
    },
    password: function (val) {
      if (!val) return 'Password is required.';
      if (val.length < 8) return 'Password must be at least 8 characters.';
      if (val.length > 20) return 'Password must not exceed 20 characters.';
      if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter.';
      if (!/[a-z]/.test(val)) return 'Password must contain at least one lowercase letter.';
      if (!/\d/.test(val)) return 'Password must contain at least one number.';
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) return 'Password must contain at least one special character.';
      return '';
    },
    confirmPassword: function (val) {
      var pw = document.getElementById('auth-password');
      if (!val) return 'Please confirm your password.';
      if (pw && val !== pw.value) return 'Passwords do not match.';
      return '';
    }
  };

  /* ---------- Password Strength ---------- */
  function getPasswordStrength(password) {
    var score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  function updatePasswordStrength(password) {
    var meter = document.getElementById('auth-strength-meter');
    var fill = document.getElementById('auth-strength-fill');
    var label = document.getElementById('auth-strength-label');
    if (!meter || !fill || !label) return;

    if (!password) {
      fill.className = 'auth__strength-fill';
      label.className = 'auth__strength-label';
      label.textContent = '';
      return;
    }

    var strength = getPasswordStrength(password);
    fill.className = 'auth__strength-fill ' + strength;
    label.className = 'auth__strength-label ' + strength;
    label.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
  }

  /* ---------- Password Requirements ---------- */
  function updatePasswordReqs(password) {
    var reqs = document.querySelectorAll('.auth__password-req');
    reqs.forEach(function (req) {
      var type = req.getAttribute('data-req');
      var met = false;
      switch (type) {
        case 'length': met = password.length >= 8; break;
        case 'uppercase': met = /[A-Z]/.test(password); break;
        case 'lowercase': met = /[a-z]/.test(password); break;
        case 'number': met = /\d/.test(password); break;
        case 'special': met = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password); break;
      }
      req.classList.toggle('met', met);
      var icon = req.querySelector('i');
      if (icon) {
        icon.className = met ? 'fas fa-check-circle' : 'far fa-circle';
      }
    });
  }

  /* ---------- Caps Lock Detection ---------- */
  function setupCapsLock(input, warningEl) {
    if (!input || !warningEl) return;
    input.addEventListener('keyup', function (e) {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        warningEl.classList.add('visible');
      } else {
        warningEl.classList.remove('visible');
      }
    });
    input.addEventListener('blur', function () {
      warningEl.classList.remove('visible');
    });
  }

  /* ---------- Show/Hide Password ---------- */
  function setupPasswordToggle(toggleBtn, inputId) {
    if (!toggleBtn) return;
    var input = document.getElementById(inputId);
    if (!input) return;

    toggleBtn.addEventListener('click', function () {
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      var icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      }
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  /* ---------- Validate Single Field ---------- */
  function validateField(field) {
    var name = field.name || field.id;
    var val = field.value;

    if (name === 'name' || name === 'fullName') {
      var err = validators.name(val);
      if (err) { showError(field, err); return false; }
      markValid(field);
      return true;
    }
    if (name === 'email') {
      var err = validators.email(val);
      if (err) { showError(field, err); return false; }
      markValid(field);
      return true;
    }
    if (name === 'phone') {
      var err = validators.phone(val);
      if (err) { showError(field, err); return false; }
      markValid(field);
      return true;
    }
    if (name === 'password') {
      var err = validators.password(val);
      if (err) { showError(field, err); return false; }
      markValid(field);
      return true;
    }
    if (name === 'confirmPassword') {
      var err = validators.confirmPassword(val);
      if (err) { showError(field, err); return false; }
      markValid(field);
      return true;
    }
    return true;
  }

  /* ---------- Validate Role Selection ---------- */
  function validateRoles() {
    var rolesContainer = document.querySelector('.auth__roles');
    if (!rolesContainer) return true;
    var selected = rolesContainer.querySelector('input[name="role"]:checked');
    if (!selected) {
      rolesContainer.classList.add('has-error');
      return false;
    }
    rolesContainer.classList.remove('has-error');
    return true;
  }

  /* ---------- Validate Terms ---------- */
  function validateTerms() {
    if (!isSignup) return true;
    var termsGroup = document.querySelector('.auth__terms');
    var checkbox = document.getElementById('auth-terms');
    if (!termsGroup || !checkbox) return true;
    if (!checkbox.checked) {
      termsGroup.classList.add('has-error');
      return false;
    }
    termsGroup.classList.remove('has-error');
    return true;
  }

  /* ---------- Validate All ---------- */
  function validateAll() {
    var isValid = true;

    /* Role selection */
    if (!validateRoles()) isValid = false;

    /* Text fields */
    var inputs = form.querySelectorAll('.auth__field-input');
    inputs.forEach(function (input) {
      if (!validateField(input)) isValid = false;
    });

    /* Terms checkbox (signup only) */
    if (!validateTerms()) isValid = false;

    return isValid;
  }

  /* ---------- Show Success Notification ---------- */
  function showSuccess(title, message) {
    var notification = document.getElementById('authSuccess');
    if (!notification) return;

    var h4 = notification.querySelector('h4');
    var p = notification.querySelector('p');
    if (h4) h4.textContent = title;
    if (p) p.textContent = message;

    notification.classList.add('visible');

    setTimeout(function () {
      notification.classList.remove('visible');
    }, 3000);
  }

  /* ---------- Redirect After Delay ---------- */
  function redirectAfter(url, delay) {
    setTimeout(function () {
      window.location.href = url;
    }, delay);
  }

  /* ---------- Form Submission ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateAll()) {
      /* Focus first error */
      var firstError = form.querySelector('.has-error .auth__field-input, .has-error input');
      if (firstError) firstError.focus();
      return;
    }

    /* Show loading state */
    var submitBtn = form.querySelector('.auth__submit');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    /* Simulate server request */
    setTimeout(function () {
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      if (isLogin) {
        var selectedRole = document.querySelector('input[name="role"]:checked');
        var roleValue = selectedRole ? selectedRole.value : 'client';

        showSuccess('Login Successful', 'Welcome back! Redirecting to your dashboard...');

        if (roleValue === 'admin') {
          redirectAfter('admin-dashboard.html', 2000);
        } else {
          redirectAfter('client-dashboard.html', 2000);
        }
      } else {
        showSuccess('Account Created Successfully', 'Your account has been created. Redirecting to login...');

        /* Clear form */
        form.reset();
        updatePasswordStrength('');
        updatePasswordReqs('');
        var confirmField = document.getElementById('auth-confirm-password');
        if (confirmField) confirmField.value = '';

        redirectAfter('login.html', 2500);
      }
    }, 1500);
  });

  /* ---------- Real-time Validation on Blur ---------- */
  var fields = form.querySelectorAll('.auth__field-input');
  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });

    /* Clear error on input */
    field.addEventListener('input', function () {
      var group = field.closest('.auth__field');
      if (group && group.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  /* ---------- Password-specific handlers ---------- */
  var passwordInput = document.getElementById('auth-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      updatePasswordStrength(this.value);
      updatePasswordReqs(this.value);

      /* Also validate confirm password if it has a value */
      var confirmInput = document.getElementById('auth-confirm-password');
      if (confirmInput && confirmInput.value) {
        validateField(confirmInput);
      }
    });

    setupCapsLock(passwordInput, document.getElementById('auth-capslock'));
  }

  var confirmInput = document.getElementById('auth-confirm-password');
  if (confirmInput) {
    setupCapsLock(confirmInput, document.getElementById('auth-capslock-confirm'));

    confirmInput.addEventListener('input', function () {
      var group = this.closest('.auth__field');
      if (group && group.classList.contains('has-error')) {
        validateField(this);
      }
    });

    confirmInput.addEventListener('blur', function () {
      validateField(this);
    });
  }

  /* ---------- Password Toggles ---------- */
  setupPasswordToggle(document.getElementById('auth-toggle-password'), 'auth-password');
  setupPasswordToggle(document.getElementById('auth-toggle-confirm'), 'auth-confirm-password');

  /* ---------- Role Selection Validation ---------- */
  var roleInputs = form.querySelectorAll('input[name="role"]');
  roleInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var container = document.querySelector('.auth__roles');
      if (container) container.classList.remove('has-error');
    });
  });

  /* ---------- Terms Checkbox Validation ---------- */
  var termsCheckbox = document.getElementById('auth-terms');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function () {
      var group = this.closest('.auth__terms');
      if (group) group.classList.remove('has-error');
    });
  }

  /* ---------- Keyboard: Enter on role cards ---------- */
  var roleCards = document.querySelectorAll('.auth__role-card');
  roleCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var input = card.querySelector('.auth__role-input');
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  });

})();
