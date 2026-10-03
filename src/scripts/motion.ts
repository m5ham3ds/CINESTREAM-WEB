import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ThemeRequest = { theme: 'light' | 'dark'; source: EventTarget | null };
type LanguageRequest = { language: 'ar' | 'en'; source: EventTarget | null };
type MenuRequest = { open: boolean; source: EventTarget | null };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

const getPoint = (source: EventTarget | null, fallbackX = window.innerWidth / 2, fallbackY = 40) => {
  if (source instanceof HTMLElement) {
    const r = source.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: fallbackX, y: fallbackY };
};

const transitionLayer = (kind: 'theme' | 'language') => {
  const el = document.createElement('div');
  el.className = `cine-transition cine-transition-${kind}`;
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  return el;
};

const refreshAfterLayoutChange = () => {
  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const animateMenu = ({ open, source }: MenuRequest) => {
  const menu = document.getElementById('mobile-menu');
  const button = source instanceof HTMLElement ? source : document.getElementById('menu-btn');
  if (!menu) return;

  if (open) {
    menu.hidden = false;
    document.body.classList.add('menu-open');
    const links = menu.querySelectorAll('a');
    gsap.killTweensOf([menu, links, button]);
    gsap.set(menu, { autoAlpha: 0, y: -22, clipPath: 'inset(0 0 100% 0 round 0 0 18px 18px)' });
    gsap.set(links, { autoAlpha: 0, y: -8, x: 16 });
    if (button) gsap.set(button, { rotate: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    // Slower, more deliberate opening: the panel settles first, then the links cascade in.
    tl.to(menu, { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 0 0 18px 18px)', duration: 0.72 })
      .to(links, { autoAlpha: 1, x: 0, y: 0, duration: 0.46, stagger: 0.09 }, '-=0.30');
    if (button) tl.to(button, { rotate: 90, scale: 1.04, duration: 0.48 }, '<0.06');
    refreshAfterLayoutChange();
    return;
  }

  const links = menu.querySelectorAll('a');
  gsap.killTweensOf([menu, links, button]);
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      menu.hidden = true;
      document.body.classList.remove('menu-open');
      refreshAfterLayoutChange();
    }
  });
  tl.to(links, { autoAlpha: 0, x: 18, duration: 0.26, stagger: 0.045 })
    .to(menu, { autoAlpha: 0, y: -16, clipPath: 'inset(0 0 100% 0 round 0 0 18px 18px)', duration: 0.48 }, '-=0.12');
  if (button) tl.to(button, { rotate: 0, scale: 1, duration: 0.36 }, '<0.04');
};

const animateWipe = (kind: 'theme' | 'language', change: () => void, source: EventTarget | null, targetColor: string) => {
  if (reducedMotion) {
    change();
    return;
  }

  const layer = transitionLayer(kind);
  const page = document.querySelector<HTMLElement>('main');
  const footer = document.querySelector<HTMLElement>('.site-footer');
  const header = document.querySelector<HTMLElement>('.site-header');
  const content = [header, page, footer].filter(Boolean) as HTMLElement[];
  const { x, y } = getPoint(source, window.innerWidth / 2, 40);
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  ) + 32;

  // A continuous radial reveal: it starts exactly at the clicked control,
  // covers the old state, swaps the state while fully covered, then recedes
  // from the same point to reveal the new state. There is no mid-screen stop.
  layer.style.background = `radial-gradient(circle at ${x}px ${y}px, ${targetColor} 0%, ${targetColor} 72%, rgba(255,255,255,.08) 88%, ${targetColor} 100%)`;
  layer.classList.add('cine-radial');
  layer.style.setProperty('--origin-x', `${x}px`);
  layer.style.setProperty('--origin-y', `${y}px`);
  layer.style.setProperty('--max-radius', `${maxRadius}px`);

  const revealTargets = page
    ? page.querySelectorAll<HTMLElement>('[data-reveal], .section-title, .content-card, .feature-card, .timeline-card, .why-grid article, .faq-item')
    : [];

  gsap.set(layer, {
    clipPath: `circle(0px at ${x}px ${y}px)`,
    autoAlpha: 1,
    scale: 1,
    willChange: 'clip-path, transform, opacity'
  });
  gsap.set(content, { willChange: 'opacity, transform, filter' });
  gsap.set(revealTargets, { autoAlpha: 1, clearProps: 'transform,filter' });

  const tl = gsap.timeline({
    defaults: { overwrite: 'auto' },
    onComplete: () => {
      layer.remove();
      gsap.set(content, { clearProps: 'willChange,filter,transform,opacity' });
      gsap.set(revealTargets, { clearProps: 'opacity,transform' });
    }
  });

  // 1) Expand from the clicked button until the whole viewport is covered.
  tl.to(layer, {
    clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
    duration: 0.72,
    ease: 'power3.inOut'
  }, 0)
    // 2) Swap the state while the new state is completely hidden underneath.
    .add(() => {
      change();
      // Start the new page slightly softer, ready for the reveal phase.
      gsap.set(revealTargets, { autoAlpha: 0, y: 10 });
    }, 0.72)
    // 3) The same surface immediately contracts back to the exact click point.
    .to(layer, {
      clipPath: `circle(0px at ${x}px ${y}px)`,
      duration: 0.92,
      ease: 'power3.inOut'
    }, 0.76)
    // 4) New elements become visible while the radial surface is receding.
    .to(revealTargets, {
      autoAlpha: 1,
      y: 0,
      duration: 0.48,
      stagger: 0.012,
      ease: 'power2.out',
      clearProps: 'opacity,transform'
    }, 0.96);
};

const animateTheme = ({ theme, source }: ThemeRequest) => {
  const current = root.dataset.theme === 'light' ? 'light' : 'dark';
  if (current === theme) return;
  const targetColor = theme === 'light' ? '#e9eaed' : '#0f1115';
  animateWipe('theme', () => {
    window.cineSetTheme(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', targetColor);
    document.dispatchEvent(new CustomEvent('cine:theme', { detail: theme }));
  }, source, targetColor);
};

const animateLanguage = ({ language, source }: LanguageRequest) => {
  if (root.lang === language) return;
  animateWipe('language', () => {
    window.cineSetLanguage(language);
  }, source, root.dataset.theme === 'light' ? '#e9eaed' : '#0f1115');
};

document.addEventListener('cine:menu', (event) => animateMenu((event as CustomEvent<MenuRequest>).detail));
document.addEventListener('cine:theme-request', (event) => animateTheme((event as CustomEvent<ThemeRequest>).detail));
document.addEventListener('cine:language-request', (event) => animateLanguage((event as CustomEvent<LanguageRequest>).detail));

if (!reducedMotion) {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.92 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -82, duration: 1.05 });
      history.replaceState(null, '', id);
    });
  });

  gsap.fromTo('.site-header', { yPercent: -100 }, { yPercent: 0, duration: .8, ease: 'power3.out', delay: .1 });
  gsap.fromTo('.hero-copy > *', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .78, stagger: .08, ease: 'power3.out', delay: .2 });
  gsap.fromTo('.hero-visual', { autoAlpha: 0, x: 55, scale: .96 }, { autoAlpha: 1, x: 0, scale: 1, duration: 1.15, ease: 'power3.out', delay: .3 });
  gsap.to('.phone-main', { y: -12, rotate: 6, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.phone-back', { y: 12, rotate: -10, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: .15 });
  gsap.to('.art-card-back', { y: 10, duration: 4.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.floating-stat', { y: -8, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .18 });
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('.section-title').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
  document.documentElement.classList.add('reduced-motion');
}
