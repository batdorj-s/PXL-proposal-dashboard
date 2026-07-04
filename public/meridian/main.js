/* ═══════════════════════════════════════════════════
   MERIDIAN — main.js
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Register GSAP plugins ───────────────────── */
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  CustomEase.create('meridian', '0.16, 1, 0.3, 1');
  CustomEase.create('meridianIn', '0.77, 0, 0.175, 1');

  /* ═══════════════════════════════════════════════
     1. CURSOR
  ═══════════════════════════════════════════════ */
  const cursor         = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let isHovering = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursor, { x: mouseX, y: mouseY });
  });

  /* Smooth follower via RAF */
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    gsap.set(cursorFollower, { x: followerX, y: followerY });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  /* Hover states for magnetic elements */
  document.querySelectorAll('.magnetic, .magnetic-input, button, a, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hovering');
      cursorFollower.classList.add('is-hovering');
      isHovering = true;
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hovering');
      cursorFollower.classList.remove('is-hovering');
      isHovering = false;
    });
  });

  /* Magnetic pull on buttons */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.28;
      const dy   = (e.clientY - cy) * 0.28;
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'meridian' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'meridian' });
    });
  });

  /* ═══════════════════════════════════════════════
     2. THREE.JS — Hero WebGL Wave
  ═══════════════════════════════════════════════ */
  const canvas = document.getElementById('heroCanvas');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  /* Plane geometry for the wave mesh */
  const geo = new THREE.PlaneGeometry(12, 12, 80, 80);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:    { value: 0 },
      uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
      uColor1:  { value: new THREE.Color('#0a0a14') },
      uColor2:  { value: new THREE.Color('#1a1228') },
      uAccent:  { value: new THREE.Color('#C9A96E') },
    },
    vertexShader: `
      uniform float uTime;
      uniform vec2  uMouse;
      varying vec2  vUv;
      varying float vElevation;

      // Classic 2D noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x  = 2.0 * fract(p * C.www) - 1.0;
        vec3 h  = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
        vec3 g;
        g.x = a0.x*x0.x + h.x*x0.y;
        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vUv = uv;
        vec3 pos = position;

        float n1 = snoise(pos.xy * 0.5 + uTime * 0.12) * 0.4;
        float n2 = snoise(pos.xy * 1.2 - uTime * 0.08) * 0.15;
        float n3 = snoise(pos.xy * 2.5 + uTime * 0.05) * 0.06;

        /* Mouse ripple */
        vec2  mDelta = pos.xy - (uMouse * 2.0 - 1.0) * 6.0;
        float mDist  = length(mDelta);
        float ripple = sin(mDist * 2.0 - uTime * 3.0) * exp(-mDist * 0.5) * 0.25;

        pos.z += n1 + n2 + n3 + ripple;
        vElevation = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3  uColor1;
      uniform vec3  uColor2;
      uniform vec3  uAccent;
      varying vec2  vUv;
      varying float vElevation;

      void main() {
        float t      = (vElevation + 0.6) * 0.8;
        t            = clamp(t, 0.0, 1.0);
        vec3  col    = mix(uColor1, uColor2, t);
        float accent = smoothstep(0.55, 0.85, t);
        col         += uAccent * accent * 0.12;

        /* Vignette fade at edges */
        vec2  center = vUv - 0.5;
        float vig    = 1.0 - dot(center, center) * 2.0;
        vig          = clamp(vig, 0.0, 1.0);

        gl_FragColor = vec4(col, vig * 0.85);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -0.4;
  scene.add(mesh);

  let clock = new THREE.Clock();
  let targetMouseX = 0.5, targetMouseY = 0.5;
  let currentMouseX = 0.5, currentMouseY = 0.5;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1 - e.clientY / window.innerHeight;
  });

  function renderThree() {
    requestAnimationFrame(renderThree);
    const elapsed = clock.getElapsedTime();
    mat.uniforms.uTime.value = elapsed;

    currentMouseX += (targetMouseX - currentMouseX) * 0.04;
    currentMouseY += (targetMouseY - currentMouseY) * 0.04;
    mat.uniforms.uMouse.value.set(currentMouseX, currentMouseY);

    renderer.render(scene, camera);
  }
  renderThree();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ═══════════════════════════════════════════════
     3. NAVIGATION — scroll-aware
  ═══════════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 80,
    onEnter:      () => nav.classList.add('scrolled'),
    onLeaveBack:  () => nav.classList.remove('scrolled'),
  });

  /* ═══════════════════════════════════════════════
     4. HERO ENTRANCE ANIMATION
  ═══════════════════════════════════════════════ */
  const heroTL = gsap.timeline({ delay: 0.3 });

  heroTL
    .to('.hero-eyebrow', { opacity: 1, duration: 0.8, ease: 'meridian' })
    .to('.reveal-line', {
      y: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'meridian',
    }, '-=0.4')
    .to('.hero-sub', { opacity: 1, duration: 0.8, ease: 'meridian' }, '-=0.5')
    .to('.hero-actions', { opacity: 1, duration: 0.8, ease: 'meridian' }, '-=0.5')
    .to('.hero-scroll-indicator', { opacity: 1, duration: 0.6, ease: 'meridian' }, '-=0.3')
    .to('.hero-corner-info', { opacity: 1, duration: 0.6, ease: 'meridian' }, '-=0.6');

  /* ═══════════════════════════════════════════════
     5. SPLIT TEXT — scroll-triggered line reveals
  ═══════════════════════════════════════════════ */
  function wrapLines(selector) {
    document.querySelectorAll(selector).forEach(el => {
      const text = el.innerHTML;
      el.innerHTML = `<span>${text}</span>`;
    });
  }

  wrapLines('.manifesto-line');
  wrapLines('.section-title');
  wrapLines('.contact-title');

  /* Manifesto lines */
  gsap.utils.toArray('.manifesto-line span').forEach((span, i) => {
    gsap.from(span, {
      y: '105%',
      duration: 1.0,
      ease: 'meridian',
      scrollTrigger: {
        trigger: span.closest('.manifesto-line'),
        start: 'top 85%',
      },
      delay: i * 0.08,
    });
  });

  /* Section titles */
  gsap.utils.toArray('.section-title span').forEach(span => {
    gsap.from(span, {
      y: '105%',
      duration: 1.0,
      ease: 'meridian',
      scrollTrigger: {
        trigger: span.closest('.section-title'),
        start: 'top 88%',
      },
    });
  });

  /* Contact title */
  gsap.utils.toArray('.contact-title span').forEach(span => {
    gsap.from(span, {
      y: '105%',
      duration: 1.2,
      ease: 'meridian',
      scrollTrigger: {
        trigger: span.closest('.contact-title'),
        start: 'top 85%',
      },
    });
  });

  /* ─── Generic scroll-reveal helpers ──────────── */
  gsap.utils.toArray('.reveal-fade-up').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'meridian',
        delay: (i % 4) * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  gsap.utils.toArray('.reveal-fade').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.9,
        ease: 'meridian',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  /* ═══════════════════════════════════════════════
     6. METRICS COUNTERS + BARS
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.metric-num').forEach(el => {
    const target  = +el.dataset.target;
    const suffix  = el.dataset.suffix || '';
    const obj     = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      },
    });
  });

  /* Metric bars */
  document.querySelectorAll('.metric-bar-fill').forEach(bar => {
    const w = bar.dataset.width;
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(bar, { width: w + '%', duration: 1.6, ease: 'power2.out', delay: 0.3 });
      },
    });
  });

  /* Hero corner counter */
  const cornerNum = document.querySelector('.corner-num');
  if (cornerNum) {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 147,
      delay: 1.5,
      duration: 2.5,
      ease: 'power3.out',
      onUpdate: () => { cornerNum.textContent = Math.round(obj.val); },
    });
  }

  /* ═══════════════════════════════════════════════
     7. PROPOSAL CARDS — 3D TILT + SHINE
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.tilt-card').forEach(card => {
    const shine = card.querySelector('.card-shine');

    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const dx    = (e.clientX - rect.left  - cx) / cx;
      const dy    = (e.clientY - rect.top   - cy) / cy;

      const rotX  = -dy * 10;
      const rotY  =  dx * 10;

      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: 800,
        duration: 0.5,
        ease: 'power2.out',
      });

      /* Shine tracking */
      const px = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const py = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mouse-x', px + '%');
      card.style.setProperty('--mouse-y', py + '%');
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'meridian',
      });
    });
  });

  /* ═══════════════════════════════════════════════
     8. PROPOSALS TRACK — drag scroll
  ═══════════════════════════════════════════════ */
  const track = document.querySelector('.proposals-track-wrap');
  if (track) {
    let isDown  = false;
    let startX  = 0;
    let scrollL = 0;

    track.addEventListener('mousedown', (e) => {
      isDown  = true;
      startX  = e.pageX - track.offsetLeft;
      scrollL = track.scrollLeft;
      track.classList.add('grabbing');
    });

    document.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('grabbing');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollL - walk;
    });

    /* Touch drag */
    let touchStartX  = 0;
    let touchScrollL = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX  = e.touches[0].pageX;
      touchScrollL = track.scrollLeft;
    });

    track.addEventListener('touchmove', (e) => {
      const diff    = touchStartX - e.touches[0].pageX;
      track.scrollLeft = touchScrollL + diff;
    });
  }

  /* ═══════════════════════════════════════════════
     9. PROPOSAL CARDS — staggered entrance
  ═══════════════════════════════════════════════ */
  gsap.from('.proposal-card', {
    opacity: 0,
    y: 40,
    duration: 0.9,
    stagger: 0.12,
    ease: 'meridian',
    scrollTrigger: {
      trigger: '.proposals-track',
      start: 'top 80%',
    },
  });

  /* ═══════════════════════════════════════════════
     10. CONTACT FORM — micro-interactions
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input.previousElementSibling, {
        color: '#C9A96E',
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    input.addEventListener('blur', () => {
      gsap.to(input.previousElementSibling, {
        color: 'rgba(232,224,213,0.4)',
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn  = contactForm.querySelector('.btn-submit');
      const text = btn.querySelector('.btn-submit-text');
      const icon = btn.querySelector('.btn-submit-icon');

      gsap.timeline()
        .to(btn, { scale: 0.96, duration: 0.1, ease: 'power2.in' })
        .to(btn, { scale: 1, duration: 0.4, ease: 'meridian' })
        .to([text, icon], { opacity: 0, duration: 0.2 }, 0)
        .call(() => { text.textContent = 'Brief Received ✓'; icon.textContent = ''; })
        .to([text, icon], { opacity: 1, duration: 0.3 });
    });
  }

  /* ═══════════════════════════════════════════════
     11. PARALLAX — sections subtle movement
  ═══════════════════════════════════════════════ */
  gsap.utils.toArray('.manifesto, .process').forEach(section => {
    gsap.to(section, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* ═══════════════════════════════════════════════
     12. SMOOTH ANCHOR SCROLL
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1.2,
        ease: 'meridian',
      });
    });
  });

  /* ═══════════════════════════════════════════════
     13. PROCESS STEPS — staggered
  ═══════════════════════════════════════════════ */
  gsap.utils.toArray('.process-step').forEach((step, i) => {
    gsap.fromTo(step,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'meridian',
        delay: i * 0.15,
        scrollTrigger: { trigger: '.process-steps', start: 'top 80%' },
      }
    );
  });

})();
