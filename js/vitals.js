/* Passive Core Web Vitals collection for the "site specs" readout. */
export const vitals = { lcp: null, cls: 0 };

try {
    new PerformanceObserver((list) => {
        for (const e of list.getEntries()) vitals.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) vitals.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
} catch {
    /* unsupported browser: the readout shows an em dash */
}
