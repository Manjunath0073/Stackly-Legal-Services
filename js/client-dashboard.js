/* ============================================================
   STACKLY LEGAL SERVICES — CLIENT DASHBOARD JAVASCRIPT
   Live simulation, real-time data, charts, widgets, interactions
   ============================================================ */
(function () {
  'use strict';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- DOM References ---------- */
  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var sidebarCollapse = document.getElementById('sidebarCollapse');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var profileDropdown = document.getElementById('profileDropdown');
  var profileBtn = profileDropdown ? profileDropdown.querySelector('.dash-header__profile-btn') : null;
  var themeToggle = document.getElementById('themeToggle');
  var notifBtn = document.getElementById('notifBtn');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatMessages = document.getElementById('chatMessages');

  /* ---------- User Data from LocalStorage ---------- */
  function getUserData() {
    try { var d = JSON.parse(localStorage.getItem('stacklyUser')); return d || {}; }
    catch (e) { return {}; }
  }
  function setUserData(k, v) {
    try { var d = getUserData(); d[k] = v; localStorage.setItem('stacklyUser', JSON.stringify(d)); }
    catch (e) { /* silent */ }
  }
  function initUserDisplay() {
    var userData = getUserData();
    var name = userData.name || userData.fullName || 'Client';
    var firstName = name.split(' ')[0] || 'Client';
    var greetingEl = document.getElementById('dashGreeting');
    var userNameEl = document.getElementById('dashUserName');
    var profileNameEl = document.getElementById('dashProfileName');
    if (greetingEl) {
      var hour = new Date().getHours();
      greetingEl.textContent = (hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening') + ', ' + firstName;
    }
    if (userNameEl) userNameEl.textContent = 'Welcome back, ' + firstName;
    if (profileNameEl) profileNameEl.textContent = firstName;
  }

  /* ---------- Live Clock ---------- */
  function updateClock() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    var timeStr = h12 + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + ' ' + ampm;
    var clockEl = document.getElementById('dashClock');
    if (clockEl) clockEl.textContent = timeStr;
  }

  /* ---------- Sidebar Toggle (Mobile) ---------- */
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
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      if (sidebar && sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
    });
  }
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  /* ---------- Sidebar Collapse (Desktop) ---------- */
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', function () {
      if (sidebar) { sidebar.classList.toggle('collapsed'); setUserData('sidebarCollapsed', sidebar.classList.contains('collapsed')); }
    });
    var savedState = getUserData();
    if (savedState.sidebarCollapsed && sidebar) sidebar.classList.add('collapsed');
  }

  /* ---------- Section Navigation ---------- */
  var navLinks = document.querySelectorAll('.sidebar__link[data-section]');
  var sections = document.querySelectorAll('.dash-section');
  function switchSection(sectionId) {
    navLinks.forEach(function (link) {
      link.classList.remove('active'); link.removeAttribute('aria-current');
      if (link.getAttribute('data-section') === sectionId) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
    });
    sections.forEach(function (section) { section.classList.remove('active'); if (section.id === 'section-' + sectionId) section.classList.add('active'); });
    closeSidebar();
    var main = document.querySelector('.dash-main');
    if (main) main.scrollTop = 0;
    setTimeout(function () { animateCounters(); animateProgressBars(); drawAllCharts(); }, 100);
  }
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) { e.preventDefault(); switchSection(this.getAttribute('data-section')); });
  });
  document.querySelectorAll('.quick-action[data-section]').forEach(function (btn) {
    btn.addEventListener('click', function () { switchSection(this.getAttribute('data-section')); });
  });
  document.querySelectorAll('.dash-header__dropdown-item[data-section]').forEach(function (item) {
    item.addEventListener('click', function (e) { e.preventDefault(); switchSection(this.getAttribute('data-section')); if (profileDropdown) profileDropdown.classList.remove('open'); });
  });

  /* ---------- Profile Dropdown ---------- */
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

  /* ---------- Theme Toggle ---------- */
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var icon = this.querySelector('i');
      if (icon) { if (icon.classList.contains('fa-moon')) icon.classList.replace('fa-moon', 'fa-sun'); else icon.classList.replace('fa-sun', 'fa-moon'); }
    });
  }

  /* ---------- Notification Panel ---------- */
  var notifCount = 5;
  function addNotification() {
    var panel = document.getElementById('notifPanel');
    var list = document.getElementById('notifList');
    if (!list) return;
    var items = [
      { icon: 'fa-file-alt', color: '#3b82f6', text: 'New document uploaded for your case' },
      { icon: 'fa-calendar-check', color: '#22c55e', text: 'Appointment confirmed for tomorrow' },
      { icon: 'fa-credit-card', color: '#8b5cf6', text: 'Invoice payment processed' },
      { icon: 'fa-user-check', color: '#C8A96B', text: 'Attorney assigned to your case' }
    ];
    var item = items[Math.floor(Math.random() * items.length)];
    var div = document.createElement('div');
    div.className = 'notif-item notif-item--new';
    div.innerHTML = '<div class="notif-item__icon" style="background:' + item.color + '20;color:' + item.color + '"><i class="fas ' + item.icon + '" aria-hidden="true"></i></div><div class="notif-item__info"><p>' + item.text + '</p><span class="notif-item__time">Just now</span></div>';
    list.insertBefore(div, list.firstChild);
    if (list.children.length > 10) list.removeChild(list.lastChild);
    notifCount++;
    var badge = document.querySelector('.dash-header__notif-badge');
    if (badge) { badge.textContent = notifCount; badge.style.display = 'flex'; }
  }
  if (notifBtn) {
    notifBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var panel = document.getElementById('notifPanel');
      if (panel) { panel.classList.toggle('open'); if (panel.classList.contains('open')) { notifCount = 0; var badge = document.querySelector('.dash-header__notif-badge'); if (badge) badge.style.display = 'none'; } }
    });
  }
  document.addEventListener('click', function (e) {
    var panel = document.getElementById('notifPanel');
    if (panel && !panel.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) panel.classList.remove('open');
  });

  /* ---------- Counter Animation ---------- */
  function animateCounters() {
    document.querySelectorAll('.stat-card__number[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      if (prefersReducedMotion) { el.textContent = target; return; }
      var startTime = null, duration = 1200;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step); else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Live KPI Updates ---------- */
  var liveKPIs = { 'kpi-active': { base: 4, range: 1 }, 'kpi-meetings': { base: 2, range: 1 }, 'kpi-pending': { base: 3, range: 1 }, 'kpi-invoices': { base: 1, range: 1 } };
  function updateLiveKPIs() {
    Object.keys(liveKPIs).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var kpi = liveKPIs[id];
      var newVal = kpi.base + Math.floor(Math.random() * kpi.range * 2) - kpi.range;
      if (newVal < 1) newVal = 1;
      kpi.base = newVal;
      el.textContent = newVal;
      el.classList.add('stat-card__number--flash');
      setTimeout(function () { el.classList.remove('stat-card__number--flash'); }, 500);
    });
  }

  /* ---------- Progress Bar Animation ---------- */
  function animateProgressBars() {
    document.querySelectorAll('.progress-bar__fill[data-width], .table-progress__fill[data-width]').forEach(function (bar) {
      var width = bar.getAttribute('data-width');
      if (prefersReducedMotion) { bar.style.width = width + '%'; return; }
      bar.style.width = '0%';
      setTimeout(function () { bar.style.width = width + '%'; }, 200);
    });
  }

  /* ---------- Canvas Charts ---------- */
  function setupCanvas(id) {
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  function drawLineChart() {
    var s = setupCanvas('lineCanvas'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var data = [3, 5, 2, 8, 6, 4, 7];
    var max = Math.max.apply(null, data) + 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
    ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, 'rgba(200,169,107,0.2)'); grad.addColorStop(1, 'rgba(200,169,107,0.02)'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#C8A96B'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#C8A96B'; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = '#FFF'; ctx.fill(); });
  }

  function drawBarChart() {
    var s = setupCanvas('dashBarChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var data = [3, 5, 4, 7, 6, 8];
    var max = Math.max.apply(null, data) + 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    var barW = (cW / labels.length) * 0.55, gap = (cW / labels.length) * 0.45;
    labels.forEach(function (label, idx) {
      var barH = (data[idx] / max) * cH; var x = pad.left + idx * (barW + gap) + gap / 2; var y = pad.top + cH - barH;
      var barGrad = ctx.createLinearGradient(0, y, 0, pad.top + cH); barGrad.addColorStop(0, '#3b82f6'); barGrad.addColorStop(1, 'rgba(59,130,246,0.4)'); ctx.fillStyle = barGrad;
      var r = 4; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y); ctx.quadraticCurveTo(x + barW, y, x + barW, y + r); ctx.lineTo(x + barW, pad.top + cH); ctx.lineTo(x, pad.top + cH); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#64748B'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x + barW / 2, h - 8);
    });
  }

  function drawAreaChart() {
    var s = setupCanvas('dashAreaChart'); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    var data = [12, 18, 15, 22];
    var max = 28;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) { var y = pad.top + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); }
    ctx.fillStyle = '#64748B'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach(function (l, idx) { ctx.fillText(l, pad.left + (cW / (labels.length - 1)) * idx, h - 8); });
    var points = []; data.forEach(function (val, idx) { points.push({ x: pad.left + (cW / (data.length - 1)) * idx, y: pad.top + cH - (val / max) * cH }); });
    ctx.beginPath(); ctx.moveTo(points[0].x, pad.top + cH); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.lineTo(points[points.length - 1].x, pad.top + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH); grad.addColorStop(0, 'rgba(34,197,94,0.2)'); grad.addColorStop(1, 'rgba(34,197,94,0.02)'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    points.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    points.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill(); });
  }

  function drawSparkline(canvasId, data, color) {
    var s = setupCanvas(canvasId); if (!s) return;
    var ctx = s.ctx, w = s.w, h = s.h;
    var max = Math.max.apply(null, data); var min = Math.min.apply(null, data); var range = max - min || 1;
    var points = []; data.forEach(function (val, idx) { points.push({ x: (idx / (data.length - 1)) * w, y: h - ((val - min) / range) * (h - 4) - 2 }); });
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); points.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function drawAllCharts() {
    drawLineChart(); drawBarChart(); drawAreaChart();
    drawSparkline('spark1', [12, 15, 13, 18, 16, 20, 19], '#C8A96B');
    drawSparkline('spark2', [8, 12, 10, 15, 14, 18, 17], '#3b82f6');
    drawSparkline('spark3', [5, 7, 6, 9, 8, 11, 10], '#22c55e');
  }

  /* ---------- Live Activity Feed ---------- */
  var activityFeed = document.getElementById('dashActivityFeed');
  var activityItems = [
    { dot: 'blue', text: 'New document uploaded for <strong>Corporate Merger</strong>', time: 'Just now' },
    { dot: 'gold', text: 'Meeting scheduled with <strong>Sarah Mitchell</strong>', time: 'Just now' },
    { dot: 'green', text: 'Invoice <strong>#INV-2024-018</strong> paid successfully', time: 'Just now' },
    { dot: 'red', text: 'Document review required for <strong>Estate Planning</strong>', time: 'Just now' },
    { dot: 'blue', text: 'Case status updated to <strong>Under Review</strong>', time: 'Just now' }
  ];
  function prependActivity() {
    if (!activityFeed) return;
    var item = activityItems[Math.floor(Math.random() * activityItems.length)];
    var div = document.createElement('div');
    div.className = 'timeline__item timeline__item--new';
    div.innerHTML = '<div class="timeline__dot timeline__dot--' + item.dot + '"></div><div class="timeline__content"><p class="timeline__text">' + item.text + '</p><span class="timeline__time">' + item.time + '</span></div>';
    activityFeed.insertBefore(div, activityFeed.firstChild);
    if (activityFeed.children.length > 8) activityFeed.removeChild(activityFeed.lastChild);
  }

  /* ---------- Calendar ---------- */
  var calGrid = document.getElementById('calendarGrid');
  var calTitle = document.getElementById('calendarTitle');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var currentMonth = new Date().getMonth();
  var currentYear = new Date().getFullYear();
  var eventDays = [12, 18, 25];
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function renderCalendar(month, year) {
    if (!calGrid) return; calGrid.innerHTML = '';
    if (calTitle) calTitle.textContent = monthNames[month] + ' ' + year;
    var firstDay = new Date(year, month, 1).getDay(); var daysInMonth = new Date(year, month + 1, 0).getDate(); var daysInPrev = new Date(year, month, 0).getDate(); var today = new Date();
    for (var i = firstDay - 1; i >= 0; i--) { var d = document.createElement('div'); d.className = 'calendar__day calendar__day--other'; d.textContent = daysInPrev - i; calGrid.appendChild(d); }
    for (var day = 1; day <= daysInMonth; day++) { var dayEl = document.createElement('div'); dayEl.className = 'calendar__day'; dayEl.textContent = day; if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayEl.classList.add('calendar__day--today'); if (eventDays.indexOf(day) !== -1) dayEl.classList.add('calendar__day--has-event'); calGrid.appendChild(dayEl); }
    var totalCells = firstDay + daysInMonth; var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var n = 1; n <= remaining; n++) { var nd = document.createElement('div'); nd.className = 'calendar__day calendar__day--other'; nd.textContent = n; calGrid.appendChild(nd); }
  }
  if (calPrev) calPrev.addEventListener('click', function () { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(currentMonth, currentYear); });
  if (calNext) calNext.addEventListener('click', function () { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(currentMonth, currentYear); });

  /* ---------- Chat ---------- */
  function sendMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim(); if (!text) return;
    var now = new Date(); var h = now.getHours(), m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    var timeStr = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    var msgDiv = document.createElement('div'); msgDiv.className = 'chat-msg chat-msg--self';
    msgDiv.innerHTML = '<div class="chat-msg__content"><p>' + escapeHtml(text) + '</p><span class="chat-msg__time">' + timeStr + '</span></div>';
    chatMessages.appendChild(msgDiv); chatInput.value = ''; chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(function () {
      var replyDiv = document.createElement('div'); replyDiv.className = 'chat-msg chat-msg--other';
      replyDiv.innerHTML = '<div class="chat-msg__avatar"><span>SM</span></div><div class="chat-msg__content"><p>Thank you for your message. I\'ll review this and get back to you shortly.</p><span class="chat-msg__time">' + timeStr + '</span></div>';
      chatMessages.appendChild(replyDiv); chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
  }
  function escapeHtml(str) { var div = document.createElement('div'); div.appendChild(document.createTextNode(str)); return div.innerHTML; }
  if (chatSend) chatSend.addEventListener('click', sendMessage);
  if (chatInput) chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });

  /* ---------- Case Search & Filter ---------- */
  var caseSearch = document.getElementById('caseSearch');
  var caseFilter = document.getElementById('caseFilter');
  function filterCases() {
    var sv = caseSearch ? caseSearch.value.toLowerCase() : '';
    var fv = caseFilter ? caseFilter.value : 'all';
    document.querySelectorAll('#casesTable tbody tr').forEach(function (row) {
      var text = row.textContent.toLowerCase();
      var ms = !sv || text.indexOf(sv) !== -1;
      var mf = fv === 'all' || row.querySelector('.badge--' + fv);
      row.style.display = ms && mf ? '' : 'none';
    });
    document.querySelectorAll('.case-card').forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var ms = !sv || text.indexOf(sv) !== -1;
      var badge = card.querySelector('.badge');
      var st = badge ? badge.textContent.trim().toLowerCase() : '';
      var mf = fv === 'all' || st === fv;
      card.style.display = ms && mf ? '' : 'none';
    });
  }
  if (caseSearch) caseSearch.addEventListener('input', filterCases);
  if (caseFilter) caseFilter.addEventListener('change', filterCases);

  /* ---------- Chart Tab Switching ---------- */
  document.querySelectorAll('.dash-card__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var parent = this.closest('.dash-card__tabs');
      if (parent) parent.querySelectorAll('.dash-card__tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active'); drawLineChart();
    });
  });

  /* ---------- Window Resize ---------- */
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { drawAllCharts(); if (window.innerWidth > 1024) closeSidebar(); }, 250); });

  /* ---------- Escape Key ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSidebar(); if (profileDropdown) { profileDropdown.classList.remove('open'); if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false'); } }
  });

  /* ---------- Initialize ---------- */
  initUserDisplay(); updateClock(); renderCalendar(currentMonth, currentYear); animateCounters(); animateProgressBars(); drawAllCharts();

  /* Live updates */
  setInterval(updateClock, 1000);
  setInterval(updateLiveKPIs, 10000);
  setInterval(prependActivity, 15000);
  setInterval(addNotification, 20000);

})();
