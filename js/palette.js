import { GITHUB, EMAIL, toast, copyEmail, openExternal, navigate } from './ui.js';
import { vitals } from './vitals.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
const MOD = isMac ? '⌘' : 'Ctrl';

const $ = (id) => document.getElementById(id);
const palette = $('palette');
const input = $('paletteInput');
const list = $('paletteList');
const status = $('paletteStatus');
const panel = $('panel');

const SECTIONS = [
    ['index.html', 'Home', 'h'],
    ['about.html', 'About', 'a'],
    ['projects.html', 'Projects', 'p'],
    ['services.html', 'Services', 's'],
    ['contact.html', 'Contact', 'c'],
];

const go = (path) => {
    const here = location.pathname.split('/').pop() || 'index.html';
    if (path === here) {
        window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
        return;
    }
    navigate(path);
};

const download = () => {
    const a = document.createElement('a');
    a.href = 'Najimdeen_CV.pdf';
    a.download = 'Najimdeen_CV.pdf';
    a.click();
    toast('Downloading Najimdeen_CV.pdf');
};

/* Commands ---------------------------------------------------------------- */
function buildCommands() {
    const nav = SECTIONS.map(([path, label, key]) => ({
        group: 'Navigate', icon: '#', label: `Go to ${label}`, hint: `G ${key.toUpperCase()}`, keywords: label, run: () => go(path),
    }));

    const projects = [...document.querySelectorAll('.project')].map((card) => {
        const a = card.querySelector('.project__link');
        return {
            group: 'Projects', icon: '↗', label: card.querySelector('h2, h3').textContent.trim(),
            hint: new URL(a.href).host, keywords: 'project app live demo', run: () => openExternal(a.href),
        };
    });

    const actions = [
        { group: 'Actions', icon: '⧉', label: 'Copy email address', hint: 'E', keywords: 'mail clipboard contact', run: copyEmail },
        { group: 'Actions', icon: '✉', label: 'Send an email', hint: EMAIL, keywords: 'mailto contact hire', run: () => { location.href = `mailto:${EMAIL}`; } },
        { group: 'Actions', icon: '↗', label: 'Open resume (PDF)', hint: 'R', keywords: 'cv', run: () => openExternal('Najimdeen_CV.pdf') },
        { group: 'Actions', icon: '↓', label: 'Download resume', hint: 'PDF', keywords: 'cv save', run: download },
    ];

    const links = [
        { group: 'Elsewhere', icon: '↗', label: 'GitHub', hint: '@TheRealNajim', keywords: 'code repos source social', run: () => openExternal(GITHUB) },
    ];

    const site = [
        { group: 'Site', icon: '◈', label: 'Inspect site specs', hint: 'live', keywords: 'performance stack lighthouse vitals', run: openSpecs },
        { group: 'Site', icon: '?', label: 'Keyboard shortcuts', hint: '?', keywords: 'help keys hotkeys', run: openShortcuts },
    ];

    return [...nav, ...projects, ...actions, ...links, ...site];
}

const commands = buildCommands();
let results = [];
let active = 0;

/* Matching: substring beats word-initials (e.g. "gp" → Go to Projects); both rank by position. */
function score(cmd, q) {
    const hay = `${cmd.label} ${cmd.keywords}`.toLowerCase();
    const i = hay.indexOf(q);
    if (i !== -1) return 1000 - i;

    // word-initials match only: predictable, and avoids accidental subsequences
    const initials = hay.split(/[^a-z0-9]+/).map((w) => w[0]).join('');
    let h = -1;
    let gaps = 0;
    for (const ch of q) {
        const at = initials.indexOf(ch, h + 1);
        if (at === -1) return -1;
        gaps += at - h - 1;
        h = at;
    }
    return 500 - gaps;
}

function render(q) {
    const query = q.trim().toLowerCase();
    results = query
        ? commands.map((c) => [c, score(c, query)]).filter(([, s]) => s >= 0).sort((a, b) => b[1] - a[1]).map(([c]) => c)
        : commands;

    list.replaceChildren();
    let lastGroup = '';
    results.forEach((cmd, i) => {
        if (!query && cmd.group !== lastGroup) {
            lastGroup = cmd.group;
            const h = document.createElement('li');
            h.className = 'cmd-group mono';
            h.setAttribute('aria-hidden', 'true');
            h.textContent = cmd.group;
            list.append(h);
        }
        const li = document.createElement('li');
        li.className = 'cmd';
        li.id = `cmd-${i}`;
        li.setAttribute('role', 'option');
        li.dataset.index = String(i);

        const icon = document.createElement('span');
        icon.className = 'cmd__icon mono';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = cmd.icon;

        const label = document.createElement('span');
        label.className = 'cmd__label';
        label.textContent = cmd.label;

        const hint = document.createElement('span');
        hint.className = 'cmd__hint mono';
        hint.textContent = cmd.hint;

        li.append(icon, label, hint);
        list.append(li);
    });

    if (!results.length) {
        const empty = document.createElement('li');
        empty.className = 'cmd-empty mono';
        empty.textContent = `No results for “${q.trim()}”`;
        list.append(empty);
    }

    status.textContent = results.length ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'No results';
    setActive(0);
}

