const EMAIL = 'najimdeenajadi@gmail.com';

/* Mobile navigation ----------------------------------------------------- */
const menu = document.getElementById('navMenu');
const toggle = document.getElementById('navToggle');

if (menu && toggle) {
    menu.setAttribute('data-collapsible', '');
    toggle.hidden = false;

    const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        menu.toggleAttribute('data-open', open);
    };

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('.nav__link').forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.hasAttribute('data-open')) {
            setMenu(false);
            toggle.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (menu.hasAttribute('data-open') && event.target instanceof Element && !event.target.closest('.nav')) {
            setMenu(false);
        }
    });

    matchMedia('(max-width: 760px)').addEventListener('change', (event) => {
        if (!event.matches) setMenu(false);
    });
}

/* Track the section at the reading line below the fixed header ----------- */
const header = document.querySelector('.nav');
const sections = [...document.querySelectorAll('.nav__link[href^="#"]')]
    .map((link) => ({ link, target: document.getElementById(link.hash.slice(1)) }))
    .filter(({ target }) => target);

if (header) {
    let frame = 0;
    let activeLink = menu?.querySelector('[aria-current]');

    const syncNavigation = () => {
        frame = 0;
        const y = window.scrollY;
        let current = sections[0];

        if (current) {
            if (y > 0 && y + innerHeight >= document.documentElement.scrollHeight - 2) {
                current = sections[sections.length - 1];
            } else {
                const readingLine = Math.max(header.offsetHeight + 16, innerHeight * 0.3);
                for (const section of sections) {
                    if (section.target.getBoundingClientRect().top > readingLine) break;
                    current = section;
                }
            }
        }

        header.toggleAttribute('data-scrolled', y > 12);
        if (current && activeLink !== current.link) {
            activeLink?.removeAttribute('aria-current');
            activeLink = current.link;
            activeLink.setAttribute('aria-current', 'location');
        }
    };

    const scheduleSync = () => { frame ||= requestAnimationFrame(syncNavigation); };
    addEventListener('scroll', scheduleSync, { passive: true });
    addEventListener('resize', scheduleSync, { passive: true });
    addEventListener('pageshow', scheduleSync);
    scheduleSync();
}

/* Reveal section content once, just before it reaches the viewport -------- */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.page-section .section-head, .page-section .card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach((target) => revealObserver.observe(target));
}

/* Contact --------------------------------------------------------------- */
const toast = (message) => {
    const element = document.getElementById('toast');
    if (!element) return;
    element.textContent = message;
    element.setAttribute('data-show', '');
    setTimeout(() => element.removeAttribute('data-show'), 2200);
};

const copyEmail = async () => {
    try {
        await navigator.clipboard.writeText(EMAIL);
        toast(`Copied ${EMAIL}`);
    } catch {
        toast(`Copy this address: ${EMAIL}`);
    }
};

document.querySelectorAll('[data-copy-email]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', copyEmail);
});

const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (form && formStatus) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const subject = `Portfolio message from ${data.get('name')}`;
        const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
        formStatus.textContent = 'Opening your email app…';
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
