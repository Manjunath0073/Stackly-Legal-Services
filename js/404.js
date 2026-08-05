/* ============================================================
   STACKLY LEGAL SERVICES — 404 ERROR PAGE JAVASCRIPT
   Particles, parallax, go-back button, reduced motion
   ============================================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Go Back Button ---------- */
  var goBackBtn = document.getElementById('goBackBtn');
  if (goBackBtn) {
    goBackBtn.addEventListener('click', function () {
      if (window.history && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  /* ---------- Particle System ---------- */
  function initParticles() {
    if (prefersReducedMotion) return;

    var canvas = document.getElementById('particles');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 40;
    var mouse = { x: null, y: null };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    /* Track mouse for parallax */
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    /* Particle constructor */
    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.3 + 0.05;
      this.gold = Math.random() > 0.7;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;

      /* Subtle mouse influence */
      if (mouse.x !== null) {
        var dx = mouse.x - this.x;
        var dy = mouse.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.x -= dx * 0.0003;
          this.y -= dy * 0.0003;
        }
      }

      /* Wrap around edges */
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    };

    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.gold) {
        ctx.fillStyle = 'rgba(200, 169, 107, ' + this.opacity + ')';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.opacity * 0.5) + ')';
      }
      ctx.fill();
    };

    /* Create particles */
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    /* Connect nearby particles with lines */
    function connectParticles() {
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            var opacity = (1 - dist / 150) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(200, 169, 107, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    /* Animation loop */
    var animationId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connectParticles();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    /* Pause when tab is hidden */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  /* ---------- Mouse Parallax on Shapes ---------- */
  function initParallax() {
    if (prefersReducedMotion) return;

    var shapes = document.querySelectorAll('.error-page__shape');
    if (!shapes.length) return;

    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    document.addEventListener('mousemove', function (e) {
      var moveX = (e.clientX - centerX) / centerX;
      var moveY = (e.clientY - centerY) / centerY;

      shapes.forEach(function (shape, index) {
        var depth = (index + 1) * 8;
        var x = moveX * depth;
        var y = moveY * depth;
        shape.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
    });
  }

  /* ---------- Initialize ---------- */
  initParticles();
  initParallax();

})();
