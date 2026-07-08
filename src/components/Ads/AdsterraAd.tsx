import React, { useEffect, useRef, useState } from 'react';

interface AdsterraAdProps {
  zoneIdKey: 'nativeZoneId' | 'mobileBannerZoneId' | 'socialBarZoneId';
  format: '320x50' | 'native' | 'socialbar';
  fallbackComponent?: React.ReactNode;
}

export default function AdsterraAd({ zoneIdKey, format, fallbackComponent }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Try resolving from VITE environment variables first
    const envNative = (import.meta as any).env?.VITE_ADSTERRA_NATIVE_ZONE_ID;
    const envMobile = (import.meta as any).env?.VITE_ADSTERRA_MOBILE_BANNER_ZONE_ID;
    const envSocial = (import.meta as any).env?.VITE_ADSTERRA_SOCIAL_BAR_ZONE_ID;

    const envMap = {
      nativeZoneId: envNative,
      mobileBannerZoneId: envMobile,
      socialBarZoneId: envSocial
    };

    const directZoneId = envMap[zoneIdKey];
    if (directZoneId && directZoneId.trim() !== '' && !directZoneId.includes('ZONE_ID_HERE')) {
      initializeAd(directZoneId);
      return;
    }

    // 2. Fallback to ads-config.json
    fetch('/ads-config.json')
      .then(res => res.json())
      .then(config => {
        if (!isMounted) return;
        const zoneId = config?.adsterra?.[zoneIdKey];
        if (!zoneId || zoneId.includes('ZONE_ID_HERE') || zoneId.trim() === '') {
          return;
        }

        initializeAd(zoneId);
      })
      .catch(err => {
        console.error('Failed to load Adsterra config:', err);
      });

    function initializeAd(zoneId: string) {
      setIsEnabled(true);

      // Wait a short tick for containerRef to be populated on mount
      setTimeout(() => {
        if (!isMounted) return;
        const container = containerRef.current;
        if (!container) return;

        // Clear children
        container.innerHTML = '';

        if (format === '320x50') {
          const scriptConf = document.createElement('script');
          scriptConf.type = 'text/javascript';
          scriptConf.text = `
            window.atOptions = window.atOptions || {};
            window.atOptions = {
              'key' : '${zoneId}',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          `;
          container.appendChild(scriptConf);

          const scriptInvoke = document.createElement('script');
          scriptInvoke.type = 'text/javascript';
          scriptInvoke.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
          container.appendChild(scriptInvoke);
        } else if (format === 'native') {
          const adContainer = document.createElement('div');
          const adContainerId = `container-adsterra-native-${Math.random().toString(36).substr(2, 9)}`;
          adContainer.id = adContainerId;
          container.appendChild(adContainer);

          const scriptConf = document.createElement('script');
          scriptConf.type = 'text/javascript';
          scriptConf.text = `
            (window.sc_adv_out = window.sc_adv_out || []).push({
              id: "${zoneId}",
              domain: "n.ads1-adsterra.com",
              target: "${adContainerId}"
            });
          `;
          container.appendChild(scriptConf);

          const scriptInvoke = document.createElement('script');
          scriptInvoke.type = 'text/javascript';
          scriptInvoke.src = '//cdn.adsterra.com/js/adv_out.js';
          container.appendChild(scriptInvoke);
        } else if (format === 'socialbar') {
          const scriptId = `adsterra-socialbar-${zoneId}`;
          if (!document.getElementById(scriptId)) {
            const scriptInvoke = document.createElement('script');
            scriptInvoke.id = scriptId;
            scriptInvoke.type = 'text/javascript';
            scriptInvoke.src = `//pl.highperformancegate.com/${zoneId}/invoke.js`;
            document.body.appendChild(scriptInvoke);
          }
        }
      }, 50);
    }

    return () => {
      isMounted = false;
    };
  }, [zoneIdKey, format]);

  if (isEnabled) {
    return <div ref={containerRef} className="w-full flex items-center justify-center min-h-[50px] overflow-hidden" />;
  }

  return fallbackComponent ? <>{fallbackComponent}</> : null;
}