function setActive(i) {
    if (!results.length) {
        input.removeAttribute('aria-activedescendant');
        return;
    }
    active = (i + results.length) % results.length;
    list.querySelectorAll('[aria-selected]').forEach((el) => el.removeAttribute('aria-selected'));
    const el = $(`cmd-${active}`);
    el.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest' });
}

function run(i) {
    const cmd = results[i];
    if (!cmd) return;
    palette.close();
    // let the dialog release focus before the action (needed for scroll + clipboard focus rules)
    queueMicrotask(cmd.run);
}

function openPalette() {
    if (palette.open) return;
    input.value = '';
    render('');
    palette.showModal();
    input.focus();
}

input.addEventListener('input', () => render(input.value));

input.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
        case 'ArrowUp': e.preventDefault(); setActive(active - 1); break;
        case 'Home': if (!input.value) { e.preventDefault(); setActive(0); } break;
        case 'End': if (!input.value) { e.preventDefault(); setActive(results.length - 1); } break;
        case 'Enter': e.preventDefault(); run(active); break;
    }
});

list.addEventListener('pointermove', (e) => {
    const li = e.target.closest('.cmd');
    if (li && Number(li.dataset.index) !== active) setActive(Number(li.dataset.index));
});
list.addEventListener('click', (e) => {
    const li = e.target.closest('.cmd');
    if (li) run(Number(li.dataset.index));
});

/* Dialog plumbing: click on the backdrop closes ---------------------------- */
[palette, panel].forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
$('panelClose').addEventListener('click', () => panel.close());

/* Panels: shortcuts HUD + live site specs ---------------------------------- */
function openPanel(title, rows) {
    $('panelTitle').textContent = title;
    const dl = document.createElement('dl');
    dl.className = 'rows';
    rows.forEach(([k, v]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = k;
        if (v instanceof Node) dd.append(v); else dd.textContent = v;
        row.append(dt, dd);
        dl.append(row);
    });
    $('panelBody').replaceChildren(dl);
    panel.showModal();
}

const keys = (...parts) => {
    const frag = document.createDocumentFragment();
    parts.forEach((p, i) => {
        if (i) frag.append(' ');
        const k = document.createElement('kbd');
        k.textContent = p;
        frag.append(k);
    });
    return frag;
};

function openShortcuts() {
    openPanel('Keyboard shortcuts', [
        ['Command palette', keys(MOD, 'K')],
        ['Command palette (alt)', keys('/')],
        ['This help', keys('?')],
        ['Go to page', keys('G', 'then H · A · P · S · C')],
        ['Copy email', keys('E')],
        ['Open resume', keys('R')],
        ['Close any dialog', keys('Esc')],
    ]);
}

const kb = (n) => (n >= 1024 ? `${(n / 1024).toFixed(1)} kB` : `${n} B`);
const ms = (n) => (n == null ? '—' : `${Math.round(n)} ms`);

function openSpecs() {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const size = (e) => e.transferSize || e.encodedBodySize || 0;
    const total = (nav ? size(nav) : 0) + res.reduce((s, e) => s + size(e), 0);
    const js = res.filter((e) => /\.js(\?|$)/.test(e.name)).reduce((s, e) => s + size(e), 0);
    const fonts = res.filter((e) => /\.woff2(\?|$)/.test(e.name)).reduce((s, e) => s + size(e), 0);

    openPanel('Site specs', [
        ['Stack', 'Static HTML · CSS · native ES modules'],
        ['Dependencies', '0 runtime · 0 build step'],
        ['Type', 'Plus Jakarta Sans (self-hosted, variable)'],
        ['Motion', 'CSS transform/opacity + scroll-driven reveals'],
        ['— measured this load —', ''],
        ['Requests', String(res.length + 1)],
        ['Transferred', kb(total)],
        ['JavaScript', kb(js)],
        ['Fonts', kb(fonts)],
        ['DOM nodes', String(document.getElementsByTagName('*').length)],
        ['LCP', ms(vitals.lcp)],
        ['CLS', vitals.cls.toFixed(3)],
        ['Page load', ms(nav?.loadEventEnd)],
    ]);
}

/* Global shortcuts --------------------------------------------------------- */
let pendingG = 0;
const editable = (t) => t instanceof Element && (t.closest('input, textarea, select, [contenteditable]') !== null);

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette.open) palette.close(); else { panel.close(); openPalette(); }
        return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if (palette.open || panel.open || editable(e.target)) return;

    if (pendingG) {
        const hit = SECTIONS.find(([, , k]) => k === e.key.toLowerCase());
        clearTimeout(pendingG);
        pendingG = 0;
        if (hit) { e.preventDefault(); go(hit[0]); }
        return;
    }

    switch (e.key) {
        case '/': e.preventDefault(); openPalette(); break;
        case '?': e.preventDefault(); openShortcuts(); break;
        case 'g': pendingG = setTimeout(() => { pendingG = 0; }, 900); break;
        case 'e': copyEmail(); break;
        case 'r': openExternal('Najimdeen_CV.pdf'); break;
    }
});

/* Triggers ------------------------------------------------------------------ */
document.querySelectorAll('[data-palette-open]').forEach((el) => el.addEventListener('click', openPalette));
document.querySelectorAll('[data-copy-email]').forEach((el) => el.addEventListener('click', copyEmail));
document.querySelectorAll('[data-mod-key]').forEach((el) => { el.textContent = `${MOD} K`; });
