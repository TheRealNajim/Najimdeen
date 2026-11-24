import './vitals.js';
import { EMAIL, navigate } from './ui.js';
import './palette.js';
import { initMagnetic } from './magnetic.js';
import { initSpotlight } from './spotlight.js';

/* Mobile menu ---------------------------------------------------------- */
const nav = document.getElementById('navMenu');
const toggle = document.getElementById('navToggle');

if (nav && toggle) {
    const links = [...document.querySelectorAll('.nav__link')];

    const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        nav.toggleAttribute('data-open', open);
    };

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.hasAttribute('data-open')) {
            setMenu(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', (e) => {
        if (nav.hasAttribute('data-open') && e.target instanceof Element && !e.target.closest('.nav')) setMenu(false);
    });
    matchMedia('(max-width: 720px)').addEventListener('change', (e) => {
        if (!e.matches) setMenu(false);
    });
}

/* Contact form (contact.html only): opens the visitor's mail client with the message prefilled */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form && status) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const subject = `Portfolio message from ${data.get('name')}`;
        const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening your email app…';
    });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

/* Page transitions ------------------------------------------------------- */
document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    const here = location.pathname.replace(/\/$/, '/index.html');
    if (url.origin !== location.origin || url.pathname === here || !/\.html$/.test(url.pathname)) return;

    e.preventDefault();
    navigate(url.href);
});

/* Motion ---------------------------------------------------------------- */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const main = document.querySelector('main');

/* Sticky nav condenses into a blurred bar as soon as the page moves. */
const header = document.querySelector('.nav');
if (header) {
    let frame = 0;
    const syncHeader = () => {
        header.toggleAttribute('data-scrolled', window.scrollY > 12);
        frame = 0;
    };
    addEventListener('scroll', () => {
        frame ||= requestAnimationFrame(syncHeader);
    }, { passive: true });
    syncHeader();
}

/* Scroll reveal: release each [data-reveal] block as it enters the viewport,
   with a short cascade. Transform-only, so contrast never shifts mid-animation. */
const revealTargets = [...document.querySelectorAll('[data-reveal]')];

if (revealTargets.length) {
    revealTargets.forEach((el, i) => el.style.setProperty('--reveal-i', String(i % 6)));

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('is-revealed'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

        revealTargets.forEach((el) => observer.observe(el));
    }
}

/* Page entrance for the main column; the exit handover lives in js/ui.js. */
if (main && !reducedMotion.matches) main.classList.add('is-entering');

initMagnetic();
initSpotlight();
