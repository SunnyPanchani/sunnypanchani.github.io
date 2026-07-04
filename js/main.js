/**
 * main.js
 * Loader · Navbar · Scroll spy · Skill bars · Tab switching · Counters · AOS
 * GSAP is used ONLY for the one-time hero entrance timeline on page load.
 * All scroll-triggered reveals (project cards, section titles, timeline
 * items) are handled by AOS alone. Do not add ScrollTrigger back on top
 * of AOS-controlled elements — see note further down in this file.
 */

'use strict';

/* ===========================
   LOADER
=========================== */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.querySelector('.loader-fill');
  const name   = document.querySelector('.loader-name');
  if (!loader || !fill) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (fill) fill.style.width = '100%';
      if (name) name.style.opacity = '1';

      setTimeout(() => {
        loader.style.transition = 'opacity 0.55s ease';
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          initEntrance();
        }, 560);
      }, 420);
    } else {
      if (fill) fill.style.width = progress + '%';
    }
  }, 55);
})();

/* ===========================
   HERO ENTRANCE ANIMATION
=========================== */
function initEntrance() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-eyebrow', { y: 24, opacity: 0, duration: 0.7 })
    .from('.hero-name',    { y: 40, opacity: 0, duration: 0.8 }, '-=0.3')
    .from('.hero-tagline', { y: 24, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-sub',     { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
    .from('.hero-ctas > *', {
      y: 16, opacity: 0, duration: 0.5, stagger: 0.12
    }, '-=0.3')
    .from('.hero-stats-strip', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
    .from('.scroll-indicator', { opacity: 0, duration: 0.4 }, '-=0.1');
}

/* ===========================
   NAVBAR — SCROLL BEHAVIOR
=========================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();  // run once on load
})();

/* ===========================
   NAVBAR — ACTIVE LINK SCROLL SPY
=========================== */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
})();

/* ===========================
   SCROLL INDICATOR — HIDE ON SCROLL
=========================== */
(function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  const onScroll = () => {
    indicator.style.opacity = window.scrollY > 80 ? '0' : '1';
    indicator.style.pointerEvents = window.scrollY > 80 ? 'none' : 'auto';
  };
  indicator.style.transition = 'opacity 0.4s ease';
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===========================
   HERO STAT COUNTERS
=========================== */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-value[data-count]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  } else {
    counters.forEach(c => animateCounter(c));
  }
})();

/* ===========================
   SKILLS — TAB SWITCHING
=========================== */
(function initSkillTabs() {
  const tabs   = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skills-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById('cat-' + cat);
      if (panel) {
        panel.classList.add('active');
        // Short delay so display:block renders before transition starts
        requestAnimationFrame(() => {
          requestAnimationFrame(() => animateSkillBars(panel));
        });
      }
    });
  });

  // Animate the default visible panel on scroll entry
  const skillsSection = document.getElementById('skills');
  if (skillsSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activePanel = document.querySelector('.skills-panel.active');
          if (activePanel) animateSkillBars(activePanel);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(skillsSection);
  }
})();

/* ===========================
   SKILLS — ANIMATE BARS
=========================== */
function animateSkillBars(panel) {
  const bars = panel.querySelectorAll('.skill-fill');
  bars.forEach((bar, i) => {
    const pct = bar.dataset.pct || '0';
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = pct + '%';
    }, i * 70 + 80);
  });
}

/* ===========================
   AOS — SCROLL ANIMATIONS
=========================== */
(function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
})();

/* ===========================
   SMOOTH SCROLL (legacy fallback)
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile menu if open
      const collapse = document.getElementById('navMenu');
      if (collapse && collapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    }
  });
});

/* ===========================
   BACK TO TOP — OPTIONAL
   Add a #back-to-top element to HTML to enable
=========================== */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ===========================
   NOTE: Scroll-reveal animations for .section-title, .project-card,
   and .tl-item are handled entirely by AOS via data-aos attributes
   in the HTML. Do not add a second scroll-animation library on top
   of these elements — GSAP ScrollTrigger was previously stacked here
   and caused a real bug: two competing systems both tried to control
   opacity on page load, and the reveal trigger silently failed,
   leaving the Projects section permanently invisible (opacity: 0)
   while the content remained selectable in the DOM.
=========================== */
