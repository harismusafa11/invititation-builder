
import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Music,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  CalendarDays,
  Gift,
  FileText,
  Minus,
  Plus,
  Send,
  HelpCircle,
  User,
  AlertCircle,
  ChevronsDown,
  Play,
  ArrowDown
} from 'lucide-react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'motion/react';
import { InvitationTemplate, InvitationElement, InvitationPage } from '../../types';
import ParticleEffect from '../ParticleEffect';
import AdsterraAd from '../Ads/AdsterraAd';

// Helper to dynamically recolor SVG data URLs
const recolorSvgDataUrl = (dataUrl: string | undefined, tintColor: string | undefined): string => {
  if (!dataUrl) return '';
  if (!tintColor || tintColor === 'none' || tintColor === '') return dataUrl;

  try {
    if (dataUrl.startsWith('data:image/svg+xml')) {
      let svgText = '';
      if (dataUrl.includes(';base64,')) {
        const base64Str = dataUrl.split(';base64,')[1];
        svgText = atob(base64Str);
      } else {
        const urlEncodedStr = dataUrl.split('data:image/svg+xml;utf8,')[1] || dataUrl.split('data:image/svg+xml,')[1] || '';
        svgText = decodeURIComponent(urlEncodedStr);
      }

      if (svgText) {
        // Replace fill and stroke attributes that have a hex color or other colors, keeping fill="none"
        const recoloredSvg = svgText
          .replace(/fill="((?!none)[^"]+)"/gi, `fill="${tintColor}"`)
          .replace(/stroke="((?!none)[^"]+)"/gi, `stroke="${tintColor}"`)
          .replace(/stroke:#([0-9a-fA-F]{3,6})/gi, `stroke:${tintColor}`)
          .replace(/fill:#([0-9a-fA-F]{3,6})/gi, `fill:${tintColor}`);

        return `data:image/svg+xml;utf8,${encodeURIComponent(recoloredSvg)}`;
      }
    }
  } catch (e) {
    console.warn("SVG Recolor error:", e);
  }
  return dataUrl;
};

interface PreviewModalProps {
  template: InvitationTemplate;
  onClose: () => void;
  isPublicView?: boolean;
}

