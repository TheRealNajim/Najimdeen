export const EMAIL = 'najimdeenajadi@gmail.com';
export const GITHUB = 'https://github.com/TheRealNajim';

let timer = 0;

export function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.setAttribute('data-show', '');
    clearTimeout(timer);
    timer = setTimeout(() => el.removeAttribute('data-show'), 2400);
}

export async function copyEmail() {
    try {
        await navigator.clipboard.writeText(EMAIL);
    } catch {
        const ta = document.createElement('textarea');
        ta.value = EMAIL;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.append(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (!ok) return toast(`Copy failed — ${EMAIL}`);
    }
    toast(`Copied ${EMAIL}`);
}

export const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/* Page transitions -------------------------------------------------------
   The header is never touched: only <main> leaves (160 ms) and enters. The
   document is swapped with a plain location change, so this works from
   file:// as well as over HTTP — no fetch, no history rewrite. */
const EXIT_MS = 160;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let leaving = false;

function settle() {
    leaving = false;
    document.body.classList.remove('is-leaving');
    document.querySelector('main')?.classList.remove('is-leaving');
}

export function navigate(url) {
    if (leaving) return;
    const main = document.querySelector('main');
    if (!main || reduced.matches) {
        location.href = url;
        return;
    }
    leaving = true;
    // Drop a still-running entrance animation so the exit transition owns the element.
    main.classList.remove('is-entering');
    main.classList.add('is-leaving');
    document.body.classList.add('is-leaving');
    setTimeout(() => {
        location.href = url;
    }, EXIT_MS);
}

// Back/forward cache: the page can be restored mid-exit, so put it straight
// back into its visible state instead of leaving <main> invisible.
addEventListener('pageshow', () => settle());
