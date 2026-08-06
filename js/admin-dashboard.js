/* ============================================================
   STACKLY LEGAL SERVICES — ADMIN DASHBOARD JAVASCRIPT
   Live simulation, real-time data, charts, widgets, interactions
   ============================================================ */
(function () {
  'use strict';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prefersReducedMotionFlag = prefersReducedMotion;

  /* ============================================================
     DOM REFERENCES
     ============================================================ */
  var sidebar = document.getElementById('admSidebar');
  var sidebarToggle = document.getElementById('admSidebarToggle');
  var sidebarCollapse = document.getElementById('admSidebarCollapse');
  var sidebarOverlay = document.getElementById('admSidebarOverlay');
  var profileDropdown = document.getElementById('admProfileDropdown');
  var profileBtn = profileDropdown ? profileDropdown.querySelector('.adm-header__profile-btn') : null;
  var themeToggle = document.getElementById('admThemeToggle');
  var notifBtn = document.getElementById('admNotifBtn');
  var msgBtn = document.getElementById('admMsgBtn');
  var notifPanel = document.getElementById('admNotifPanel');
  var notifList = document.getElementById('admNotifList');
  var notifBadge = notifBtn ? notifBtn.querySelector('.adm-header__badge') : null;

  /* ============================================================
     USER DATA FROM LOCAL STORAGE
     ============================================================ */
  function getUserData() {
    try { var r = localStorage.getItem('stacklyUser'); return r ? JSON.parse(r) : {}; }
    catch (e) { return {}; }
  }
  function setUserData(k, v) {
    try { var d = getUserData(); d[k] = v; localStorage.setItem('stacklyUser', JSON.stringify(d)); }
    catch (e) { /* silent */ }
  }
  function initUserDisplay() {
    var data = getUserData();
    var name = data.name || data.fullName || 'Administrator';
    var firstName = name.split(' ')[0] || 'Administrator';
    var pn = document.getElementById('admProfileName');
    var hn = document.getElementById('admHeaderName');
    if (pn) pn.textContent = firstName;
    if (hn) hn.textContent = firstName;
  }

  /* ============================================================
     LIVE CLOCK & GREETING
     ============================================================ */
  function updateClock() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    var timeStr = h12 + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + ' ' + ampm;
    var dateEl = document.getElementById('admDate');
    var clockEl = document.getElementById('admClock');
    var greetEl = document.getElementById('admGreeting');
    if (clockEl) clockEl.textContent = timeStr;
    if (dateEl) {
      var opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', opts);
    }
    if (greetEl) {
      var greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
      var uname = (getUserData().name || 'Administrator').split(' ')[0];
      greetEl.textContent = greet + ', ' + uname;
    }
  }

  /* ============================================================
     SIDEBAR — MOBILE TOGGLE
     ============================================================ */
  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (sidebarToggle) sidebarToggle.addEventListener('click', function () {
    if (sidebar && sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
  });
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  /* ============================================================
     SIDEBAR — DESKTOP COLLAPSE
     ============================================================ */
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', function () {
      if (sidebar) { sidebar.classList.toggle('collapsed'); setUserData('adminSidebarCollapsed', sidebar.classList.contains('collapsed')); }
    });
    var saved = getUserData();
    if (saved.adminSidebarCollapsed && sidebar) sidebar.classList.add('collapsed');
  }

  /* ============================================================
     SECTION NAVIGATION
     ============================================================ */
  var navLinks = document.querySelectorAll('.adm-sidebar__link[data-section]');
  var sections = document.querySelectorAll('.adm-section');
  var currentSection = 'executive';

  function switchSection(sectionId) {
    currentSection = sectionId;
    navLinks.forEach(function (link) {
      link.classList.remove('active'); link.removeAttribute('aria-current');
      if (link.getAttribute('data-section') === sectionId) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
    });
    sections.forEach(function (section) {
      section.classList.remove('active');
      if (section.id === 'section-' + sectionId) section.classList.add('active');
    });
    closeSidebar();
    var main = document.querySelector('.adm-main');
    if (main) main.scrollTop = 0;
    setTimeout(function () { animateCounters(); animateProgressBars(); animateCircleProgress(); drawAllCharts(); }, 100);
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) { e.preventDefault(); switchSection(this.getAttribute('data-section')); });
  });
  document.querySelectorAll('.adm-quick[data-section]').forEach(function (btn) {
    btn.addEventListener('click', function () { switchSection(this.getAttribute('data-section')); });
  });
  document.querySelectorAll('.adm-header__dropdown-item[data-section]').forEach(function (item) {
    item.addEventListener('click', function (e) { e.preventDefault(); switchSection(this.getAttribute('data-section')); if (profileDropdown) profileDropdown.classList.remove('open'); });
  });

  /* ============================================================
     PROFILE DROPDOWN
     ============================================================ */
  if (profileBtn) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = profileDropdown.classList.contains('open');
      profileDropdown.classList.toggle('open');
      profileBtn.setAttribute('aria-expanded', !isOpen);
    });
  }
  document.addEventListener('click', function (e) {
    if (profileDropdown && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('open');
      if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ============================================================
     NOTIFICATION PANEL
     ============================================================ */
  var notifCount = 8;
  var notifMessages = [
    { icon: 'fa-user-plus', color: '#3b82f6', text: 'New client <strong>Amara Johnson</strong> registered', time: 'Just now' },
    { icon: 'fa-calendar-check', color: '#22c55e', text: 'Appointment approved for <strong>Robert Chen</strong>', time: '2 min ago' },
    { icon: 'fa-file-alt', color: '#f59e0b', text: 'Document <strong>Merger v3.2</strong> uploaded', time: '5 min ago' },
    { icon: 'fa-credit-card', color: '#8b5cf6', text: 'Payment of <strong>$4,200</strong> received', time: '12 min ago' },
    { icon: 'fa-gavel', color: '#ef4444', text: 'Case <strong>#CS-2024-089</strong> hearing tomorrow', time: '1 hour ago' },
    { icon: 'fa-shield-alt', color: '#14b8a6', text: 'Document verified: <strong>Lease Contract</strong>', time: '2 hours ago' },
    { icon: 'fa-bell', color: '#6366f1', text: 'System maintenance scheduled for <strong>Sunday</strong>', time: '3 hours ago' },
    { icon: 'fa-user-tie', color: '#C8A96B', text: 'Attorney <strong>Sarah Mitchell</strong> logged in', time: '4 hours ago' }
  ];

  function addNotification() {
    if (!notifList) return;
    var items = [
      { icon: 'fa-file-upload', color: '#3b82f6', text: 'New document uploaded by client' },
      { icon: 'fa-calendar-plus', color: '#22c55e', text: 'New appointment request received' },
      { icon: 'fa-credit-card', color: '#8b5cf6', text: 'Invoice payment confirmed' },
      { icon: 'fa-user-check', color: '#C8A96B', text: 'Client registration completed' },
      { icon: 'fa-gavel', color: '#ef4444', text: 'Court date reminder: tomorrow' }
    ];
    var item = items[Math.floor(Math.random() * items.length)];
    var div = document.createElement('div');
    div.className = 'adm-notif-item adm-notif-item--new';
    div.innerHTML = '<div class="adm-notif-item__icon" style="background:' + item.color + '20;color:' + item.color + '"><i class="fas ' + item.icon + '" aria-hidden="true"></i></div><div class="adm-notif-item__info"><p>' + item.text + '</p><span class="adm-notif-item__time">Just now</span></div>';
    notifList.insertBefore(div, notifList.firstChild);
    if (notifList.children.length > 12) notifList.removeChild(notifList.lastChild);
    notifCount++;
    if (notifBadge) { notifBadge.textContent = notifCount; notifBadge.style.display = 'flex'; notifBadge.classList.add('adm-header__badge--pulse'); setTimeout(function () { notifBadge.classList.remove('adm-header__badge--pulse'); }, 600); }
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (notifPanel) {
        var isOpen = notifPanel.classList.contains('open');
        notifPanel.classList.toggle('open');
        if (!isOpen) { notifCount = 0; if (notifBadge) notifBadge.style.display = 'none'; }
      }
    });
  }
  document.addEventListener('click', function (e) {
    if (notifPanel && !notifPanel.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
      if (notifPanel) notifPanel.classList.remove('open');
    }
  });

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var icon = this.querySelector('i');
      document.body.classList.toggle('dark-mode');
      if (icon) {
        if (icon.classList.contains('fa-moon')) icon.classList.replace('fa-moon', 'fa-sun');
        else icon.classList.replace('fa-sun', 'fa-moon');
      }
      try { localStorage.setItem('stacklyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } catch (e) {}
    });
    try { if (localStorage.getItem('stacklyTheme') === 'dark') { document.body.classList.add('dark-mode'); var icon = themeToggle.querySelector('i'); if (icon) { icon.classList.replace('fa-moon', 'fa-sun'); } } } catch (e) {}
  }

  /* ============================================================
     MESSAGE BUTTON
     ============================================================ */
  if (msgBtn) {
    msgBtn.addEventListener('click', function () {
      var section = document.querySelector('[data-section="messages"]') || document.querySelector('a[href="#messages"]');
      if (section) section.click();
    });
  }

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  function animateCounters() {
    document.querySelectorAll('.adm-kpi__number[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var format = el.getAttribute('data-format');
      if (isNaN(target)) return;
      if (prefersReducedMotionFlag) { el.textContent = prefix + (format === 'currency' ? target.toLocaleString() : target) + suffix; return; }
      var startTime = null, duration = 1200;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + (format === 'currency' ? current.toLocaleString() : current) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + (format === 'currency' ? target.toLocaleString() : target) + suffix;
      }
      requestAnimationFrame(step);
    });
  }

  /* ============================================================
     LIVE KPI UPDATES
     ============================================================ */
  var liveKPIs = {
    'kpi-clients': { base: 248, range: 3 },
    'kpi-cases': { base: 67, range: 2 },
    'kpi-revenue': { base: 847500, range: 5000, format: 'currency' },
    'kpi-messages': { base: 12, range: 2 },
    'kpi-appointments': { base: 8, range: 1 }
  };

  function updateLiveKPIs() {
    Object.keys(liveKPIs).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var kpi = liveKPIs[id];
      var newVal = kpi.base + Math.floor(Math.random() * kpi.range * 2) - kpi.range;
      kpi.base = newVal;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + (kpi.format === 'currency' ? newVal.toLocaleString() : newVal) + suffix;
      el.classList.add('adm-kpi__number--flash');
      setTimeout(function () { el.classList.remove('adm-kpi__number--flash'); }, 500);
    });
  }

  /* ============================================================
     PROGRESS BAR ANIMATION
     ============================================================ */
  function animateProgressBars() {
    document.querySelectorAll('.adm-progress__fill[data-width]').forEach(function (bar) {
      var width = bar.getAttribute('data-width');
      if (prefersReducedMotionFlag) { bar.style.width = width + '%'; return; }
      bar.style.width = '0%';
      setTimeout(function () { bar.style.width = width + '%'; }, 200);
    });
  }

  /* ============================================================
     CIRCULAR PROGRESS ANIMATION
     ============================================================ */
  function animateCircleProgress() {
    document.querySelectorAll('.adm-circle-progress').forEach(function (el) {
      var value = parseInt(el.getAttribute('data-value'), 10);
      var ring = el.querySelector('.adm-circle-progress__ring');
      if (!ring || isNaN(value)) return;
      var circumference = 2 * Math.PI * 52;
      var offset = circumference - (value / 100) * circumference;
      if (prefersReducedMotionFlag) { ring.style.strokeDashoffset = offset; }
      else { ring.style.strokeDashoffset = circumference; setTimeout(function () { ring.style.strokeDashoffset = offset; }, 300); }
    });
  }

  /* ============================================================
     CANVAS CHARTS
     ============================================================ */
  function setupCanvas(id, w, h) {
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    var cw = w || rect.width, ch = h || rect.height;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: cw, h: ch };
  }

  function drawLineChart() {
    var s = setupCanvas('admLineChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var data = [12, 19, 8, 15, 22, 14, 18];
    var max = Math.max.apply(null, data) + 5;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
    ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, 'rgba(200,169,107,0.25)'); grad.addColorStop(1, 'rgba(200,169,107,0.02)'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#C8A96B'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#C8A96B'; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); });
  }

  function drawBarChart() {
    var s = setupCanvas('admBarChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var data = [42, 58, 35, 67, 52, 71];
    var max = Math.max.apply(null, data) + 10;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    var barW = (cW / labels.length) * 0.55, gap = (cW / labels.length) * 0.45;
    labels.forEach(function (label, idx) {
      var barH = (data[idx] / max) * cH; var x = pad.left + idx * (barW + gap) + gap / 2; var y = pad.top + cH - barH;
      var barGrad = ctx.createLinearGradient(0, y, 0, pad.top + cH); barGrad.addColorStop(0, '#C8A96B'); barGrad.addColorStop(1, 'rgba(200,169,107,0.4)'); ctx.fillStyle = barGrad;
      var r = 4; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y); ctx.quadraticCurveTo(x + barW, y, x + barW, y + r); ctx.lineTo(x + barW, pad.top + cH); ctx.lineTo(x, pad.top + cH); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x + barW / 2, h - 8);
    });
  }

  function drawDonutChart() {
    var s = setupCanvas('admDonutCanvas', 160, 160); if (!s) return;
    var ctx = s.ctx, cx = 80, cy = 80, r = 60, lineW = 14;
    var segments = [{ pct: 0.35, color: '#C8A96B' }, { pct: 0.25, color: '#3b82f6' }, { pct: 0.20, color: '#22c55e' }, { pct: 0.20, color: '#8b5cf6' }];
    ctx.clearRect(0, 0, 160, 160);
    var startAngle = -Math.PI / 2;
    segments.forEach(function (seg) { var sweep = seg.pct * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, startAngle + sweep); ctx.strokeStyle = seg.color; ctx.lineWidth = lineW; ctx.lineCap = 'round'; ctx.stroke(); startAngle += sweep; });
  }

  function drawRevenueChart() {
    var s = setupCanvas('admRevenueChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 55 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    var data = [42000, 58000, 51000, 67000, 62000, 75000, 81000, 84750];
    var max = Math.max.apply(null, data) + 10000;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) {
      var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      var val = Math.round(max - (max / 4) * i); ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('$' + (val / 1000) + 'k', pad.left - 8, y + 3);
    }
    ctx.textAlign = 'center'; labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
    ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, 'rgba(34,197,94,0.2)'); grad.addColorStop(1, 'rgba(34,197,94,0.02)'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); });
  }

  function drawHorizontalBarChart() {
    var s = setupCanvas('admHBarChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 10, right: 60, bottom: 10, left: 100 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Corporate', 'Family', 'Criminal', 'IP Law', 'Real Estate'];
    var data = [35, 25, 20, 12, 8];
    var colors = ['#C8A96B', '#3b82f6', '#ef4444', '#8b5cf6', '#22c55e'];
    var max = Math.max.apply(null, data) + 5;
    var barH = cH / labels.length * 0.6;
    var gap = cH / labels.length;
    ctx.clearRect(0, 0, w, h);
    labels.forEach(function (label, idx) {
      var y = pad.top + idx * gap + (gap - barH) / 2;
      var bw = (data[idx] / max) * cW;
      var grad = ctx.createLinearGradient(pad.left, 0, pad.left + bw, 0); grad.addColorStop(0, colors[idx]); grad.addColorStop(1, colors[idx] + '66');
      ctx.fillStyle = grad;
      var r = 4; ctx.beginPath(); ctx.moveTo(pad.left, y + r); ctx.quadraticCurveTo(pad.left, y, pad.left + r, y); ctx.lineTo(pad.left + bw - r, y); ctx.quadraticCurveTo(pad.left + bw, y, pad.left + bw, y + r); ctx.lineTo(pad.left + bw, y + barH - r); ctx.quadraticCurveTo(pad.left + bw, y + barH, pad.left + bw - r, y + barH); ctx.lineTo(pad.left + r, y + barH); ctx.quadraticCurveTo(pad.left, y + barH, pad.left, y + barH - r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(label, pad.left - 10, y + barH / 2 + 4);
      ctx.fillStyle = colors[idx]; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(data[idx] + '%', pad.left + bw + 8, y + barH / 2 + 4);
    });
  }

  function drawAreaChart() {
    var s = setupCanvas('admAreaChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    var data1 = [28, 35, 30, 42];
    var data2 = [18, 22, 25, 28];
    var max = 50;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    function drawArea(data, color) {
      var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
      ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, color + '40'); grad.addColorStop(1, color + '05'); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
      points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
    }
    drawArea(data1, '#C8A96B'); drawArea(data2, '#3b82f6');
  }

  function drawSparkline(canvasId, data, color) {
    var s = setupCanvas(canvasId, 80, 30); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var max = Math.max.apply(null, data); var min = Math.min.apply(null, data); var range = max - min || 1;
    var points = []; data.forEach(function (val, idx) { points.push({ x: (idx / (data.length - 1)) * w, y: h - ((val - min) / range) * (h - 4) - 2 }); });
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
  }

  /* ---------- New Chart Functions ---------- */
  function drawClientGrowthChart() {
    var s = setupCanvas('admClientGrowthChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var data = [12, 19, 15, 22, 18, 25];
    var max = 30;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) { var y = pad.top + (cH / 5) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
    ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, '#22c55e40'); grad.addColorStop(1, '#22c55e05'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill(); });
  }

  function drawClientStatusChart() {
    var s = setupCanvas('admClientStatusCanvas', 140, 140); if (!s) return;
    var ctx = s.ctx, cx = s.w / 2, cy = s.h / 2, r = 55;
    var data = [62, 18, 20]; var colors = ['#22c55e', '#f59e0b', '#6b7280'];
    var total = data.reduce(function (a, b) { return a + b; }, 0); var start = -Math.PI / 2;
    ctx.clearRect(0, 0, s.w, s.h);
    data.forEach(function (val, idx) { var angle = (val / total) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle); ctx.lineWidth = 20; ctx.strokeStyle = colors[idx]; ctx.stroke(); start += angle; });
  }

  function drawCaseStatusChart() {
    var s = setupCanvas('admCaseStatusCanvas', 140, 140); if (!s) return;
    var ctx = s.ctx, cx = s.w / 2, cy = s.h / 2, r = 55;
    var data = [55, 25, 20]; var colors = ['#22c55e', '#f59e0b', '#6b7280'];
    var total = data.reduce(function (a, b) { return a + b; }, 0); var start = -Math.PI / 2;
    ctx.clearRect(0, 0, s.w, s.h);
    data.forEach(function (val, idx) { var angle = (val / total) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle); ctx.lineWidth = 20; ctx.strokeStyle = colors[idx]; ctx.stroke(); start += angle; });
  }

  function drawCasePriorityChart() {
    var s = setupCanvas('admCasePriorityChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 50 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['High', 'Medium', 'Low'];
    var data = [28, 35, 14];
    var max = 40;
    ctx.clearRect(0, 0, w, h);
    var barH = (cH / labels.length) * 0.6;
    var gap = (cH / labels.length) * 0.4;
    var colors = ['#ef4444', '#f59e0b', '#22c55e'];
    labels.forEach(function (label, idx) {
      var y = pad.top + idx * (barH + gap);
      var bw = (data[idx] / max) * cW;
      var grad = ctx.createLinearGradient(pad.left, 0, pad.left + bw, 0);
      grad.addColorStop(0, colors[idx]); grad.addColorStop(1, colors[idx] + '80');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(pad.left, y, bw, barH, 4); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(label, pad.left - 8, y + barH / 2 + 4);
      ctx.fillStyle = colors[idx]; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(data[idx], pad.left + bw + 8, y + barH / 2 + 4);
    });
  }

  function drawAppointmentWeekChart() {
    var s = setupCanvas('admAppointmentWeekChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    var data = [8, 12, 6, 10, 14];
    var max = 16;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    var barW = (cW / labels.length) * 0.5;
    var gap = (cW / labels.length) * 0.5;
    labels.forEach(function (label, idx) {
      var x = pad.left + idx * (barW + gap) + gap / 2;
      var bh = (data[idx] / max) * cH;
      var grad = ctx.createLinearGradient(0, pad.top + cH - bh, 0, pad.top + cH);
      grad.addColorStop(0, '#C8A96B'); grad.addColorStop(1, '#C8A96B40');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(x, pad.top + cH - bh, barW, bh, 4); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, x + barW / 2, h - 8);
    });
  }

  function drawAppointmentTypeChart() {
    var s = setupCanvas('admAppointmentTypeChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 80 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Consultation', 'Case Review', 'Filing', 'Court Prep'];
    var data = [35, 25, 22, 18];
    var max = 40;
    ctx.clearRect(0, 0, w, h);
    var barH = (cH / labels.length) * 0.6;
    var gap = (cH / labels.length) * 0.4;
    var colors = ['#3b82f6', '#C8A96B', '#22c55e', '#8b5cf6'];
    labels.forEach(function (label, idx) {
      var y = pad.top + idx * (barH + gap);
      var bw = (data[idx] / max) * cW;
      var grad = ctx.createLinearGradient(pad.left, 0, pad.left + bw, 0);
      grad.addColorStop(0, colors[idx]); grad.addColorStop(1, colors[idx] + '80');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(pad.left, y, bw, barH, 4); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(label, pad.left - 8, y + barH / 2 + 4);
    });
  }

  function drawDocStatusChart() {
    var s = setupCanvas('admDocStatusCanvas', 140, 140); if (!s) return;
    var ctx = s.ctx, cx = s.w / 2, cy = s.h / 2, r = 55;
    var data = [89, 9, 2]; var colors = ['#22c55e', '#f59e0b', '#ef4444'];
    var total = data.reduce(function (a, b) { return a + b; }, 0); var start = -Math.PI / 2;
    ctx.clearRect(0, 0, s.w, s.h);
    data.forEach(function (val, idx) { var angle = (val / total) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle); ctx.lineWidth = 20; ctx.strokeStyle = colors[idx]; ctx.stroke(); start += angle; });
  }

  function drawDocTypeChart() {
    var s = setupCanvas('admDocTypeChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 80 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['PDF', 'DOCX', 'Images', 'Other'];
    var data = [45, 28, 18, 9];
    var max = 50;
    ctx.clearRect(0, 0, w, h);
    var barH = (cH / labels.length) * 0.6;
    var gap = (cH / labels.length) * 0.4;
    var colors = ['#ef4444', '#3b82f6', '#22c55e', '#6b7280'];
    labels.forEach(function (label, idx) {
      var y = pad.top + idx * (barH + gap);
      var bw = (data[idx] / max) * cW;
      var grad = ctx.createLinearGradient(pad.left, 0, pad.left + bw, 0);
      grad.addColorStop(0, colors[idx]); grad.addColorStop(1, colors[idx] + '80');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(pad.left, y, bw, barH, 4); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(label, pad.left - 8, y + barH / 2 + 4);
    });
  }

  function drawPaymentMethodChart() {
    var s = setupCanvas('admPaymentMethodCanvas', 140, 140); if (!s) return;
    var ctx = s.ctx, cx = s.w / 2, cy = s.h / 2, r = 55;
    var data = [45, 30, 15, 10]; var colors = ['#3b82f6', '#22c55e', '#C8A96B', '#8b5cf6'];
    var total = data.reduce(function (a, b) { return a + b; }, 0); var start = -Math.PI / 2;
    ctx.clearRect(0, 0, s.w, s.h);
    data.forEach(function (val, idx) { var angle = (val / total) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle); ctx.lineWidth = 20; ctx.strokeStyle = colors[idx]; ctx.stroke(); start += angle; });
  }

  function drawMonthlyCompChart() {
    var s = setupCanvas('admMonthlyCompChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 50 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var data1 = [45, 52, 48, 61, 55, 68];
    var data2 = [32, 38, 35, 42, 40, 45];
    var max = 80;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    function drawLine(data, color) {
      var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
      points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
    }
    drawLine(data1, '#22c55e'); drawLine(data2, '#ef4444');
  }

  function drawRevenueExpenseChart() {
    var s = setupCanvas('admRevenueExpenseChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 50 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var revenue = [85, 92, 88, 95, 90, 105];
    var expenses = [45, 48, 42, 50, 46, 52];
    var max = 120;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    function drawFilledLine(data, color) {
      var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
      ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, color + '40'); grad.addColorStop(1, color + '05'); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    }
    drawFilledLine(revenue, '#22c55e'); drawFilledLine(expenses, '#ef4444');
  }

  function drawClientAcqChart() {
    var s = setupCanvas('admClientAcqChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var data = [8, 12, 10, 15, 13, 18];
    var max = 20;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    var barW = (cW / labels.length) * 0.5;
    var gap = (cW / labels.length) * 0.5;
    labels.forEach(function (label, idx) {
      var x = pad.left + idx * (barW + gap) + gap / 2;
      var bh = (data[idx] / max) * cH;
      var grad = ctx.createLinearGradient(0, pad.top + cH - bh, 0, pad.top + cH);
      grad.addColorStop(0, '#8b5cf6'); grad.addColorStop(1, '#8b5cf640');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(x, pad.top + cH - bh, barW, bh, 4); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, x + barW / 2, h - 8);
    });
  }

  function drawAllCharts() {
    drawLineChart(); drawBarChart(); drawDonutChart(); drawRevenueChart();
    drawHorizontalBarChart(); drawAreaChart();
    drawClientGrowthChart(); drawClientStatusChart();
    drawCaseStatusChart(); drawCasePriorityChart();
    drawAppointmentWeekChart(); drawAppointmentTypeChart();
    drawDocStatusChart(); drawDocTypeChart();
    drawPaymentMethodChart(); drawMonthlyCompChart();
    drawRevenueExpenseChart(); drawClientAcqChart();
    drawSparkline('sparkline1', [12, 15, 13, 18, 16, 20, 19], '#C8A96B');
    drawSparkline('sparkline2', [8, 12, 10, 15, 14, 18, 17], '#3b82f6');
    drawSparkline('sparkline3', [5, 7, 6, 9, 8, 11, 10], '#22c55e');
    drawSparkline('sparkline4', [3, 5, 4, 6, 5, 8, 7], '#8b5cf6');
  }

  /* ============================================================
     CALENDAR
     ============================================================ */
  var calGrid = document.getElementById('admCalGrid');
  var calTitle = document.getElementById('admCalTitle');
  var calPrev = document.getElementById('admCalPrev');
  var calNext = document.getElementById('admCalNext');
  var curMonth = new Date().getMonth();
  var curYear = new Date().getFullYear();
  var eventDays = [3, 8, 12, 15, 18, 22, 25, 28];
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function renderCalendar(month, year) {
    if (!calGrid) return; calGrid.innerHTML = '';
    if (calTitle) calTitle.textContent = monthNames[month] + ' ' + year;
    var firstDay = new Date(year, month, 1).getDay(); var daysInMonth = new Date(year, month + 1, 0).getDate(); var daysInPrev = new Date(year, month, 0).getDate(); var today = new Date();
    for (var i = firstDay - 1; i >= 0; i--) { var d = document.createElement('div'); d.className = 'adm-cal-day adm-cal-day--other'; d.textContent = daysInPrev - i; calGrid.appendChild(d); }
    for (var day = 1; day <= daysInMonth; day++) { var dayEl = document.createElement('div'); dayEl.className = 'adm-cal-day'; dayEl.textContent = day; if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayEl.classList.add('adm-cal-day--today'); if (eventDays.indexOf(day) !== -1) dayEl.classList.add('adm-cal-day--event'); calGrid.appendChild(dayEl); }
    var totalCells = firstDay + daysInMonth; var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var n = 1; n <= remaining; n++) { var nd = document.createElement('div'); nd.className = 'adm-cal-day adm-cal-day--other'; nd.textContent = n; calGrid.appendChild(nd); }
  }
  if (calPrev) calPrev.addEventListener('click', function () { curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; } renderCalendar(curMonth, curYear); });
  if (calNext) calNext.addEventListener('click', function () { curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; } renderCalendar(curMonth, curYear); });

  /* ============================================================
     CHART TAB SWITCHING
     ============================================================ */
  document.querySelectorAll('.adm-card__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var parent = this.closest('.adm-card__tabs');
      if (parent) parent.querySelectorAll('.adm-card__tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active'); drawLineChart();
    });
  });

  /* ============================================================
     TABLE TO CARDS (MOBILE)
     ============================================================ */
  function buildMobileCards(tableId, cardsId, buildFn) {
    var container = document.getElementById(cardsId);
    if (!container) return; container.innerHTML = '';
    var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
    rows.forEach(function (row) { var card = buildFn(row); if (card) container.appendChild(card); });
  }

  function buildClientCard(row) {
    var cells = row.querySelectorAll('td'); if (cells.length < 5) return null;
    var name = cells[0].textContent.trim(), email = cells[1].textContent.trim(), phone = cells[2].textContent.trim(), status = cells[3].innerHTML, lawyer = cells[4].textContent.trim();
    var card = document.createElement('div'); card.className = 'adm-mobile-card';
    card.innerHTML = '<div class="adm-mobile-card__header"><div class="adm-table__avatar">' + name.split(' ').map(function (w) { return w[0]; }).join('') + '</div><div><strong>' + name + '</strong><span>' + email + '</span></div></div><div class="adm-mobile-card__body"><p><i class="fas fa-phone" aria-hidden="true"></i> ' + phone + '</p><p><i class="fas fa-user-tie" aria-hidden="true"></i> ' + lawyer + '</p></div><div class="adm-mobile-card__footer">' + status + '</div>';
    return card;
  }

  function buildCaseCard(row) {
    var cells = row.querySelectorAll('td'); if (cells.length < 7) return null;
    var caseNum = cells[0].textContent.trim(), client = cells[1].textContent.trim(), lawyer = cells[2].textContent.trim(), area = cells[3].textContent.trim(), priority = cells[4].innerHTML, status = cells[5].innerHTML, courtDate = cells[6].textContent.trim();
    var card = document.createElement('div'); card.className = 'adm-mobile-card';
    card.innerHTML = '<div class="adm-mobile-card__header"><strong>' + caseNum + '</strong><div>' + status + ' ' + priority + '</div></div><div class="adm-mobile-card__body"><p><i class="fas fa-user" aria-hidden="true"></i> ' + client + '</p><p><i class="fas fa-user-tie" aria-hidden="true"></i> ' + lawyer + '</p><p><i class="fas fa-balance-scale" aria-hidden="true"></i> ' + area + '</p><p><i class="fas fa-calendar" aria-hidden="true"></i> ' + courtDate + '</p></div>';
    return card;
  }

  /* ============================================================
     SEARCH & FILTER
     ============================================================ */
  function setupFilter(searchId, filterId, tableId, extraFilterId) {
    var search = document.getElementById(searchId);
    var filter = document.getElementById(filterId);
    var extraFilter = extraFilterId ? document.getElementById(extraFilterId) : null;
    if (search) search.addEventListener('input', doFilter);
    if (filter) filter.addEventListener('change', doFilter);
    if (extraFilter) extraFilter.addEventListener('change', doFilter);
    function doFilter() {
      var s = search ? search.value.toLowerCase() : '';
      var f = filter ? filter.value : 'all';
      var ef = extraFilter ? extraFilter.value : 'all';
      document.querySelectorAll('#' + tableId + ' tbody tr').forEach(function (row) {
        var text = row.textContent.toLowerCase();
        var matchSearch = !s || text.indexOf(s) !== -1;
        var badges = row.querySelectorAll('.adm-badge, .adm-priority');
        var matches = true;
        badges.forEach(function (b) {
          var t = b.textContent.trim().toLowerCase();
          if (f !== 'all' && !b.classList.contains('adm-priority')) { if (t !== f) matches = false; }
          if (ef !== 'all' && b.classList.contains('adm-priority')) { if (t !== ef) matches = false; }
        });
        row.style.display = matchSearch && matches ? '' : 'none';
      });
    }
  }
  setupFilter('clientSearch', 'clientStatusFilter', 'clientTableWrap');
  setupFilter('caseSearch', 'caseStatusFilter', 'caseTableWrap', 'casePriorityFilter');

  /* ============================================================
     LIVE ACTIVITY FEED
     ============================================================ */
  var activityFeed = document.getElementById('admActivityFeed');
  var activityItems = [
    { dot: 'blue', text: 'New client <strong>Maria Santos</strong> registered', time: 'Just now' },
    { dot: 'gold', text: 'Case <strong>#CS-2024-091</strong> assigned to David Chen', time: 'Just now' },
    { dot: 'green', text: 'Payment of <strong>$3,100</strong> received from James Whitfield', time: 'Just now' },
    { dot: 'red', text: 'Document <strong>Contract Draft</strong> requires review', time: 'Just now' },
    { dot: 'blue', text: 'Appointment scheduled for <strong>Aug 18</strong>', time: 'Just now' },
    { dot: 'gold', text: 'Client <strong>Sarah Chen</strong> updated profile', time: 'Just now' }
  ];

  function prependActivity() {
    if (!activityFeed) return;
    var item = activityItems[Math.floor(Math.random() * activityItems.length)];
    var div = document.createElement('div');
    div.className = 'adm-timeline__item adm-timeline__item--new';
    div.innerHTML = '<div class="adm-timeline__dot adm-timeline__dot--' + item.dot + '"></div><div class="adm-timeline__content"><p class="adm-timeline__text">' + item.text + '</p><span class="adm-timeline__time">' + item.time + '</span></div>';
    activityFeed.insertBefore(div, activityFeed.firstChild);
    if (activityFeed.children.length > 10) activityFeed.removeChild(activityFeed.lastChild);
  }

  /* ============================================================
     APPOINTMENT COUNTDOWN
     ============================================================ */
  function updateCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      var target = new Date(el.getAttribute('data-countdown')).getTime();
      var now = Date.now();
      var diff = target - now;
      if (diff <= 0) { el.textContent = 'Now'; el.classList.add('adm-countdown--urgent'); return; }
      var hours = Math.floor(diff / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      el.textContent = hours + 'h ' + mins + 'm';
    });
  }

  /* ============================================================
     GLOBAL SEARCH
     ============================================================ */
  var globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('focus', function () { this.parentElement.classList.add('adm-header__search--focused'); });
    globalSearch.addEventListener('blur', function () { this.parentElement.classList.remove('adm-header__search--focused'); });
  }

  /* ============================================================
     EXPORT BUTTON
     ============================================================ */
  var exportBtn = document.getElementById('admExportBtn');
  if (exportBtn) exportBtn.addEventListener('click', function () { alert('Report export would be generated here.'); });

  /* ============================================================
     WINDOW RESIZE
     ============================================================ */
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { drawAllCharts(); if (window.innerWidth > 1024) closeSidebar(); }, 250); });

  /* ============================================================
     ESCAPE KEY
     ============================================================ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSidebar(); if (notifPanel) notifPanel.classList.remove('open'); if (profileDropdown) { profileDropdown.classList.remove('open'); if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false'); } }
  });

  /* ============================================================
     INITIALIZE
     ============================================================ */
  initUserDisplay(); updateClock(); renderCalendar(curMonth, curYear); animateCounters(); animateProgressBars(); animateCircleProgress(); drawAllCharts();
  buildMobileCards('clientTableWrap', 'clientCards', buildClientCard);
  buildMobileCards('caseTableWrap', 'caseCards', buildCaseCard);

  /* Live updates */
  setInterval(updateClock, 1000);
  setInterval(updateLiveKPIs, 8000);
  setInterval(prependActivity, 12000);
  setInterval(addNotification, 15000);
  setInterval(updateCountdowns, 60000);
  updateCountdowns();

})();
