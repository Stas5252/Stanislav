import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 0. Smooth Scroll (Lenis)
// ==========================================
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
});

// Disable scrolling during preloader
lenis.stop();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 1. Custom Cursor
// ==========================================
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  // Instant movement for dot
  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  // Smooth follow for outline using GSAP
  gsap.to(cursorOutline, {
    x: posX,
    y: posY,
    duration: 0.15,
    ease: "power2.out"
  });
});

// Hover effects for cursor
const hoverElements = document.querySelectorAll('a, button, .service-row');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorOutline.style.width = '60px';
    cursorOutline.style.height = '60px';
    cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });
  el.addEventListener('mouseleave', () => {
    cursorOutline.style.width = '40px';
    cursorOutline.style.height = '40px';
    cursorOutline.style.backgroundColor = 'transparent';
  });
});

// Smart cursor for cases
const caseCards = document.querySelectorAll('.case-card');
const cursorText = document.getElementById('cursor-text');

// Check if device is touch-enabled
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    gsap.to(cursorOutline, {
      x: posX,
      y: posY,
      duration: 0.15,
      ease: "power2.out"
    });
  });

  caseCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cursorOutline.style.width = '90px';
      cursorOutline.style.height = '90px';
      cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      cursorOutline.style.borderColor = 'var(--accent)';
    });
    card.addEventListener('mouseleave', () => {
      cursorOutline.style.width = '40px';
      cursorOutline.style.height = '40px';
      cursorOutline.style.backgroundColor = 'transparent';
      cursorOutline.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });
  });
}

// ==========================================
// 2. Preloader & GSAP Animations
// ==========================================

const heroTimeline = gsap.timeline({ paused: true });

heroTimeline.from('.hero-title .line', {
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: 'power4.out',
  delay: 0.2
})
.from('.hero-subtitle', {
  y: 20,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, "-=0.5")
.from('.hero-actions', {
  y: 20,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, "-=0.6");

// Preloader Logic
const preloaderText = document.getElementById('preloader-text');
const preloader = document.getElementById('preloader');
let progress = { value: 0 };

// Faster progress animation
gsap.to(progress, {
  value: 100,
  duration: 1.2, // Reduced from 2s
  ease: 'power1.inOut',
  onUpdate: () => {
    if (preloaderText) preloaderText.innerText = Math.floor(progress.value) + '%';
  },
  onComplete: () => {
    gsap.to(preloader, {
      yPercent: -100,
      duration: 0.8, // Reduced from 1s
      ease: 'power4.inOut',
      onComplete: () => {
        heroTimeline.play();
        lenis.start();
      }
    });
  }
});

// About Text Reveal
const aboutTexts = document.querySelectorAll('.about-text');
aboutTexts.forEach(text => {
  const words = text.innerText.split(' ');
  text.innerHTML = '';
  words.forEach(word => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.innerHTML = `<span class="word-inner">${word}</span>`;
    text.appendChild(wordSpan);
    text.appendChild(document.createTextNode(' '));
  });

  gsap.to(text.querySelectorAll('.word-inner'), {
    scrollTrigger: {
      trigger: text,
      start: 'top 85%',
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.02,
    ease: 'power3.out'
  });
});

// Marquee Animation
const marqueeTween = gsap.to('.marquee-inner', {
  xPercent: -50,
  ease: 'none',
  duration: 15,
  repeat: -1,
  modifiers: {
    xPercent: gsap.utils.wrap(-50, 0)
  }
});

ScrollTrigger.create({
  onUpdate: (self) => {
    if (self.direction === 1) {
      gsap.to(marqueeTween, { timeScale: 1, duration: 0.3 });
    } else {
      gsap.to(marqueeTween, { timeScale: -1, duration: 0.3 });
    }
  }
});

// Cases scroll animation
gsap.utils.toArray('.case-card-wrapper').forEach(card => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });
});

// Contrast section scroll animation
gsap.from('.contrast-section .section-title', {
  scrollTrigger: {
    trigger: '.contrast-section',
    start: 'top 85%',
  },
  y: 30,
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
});

gsap.utils.toArray('.contrast-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
    },
    x: i === 0 ? -50 : 50,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: 'power3.out'
  });
});

// Process scroll animation
gsap.utils.toArray('.process-card').forEach(card => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });
});

// Services List scroll animation
gsap.utils.toArray('.service-row').forEach(row => {
  gsap.from(row, {
    scrollTrigger: {
      trigger: row,
      start: 'top 90%',
    },
    x: -50,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
  });
});

// Contact scale animation
gsap.from('.contact-box', {
  scrollTrigger: {
    trigger: '.contact',
    start: 'top 80%',
  },
  scale: 0.9,
  opacity: 0,
  duration: 1,
  ease: 'power4.out'
});

// ==========================================
// 3. Three.js Background
// ==========================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ 
  color: 0x333333,
  wireframe: true,
  transparent: true,
  opacity: 0.2
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xb0ff1a,
  transparent: true,
  opacity: 0.4
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

if (!isTouchDevice) {
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  torusKnot.rotation.y += 0.002;
  torusKnot.rotation.x += 0.001;
  particlesMesh.rotation.y = elapsedTime * 0.01;

  if (!isTouchDevice) {
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    torusKnot.rotation.y += 0.05 * (targetX - torusKnot.rotation.y);
    torusKnot.rotation.x += 0.05 * (targetY - torusKnot.rotation.x);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 4. Scroll to Top Button
// ==========================================
const scrollTopBtn = document.getElementById('scrollToTopBtn');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.5 });
  });
}

// ==========================================
// 5. Cookie Banner Logic
// ==========================================
const cookieBanner = document.getElementById('cookie-banner');
const acceptCookiesBtn = document.getElementById('accept-cookies');

if (cookieBanner && acceptCookiesBtn) {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted');
  
  if (!cookiesAccepted) {
    setTimeout(() => {
      cookieBanner.style.display = 'block';
    }, 2000);
  }

  acceptCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.style.opacity = '0';
    setTimeout(() => {
      cookieBanner.style.display = 'none';
    }, 500);
  });
}
