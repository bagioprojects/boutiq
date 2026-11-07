import React, { useEffect } from 'react';

export interface WebVitalsPayload {
  name: 'LCP' | 'INP' | 'CLS' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
}

export const RumCollector: React.FC<{ endpoint?: string }> = ({ endpoint = '/api/telemetry/rum' }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const sendMetric = (metric: WebVitalsPayload) => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(metric));
      } else {
        fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(metric),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {});
      }
    };

    // TTFB ölçümü
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      const ttfb = nav.responseStart - nav.requestStart;
      sendMetric({
        name: 'TTFB',
        value: Math.round(ttfb),
        rating: ttfb < 100 ? 'good' : ttfb < 300 ? 'needs-improvement' : 'poor',
        url: window.location.href,
      });
    }

    // CLS gözlemcisi
    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          sendMetric({
            name: 'CLS',
            value: parseFloat(clsValue.toFixed(4)),
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            url: window.location.href,
          });
        }
      });
    } catch {
      // Tarayıcı desteklemiyorsa sessizce geç
    }
  }, [endpoint]);

  return null;
};