export default function PreviewModal({ template, onClose, isPublicView = false }: PreviewModalProps) {
  const { background, pages = [], settings } = template;

  // Interactive features states
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isOpen, setIsOpen] = useState(settings.showCover === false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [guestName, setGuestName] = useState<string>('');
  const [galleryIndices, setGalleryIndices] = useState<Record<string, number>>({});
  const [lightboxImage, setLightboxImage] = useState<{ images: string[]; index: number } | null>(null);

  // Loading Feature States — declared early so useEffect hooks below can reference them
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Menginisialisasi Template...');
  const [scale, setScale] = useState(1);
  const [coverImagesLoaded, setCoverImagesLoaded] = useState(false);
  const viewportHeight = isPublicView ? (window.innerHeight / scale) : 844;

  // scrollContainer declared early so useEffect hooks below can reference them
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);

  // Preload cover page images to solve the slow loading image issue
  useEffect(() => {
    if (pages.length === 0) {
      setCoverImagesLoaded(true);
      return;
    }

    const coverImageUrls: string[] = [];
    pages[0].elements.forEach(el => {
      if (el.type === 'image' && el.src) {
        coverImageUrls.push(el.src);
      }
    });
    if (background.type === 'image' && background.imageUrl) {
      coverImageUrls.push(background.imageUrl);
    }

    if (coverImageUrls.length === 0) {
      setCoverImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    let hasFinished = false;

    const checkFinished = () => {
      if (hasFinished) return;
      loadedCount++;
      if (loadedCount >= coverImageUrls.length) {
        hasFinished = true;
        setCoverImagesLoaded(true);
      }
    };

    // Set a safety fallback timeout of 4 seconds so it never gets stuck
    const safetyTimeout = setTimeout(() => {
      if (!hasFinished) {
        hasFinished = true;
        setCoverImagesLoaded(true);
      }
    }, 4000);

    coverImageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      if (img.complete) {
        checkFinished();
      } else {
        img.onload = () => checkFinished();
        img.onerror = () => checkFinished();
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [pages, background]);

  // Preload cover page images to solve the slow loading image issue (rel link injection)
  useEffect(() => {
    if (pages.length > 0) {
      const coverPage = pages[0];
      const imageElements = coverPage.elements.filter(el => el.type === 'image' && el.src);
      imageElements.forEach(el => {
        // Only preload actual external URLs or custom uploads, skip data URIs
        if (el.src && !el.src.startsWith('data:')) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = el.src;
          document.head.appendChild(link);
        }
      });
      // Also preload page background image if it exists
      if (background.type === 'image' && background.imageUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = background.imageUrl;
        document.head.appendChild(link);
      }
    }
  }, [pages, background]);

  // Loading progression and texts effect
  useEffect(() => {
    if (isLoading) {
      const texts = [
        'Menginisialisasi Template...',
        'Menyelaraskan Desain Elegan...',
        'Memuat Aset Ornamen...',
        'Mengonfigurasi Animasi Reveal...',
        'Menyiapkan Musik Latar...',
        'Hampir Selesai...',
      ];
      let currentTextIdx = 0;
      const textInterval = setInterval(() => {
        if (currentTextIdx < texts.length - 1) {
          currentTextIdx++;
          setLoadingText(texts[currentTextIdx]);
        }
      }, 300);

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            // Wait until cover images are loaded before completing the last 10%
            if (coverImagesLoaded) {
              if (prev >= 100) {
                clearInterval(progressInterval);
                clearInterval(textInterval);
                setTimeout(() => {
                  setIsLoading(false);
                }, 300);
                return 100;
              }
              return prev + 5;
            }
            return 90; // Hold at 90%
          }
          return prev + 5;
        });
      }, 70);

      return () => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading, coverImagesLoaded]);

  // Visitor view security (Anti-cloning, anti-right click, anti-F12, frame-busting)
  useEffect(() => {
    if (!isPublicView) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return false;
      }
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    try {
      if (window.self !== window.top) {
        window.top!.location.replace(window.self.location.href);
      }
    } catch {
      window.location.replace("about:blank");
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [isPublicView]);

  // Auto scroll logic animation loop
  useEffect(() => {
    if (!isOpen || !scrollContainer || !isAutoScrolling) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = settings.autoScrollSpeed || 30; // pixels per second

    const scrollLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (scrollContainer) {
        scrollContainer.scrollTop += speed * delta;

        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (scrollContainer.scrollTop >= maxScroll - 1) {
          setIsAutoScrolling(false);
          return;
        }
      }

      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, scrollContainer, isAutoScrolling, settings.autoScrollSpeed]);

  // Load Lenis smooth scroll dynamically on mounted/scrollContainer change
  useEffect(() => {
    if (!scrollContainer) return;

    // 1. Inject Lenis CSS if not present
    let link = document.getElementById('lenis-style') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'lenis-style';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/lenis@1.3.25/dist/lenis.css';
      document.head.appendChild(link);
    }

    // 2. Inject Lenis JS if not present
    let script = document.getElementById('lenis-script') as HTMLScriptElement;
    let lenisInstance: any = null;

    const initLenis = () => {
      if (!(window as any).Lenis) return;
      try {
        lenisInstance = new (window as any).Lenis({
          wrapper: scrollContainer,
          content: scrollContainer.firstElementChild || undefined,
          autoRaf: true,
          autoToggle: true,
          anchors: true,
          allowNestedScroll: true,
          naiveDimensions: true,
          stopInertiaOnNavigate: true
        });
      } catch (err) {
        console.warn("Failed to initialize Lenis:", err);
      }
    };

    if ((window as any).Lenis) {
      initLenis();
    } else {
      script = document.createElement('script');
      script.id = 'lenis-script';
      script.src = 'https://unpkg.com/lenis@1.3.25/dist/lenis.min.js';
      script.async = true;
      script.onload = () => {
        initLenis();
      };
      document.body.appendChild(script);
    }

    return () => {
      if (lenisInstance) {
        try {
          lenisInstance.destroy();
        } catch (_) {}
      }
    };
  }, [scrollContainer]);

  // Lock body scroll when the preview modal is open (unmount unlocks)
  useEffect(() => {
    if (isPublicView) return; // In public view, the page itself is the modal container, so don't lock body

    // Save original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isPublicView]);

  // Prevent scrolling past boundaries (hard stop on the last page to prevent overscroll/wobble)
  useEffect(() => {
    if (!scrollContainer) return;

    let touchStartY = 0;
    let maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

    const updateMaxScroll = () => {
      maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleScrollBoundary = (e: WheelEvent | TouchEvent) => {
      const currentScroll = scrollContainer.scrollTop;

      // Determine scroll direction
      let isScrollingDown = false;
      if (e.type === 'wheel') {
        isScrollingDown = (e as WheelEvent).deltaY > 0;
      } else if (e.type === 'touchmove' && (e as TouchEvent).touches.length > 0) {
        const touchCurrentY = (e as TouchEvent).touches[0].clientY;
        isScrollingDown = touchCurrentY < touchStartY;
      }

      // Hard stop boundary checks
      if (isScrollingDown && currentScroll >= maxScroll - 1) {
        // At the bottom (last page), block scrolling down further
        if (e.cancelable) e.preventDefault();
      } else if (!isScrollingDown && currentScroll <= 0) {
        // At the top (first page), block scrolling up further
        if (e.cancelable) e.preventDefault();
      }
    };

    // Attach non-passive listeners so we can call preventDefault()
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('wheel', handleScrollBoundary, { passive: false });
    scrollContainer.addEventListener('touchmove', handleScrollBoundary, { passive: false });
    window.addEventListener('resize', updateMaxScroll);

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('wheel', handleScrollBoundary);
      scrollContainer.removeEventListener('touchmove', handleScrollBoundary);
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, [scrollContainer]);

  // Pause auto scroll on manual interaction
  useEffect(() => {
    if (!scrollContainer || !isAutoScrolling) return;

    const pauseScroll = () => {
      setIsAutoScrolling(false);
    };

    scrollContainer.addEventListener('wheel', pauseScroll, { passive: true });
    scrollContainer.addEventListener('touchmove', pauseScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('wheel', pauseScroll);
      scrollContainer.removeEventListener('touchmove', pauseScroll);
    };
  }, [scrollContainer, isAutoScrolling]);

  // Auto scroll trigger on load if cover is bypassed
  useEffect(() => {
    if (!settings.showCover && isOpen && !isLoading && settings.autoScrollEnabled) {
      setIsAutoScrolling(true);
    }
  }, [isOpen, isLoading, settings.showCover, settings.autoScrollEnabled]);

  useEffect(() => {
    // Parse guest name from URL
    const searchParams = new URLSearchParams(window.location.search);
    const to = searchParams.get('to');
    if (to) {
      setGuestName(to);
    }
  }, []);

  useEffect(() => {
    // Record view if public
    if (isPublicView && template.id) {
      fetch(`/api/invitations/${template.id}/view`, { method: 'POST' }).catch(console.error);
    }
  }, [isPublicView, template.id]);

  const [rsvpAttending, setRsvpAttending] = useState('hadir');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);

  // Guest wishes state
  const [rsvpWishes, setRsvpWishes] = useState<any[]>([]);

  // Dual view mode state
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Loading Feature States — declared above (near top of component) to avoid TS2448

  const allElements = pages.flatMap(p => p.elements);
  const rsvpWidget = allElements.find(el => el.widgetType === 'rsvp');
  const [rsvpSimCount, setRsvpSimCount] = useState(rsvpWidget?.widgetConfig?.rsvpSubmissionCount || 24);

  // Check if a canvas-based music player widget is present
  const hasMusicWidget = allElements.some(el => el.widgetType === 'music');

  // Find music URL from either global settings or a music widget element
  const getActiveMusic = () => {
    if (settings.musicUrl) {
      return {
        url: settings.musicUrl,
        name: settings.musicName || 'Wedding Background Music'
      };
    }
    // Find in pages elements
    for (const page of pages) {
      for (const el of page.elements) {
        if (el.widgetType === 'music' && el.widgetConfig?.audioUrl) {
          return {
            url: el.widgetConfig.audioUrl,
            name: el.widgetConfig.audioName || 'Wedding Background Music'
          };
        }
      }
    }
    return null;
  };

  const activeMusic = getActiveMusic();

  const coverMusicWidget = settings.showCover && pages[0]
    ? pages[0].elements.find(el => el.widgetType === 'music')
    : null;

  // Audio and Ref handles
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // scrollContainer state declared above (near top) to avoid TS2448
  const [activeScrolledPageIdx, setActiveScrolledPageIdx] = useState(settings.showCover ? 1 : 0);

  useEffect(() => {
    if (!isOpen || !scrollContainer) return;

    let rAFId: number | null = null;

    const handleScrollUpdateActivePage = () => {
      if (rAFId !== null) return;

      rAFId = requestAnimationFrame(() => {
        rAFId = null;
        const scrollTop = scrollContainer.scrollTop;
        const height = 844;
        const relativeScroll = scrollTop + (height / 2);
        const scrolledIdx = Math.floor(relativeScroll / height);
        const finalIdx = scrolledIdx + (settings.showCover ? 1 : 0);
        const clampedIdx = Math.max(settings.showCover ? 1 : 0, Math.min(pages.length - 1, finalIdx));
        setActiveScrolledPageIdx(prev => (prev !== clampedIdx ? clampedIdx : prev));
      });
    };

    scrollContainer.addEventListener('scroll', handleScrollUpdateActivePage, { passive: true });
    // Run once on load/toggle
    handleScrollUpdateActivePage();
    return () => {
      if (rAFId !== null) cancelAnimationFrame(rAFId);
      scrollContainer.removeEventListener('scroll', handleScrollUpdateActivePage);
    };
  }, [isOpen, scrollContainer, settings.showCover, pages.length]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const animatedIdsRef = useRef<Set<string>>(new Set());

  // 1. Ticking Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const countdownWidget = allElements.find(el => el.widgetType === 'countdown');
  const targetDateStr = countdownWidget?.widgetConfig?.targetDate || '2026-12-18T16:00:00';

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  // Loading progression and texts effect
  useEffect(() => {
    if (isLoading) {
      const texts = [
        'Menginisialisasi Template...',
        'Menyelaraskan Desain Elegan...',
        'Memuat Aset Ornamen...',
        'Mengonfigurasi Animasi Reveal...',
        'Menyiapkan Musik Latar...',
        'Hampir Selesai...',
      ];
      let currentTextIdx = 0;
      const textInterval = setInterval(() => {
        if (currentTextIdx < texts.length - 1) {
          currentTextIdx++;
          setLoadingText(texts[currentTextIdx]);
        }
      }, 300);

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(textInterval);
            setTimeout(() => {
              setIsLoading(false);
            }, 300);
            return 100;
          }
          return prev + 5;
        });
      }, 70);

      return () => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading]);

  // Clear animation cache when loading or open status changes
  useEffect(() => {
    animatedIdsRef.current.clear();
  }, [isLoading, isOpen]);

  // 2. Play Background Music
  const activeMusicUrl = activeMusic?.url;

  useEffect(() => {
    if (!activeMusicUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlayingMusic(false);
      }
      return;
    }

    // Initialize or update the audio source
    let audio = audioRef.current;
    let absoluteUrl = '';
    try {
      absoluteUrl = new URL(activeMusicUrl, window.location.origin).href;
    } catch (e) {
      absoluteUrl = activeMusicUrl;
    }

    if (!audio || audio.src !== absoluteUrl) {
      if (audio) {
        audio.pause();
      }
      audio = new Audio(activeMusicUrl);
      audio.loop = true;
      audioRef.current = audio;
    }

    // Play/Pause behavior based on cover settings and open status
    // If showCover is true, only play if the cover is opened (isOpen is true)
    // If showCover is false, play immediately
    const shouldPlay = !settings.showCover || isOpen;

    if (shouldPlay) {
      audio.play()
        .then(() => {
          setIsPlayingMusic(true);
        })
        .catch((err) => {
          console.warn("Autoplay blocked or play failed:", err);
          setIsPlayingMusic(false);
        });
    } else {
      audio.pause();
      setIsPlayingMusic(false);
    }
  }, [activeMusicUrl, settings.showCover, isOpen]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser policy"));
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  // Responsive scale observer effect
  useEffect(() => {
    const CANVAS_W = 390;
    const CANVAS_H = 844;

    const handleResize = () => {
      if (isPublicView) {
        const vw = window.innerWidth;
        const targetWidth = Math.min(vw, 450);
        const scaleByWidth = targetWidth / CANVAS_W;
        setScale(scaleByWidth);
      } else {
        // In editor preview: scale down only if window is too narrow for the phone casing
        const parentWidth = wrapperRef.current?.parentElement?.clientWidth || window.innerWidth;
        const targetWidth = Math.min(parentWidth - 40, 422);
        setScale(targetWidth < 422 ? targetWidth / 422 : 1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isLoading, isPublicView, isOpen]);

  // Helper to animate single element via scroll reveal effects
  const animateScrollElement = (el: InvitationElement, onFinish?: () => void) => {
    if (!el.scrollEffect || el.scrollEffect === 'none') {
      onFinish?.();
      return;
    }
    if (animatedIdsRef.current.has(el.id)) return;

    const target = document.getElementById(`preview-element-${el.id}`);
    if (!target) return;

    const duration = 1.0;
    const finalOpacity = el.opacity ?? 1;

    gsap.killTweensOf(target);
    gsap.set(target, { opacity: 0 });
    animatedIdsRef.current.add(el.id);

    const tweenProps = {
      duration,
      ease: 'power2.out',
      onComplete: onFinish,
    };

    switch (el.scrollEffect) {
      case 'fade-in':
        gsap.fromTo(target, { opacity: 0 }, { ...tweenProps, opacity: finalOpacity });
        break;
      case 'slide-up':
        gsap.fromTo(target, { opacity: 0, y: 50 }, { ...tweenProps, opacity: finalOpacity, y: 0 });
        break;
      case 'slide-down':
        gsap.fromTo(target, { opacity: 0, y: -50 }, { ...tweenProps, opacity: finalOpacity, y: 0 });
        break;
      case 'zoom-in':
        gsap.fromTo(target, { opacity: 0, scale: 0.8 }, { ...tweenProps, opacity: finalOpacity, scale: 1 });
        break;
      case 'rotate-in':
        gsap.fromTo(target, { opacity: 0, rotate: -25 }, { ...tweenProps, opacity: finalOpacity, rotate: 0 });
        break;
      case 'slide-left':
        gsap.fromTo(target, { opacity: 0, x: 50 }, { ...tweenProps, opacity: finalOpacity, x: 0 });
        break;
      case 'slide-right':
        gsap.fromTo(target, { opacity: 0, x: -50 }, { ...tweenProps, opacity: finalOpacity, x: 0 });
        break;
      default:
        onFinish?.();
        break;
    }

    // Fail-safe fallback to ensure the element becomes visible even if GSAP fails/gets stuck
    setTimeout(() => {
      if (target) {
        target.style.opacity = String(finalOpacity);
      }
      onFinish?.();
    }, duration * 1000 + 200);
  };

  // Helper to animate single element via GSAP
  const animateElement = (el: InvitationElement, afterScrollReveal: boolean = false) => {
    if (!el.animation || el.animation.type === 'none') return;
    if (!afterScrollReveal && animatedIdsRef.current.has(el.id)) return;

    const target = document.getElementById(`preview-element-${el.id}`);
    if (!target) return;

    const duration = el.animation.duration || 1.2;
    const delay = el.animation.delay || 0;
    const ease = el.animation.easing || 'power2.out';
    const finalOpacity = el.opacity ?? 1;

    // Kill existing tweens but do NOT clearProps — that wipes the element's opacity before animation
    gsap.killTweensOf(target);

    // Set initial hidden state without wiping layout properties if NOT after scroll reveal
    if (!afterScrollReveal) {
      gsap.set(target, { opacity: 0 });
      animatedIdsRef.current.add(el.id);
    }

    const loopProps = el.animation.loop ? { repeat: -1, yoyo: true, repeatDelay: 0.5 } : {};

    switch (el.animation.type) {
      case 'fade':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { opacity: finalOpacity }, { opacity: finalOpacity * 0.3, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.to(target, { opacity: finalOpacity, duration: 0.1 });
        } else {
          gsap.fromTo(target, { opacity: 0 }, { opacity: finalOpacity, duration, delay, ease, ...loopProps });
        }
        break;
      case 'zoom':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { scale: 1 }, { scale: 0.8, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { scale: 0.8 }, { scale: 1, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, scale: 0.7 }, { opacity: finalOpacity, scale: 1, duration, delay, ease, ...loopProps });
        }
        break;
      case 'slide-up':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { y: 0 }, { y: -20, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { y: 40 }, { y: 0, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, y: 60 }, { opacity: finalOpacity, y: 0, duration, delay, ease, ...loopProps });
        }
        break;
      case 'slide-down':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { y: 0 }, { y: 20, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { y: -40 }, { y: 0, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, y: -60 }, { opacity: finalOpacity, y: 0, duration, delay, ease, ...loopProps });
        }
        break;
      case 'slide-left':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { x: 0 }, { x: -20, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { x: 40 }, { x: 0, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, x: 60 }, { opacity: finalOpacity, x: 0, duration, delay, ease, ...loopProps });
        }
        break;
      case 'slide-right':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { x: 0 }, { x: 20, duration, delay, ease, repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { x: -40 }, { x: 0, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, x: -60 }, { opacity: finalOpacity, x: 0, duration, delay, ease, ...loopProps });
        }
        break;
      case 'rotate':
        if (afterScrollReveal && el.animation.loop) {
          gsap.to(target, { rotate: 360, duration: duration * 4, ease: 'none', repeat: -1 });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { rotate: -30, scale: 0.8 }, { rotate: 0, scale: 1, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, rotate: -30, scale: 0.8 }, { opacity: finalOpacity, rotate: 0, scale: 1, duration, delay, ease, ...loopProps });
        }
        break;
      case 'scale':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { scaleY: 1 }, { scaleY: 0.7, duration, delay, ease, repeat: -1, yoyo: true, transformOrigin: 'bottom center' });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { scaleY: 0, transformOrigin: 'bottom center' }, { scaleY: 1, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, scaleY: 0, transformOrigin: 'bottom center' }, { opacity: finalOpacity, scaleY: 1, duration, delay, ease, ...loopProps });
        }
        break;
      case 'bounce':
        if (afterScrollReveal && el.animation.loop) {
          gsap.fromTo(target, { y: 0 }, { y: -20, duration: duration * 0.6, ease: 'bounce.out', repeat: -1, yoyo: true });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { y: -40 }, { y: 0, duration, delay, ease: 'bounce.out' });
        } else {
          gsap.fromTo(target, { opacity: 0, y: -50 }, { opacity: finalOpacity, y: 0, duration, delay, ease: 'bounce.out', ...loopProps });
        }
        break;
      case 'flip':
        if (afterScrollReveal && el.animation.loop) {
          gsap.to(target, { rotationY: 360, duration: duration * 3, ease: 'power1.inOut', repeat: -1 });
        } else if (afterScrollReveal) {
          gsap.fromTo(target, { rotationY: 90 }, { rotationY: 0, duration, delay, ease });
        } else {
          gsap.fromTo(target, { opacity: 0, rotationY: 90 }, { opacity: finalOpacity, rotationY: 0, duration, delay, ease, ...loopProps });
        }
        break;
      case 'float':
        if (el.animation.loop) {
          if (afterScrollReveal) {
            gsap.to(target, { y: -8, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay });
          } else {
            gsap.fromTo(target, { opacity: 0, y: 15 }, {
              opacity: finalOpacity, y: 0, duration, delay, ease,
              onComplete: () => {
                gsap.to(target, { y: -8, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
              }
            });
          }
        } else {
          if (afterScrollReveal) {
            gsap.fromTo(target, { y: 15 }, { y: 0, duration, delay, ease });
          } else {
            gsap.fromTo(target, { opacity: 0, y: 15 }, { opacity: finalOpacity, y: 0, duration, delay, ease });
          }
        }
        break;
      default:
        break;
    }

    // Fail-safe fallback to ensure the element becomes visible even if GSAP fails/gets stuck
    setTimeout(() => {
      if (target) {
        target.style.opacity = String(finalOpacity);
      }
    }, (delay + duration) * 1000 + 200);
  };

  // Trigger animations per page when they enter the viewport or on cover load
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      // Cover Page View: if cover is active, animate page 0 elements immediately
      if (!isOpen && pages.length > 0) {
        pages[0].elements.forEach((el) => {
          const hasScroll = el.scrollEffect && el.scrollEffect !== 'none';
          const hasAnim = el.animation && el.animation.type !== 'none';

          if (hasScroll) {
            animateScrollElement(el, () => {
              if (hasAnim) {
                animateElement(el, true);
              }
            });
          } else {
            if (hasAnim) {
              animateElement(el);
            }
          }
        });
        return;
      }

      // Scrollable View: use IntersectionObserver to animate each page's elements when scrolled into view
      if (isOpen && scrollContainer) {
        const observerOptions = {
          root: scrollContainer,
          threshold: 0.15,
        };

        const pageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageId = entry.target.id.replace('preview-page-', '');
              const targetPage = pages.find((p) => p.id === pageId);
              if (targetPage) {
                targetPage.elements.forEach((el) => {
                  const hasScroll = el.scrollEffect && el.scrollEffect !== 'none';
                  const hasAnim = el.animation && el.animation.type !== 'none';

                  if (hasScroll) {
                    animateScrollElement(el, () => {
                      if (hasAnim) {
                        animateElement(el, true);
                      }
                    });
                  } else {
                    if (hasAnim) {
                      animateElement(el);
                    }
                  }
                });
              }
            }
          });
        }, observerOptions);

        pages.forEach((page, idx) => {
          if (settings.showCover && idx === 0) return; // Skip cover as it is shown separately
          const pageElement = document.getElementById(`preview-page-${page.id}`);
          if (pageElement) {
            pageObserver.observe(pageElement);
          }
        });

        return () => {
          pageObserver.disconnect();
        };
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, isLoading, pages, scrollContainer]);



  // 3.b Load RSVP wishes/guestbook from database scoped to this invitation project
  useEffect(() => {
    if (!template.id) return;
    fetch(`/api/invitations/${template.id}/wishes`)
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          // Format date or defaults
          const formatted = res.data.map((w: any) => ({
            ...w,
            timestamp: w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Baru saja'
          }));
          setRsvpWishes(formatted);
        }
      })
      .catch(err => console.error("Failed to load RSVP wishes:", err));
  }, [template.id]);

  // 4. Clipboard copy for digital bank accounts
  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccountNumber(true);
    setTimeout(() => setCopiedAccountNumber(false), 2000);
  };

  // 5. Submit RSVP to database
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    const payload = {
      name: rsvpName.trim(),
      attending: rsvpAttending,
      guests: rsvpGuests,
      message: rsvpMessage.trim() || 'Selamat berbahagia!'
    };

    fetch(`/api/invitations/${template.id || 'default'}/wishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const wishWithFormattedTime = {
            ...res.data,
            timestamp: 'Baru saja'
          };
          setRsvpWishes(prev => [wishWithFormattedTime, ...prev]);
        }
      })
      .catch(err => {
        console.error("Failed to post RSVP wish:", err);
        // Fallback locally
        const newWish = {
          id: `wish-${Date.now()}`,
          name: payload.name,
          attending: payload.attending,
          guests: payload.guests,
          message: payload.message,
          timestamp: 'Baru saja'
        };
        setRsvpWishes(prev => [newWish, ...prev]);
      });

    setRsvpSubmitted(true);
    if (rsvpAttending === 'hadir' || rsvpAttending === 'yes') {
      setRsvpSimCount(prev => prev + rsvpGuests);
    }
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(console.error);
    }
    if (settings.autoScrollEnabled) {
      setIsAutoScrolling(true);
    }
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  const renderElementRaw = (el: InvitationElement, elIndex: number = 0, isCoverPage: boolean = false) => {
    if (el.hidden) return null;

    const contentScale = isCoverPage && viewportHeight < 844 ? (viewportHeight / 844) : 1;
    const adjustedY = el.y * contentScale;

    // Outer style: Position, size, opacity. Targeted by GSAP — NO CSS transitions here or they fight animations.
    const isGallery = el.type === 'image' && el.isGalleryPhoto;
    const isInteractive = el.type === 'button' || el.type === 'widget' || isGallery;
    const outerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${adjustedY}px`,
      width: `${el.width}px`,
      height: el.widgetType === 'rsvp' ? `${Math.max(380, el.height)}px` : `${el.height}px`,
      opacity: el.opacity,
      overflow: 'visible',  // match Konva: text/shapes can overflow their bounding box
      zIndex: elIndex + 1,  // stack order matches layer order
      pointerEvents: isInteractive ? 'auto' : 'none', // only interactive elements respond to clicks
    };

    // Combined transform: rotation around top-left origin (matches Konva) + flip
    const flipX = el.flipHorizontal ? -1 : 1;
    const flipY = el.flipVertical ? -1 : 1;
    const rot = el.rotation || 0;

    // Wrapper 1: Rotation around element's top-left corner (0,0), matching Konva's rotation
    const rotateStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      transform: `rotate(${rot}deg)`,
      transformOrigin: '0 0',
    };

    // Wrapper 2: Flip around center + drop-shadow filter
    // Must be inside the rotate wrapper so flip pivots at element center AFTER rotation
    const flipStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      transform: `scaleX(${flipX}) scaleY(${flipY})`,
      transformOrigin: '50% 50%',
      filter: el.shadowBlur ? `drop-shadow(${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.3)'})` : 'none',
    };

    // Render: TEXT
    if (el.type === 'text') {
      // Apply textTransform on the display text (Konva does this programmatically in editor)
      let displayText = el.text || '';
      if (el.textTransform === 'uppercase') displayText = displayText.toUpperCase();
      else if (el.textTransform === 'lowercase') displayText = displayText.toLowerCase();
      else if (el.textTransform === 'capitalize') displayText = displayText.replace(/\b\w/g, c => c.toUpperCase());

      // Replace guest name placeholder
      if (displayText.includes('{{guest_name}}')) {
        displayText = displayText.replace('{{guest_name}}', guestName || 'Tamu Undangan');
      }

      const textStyle: React.CSSProperties = {
        fontFamily: el.fontFamily || 'Inter',
        fontSize: `${el.fontSize || 14}px`,
        fontWeight: el.fontWeight || '400',
        fontStyle: el.fontStyle || 'normal',
        textAlign: el.textAlign || 'center',
        lineHeight: el.lineHeight || 1.2,
        letterSpacing: `${el.letterSpacing || 0}px`,
        width: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        display: 'block',
      };

      if (el.outlineWidth && el.outlineWidth > 0) {
        textStyle.WebkitTextStroke = `${el.outlineWidth}px ${el.outlineColor || '#D4AF37'}`;
      }

      if (el.shadowBlur && el.shadowColor && el.shadowColor !== 'transparent') {
        textStyle.textShadow = `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur}px ${el.shadowColor}`;
      }

      if (el.gradientText && el.gradientColors && el.gradientColors.length >= 2) {
        textStyle.backgroundImage = `linear-gradient(135deg, ${el.gradientColors[0]}, ${el.gradientColors[1]})`;
        textStyle.WebkitBackgroundClip = 'text';
        textStyle.WebkitTextFillColor = 'transparent';
        textStyle.backgroundClip = 'text';
      } else {
        textStyle.color = el.textColor || '#000000';
      }

      const textFlipStyle: React.CSSProperties = { ...flipStyle, filter: 'none' };

      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={textFlipStyle}>
              <div style={textStyle}>{displayText}</div>
            </div>
          </div>
        </div>
      );
    }

    // Render: IMAGE
    if (el.type === 'image') {
      const resolvedSrc = recolorSvgDataUrl(el.src, el.colorTint);
      el = { ...el, src: resolvedSrc };
      const filterStr = `
        blur(${el.blur || 0}px) 
        brightness(${el.brightness ?? 1}) 
        contrast(${el.contrast ?? 1})
        hue-rotate(${el.hueRotate || 0}deg)
      `;

      // Base image styles
      let imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'fill',
        filter: filterStr,
        display: 'block',
      };

      let containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      };

      // Color tint overlay for SVG assets using CSS mask-image technique
      const isSvgSrc = el.src?.startsWith('data:image/svg+xml') || el.src?.endsWith('.svg');
      const hasTint = el.colorTint && el.colorTint !== 'none';

      const hasCrop = typeof el.cropX === 'number' &&
        typeof el.cropY === 'number' &&
        typeof el.cropWidth === 'number' &&
        typeof el.cropHeight === 'number' &&
        el.cropWidth > 0 &&
        el.cropHeight > 0;

      const renderImageTag = (styleObj: React.CSSProperties, extraProps: any = {}) => {
        // Detect if this element is on the first page (cover) to load it instantly
        const isCoverElement = pages[0]?.elements.some(item => item.id === el.id);
        const priorityProps = isCoverElement ? {
          loading: "eager" as const,
          fetchPriority: "high" as const,
        } : {};

        if (hasCrop) {
          const { borderRadius, border, ...restStyle } = styleObj;
          return (
            <div className="w-full h-full relative" style={{ borderRadius: borderRadius || 0, border: border || 'none', overflow: 'hidden' }}>
              <img
                src={el.src}
                alt={el.name}
                style={{
                  ...restStyle,
                  position: 'absolute',
                  width: `${10000 / el.cropWidth}%`,
                  height: `${10000 / el.cropHeight}%`,
                  left: `${- (el.cropX / el.cropWidth) * 100}%`,
                  top: `${- (el.cropY / el.cropHeight) * 100}%`,
                  objectFit: 'fill',
                  borderRadius: 0,
                  border: 'none',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                referrerPolicy="no-referrer"
                {...priorityProps}
                {...extraProps}
              />
            </div>
          );
        } else {
          return (
            <img
              src={el.src}
              alt={el.name}
              style={{
                ...styleObj,
                maxWidth: 'none',
                maxHeight: 'none',
              }}
              referrerPolicy="no-referrer"
              {...priorityProps}
              {...extraProps}
            />
          );
        }
      };

      // If there is no specific frameStyle, use standard border-radius and border
      if (!el.frameStyle) {
        imgStyle.borderRadius = `${el.borderRadius || 0}px`;
        imgStyle.border = el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#D4AF37'}` : 'none';

        if (isSvgSrc && hasTint) {
          // SVG recolor via CSS mask-image + background-color overlay
          const renderSvgMask = () => {
            const maskStyle: React.CSSProperties = {
              ...imgStyle,
              maskImage: `url("${el.src}")`,
              WebkitMaskImage: `url("${el.src}")`,
              maskSize: hasCrop ? '100% 100%' : 'contain',
              WebkitMaskSize: hasCrop ? '100% 100%' : 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: el.colorTint,
              filter: filterStr,
              border: 'none',
            };

            if (hasCrop) {
              const { borderRadius, border, ...restStyle } = maskStyle;
              return (
                <div className="w-full h-full relative" style={{ borderRadius: borderRadius || 0, border: border || 'none', overflow: 'hidden' }}>
                  <div
                    style={{
                      ...restStyle,
                      position: 'absolute',
                      width: `${10000 / el.cropWidth}%`,
                      height: `${10000 / el.cropHeight}%`,
                      left: `${- (el.cropX / el.cropWidth) * 100}%`,
                      top: `${- (el.cropY / el.cropHeight) * 100}%`,
                      borderRadius: 0,
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }}
                  />
                </div>
              );
            } else {
              return <div style={maskStyle} />;
            }
          };

          return (
            <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
              <div style={rotateStyle}>
                <div style={flipStyle}>
                  {renderSvgMask()}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Premium Frame Renderers
      if (el.frameStyle === 'classic_arch_gold') {
        // Arch shape: rounded top, flat bottom
        const archRadius = `${el.width / 2}px ${el.width / 2}px 8px 8px`;
        containerStyle = {
          ...containerStyle,
          borderRadius: archRadius,
          border: `2px solid ${el.borderColor || '#D4AF37'}`,
          boxShadow: '0 12px 36px -8px rgba(140, 122, 91, 0.25)',
          padding: '4px',
          backgroundColor: '#FFFDF9',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: `${el.width / 2 - 4}px ${el.width / 2 - 4}px 4px 4px`,
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Vintage Crest Top Ornament */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20 w-10 h-10 flex items-center justify-center text-amber-600 drop-shadow-sm">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="w-8 h-8">
                    <path d="M50,15 L62,38 L87,38 L68,54 L75,79 L50,64 L25,79 L32,54 L13,38 L38,38 Z" opacity="0.15" />
                    <path d="M50,18 C52,18 54,20 54,22 C54,24 52,26 50,26 C48,26 46,24 46,22 C46,20 48,18 50,18 Z M50,28 C56,28 65,34 65,42 C65,44 63,46 61,46 C59,46 58,44 57,42 C55,38 50,38 50,38 C50,38 45,38 43,42 C42,44 41,46 39,46 C37,46 35,44 35,42 C35,34 44,28 50,28 Z M50,44 C53,44 55,46 55,49 L55,59 C55,62 53,64 50,64 C47,64 45,62 45,59 L45,49 C45,46 47,44 50,44 Z M50,67 C51.5,67 52,68 52,69 C52,70 51.5,71 50,71 C48.5,71 48,70 48,69 C48,68 48.5,67 50,67 Z" />
                    <path d="M15,50 C15,30.7 30.7,15 50,15 C69.3,15 85,30.7 85,50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                </div>

                {/* Thin inner gold outline container */}
                <div style={containerStyle}>
                  <div className="w-full h-full relative" style={{ borderRadius: `${el.width / 2 - 4}px ${el.width / 2 - 4}px 4px 4px`, overflow: 'hidden' }}>
                    {renderImageTag(imgStyle)}
                    <div className="absolute inset-0 pointer-events-none border border-[#D4AF37]/30" style={{ borderRadius: `${el.width / 2 - 4}px ${el.width / 2 - 4}px 4px 4px` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (el.frameStyle === 'royal_double_fine') {
        // Luxury Double thin border with elegant offset spacing
        containerStyle = {
          ...containerStyle,
          borderRadius: `${el.borderRadius || 6}px`,
          border: `1.5px solid ${el.borderColor || '#C5A880'}`,
          padding: '6px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
          backgroundColor: '#FFFFFF',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: `${Math.max(0, (el.borderRadius || 6) - 4)}px`,
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div style={containerStyle}>
                  {/* Inner thin frame outline */}
                  <div className="w-full h-full p-1 border border-[#C5A880]/40 relative" style={{ borderRadius: `${Math.max(0, (el.borderRadius || 6) - 2)}px` }}>
                    {renderImageTag(imgStyle)}
                    {/* Tiny corner markers inside */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#C5A880]" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#C5A880]" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#C5A880]" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#C5A880]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (el.frameStyle === 'organic_asymmetric') {
        // Organic Pebble Curve - asymmetrical border radius
        const blobRadius = '140px 40px 140px 40px';
        containerStyle = {
          ...containerStyle,
          borderRadius: blobRadius,
          border: `3px solid ${el.borderColor || '#E2D4C0'}`,
          boxShadow: '0 16px 40px -10px rgba(89, 74, 62, 0.22)',
          backgroundColor: '#FFFFFF',
          padding: '3px',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: '137px 37px 137px 37px',
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Shadow organic layer offset behind it */}
                <div
                  className="absolute inset-0 translate-x-1.5 translate-y-1.5 -z-10 pointer-events-none opacity-40"
                  style={{
                    borderRadius: blobRadius,
                    border: '1.5px dashed #E2D4C0',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (el.frameStyle === 'gilded_vintage_filigree') {
        const size = Math.min(el.width, el.height);
        containerStyle = {
          ...containerStyle,
          width: `${size}px`,
          height: `${size}px`,
          position: 'absolute',
          left: `${(el.width - size) / 2}px`,
          top: `${(el.height - size) / 2}px`,
          borderRadius: '50%',
          border: '2px solid #E5CBA3',
          boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
          backgroundColor: '#FFFFFF',
          padding: '5px',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: '50%',
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Filigree Ornament Vector overlaying the frame boundaries */}
                <div className="absolute inset-0 pointer-events-none z-20 -m-5 flex items-center justify-center text-amber-500/80">
                  <svg viewBox="0 0 200 200" fill="none" className="w-[calc(100%+40px)] h-[calc(100%+40px)]">
                    {/* Top center flower ornament */}
                    <path d="M100,5 C97,15 90,18 100,24 C110,18 103,15 100,5 Z" fill="currentColor" />
                    <circle cx="100" cy="24" r="2" fill="currentColor" />
                    {/* Bottom center flower ornament */}
                    <path d="M100,195 C97,185 90,182 100,176 C110,182 103,185 100,195 Z" fill="currentColor" />
                    <circle cx="100" cy="176" r="2" fill="currentColor" />
                    {/* Elegant flourish rings */}
                    <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" />
                    <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" />
                    {/* Side wreaths */}
                    <path d="M15,100 C15,53 53,15 100,15" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M185,100 C185,53 147,15 100,15" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M15,100 C15,147 53,185 100,185" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M185,100 C185,147 147,185 100,185" stroke="currentColor" strokeWidth="0.5" />
                    {/* Small leaf vectors at quadrants */}
                    <path d="M35,60 Q28,52 38,48 Q42,56 35,60 Z" fill="currentColor" />
                    <path d="M165,60 Q172,52 162,48 Q158,56 165,60 Z" fill="currentColor" />
                    <path d="M35,140 Q28,148 38,152 Q42,144 35,140 Z" fill="currentColor" />
                    <path d="M165,140 Q172,148 162,152 Q158,144 165,140 Z" fill="currentColor" />
                  </svg>
                </div>
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (el.frameStyle === 'javanese_joglo_gunungan') {
        // Traditional Royal Heritage Gunungan Silhouette
        // Arch top shape
        containerStyle = {
          ...containerStyle,
          borderRadius: '90px 90px 12px 12px',
          border: '2px solid #D4AF37',
          boxShadow: '0 15px 35px -5px rgba(212, 175, 55, 0.15)',
          padding: '4px',
          backgroundColor: '#FFFDF9',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: '86px 86px 8px 8px',
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Traditional Golden Gunungan Peak Ornament */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-20 w-16 h-12 flex items-center justify-center text-amber-500 drop-shadow-md">
                  <svg viewBox="0 0 100 80" fill="currentColor" className="w-12 h-10">
                    <path d="M50,2 L90,65 C92,68 88,72 84,72 L16,72 C12,72 8,68 10,65 Z M50,15 L18,65 L82,65 Z" opacity="0.3" />
                    <path d="M50,10 L50,65 M45,25 Q35,20 30,35 Q40,32 45,35 M55,25 Q65,20 70,35 Q60,32 55,35 M47,40 Q32,38 25,50 Q38,45 47,48 M53,40 Q68,38 75,50 Q62,45 53,48" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M50,0 C52,5 48,8 50,12 C52,8 48,5 50,0" fill="currentColor" />
                  </svg>
                </div>
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (el.frameStyle === 'torn_paper_boho') {
        // Shabby chic deckle torn paper frame + real dry flowers overlay
        containerStyle = {
          ...containerStyle,
          borderRadius: '4px',
          border: '12px solid #FAF7F0',
          boxShadow: '2px 15px 40px rgba(50,42,32,0.18)',
          backgroundColor: '#FAF7F0',
        };
        imgStyle = {
          ...imgStyle,
          borderRadius: '2px',
        };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Elegant eucalyptus twig overlay cascading from the top right corner */}
                <div className="absolute -top-7 -right-7 z-20 w-16 h-16 text-[#8C826E] pointer-events-none drop-shadow-sm select-none">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full rotate-12">
                    <path d="M90,10 Q50,40 10,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M75,25 Q82,10 70,15 Q64,26 75,25 Z" fill="currentColor" opacity="0.9" />
                    <path d="M60,35 Q48,22 52,30 Q54,42 60,35 Z" fill="currentColor" opacity="0.9" />
                    <path d="M45,48 Q35,35 38,42 Q41,54 45,48 Z" fill="currentColor" opacity="0.9" />
                    <path d="M30,62 Q18,52 22,58 Q26,68 30,62 Z" fill="currentColor" opacity="0.9" />
                    <circle cx="68" cy="28" r="3" fill="#D4AF37" />
                    <circle cx="51" cy="41" r="2.5" fill="#D4AF37" />
                    <circle cx="36" cy="55" r="2" fill="#D4AF37" />
                  </svg>
                </div>
                {/* Wavy/deckle effect simulation using a clip path or overlay */}
                <div style={containerStyle} className="relative">
                  <div className="absolute inset-0 pointer-events-none border border-[#FAF7F0] shadow-inner" />
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Minimalist Circle Frame
      if (el.frameStyle === 'minimal_circle') {
        const size = Math.min(el.width, el.height);
        containerStyle = {
          ...containerStyle,
          width: `${size}px`,
          height: `${size}px`,
          position: 'absolute',
          left: `${(el.width - size) / 2}px`,
          top: `${(el.height - size) / 2}px`,
          borderRadius: '50%',
          border: `2px solid ${el.borderColor || '#D4AF37'}`,
          boxShadow: '0 8px 25px -5px rgba(212, 175, 55, 0.2)',
          padding: '4px',
          backgroundColor: '#FFFDF9',
        };
        imgStyle = { ...imgStyle, borderRadius: '50%' };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div style={containerStyle}>
                  <div className="absolute inset-0 rounded-full pointer-events-none border border-[#D4AF37]/20 m-1.5" />
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Boho Hexagon Frame
      if (el.frameStyle === 'boho_hexagon') {
        const hexClip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        containerStyle = {
          ...containerStyle,
          clipPath: hexClip,
          WebkitClipPath: hexClip,
          border: 'none',
          backgroundColor: 'transparent',
        };
        imgStyle = { ...imgStyle, borderRadius: '0' };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                {/* Boho hex border via slightly larger hex behind */}
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  clipPath: hexClip,
                  WebkitClipPath: hexClip,
                  backgroundColor: el.borderColor || '#C5A880',
                }} />
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Luxury Heart Frame
      if (el.frameStyle === 'luxury_heart') {
        const heartClip = 'path("M50,85 C30,70 5,58 5,35 C5,20 15,10 28,10 C36,10 43,14 50,22 C57,14 64,10 72,10 C85,10 95,20 95,35 C95,58 70,70 50,85 Z")';
        containerStyle = {
          ...containerStyle,
          clipPath: heartClip,
          WebkitClipPath: heartClip,
          border: 'none',
        };
        imgStyle = { ...imgStyle, borderRadius: '0' };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div style={containerStyle}>
                  {renderImageTag({ ...imgStyle, objectPosition: 'center 30%' })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Retro Polaroid Frame
      if (el.frameStyle === 'retro_polaroid') {
        containerStyle = {
          ...containerStyle,
          borderRadius: '4px',
          border: '8px solid #FFFFFF',
          borderBottom: '24px solid #FFFFFF',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          backgroundColor: '#FFFFFF',
        };
        imgStyle = { ...imgStyle, borderRadius: '2px', objectFit: 'cover' };

        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div style={containerStyle}>
                  {renderImageTag(imgStyle)}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Fallback: render default image if no matching frameStyle found
      imgStyle.borderRadius = `${el.borderRadius || 0}px`;
      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={flipStyle}>
              <div style={containerStyle}>
                {renderImageTag(imgStyle)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render: SHAPE
    if (el.type === 'shape') {
      // Circle shape
      if (el.shapeType === 'circle') {
        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: el.backgroundColor || 'transparent',
                    border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#D4AF37'}` : 'none',
                    boxShadow: el.shadowColor && el.shadowColor !== 'transparent'
                      ? `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 10}px ${el.shadowColor}66`
                      : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        );
      }

      // SVG path shape (star, heart, hexagon, wave, triangle, diamond…)
      if (el.path) {
        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <svg
                  viewBox="0 0 24 24"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible', display: 'block' }}
                >
                  <path
                    d={el.path}
                    fill={el.backgroundColor || 'transparent'}
                    stroke={el.borderColor || 'none'}
                    strokeWidth={el.borderWidth ? el.borderWidth / (el.width / 24) : 0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={1}
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      }

      // Default rect / block shape
      const shapeStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: el.backgroundColor || 'transparent',
        border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#D4AF37'}` : 'none',
        borderRadius: `${el.borderRadius || 0}px`,
        boxShadow: el.shadowColor && el.shadowColor !== 'transparent'
          ? `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 10}px ${el.shadowColor}66`
          : undefined,
      };

      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={flipStyle}>
              <div style={shapeStyle} />
            </div>
          </div>
        </div>
      );
    }

    // Render: DIVIDER
    if (el.type === 'divider') {
      const divStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: el.backgroundColor || '#D4AF37',
        borderRadius: '99px',
      };

      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={flipStyle}>
              <div style={divStyle} />
            </div>
          </div>
        </div>
      );
    }

    // Render: BUTTON (Clickable link simulation)
    if (el.type === 'button') {
      const isCoverOpenBtn = el.id === 'open-button' || !el.buttonAction || el.buttonAction === 'open_invitation';
      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={flipStyle}>
              <button
                onClick={() => {
                  if (el.buttonAction === 'open_link') {
                    if (el.buttonLink) {
                      window.open(el.buttonLink, '_blank');
                    } else {
                      alert('Tautan link belum diisi!');
                    }
                  } else {
                    handleOpenInvitation();
                  }
                }}
                className="w-full h-full flex items-center justify-center font-bold tracking-wider transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-md shadow-black/10 px-4 text-center"
                style={{
                  backgroundColor: el.backgroundColor || '#0F172A',
                  color: el.textColor || '#FFFFFF',
                  borderRadius: `${el.borderRadius || 99}px`,
                  fontFamily: el.fontFamily || 'Montserrat',
                  fontSize: `${el.fontSize || 11}px`,
                }}
              >
                {el.text}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render: INTERACTIVE WIDGETS
    if (el.type === 'widget') {
      if (el.widgetType === 'music') {
        const style = el.widgetConfig?.musicStyle || 'vinyl';
        return (
          <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
            <div style={rotateStyle}>
              <div style={flipStyle}>
                <div
                  onClick={toggleMusic}
                  className={`w-full h-full rounded-full cursor-pointer relative shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 select-none ${isPlayingMusic ? 'animate-spin animate-infinite' : ''}`}
                  style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}
                >
                  {/* Vinyl style */}
                  {style === 'vinyl' && (
                    <div className="absolute inset-0 rounded-full bg-[#111] border-2 border-[#D4AF37] flex items-center justify-center">
                      <div className="absolute w-[80%] h-[80%] rounded-full border border-slate-800/40" />
                      <div className="absolute w-[65%] h-[65%] rounded-full border border-slate-800/40" />
                      <div className="absolute w-[50%] h-[50%] rounded-full border border-slate-800/40" />
                      <div className="absolute w-[35%] h-[35%] rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <div className="w-[30%] h-[30%] rounded-full bg-[#FCFBF7]" />
                      </div>
                    </div>
                  )}

                  {/* Rose Gold Wreath */}
                  {style === 'gold-wreath' && (
                    <div className="absolute inset-0 rounded-full bg-[#FFF5F5] border-2 border-[#FDA4AF] flex items-center justify-center">
                      <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#F472B6]/60" />
                      <div className="absolute w-[45%] h-[45%] rounded-full bg-[#FFE4E6] flex items-center justify-center text-[10px]">
                        🌸
                      </div>
                    </div>
                  )}

                  {/* Traditional Gong */}
                  {style === 'traditional-gong' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#B45309] to-[#D4AF37] border-2 border-[#92400E] flex items-center justify-center shadow-inner">
                      <div className="absolute w-[75%] h-[75%] rounded-full border border-[#92400E]/30" />
                      <div className="absolute w-[50%] h-[50%] rounded-full border border-[#92400E]/20" />
                      <div className="absolute w-[25%] h-[25%] rounded-full bg-[#92400E] shadow-md" />
                    </div>
                  )}

                  {/* Neon Heart */}
                  {style === 'neon-heart' && (
                    <div className="absolute inset-0 rounded-full bg-[#FFF1F2] border-2 border-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.25)] flex items-center justify-center">
                      <div className="absolute w-[80%] h-[80%] rounded-full border border-[#FDA4AF]" />
                      <div className="absolute w-[40%] h-[40%] rounded-full bg-[#FFE4E6] flex items-center justify-center text-[10px]">
                        ❤️
                      </div>
                    </div>
                  )}

                  {/* Royal Lace */}
                  {style === 'royal-lace' && (
                    <div className="absolute inset-0 rounded-full bg-[#FCF9F2] border-2 border-[#D4AF37] flex items-center justify-center">
                      <div className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-[#D4AF37]/80" />
                      <div className="absolute w-[70%] h-[70%] rounded-full border border-[#D4AF37]/30" />
                      <div className="absolute w-[35%] h-[35%] rounded-full bg-[#D4AF37] flex items-center justify-center text-[8px] text-white">
                        👑
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      const widgetBackStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: el.hideBackground ? 'transparent' : (el.backgroundColor || '#FFFFFF'),
        border: el.hideBackground ? 'none' : (el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#E2E8F0'}` : 'none'),
        borderRadius: `${el.borderRadius || 12}px`,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        boxShadow: el.hideBackground ? 'none' : '0 4px 15px -3px rgba(0, 0, 0, 0.05)',
      };

      return (
        <div key={el.id} id={`preview-element-${el.id}`} style={outerStyle}>
          <div style={rotateStyle}>
            <div style={flipStyle}>
              {/* COUNTDOWN INTERACTIVE */}
              {el.widgetType === 'countdown' && (
                <div style={widgetBackStyle} className="justify-center items-center">
                  <h5 className="text-[9px] font-bold text-[#8C7A5B] tracking-widest uppercase mb-2 font-sans">
                    {el.widgetConfig?.title || 'SAVING THE DATE'}
                  </h5>
                  {/* Counter numbers */}
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <span className="font-cinzel text-xl font-extrabold text-slate-800">{String(timeLeft.days).padStart(2, '0')}</span>
                      <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5 font-sans">Days</p>
                    </div>
                    <span className="font-cinzel text-slate-400 text-sm font-bold pb-2">:</span>
                    <div className="text-center">
                      <span className="font-cinzel text-xl font-extrabold text-slate-800">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5 font-sans">Hrs</p>
                    </div>
                    <span className="font-cinzel text-slate-400 text-sm font-bold pb-2">:</span>
                    <div className="text-center">
                      <span className="font-cinzel text-xl font-extrabold text-slate-800">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5 font-sans">Min</p>
                    </div>
                    <span className="font-cinzel text-slate-400 text-sm font-bold pb-2">:</span>
                    <div className="text-center animate-pulse">
                      <span className="font-cinzel text-xl font-extrabold text-blue-600">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <p className="text-[7px] text-blue-500 font-bold uppercase mt-0.5 font-sans">Sec</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RSVP FORM INTERACTIVE */}
              {el.widgetType === 'rsvp' && (() => {
                const rsvpTextColor = el.textColor || '#2D271E';
                const rsvpTitle = el.widgetConfig?.title || 'Konfirmasi Kehadiran';
                const rsvpSubtitle = el.widgetConfig?.subtitle || 'Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan jamuan terbaik.';
                const rsvpBtnColor = el.widgetConfig?.buttonColor || '#D4AF37';
                const rsvpBtnTextColor = el.widgetConfig?.buttonTextColor || '#111625';
                const rsvpInputBg = el.widgetConfig?.inputBgColor || '#F8FAFC';
                const rsvpInputText = el.widgetConfig?.inputTextColor || '#1E293B';
                const rsvpAccent = el.widgetConfig?.accentColor || '#D4AF37';

                return (
                  <div
                    style={{
                      ...widgetBackStyle,
                      color: rsvpTextColor,
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '14px',
                      overflowY: 'auto'
                    }}
                    className="scrollbar-hide"
                  >
                    <div className="text-center space-y-0.5">
                      <h5 className="text-[11px] font-extrabold tracking-wider uppercase font-cinzel" style={{ color: rsvpTextColor }}>
                        {rsvpTitle}
                      </h5>
                      <p className="text-[7.5px] leading-relaxed opacity-75 font-sans" style={{ color: rsvpTextColor }}>
                        {rsvpSubtitle}
                      </p>
                    </div>

                    {rsvpSubmitted ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-2 animate-in zoom-in-90 duration-300">
                        <CheckCircle className="w-8 h-8" style={{ color: rsvpAccent }} />
                        <div className="text-[10px] font-bold font-sans" style={{ color: rsvpTextColor }}>RSVP Terkirim!</div>
                        <p className="text-[8px] opacity-75 max-w-[200px] font-sans" style={{ color: rsvpTextColor }}>
                          Terima kasih atas konfirmasi kehadiran Anda. Sampai jumpa di hari bahagia kami!
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleRsvpSubmit} className="space-y-2.5 flex-1 flex flex-col justify-between">
                        {/* Name input */}
                        <div className="space-y-0.5">
                          <input
                            type="text"
                            value={rsvpName}
                            onChange={(e) => setRsvpName(e.target.value)}
                            placeholder="Nama Lengkap Anda"
                            style={{
                              backgroundColor: rsvpInputBg,
                              color: rsvpInputText,
                              borderColor: el.borderColor || '#E2E8F0',
                            }}
                            className="w-full text-[9px] border rounded-lg px-2.5 py-1.5 outline-none font-sans"
                            required
                          />
                        </div>

                        {/* Attendance Buttons */}
                        <div className="space-y-1">
                          <span className="text-[7px] font-extrabold tracking-wider uppercase block opacity-85 font-sans">
                            Status Kehadiran
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { value: 'hadir', label: 'Hadir', icon: Check },
                              { value: 'absen', label: 'Absen', icon: X },
                              { value: 'ragu', label: 'Ragu', icon: HelpCircle }
                            ].map((opt) => {
                              const isSelected = rsvpAttending === opt.value;
                              const Icon = opt.icon;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setRsvpAttending(opt.value)}
                                  style={{
                                    backgroundColor: isSelected ? rsvpBtnColor : 'transparent',
                                    color: isSelected ? rsvpBtnTextColor : rsvpTextColor,
                                    borderColor: isSelected ? rsvpBtnColor : (el.borderColor || '#E2E8F0'),
                                    borderWidth: '1px',
                                    borderStyle: 'solid'
                                  }}
                                  className="py-1 rounded-lg text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer transform active:scale-95"
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Guest Count Selector */}
                        <div className="space-y-1">
                          <span className="text-[7px] font-extrabold tracking-wider uppercase flex items-center gap-0.5 opacity-85 font-sans">
                            <User className="w-2.5 h-2.5" />
                            <span>Jumlah Tamu</span>
                          </span>
                          <div
                            style={{ backgroundColor: rsvpInputBg, borderColor: el.borderColor || '#E2E8F0' }}
                            className="flex items-center justify-between border rounded-lg px-1.5 py-0.5"
                          >
                            <button
                              type="button"
                              onClick={() => setRsvpGuests(prev => Math.max(1, prev - 1))}
                              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: rsvpTextColor }}
                              className="w-4.5 h-4.5 rounded flex items-center justify-center hover:bg-black/10 cursor-pointer active:scale-90"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-[9px] font-extrabold font-sans" style={{ color: rsvpTextColor }}>
                              {rsvpGuests} Orang
                            </span>
                            <button
                              type="button"
                              onClick={() => setRsvpGuests(prev => Math.min(10, prev + 1))}
                              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: rsvpTextColor }}
                              className="w-4.5 h-4.5 rounded flex items-center justify-center hover:bg-black/10 cursor-pointer active:scale-90"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Wishes input */}
                        <div className="space-y-0.5">
                          <textarea
                            value={rsvpMessage}
                            onChange={(e) => setRsvpMessage(e.target.value)}
                            placeholder="Kirim Doa & Ucapan Terbaik Anda"
                            style={{
                              backgroundColor: rsvpInputBg,
                              color: rsvpInputText,
                              borderColor: el.borderColor || '#E2E8F0',
                            }}
                            className="w-full h-9 text-[8px] border rounded-lg px-2.5 py-1.5 outline-none font-sans resize-none"
                            rows={2}
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          style={{
                            backgroundColor: rsvpBtnColor,
                            color: rsvpBtnTextColor,
                          }}
                          className="w-full py-1.5 font-bold text-[8px] tracking-widest rounded-lg transition-all transform active:scale-[0.98] uppercase flex items-center justify-center gap-1 cursor-pointer font-sans"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Kirim Konfirmasi</span>
                        </button>
                      </form>
                    )}

                    {/* Guestbook Wishes List Section */}
                    <div className="border-t border-dashed pt-2 space-y-1.5" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                      <span className="text-[7.5px] font-extrabold tracking-wider uppercase block opacity-85 font-sans">
                        Doa Restu & Ucapan ({rsvpWishes.length})
                      </span>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-0.5 scrollbar-hide text-left">
                        {rsvpWishes.length === 0 ? (
                          <div className="py-4 text-center opacity-60 text-[7px] font-medium font-sans leading-relaxed" style={{ color: rsvpTextColor }}>
                            Belum ada ucapan doa restu. Kirim ucapan Anda di atas untuk menjadi yang pertama!
                          </div>
                        ) : (
                          rsvpWishes.map((wish) => {
                            const isHadir = wish.attending === 'hadir';
                            const isAbsen = wish.attending === 'absen';

                            let badgeText = "Ragu";
                            let badgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                            if (isHadir) {
                              badgeText = `Hadir (${wish.guests} Orang)`;
                              badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                            } else if (isAbsen) {
                              badgeText = "Absen";
                              badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                            }

                            return (
                              <div
                                key={wish.id}
                                style={{
                                  backgroundColor: 'rgba(128, 128, 128, 0.05)',
                                  borderColor: 'rgba(128, 128, 128, 0.1)'
                                }}
                                className="p-2 rounded-lg border text-[8px] space-y-1 font-sans relative"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold block" style={{ color: rsvpTextColor }}>{wish.name}</span>
                                  <span className="text-[6.5px] font-mono opacity-60" style={{ color: rsvpTextColor }}>{wish.timestamp}</span>
                                </div>
                                <div>
                                  <span className={`px-1 py-0.2 rounded text-[6px] font-extrabold border ${badgeColor}`}>
                                    {badgeText}
                                  </span>
                                </div>
                                <p className="leading-normal italic text-[7.5px] font-light mt-1" style={{ color: rsvpTextColor, opacity: 0.9 }}>
                                  "{wish.message}"
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="border-t border-dashed pt-1 text-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                      <span className="text-[8px] opacity-75 font-sans" style={{ color: rsvpTextColor }}>
                        {rsvpSimCount} orang akan hadir di pesta pernikahan
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* DIGITAL GIFT BOX */}
              {el.widgetType === 'gift' && (() => {
                const style = el.widgetConfig?.giftCardStyle || 'bca-blue';
                const bankName = el.widgetConfig?.giftBankName || 'Bank BCA';
                const accountNumber = el.widgetConfig?.giftAccountNumber || '843-0912-881';
                const recipientName = el.widgetConfig?.giftRecipientName || 'Sophia & William';

                // Determine styling classes based on selected template style
                let cardBgClass = '';
                let cardTextColor = 'text-white';
                let chipColor = 'from-yellow-300 via-amber-400 to-yellow-500 border-amber-300/60';
                let logoMark = null;

                if (style === 'bca-blue') {
                  cardBgClass = 'bg-gradient-to-br from-blue-800 via-blue-900 to-sky-950 border border-blue-700/50';
                  logoMark = (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="font-sans font-black italic tracking-tighter text-white text-sm">BCA</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                  );
                } else if (style === 'mandiri-navy') {
                  cardBgClass = 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800/80';
                  logoMark = (
                    <div className="flex flex-col items-end leading-none select-none">
                      <span className="font-sans font-extrabold italic tracking-tight text-white text-[11px]">mandırı</span>
                      <span className="text-[5px] tracking-wider text-amber-400 font-bold uppercase">debit</span>
                    </div>
                  );
                } else if (style === 'bni-emerald') {
                  cardBgClass = 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 border border-emerald-700/40';
                  logoMark = (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="font-sans font-black tracking-tight text-white text-xs italic">BNI</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-teal-500 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-white" />
                      </div>
                    </div>
                  );
                } else if (style === 'luxury-gold') {
                  cardBgClass = 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-500/25';
                  cardTextColor = 'text-amber-100';
                  chipColor = 'from-amber-200 via-yellow-400 to-amber-200 border-amber-300/40';
                  logoMark = (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="font-serif font-black tracking-widest text-[#D4AF37] text-[11px] uppercase">VIP</span>
                      <div className="w-1 h-1 rounded-full bg-amber-500" />
                    </div>
                  );
                }

                return (
                  <div
                    className={`w-full h-full rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden select-none ${cardBgClass} ${cardTextColor}`}
                    style={{
                      border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || 'transparent'}` : undefined,
                      borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                    }}
                  >
                    {/* Glossy card reflections */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
                    {style === 'mandiri-navy' && (
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    )}
                    {style === 'bni-emerald' && (
                      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    {/* Top row: Chip and Bank logo */}
                    <div className="flex items-center justify-between relative z-10">
                      {/* Realistic Gold Chip */}
                      <div className={`w-7 h-5.5 bg-gradient-to-r ${chipColor} rounded-md border relative overflow-hidden shadow-xs shrink-0`}>
                        <div className="absolute inset-x-2 top-0 bottom-0 border-x border-black/15" />
                        <div className="absolute inset-y-1.5 left-0 right-0 border-y border-black/15" />
                        <div className="absolute inset-1.5 border border-black/5 rounded-xs" />
                      </div>

                      {/* Bank logo */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[6px] font-bold text-white/50 tracking-wider uppercase font-sans">
                          {style === 'luxury-gold' ? 'PRIVE' : 'DEBIT CARD'}
                        </span>
                        {logoMark}
                      </div>
                    </div>

                    {/* Mid row: Card Account Number with spacing */}
                    <div className="my-1 relative z-10 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[6px] font-bold text-white/40 tracking-widest uppercase block font-sans">NOMOR REKENING</span>
                        <span className="text-xs font-mono font-bold tracking-widest block select-all">
                          {accountNumber}
                        </span>
                      </div>

                      {/* Copy Action Button beautifully integrated */}
                      <button
                        onClick={() => handleCopyAccount(accountNumber)}
                        className={`px-2.5 py-1 rounded-lg border text-[8px] font-bold tracking-wider transition-all transform active:scale-95 cursor-pointer flex items-center space-x-1 z-20 ${copiedAccountNumber
                          ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                          }`}
                        title="Salin No Rekening"
                      >
                        {copiedAccountNumber ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-white" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5 text-white" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bottom row: Recipient Name and Card Brand Logo */}
                    <div className="flex items-end justify-between relative z-10">
                      <div className="space-y-0.5">
                        <span className="text-[6px] font-bold text-white/40 tracking-widest uppercase block font-sans">PEMILIK REKENING</span>
                        <span className="text-[9px] font-bold tracking-wide uppercase font-sans block truncate max-w-[180px]">
                          {recipientName}
                        </span>
                      </div>

                      {/* Brand Logo (Mastercard / Visa simulation) */}
                      {style === 'bca-blue' && (
                        <div className="flex items-center space-x-0.5 opacity-80 scale-75 origin-bottom-right shrink-0">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/95" />
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/95 -ml-2" />
                        </div>
                      )}
                      {(style === 'mandiri-navy' || style === 'bni-emerald') && (
                        <span className="font-sans font-black italic tracking-tighter text-white text-[10px] opacity-75 shrink-0">VISA</span>
                      )}
                      {style === 'luxury-gold' && (
                        <span className="font-serif font-black tracking-widest text-[#D4AF37]/90 text-[8px] uppercase shrink-0">GPN</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* GOOGLE MAPS LOCATION */}
              {(el.widgetType === 'maps' || el.widgetType === 'location') && (
                <div style={widgetBackStyle} className="justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-amber-600 tracking-wider block font-sans">VENUE LOCATION</span>
                    <span className="text-[9px] font-bold text-slate-800 block truncate font-cinzel">
                      {el.widgetConfig?.eventLocationName || 'The Ballroom, Ritz-Carlton'}
                    </span>
                  </div>

                  <a
                    href={el.widgetConfig?.mapUrl || 'https://maps.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8.5px] tracking-wider rounded-lg transition-all"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>BUKA PETUNJUK MAPS</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}

              {/* EVENT DETAIL CARD */}
              {el.widgetType === 'event' && (() => {
                const style = el.widgetConfig?.eventCardStyle || 'classic-arch';
                const title = (el.widgetConfig?.title || 'THE WEDDING CEREMONY').toUpperCase();
                const date = el.widgetConfig?.eventDate || '2026-10-24';
                const time = el.widgetConfig?.eventTime || '06:00 PM - 10:00 PM';
                const locationName = el.widgetConfig?.eventLocationName || 'Glass Greenhouse, Jakarta';
                const address = el.widgetConfig?.eventAddress || '123 Main Street, New York';

                // Format dates for Google Calendar URL (YYYYMMDDTHHMMSSZ)
                const gCalDate = date.replace(/-/g, '');
                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gCalDate}T000000Z/${gCalDate}T235959Z&details=${encodeURIComponent('Acara pernikahan kami.')}&location=${encodeURIComponent(address || locationName)}`;

                let shapeClass = '';
                let innerClass = '';
                if (style === 'classic-arch') {
                  shapeClass = 'rounded-t-[80px] rounded-b-xl border-[#D4AF37] border-2 bg-[#FDFBF7] shadow-lg overflow-hidden';
                  innerClass = 'p-5 flex flex-col items-center justify-between text-center min-h-[140px]';
                } else if (style === 'rustic-oval') {
                  shapeClass = 'rounded-[100px] border-[#8C7A5B] border-[1.5px] bg-[#FCF8EE] shadow-md overflow-hidden';
                  innerClass = 'p-6 flex flex-col items-center justify-center text-center min-h-[150px]';
                } else if (style === 'modern-square') {
                  shapeClass = 'rounded-sm bg-[#0F172A] border-[#334155] border shadow-xl overflow-hidden';
                  innerClass = 'p-4 flex flex-col justify-between text-left min-h-[120px]';
                } else if (style === 'luxury-ticket') {
                  // Ticket shape using masking/clip-path for cutouts
                  shapeClass = 'bg-[#171717] border border-[#D4AF37] shadow-2xl relative';
                  innerClass = 'p-4 flex flex-col justify-between text-center min-h-[130px] border-l-2 border-r-2 border-dashed border-[#D4AF37]/30 mx-2 my-2';
                }

                return (
                  <div
                    className={`flex-shrink-0 w-full h-full relative group transition-all duration-300 ${shapeClass}`}
                    style={
                      style === 'luxury-ticket'
                        ? {
                          clipPath: 'polygon(0% 10px, 10px 10px, 10px 0%, calc(100% - 10px) 0%, calc(100% - 10px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 10px), 0% calc(100% - 10px))',
                        }
                        : {}
                    }
                  >
                    <div className={`${innerClass} h-full`}>
                      <h5
                        className={`text-[9px] font-bold tracking-widest uppercase ${style === 'modern-square' || style === 'luxury-ticket' ? 'text-white' : 'text-[#8C7A5B]'
                          } ${style === 'classic-arch' ? 'font-cinzel' : 'font-sans'}`}
                      >
                        {title}
                      </h5>

                      <div className={`space-y-1.5 w-full ${style === 'modern-square' ? 'text-left' : 'text-center'} mt-2`}>
                        <div className={`text-[10px] font-bold ${style === 'modern-square' ? 'text-slate-200' : (style === 'luxury-ticket' ? 'text-[#D4AF37]' : 'text-slate-800')}`}>
                          {date}
                        </div>
                        <div className={`text-[8.5px] ${style === 'modern-square' ? 'text-slate-400' : (style === 'luxury-ticket' ? 'text-slate-300' : 'text-slate-600')}`}>
                          ⏰ {time}
                        </div>
                        <div className={`text-[8.5px] italic font-serif leading-tight ${style === 'modern-square' ? 'text-slate-300' : (style === 'luxury-ticket' ? 'text-slate-200' : 'text-slate-700')}`}>
                          📍 {locationName}
                        </div>
                      </div>

                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 w-full py-1.5 text-center text-[7.5px] font-bold tracking-wider uppercase rounded-full transition-all flex items-center justify-center gap-1
                          ${style === 'modern-square'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : style === 'luxury-ticket'
                              ? 'bg-[#D4AF37] hover:bg-[#B89A32] text-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }
                        `}
                      >
                        <Calendar className="w-2.5 h-2.5" />
                        <span>Save to Calendar</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* GALLERY MULTI-LAYOUT & ASPECT RATIO & LIGHTBOX */}
              {el.widgetType === 'gallery' && (() => {
                const images = el.widgetConfig?.images || [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600'
                ];

                const layoutStyle = el.widgetConfig?.galleryStyle || 'slide';
                const ratio = el.widgetConfig?.aspectRatio || '1:1';

                let ratioClass = 'aspect-square';
                if (ratio === '4:3') ratioClass = 'aspect-[4/3]';
                else if (ratio === '16:9') ratioClass = 'aspect-video';
                else if (ratio === '9:16') ratioClass = 'aspect-[9/16]';

                const activeIdx = galleryIndices[el.id] || 0;

                const handleNext = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  setGalleryIndices(prev => ({
                    ...prev,
                    [el.id]: (activeIdx + 1) % images.length
                  }));
                };

                const handlePrev = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  setGalleryIndices(prev => ({
                    ...prev,
                    [el.id]: (activeIdx - 1 + images.length) % images.length
                  }));
                };

                if (images.length === 0) {
                  return (
                    <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg text-slate-500 font-sans text-xs">
                      📸 Belum ada foto. Upload foto di panel studio.
                    </div>
                  );
                }

                if (layoutStyle === 'slide') {
                  return (
                    <div className="w-full h-full flex flex-col justify-between p-2 relative bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden select-none border border-white/10 shadow-lg text-slate-800">
                      <div className="relative w-full overflow-hidden shadow-inner flex items-center justify-center bg-slate-900 group rounded-xl">
                        <div className={`w-full ${ratioClass} overflow-hidden relative`}>
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeIdx}
                              src={images[activeIdx]}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              transition={{ duration: 0.4 }}
                              onClick={() => setLightboxImage({ images, index: activeIdx })}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all duration-500"
                              alt={`Slide ${activeIdx + 1}`}
                            />
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={handlePrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-xs font-bold transition-all border border-white/10 cursor-pointer shadow-md active:scale-90"
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-xs font-bold transition-all border border-white/10 cursor-pointer shadow-md active:scale-90"
                        >
                          ›
                        </button>
                      </div>

                      <div className="flex justify-center space-x-1.5 py-1">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryIndices(prev => ({
                                ...prev,
                                [el.id]: i
                              }));
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${activeIdx === i ? 'bg-amber-500 scale-125' : 'bg-slate-350'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }

                if (layoutStyle === 'grid') {
                  return (
                    <div className="w-full h-full overflow-y-auto select-none flex flex-col justify-between p-2 relative bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg text-slate-800">
                      <div className="grid grid-cols-3 gap-1.5 max-h-[195px] overflow-y-auto p-1 custom-scrollbar w-full">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage({ images, index: idx })}
                            className={`relative ${ratioClass} rounded-lg overflow-hidden border border-white/10 shadow-xs cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full`}
                          >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-all" />
                          </div>
                        ))}
                      </div>
                      <div className="text-[7px] text-center text-slate-400 font-medium pt-1 font-sans italic">
                        💡 Klik foto untuk melihat lebih jelas
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="w-full h-full overflow-y-auto select-none flex flex-col justify-between p-2 relative bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg text-slate-800">
                    <div className="grid grid-cols-3 gap-1.5 max-h-[195px] overflow-y-auto p-1 custom-scrollbar w-full">
                      {images.slice(0, 7).map((img, idx) => {
                        const isFirst = idx === 0;
                        const gridClass = isFirst && images.length > 1
                          ? 'col-span-2 row-span-2'
                          : 'col-span-1';

                        return (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage({ images, index: idx })}
                            className={`relative ${gridClass} ${ratioClass} rounded-lg overflow-hidden border border-white/10 shadow-xs cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full`}
                          >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            {idx === 6 && images.length > 7 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold font-sans">
                                +{images.length - 7}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[7px] text-center text-slate-400 font-medium pt-1 font-sans italic">
                      💡 Klik foto untuk membuka kolase
                    </div>
                  </div>
                );
              })()}

              {/* VIDEO EMBED INTERACTIVE */}
              {el.widgetType === 'video' && (() => {
                const videoUrl = el.widgetConfig?.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

                let embedId = '';
                try {
                  const url = new URL(videoUrl);
                  if (url.hostname === 'youtu.be') {
                    embedId = url.pathname.substring(1);
                  } else if (url.hostname.includes('youtube.com')) {
                    embedId = url.searchParams.get('v') || '';
                    if (!embedId && url.pathname.startsWith('/embed/')) {
                      embedId = url.pathname.split('/')[2] || '';
                    }
                  }
                } catch (e) {
                  const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|\?v=))([\w-]{11})/);
                  if (match && match[1]) {
                    embedId = match[1];
                  } else {
                    embedId = videoUrl;
                  }
                }

                const embedUrl = `https://www.youtube.com/embed/${embedId}?autoplay=0&mute=0&rel=0`;

                return (
                  <div className="w-full h-full flex flex-col justify-between p-2 relative bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/10">
                    {embedId ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full rounded-xl border-0 shadow-inner animate-fade-in"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video Player"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold p-4 text-center">
                        Tautan video Youtube tidak valid atau belum diisi.
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderElement = (el: InvitationElement, elIndex: number = 0, isCoverPage: boolean = false) => {
    const rendered = renderElementRaw(el, elIndex, isCoverPage);
    if (!rendered) return null;

    const effectClass = el.visualEffect && el.visualEffect !== 'none' ? `effect-${el.visualEffect}` : '';
    const hoverClass = el.hoverEffect && el.hoverEffect !== 'none' ? `hover-effect-${el.hoverEffect}` : '';
    const combinedClass = [rendered.props.className, effectClass, hoverClass].filter(Boolean).join(' ');

    const glowColor = el.outlineColor || el.textColor || '#D4AF37';
    const styleVariables = el.visualEffect === 'glow' || el.hoverEffect === 'glow' ? {
      '--effect-glow-color': glowColor
    } as React.CSSProperties : {};

    const isGallery = el.type === 'image' && el.isGalleryPhoto;
    const isInteractive = el.type === 'button' || el.type === 'widget' || isGallery;
    const hasHover = el.hoverEffect && el.hoverEffect !== 'none';
    const hasClick = el.type === 'button' || el.type === 'widget' || isGallery || (el as any).buttonLink || (el as any).buttonAction;
    const pointerEvents = (isInteractive || hasHover || hasClick) ? 'auto' : 'none';

    const extraProps: any = {};
    if (isGallery) {
      extraProps.onClick = () => {
        setLightboxImage({ images: [el.src || ''], index: 0 });
      };
      extraProps.style = {
        ...rendered.props.style,
        ...styleVariables,
        pointerEvents,
        cursor: 'zoom-in',
      };
    } else {
      extraProps.style = {
        ...rendered.props.style,
        ...styleVariables,
        pointerEvents,
      };
    }

    return React.cloneElement(rendered as React.ReactElement<any>, {
      className: combinedClass,
      ...extraProps,
    });
  };

  // Build Background Style
  const getBackgroundStyle = () => {
    if (background.type === 'color') {
      return { backgroundColor: background.color };
    } else if (background.type === 'gradient') {
      return {
        backgroundImage: `linear-gradient(${background.gradientAngle}deg, ${background.gradientStart}, ${background.gradientEnd})`,
      };
    } else if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  const renderBottomNavbar = () => {
    const navStyle = settings.bottomNavigationStyle || 'glass';
    const visiblePages = settings.showCover ? pages.slice(1) : pages;

    let barClass = "";
    let activeBtnClass = "";
    let inactiveBtnClass = "";

    if (navStyle === 'gold') {
      // Ornate Gold & Navy Vibe
      barClass = "absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-[#0B132B] border border-[#D4AF37] rounded-xl flex items-center justify-around px-2 z-40 shadow-[0_4px_20px_rgba(212,175,55,0.15)] font-serif";
      activeBtnClass = "flex flex-col items-center justify-center text-[#D4AF37] transition-all relative scale-105";
      inactiveBtnClass = "flex flex-col items-center justify-center text-slate-400 hover:text-amber-250 transition-all";
    } else if (navStyle === 'glass') {
      // Minimalist Glassmorphism Capsule
      barClass = "absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-13 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-around px-3 z-40 shadow-lg font-sans";
      activeBtnClass = "flex flex-col items-center justify-center text-white bg-white/15 px-3 py-1.5 rounded-full transition-all scale-105 shadow-xs";
      inactiveBtnClass = "flex flex-col items-center justify-center text-white/60 hover:text-white transition-all";
    } else if (navStyle === 'terracotta') {
      // Terracotta Clay Aesthetic
      barClass = "absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-[#FAF6F0] border border-[#E9D2C4] rounded-2xl flex items-center justify-around px-2 z-40 shadow-md font-sans";
      activeBtnClass = "flex flex-col items-center justify-center text-[#C96F53] bg-[#F3E6DF] px-3.5 py-1.5 rounded-xl transition-all font-semibold";
      inactiveBtnClass = "flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-all";
    } else if (navStyle === 'navy') {
      // Royal Velvet Navy
      barClass = "absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-[#0F172A] border border-blue-900/50 rounded-xl flex items-center justify-around px-2 z-40 shadow-[0_4px_25px_rgba(15,23,42,0.4)] font-sans";
      activeBtnClass = "flex flex-col items-center justify-center text-[#FCD34D] border-b-2 border-[#FCD34D] pb-0.5 transition-all";
      inactiveBtnClass = "flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition-all";
    } else if (navStyle === 'botanical') {
      // Sage Green Botanical
      barClass = "absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-[#E8F0E9] border border-[#C2D8C5] rounded-full flex items-center justify-around px-2 z-40 shadow-sm font-sans";
      activeBtnClass = "flex flex-col items-center justify-center text-[#1E4620] bg-[#D0E2D2] px-3.5 py-1.5 rounded-full transition-all font-semibold";
      inactiveBtnClass = "flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 transition-all";
    }

    const getPageIcon = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('mempelai') || lower.includes('couple') || lower.includes('pengantin') || lower.includes('happy')) {
        return <Heart className="w-3.5 h-3.5" />;
      }
      if (lower.includes('acara') || lower.includes('event') || lower.includes('resepsi') || lower.includes('jadwal') || lower.includes('matrimony') || lower.includes('informasi')) {
        return <Calendar className="w-3.5 h-3.5" />;
      }
      if (lower.includes('lokasi') || lower.includes('map') || lower.includes('alamat') || lower.includes('peta') || lower.includes('venue')) {
        return <MapPin className="w-3.5 h-3.5" />;
      }
      if (lower.includes('rsvp') || lower.includes('konfirmasi') || lower.includes('kehadiran')) {
        return <MessageSquare className="w-3.5 h-3.5" />;
      }
      if (lower.includes('kado') || lower.includes('gift') || lower.includes('hadiah') || lower.includes('amplop')) {
        return <Gift className="w-3.5 h-3.5" />;
      }
      return <FileText className="w-3.5 h-3.5" />;
    };

    const handleNavClick = (realIdx: number) => {
      if (!scrollContainerRef.current) return;
      const targetScrollTop = (realIdx - (settings.showCover ? 1 : 0)) * 844;
      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      setActiveScrolledPageIdx(realIdx);
    };

    return (
      <div className={barClass}>
        {visiblePages.map((page, index) => {
          const realIdx = settings.showCover ? index + 1 : index;
          const isActive = activeScrolledPageIdx === realIdx;

          // Simple name sanitizer
          let label = page.name;
          if (label.toLowerCase().includes('mempelai') || label.toLowerCase().includes('couple')) label = 'Mempelai';
          else if (label.toLowerCase().includes('acara') || label.toLowerCase().includes('event') || label.toLowerCase().includes('informasi')) label = 'Acara';
          else if (label.toLowerCase().includes('lokasi') || label.toLowerCase().includes('peta') || label.toLowerCase().includes('map')) label = 'Peta';
          else if (label.toLowerCase().includes('rsvp') || label.toLowerCase().includes('konfirmasi')) label = 'RSVP';
          else if (label.toLowerCase().includes('kado') || label.toLowerCase().includes('gift') || label.toLowerCase().includes('hadiah') || label.toLowerCase().includes('amplop')) label = 'Kado';
          else label = label.substring(0, 10); // Truncate name

          return (
            <button
              key={page.id}
              onClick={() => handleNavClick(realIdx)}
              className={isActive ? activeBtnClass : inactiveBtnClass}
            >
              {getPageIcon(page.name)}
              <span className="text-[8px] font-bold uppercase tracking-wider mt-1">{label}</span>
              {isActive && navStyle === 'gold' && (
                <div className="absolute -bottom-1.5 w-1 h-1 bg-[#D4AF37] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderScreenContent = () => {
    return (
      <div
        className={`w-[390px] ${isPublicView ? 'rounded-none' : 'rounded-[32px]'} overflow-hidden relative shadow-inner bg-white preview-viewport-content`}
        style={{
          ...getBackgroundStyle(),
          height: `${viewportHeight}px`,
        }}
      >
        {/* Texture overlay */}
        {background.overlayOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundColor: background.overlayColor,
              opacity: background.overlayOpacity,
              mixBlendMode: 'multiply',
            }}
          />
        )}

        {/* Dynamic floating/falling particles effect */}
        {settings.particleEffect && settings.particleEffect !== 'none' && !isLoading && (
          <ParticleEffect type={settings.particleEffect} />
        )}

        {/* Render loading screen independently on top of everything */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-6 text-center select-none"
            >
              {/* Background ambient gold aura */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Gold Ring Spinner */}
              <div className="relative w-20 h-20 mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute inset-2 border-2 border-amber-500/80 border-t-transparent border-b-transparent rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-6 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20"
                >
                  <Heart className="w-4 h-4 text-slate-950 fill-slate-950" />
                </motion.div>
              </div>

              {/* Loading Typography */}
              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-amber-400 font-sans font-medium tracking-[0.2em] text-[10px] uppercase mb-2"
              >
                MEMBUKA UNDANGAN
              </motion.h3>
              <div className="h-6 flex items-center justify-center mb-6">
                <motion.p
                  key={loadingText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="text-slate-300 font-sans text-xs font-light tracking-wide"
                >
                  {loadingText}
                </motion.p>
              </div>

              {/* Loading Progress Bar */}
              <div className="w-48 h-[3px] bg-slate-800 rounded-full overflow-hidden relative border border-slate-900">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-yellow-300"
                  style={{ width: `${loadingProgress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-500/60 mt-2">{loadingProgress}%</span>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Content & Cover Rendered Immediately to pipeline image downloads */}
        <AnimatePresence mode="wait">
          {!isOpen && pages.length > 0 ? (
            // COVER PAGE VIEW
            <motion.div
              key="cover"
              initial={{ opacity: 1 }}
              exit={{
                opacity: (settings.openAnimation || 'curtain-up') === 'fade' ? 0 : 1,
                x: (settings.openAnimation || 'curtain-up') === 'door-left' ? -390 : (settings.openAnimation || 'curtain-up') === 'door-right' ? 390 : 0,
                y: (settings.openAnimation || 'curtain-up') === 'curtain-up' ? -844 : (settings.openAnimation || 'curtain-up') === 'curtain-down' ? 844 : 0,
                scale: (settings.openAnimation || 'curtain-up') === 'zoom-out' ? 1.5 : ((settings.openAnimation || 'curtain-up') === 'fade' ? 1.05 : 1),
                filter: (settings.openAnimation || 'curtain-up') === 'fade' ? 'blur(10px)' : 'none',
                transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
              }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
              style={getBackgroundStyle()}
            >
              {/* Background Overlay for Cover if needed */}
              {background.overlayOpacity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: background.overlayColor,
                    opacity: background.overlayOpacity,
                    mixBlendMode: 'multiply',
                  }}
                />
              )}

              {/* Cover Elements */}
              <div className="w-full h-full relative">
                {pages[0].elements
                  .filter(el => el.widgetType !== 'music')
                  .map((el, i) => renderElement(el, i, true))}
              </div>
            </motion.div>
          ) : (
            // MAIN CONTENT SCROLLABLE VIEW
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{ overscrollBehaviorY: 'contain' }}
              ref={(node) => {
                scrollContainerRef.current = node;
                if (scrollContainer !== node) {
                  setScrollContainer(node);
                }
              }}
            >
              <div className="flex flex-col min-h-full">
                {pages.map((page, pageIndex) => {
                  // If this is the cover page (index 0) and we use it as an overlay cover, skip it in the scrollable view
                  if (pageIndex === 0 && settings.showCover !== false) {
                    return null;
                  }
                  return (
                    <div
                      key={page.id}
                      id={`preview-page-${page.id}`}
                      className="relative w-[390px] h-[844px] shrink-0 border-b border-slate-100/10 overflow-hidden"
                      style={page.background ? {
                        backgroundColor: page.background.color,
                        backgroundImage: page.background.type === 'gradient' ? `linear-gradient(${page.background.gradientAngle}deg, ${page.background.gradientStart}, ${page.background.gradientEnd})` : (page.background.type === 'image' ? `url(${page.background.imageUrl})` : 'none'),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : getBackgroundStyle()}
                    >
                      {page.elements.map((el, i) => renderElement(el, i, false))}
                    </div>
                  );
                })}

                {/* Adsterra Display Banner (Footer Ad Zone) */}
                <div className="w-[390px] py-3 bg-[#090c15] border-t border-slate-900/60 flex flex-col items-center justify-center shrink-0">
                  <AdsterraAd
                    zoneIdKey="mobileBannerZoneId"
                    format="320x50"
                    fallbackComponent={
                      <div className="px-4 py-2 border border-dashed border-slate-850 rounded-xl bg-slate-900/40 text-[9px] text-slate-500 font-sans tracking-wide text-center">
                        <span className="font-bold text-slate-450 block mb-0.5">Rekomendasi Cincin & Souvenir Pernikahan</span>
                        <span>IKLAN SPONSOR (Adsterra Banner Placement)</span>
                      </div>
                    }
                  />
                </div>

                {/* Powered by Watermark Badge for Public Viewing SEO Loop */}
                <div className="w-[390px] py-8 bg-[#090c15] border-t border-slate-900 flex flex-col items-center justify-center space-y-2 font-sans text-center shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Buat Undangan Pernikahan Sendiri</span>
                  <a
                    href="https://invitationbuilder.net/"
                    className="text-sm font-black text-white hover:text-amber-400 transition-colors flex items-center space-x-2"
                    title="Buat Undangan Digital Gratis di invitationbuilder.net"
                  >
                    <img src="/logo.png" className="w-5 h-5 object-contain" alt="invitationbuilder.net Logo" />
                    <span className="tracking-tight text-white font-black">invitationbuilder<span className="text-amber-400">.net</span></span>
                  </a>
                  <span className="text-[9px] text-slate-450">Buat, Desain, &amp; Kirim Undangan Digital Gratis</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating cover music widget when invitation is open */}
        {coverMusicWidget && isOpen && renderElement(coverMusicWidget, 999, false)}

        {/* Bottom Navigation Navbar */}
        {settings.showBottomNavigation && isOpen && renderBottomNavbar()}

        {/* Luxury Background Music Spinning Disk Trigger */}
        {activeMusic && !hasMusicWidget && isOpen && (
          <button
            onClick={toggleMusic}
            className={`absolute ${settings.showBottomNavigation ? 'bottom-22' : 'bottom-6'} right-6 w-11 h-11 rounded-full border shadow-xl z-45 transition-all flex items-center justify-center cursor-pointer ${isPlayingMusic
              ? 'bg-amber-100 border-amber-300 text-amber-700 animate-spin animate-infinite'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            style={{ animationDuration: '8s', animationTimingFunction: 'linear' }}
            title={isPlayingMusic ? 'Mute Music' : 'Play Music'}
          >
            {isPlayingMusic ? <Music className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}
        {/* Floating Auto-Scroll Control Button */}
        {settings.autoScrollEnabled && isOpen && (
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`absolute z-45 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${settings.showBottomNavigation ? 'bottom-22' : 'bottom-6'
              } left-6 ${(settings.autoScrollButtonStyle || 'circular') === 'circular'
                ? 'w-11 h-11 rounded-full'
                : (settings.autoScrollButtonStyle || 'circular') === 'pill'
                  ? 'px-4 py-2.5 rounded-full text-[10px] font-bold space-x-1.5'
                  : 'w-11 h-11 rounded-2xl'
              }`}
            style={{
              backgroundColor: isAutoScrolling ? (settings.autoScrollButtonColor || '#D4AF37') : '#E2E8F0',
              color: isAutoScrolling ? '#FFFFFF' : '#475569',
              border: `1.5px solid ${isAutoScrolling ? 'transparent' : '#CBD5E1'}`
            }}
            title={isAutoScrolling ? 'Pause Auto Scroll' : 'Start Auto Scroll'}
          >
            {(() => {
              const iconClass = "w-4 h-4";
              let iconNode = null;
              const type = settings.autoScrollButtonIcon || 'chevron';
              if (type === 'play') {
                iconNode = <Play className={`${iconClass} ${isAutoScrolling ? 'fill-current' : ''}`} />;
              } else if (type === 'scroll') {
                iconNode = <FileText className={iconClass} />;
              } else if (type === 'arrow') {
                iconNode = <ArrowDown className={iconClass} />;
              } else {
                iconNode = <ChevronsDown className={`${iconClass} ${isAutoScrolling ? 'animate-bounce' : ''}`} />;
              }

              if ((settings.autoScrollButtonStyle || 'circular') === 'pill') {
                return (
                  <>
                    {iconNode}
                    <span>{isAutoScrolling ? 'Gulir On' : 'Gulir Off'}</span>
                  </>
                );
              }
              return iconNode;
            })()}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`${isPublicView
      ? 'w-screen h-screen overflow-hidden flex flex-col items-center justify-center'
      : 'fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200'
      } select-none`}>

      {/* View Mode Toggle Header */}
      {!isPublicView && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-2xl p-1 flex items-center space-x-1 z-35 shadow-xl">
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${viewMode === 'mobile'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span>📱</span>
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${viewMode === 'desktop'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span>💻</span>
            <span>Desktop</span>
          </button>
        </div>
      )}

      {/* Absolute Close */}
      {!isPublicView && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 shadow-lg z-30 cursor-pointer"
          title="Exit Preview"
        >
          <X className="w-5 h-5" />
        </button>
      )}


      {/* RENDER SPLIT MODE FOR DESKTOP VIEW */}
      {viewMode === 'desktop' && !isPublicView ? (
        <div className="w-full max-w-5xl h-[85vh] bg-slate-950/40 border border-white/10 backdrop-blur-md rounded-[32px] overflow-hidden flex shadow-2xl relative animate-in zoom-in-95 duration-350">

          {/* Left Presentation Pane */}
          <div className="flex-1 flex flex-col justify-between p-12 bg-gradient-to-br from-amber-900/10 to-slate-950 text-white relative overflow-hidden select-none border-r border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-amber-500 uppercase">WEDDING INVITATION MOCKUP</span>
              <span className="text-xs text-slate-400 font-serif">William & Sophia</span>
            </div>

            <div className="my-auto space-y-6 z-10 max-w-md">
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-amber-100 leading-tight">
                William <span className="text-2xl font-serif font-light text-amber-500/70 block md:inline md:mx-2">&</span> Sophia
              </h1>
              <p className="text-xs text-slate-350 leading-relaxed font-light font-sans italic">
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya..."
              </p>

              {/* Event Countdown */}
              <div className="pt-4 border-t border-white/10 flex space-x-6">
                <div>
                  <span className="text-2xl font-extrabold text-amber-400 font-cinzel">{timeLeft.days}</span>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase mt-0.5">Hari</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-amber-400 font-cinzel">{timeLeft.hours}</span>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase mt-0.5">Jam</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-amber-400 font-cinzel">{timeLeft.minutes}</span>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase mt-0.5">Menit</span>
                </div>
                <div className="animate-pulse">
                  <span className="text-2xl font-extrabold text-blue-400 font-cinzel">{timeLeft.seconds}</span>
                  <span className="text-[9px] text-blue-400 block font-bold uppercase mt-0.5">Detik</span>
                </div>
              </div>
            </div>

            {/* Music info & play controller */}
            {isOpen && (
              <div className="flex items-center justify-between border-t border-white/10 pt-6 z-10 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleMusic}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${isPlayingMusic
                      ? 'bg-amber-400 border-amber-400 text-slate-950 animate-spin'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    style={{ animationDuration: '6s' }}
                  >
                    {isPlayingMusic ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 font-sans truncate max-w-[180px]">
                      {activeMusic?.name || 'Wedding Background Music'}
                    </p>
                    <p className="text-[8px] text-slate-400 font-sans mt-0.5">Background Music Playing</p>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-slate-500">Tampilan Desktop</span>
              </div>
            )}
          </div>

          {/* Right Mobile Phone View Pane */}
          <div className="w-[450px] bg-slate-950/40 flex items-center justify-center p-6 shrink-0 relative overflow-hidden">
            <div className="scale-[0.82] origin-center shrink-0">
              <div className="bg-slate-950 rounded-[48px] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-slate-800/80 w-[422px] h-[876px] relative">
                {/* Speaker, Front Cam */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center space-x-1.5">
                  <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
                </div>
                {renderScreenContent()}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* NORMAL MOBILE PREVIEW MODE */
        <div
          ref={wrapperRef}
          className={`flex flex-col items-center justify-center max-w-full relative ${isPublicView ? '' : 'py-6'}`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: isPublicView ? 'top center' : 'center center',
            width: isPublicView ? '390px' : undefined,
            height: isPublicView ? `${viewportHeight * scale}px` : `${876 * scale}px`,
            transition: 'transform 0.2s ease-out, height 0.2s ease-out',
          }}
        >
          {/* Device Case — hidden in public view */}
          <div 
            className={`relative ${isPublicView
              ? 'bg-transparent rounded-none p-0 shadow-none border-0 w-[390px]'
              : 'bg-slate-950 rounded-[48px] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-slate-800/80 w-[422px] h-[876px]'
              } shrink-0`}
            style={isPublicView ? { height: `${viewportHeight}px` } : undefined}
          >

            {/* Speaker, Front Cam */}
            {!isPublicView && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center space-x-1.5">
                <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
              </div>
            )}

            {renderScreenContent()}
          </div>

          {!isPublicView && (
            <p className="text-white/60 text-[10px] tracking-wider uppercase font-bold mt-4 font-sans text-center">
              📱 Tampilan Preview HP
            </p>
          )}
        </div>
      )}

      {/* Copy notification toast */}
      {copiedAccountNumber && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-500 text-emerald-400 px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center space-x-2 z-50 animate-in fade-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Nomor Rekening Berhasil Disalin!</span>
        </div>
      )}

      {/* Fullscreen Lightbox Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200 select-none text-white"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Header */}
          <div className="flex justify-between items-center px-4 py-2 w-full">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
              {lightboxImage.index + 1} / {lightboxImage.images.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
              className="text-white hover:text-amber-500 font-black text-xl p-2 cursor-pointer transition-all hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center border border-white/5"
            >
              ✕
            </button>
          </div>

          {/* Center Image View */}
          <div className="flex-1 flex items-center justify-center relative max-h-[75vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
              }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold flex items-center justify-center border border-white/10 cursor-pointer shadow-md transition-all z-10"
            >
              ‹
            </button>

            <img
              src={lightboxImage.images[lightboxImage.index]}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
              alt="Lightbox View"
            />

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
              }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold flex items-center justify-center border border-white/10 cursor-pointer shadow-md transition-all z-10"
            >
              ›
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div className="flex justify-center space-x-2 py-4 overflow-x-auto max-w-full px-4 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            {lightboxImage.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImage(prev => prev ? { ...prev, index: idx } : null)}
                className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${lightboxImage.index === idx ? 'border-amber-500 scale-110 shadow-lg' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
