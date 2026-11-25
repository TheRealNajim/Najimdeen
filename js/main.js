const EMAIL = 'najimdeenajadi@gmail.com';

/* Mobile navigation ----------------------------------------------------- */
const menu = document.getElementById('navMenu');
const toggle = document.getElementById('navToggle');

if (menu && toggle) {
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

/* Solid navigation rule after scrolling -------------------------------- */
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
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        formStatus.textContent = 'Opening your email app…';
    });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
