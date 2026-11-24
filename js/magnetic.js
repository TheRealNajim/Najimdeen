/* Magnetic hover: spring-driven translate on [data-magnetic].
   Only runs for fine pointers; the loop sleeps once every element has settled. */

const STRENGTH = 0.28;
const REACH = 56;
const STIFFNESS = 170;
const DAMPING = 17;

export function initMagnetic() {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;

    const items = [...document.querySelectorAll('[data-magnetic]')].map((el) => ({
        el, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
    }));
    if (!items.length) return;

    let raf = 0;
    let last = 0;

    const step = (now) => {
        const dt = Math.min((now - last) / 1000, 0.032);
        last = now;
        let moving = false;
        for (const m of items) {
            m.vx += ((m.tx - m.x) * STIFFNESS - m.vx * DAMPING) * dt;
            m.vy += ((m.ty - m.y) * STIFFNESS - m.vy * DAMPING) * dt;
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            const settled = Math.abs(m.tx - m.x) < 0.05 && Math.abs(m.ty - m.y) < 0.05 && Math.abs(m.vx) < 0.05 && Math.abs(m.vy) < 0.05;
            if (settled) {
                m.x = m.tx;
                m.y = m.ty;
                m.vx = m.vy = 0;
            } else {
                moving = true;
            }
            m.el.style.setProperty('--mx', `${m.x.toFixed(2)}px`);
            m.el.style.setProperty('--my', `${m.y.toFixed(2)}px`);
        }
        raf = moving ? requestAnimationFrame(step) : 0;
    };

    const wake = () => {
        if (!raf) {
            last = performance.now();
            raf = requestAnimationFrame(step);
        }
    };

    document.addEventListener(
        'pointermove',
        (e) => {
            let changed = false;
            for (const m of items) {
                const r = m.el.getBoundingClientRect();
                const cx = r.left + r.width / 2 - m.x;
                const cy = r.top + r.height / 2 - m.y;
                const near =
                    Math.abs(e.clientX - cx) < r.width / 2 + REACH && Math.abs(e.clientY - cy) < r.height / 2 + REACH;
                const tx = near ? (e.clientX - cx) * STRENGTH : 0;
                const ty = near ? (e.clientY - cy) * STRENGTH : 0;
                if (tx !== m.tx || ty !== m.ty) {
                    m.tx = tx;
                    m.ty = ty;
                    changed = true;
                }
            }
            if (changed) wake();
        },
        { passive: true }
    );

    document.addEventListener('pointerleave', () => {
        items.forEach((m) => { m.tx = m.ty = 0; });
        wake();
    });
}
