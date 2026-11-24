/* Cursor-tracking spotlight: a glow + a border highlight that follow the pointer.
   Layers are injected once; the pointer handler only writes a transform. */

export function initSpotlight() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cards = document.querySelectorAll('[data-spotlight]');
    const layers = new Map();

    cards.forEach((card) => {
        const make = (cls) => {
            const wrap = document.createElement('span');
            wrap.className = cls;
            wrap.setAttribute('aria-hidden', 'true');
            const glow = document.createElement('i');
            wrap.append(glow);
            card.prepend(wrap);
            return glow;
        };
        layers.set(card, [make('spot-edge'), make('spot')]);
    });

    let current = null;

    const release = () => {
        current?.classList.remove('is-spot');
        current = null;
    };

    document.addEventListener(
        'pointermove',
        (e) => {
            const card = e.target instanceof Element ? e.target.closest('[data-spotlight]') : null;
            if (card !== current) {
                release();
                if (card) {
                    card.classList.add('is-spot');
                    current = card;
                }
            }
            if (!card) return;
            const r = card.getBoundingClientRect();
            const t = `translate3d(${(e.clientX - r.left).toFixed(1)}px, ${(e.clientY - r.top).toFixed(1)}px, 0)`;
            layers.get(card).forEach((g) => { g.style.transform = t; });
        },
        { passive: true }
    );

    document.documentElement.addEventListener('pointerleave', release);
}
