import React, { useState, useEffect, useRef } from 'react';
import { 
  InvitationTemplate, 
  InvitationElement, 
  BackgroundSettings, 
  InvitationAnimation,
  EditorHistoryState,
  InvitationPage
} from './types';
import { 
  DEFAULT_TEMPLATES, 
  ELEMENT_TEMPLATES, 
  COMPONENT_TEMPLATES,
  COMPONENT_STYLE_PRESETS
} from './utils/defaults';


import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import CanvasEditor from './components/Canvas/CanvasEditor';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import PreviewModal from './components/Preview/PreviewModal';
import NewProjectModal from './components/NewProject/NewProjectModal';
import SuperAdminPanel from './components/Admin/SuperAdminPanel';
import BugReportModal from './components/BugReport/BugReportModal';
import AdsterraAd from './components/Ads/AdsterraAd';

// Auth and Dashboard integrations
import { supabase } from './utils/supabaseClient';
import AuthPortal from './components/Auth/AuthPortal';
import Dashboard from './components/Dashboard/Dashboard';
import TemplatesCatalog from './components/Dashboard/TemplatesCatalog';
import BlogPortal from './components/Dashboard/BlogPortal';
import { CreditCard, CheckCircle, AlertCircle, Heart, Smartphone, Music, VolumeX, Volume2, Plus, Code, X, Copy, Check, Sparkles, Crown, ZoomIn, ZoomOut } from 'lucide-react';

export default function App() {
  // --- 0. Lightweight Router & Public Share State ---
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [publicInvitation, setPublicInvitation] = useState<any | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [showPublicCheckout, setShowPublicCheckout] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [publicCheckoutProcessing, setPublicCheckoutProcessing] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isTemplatesRoute, setIsTemplatesRoute] = useState(false);
  const [isBlogRoute, setIsBlogRoute] = useState(false);

  // Parse path for public view `/v/:slug`
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/v/')) {
      const slug = path.substring(3);
      if (slug) {
        setPublicSlug(slug);
        loadPublicInvitation(slug);
      }
    } else if (path === '/sys-admin' || path === '/super-admin') {
      setIsAdminRoute(true);
    } else if (path === '/templates' || path === '/katalog') {
      setIsTemplatesRoute(true);
    } else if (path === '/blog' || path.startsWith('/blog/')) {
      setIsBlogRoute(true);
    }
  }, []);

  const loadPublicInvitation = async (slug: string) => {
    setPublicLoading(true);
    setPublicError(null);
    try {
      const res = await fetch(`/api/invitations/slug/${encodeURIComponent(slug)}`);
      const result = await res.json();
      if (result.success) {
        setPublicInvitation(result.data);
      } else {
        setPublicError(result.error || 'Undangan tidak ditemukan atau salah tautan.');
      }
    } catch (err) {
      setPublicError('Koneksi internet bermasalah. Gagal memuat undangan.');
    } finally {
      setPublicLoading(false);
    }
  };

  const handleSimulatePublicPayment = async () => {
    if (!publicInvitation) return;
    setPublicCheckoutProcessing(true);
    try {
      const res = await fetch(`/api/invitations/pay/${publicInvitation.id}`, {
        method: 'POST'
      });
      const result = await res.json();
      if (result.success) {
        setShowPublicCheckout(false);
        // Reload invitation
        await loadPublicInvitation(publicSlug!);
      } else {
        alert('Simulasi pembayaran gagal.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setPublicCheckoutProcessing(false);
    }
  };

  // --- 1. User Session Auth State ---
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Platform features configurations loaded from database
  const [featuresConfig, setFeaturesConfig] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingProcessing, setUpgradingProcessing] = useState(false);

  // Dynamic template management states for admin & all users
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  // Crop image element state
  const [cropElementId, setCropElementId] = useState<string | null>(null);

  const fetchCustomTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCustomTemplates(result.data);
        return result.data as any[];
      }
    } catch (err) {
      console.error("Failed to load custom templates list:", err);
    }
    return [];
  };

  /**
   * Seeds all DEFAULT_TEMPLATES to the database as editable admin templates.
   * Each template gets a stable ID of `builtin-{key}` (e.g. builtin-batikHeritage).
   * Only seeds templates that don't already exist in the DB, so admin edits are never overwritten.
   */
  const seedBuiltinTemplatesToDB = async (existingTemplates: any[]) => {
    const existingIds = new Set(existingTemplates.map((t: any) => t.id));
    const templateKeys = Object.keys(DEFAULT_TEMPLATES);
    let seededCount = 0;

    for (const key of templateKeys) {
      const builtinId = `builtin-${key}`;
      if (existingIds.has(builtinId)) continue; // Already seeded, skip

      const tplData = (DEFAULT_TEMPLATES as any)[key];
      if (!tplData) continue;

      try {
        await fetch('/api/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: builtinId,
            title: tplData.name || `Template ${key}`,
            background: tplData.background,
            settings: tplData.settings,
            pages: tplData.pages || [],
            userId: 'admin',
            slug: `builtin-template-${key}`,
            paid: true,
            isTemplate: true,
          }),
        });
        seededCount++;
      } catch (err) {
        console.error(`[Template Seed] Failed to seed built-in template '${key}':`, err);
      }
    }

    if (seededCount > 0) {
      console.log(`[Template Seed] Seeded ${seededCount} built-in template(s) to DB.`);
      // Refresh template list after seeding
      await fetchCustomTemplates();
    }
  };



  // Guest mode: user is on canvas without logging in
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
  const [guestAuthMode, setGuestAuthMode] = useState<'login' | 'register'>('register');
  const [guestAuthReason, setGuestAuthReason] = useState<'save' | 'design'>('save');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestFullName, setGuestFullName] = useState('');
  const [guestUsername, setGuestUsername] = useState('');
  const [guestAuthLoading, setGuestAuthLoading] = useState(false);
  const [guestAuthError, setGuestAuthError] = useState<string | null>(null);

  const checkGuestAction = (): boolean => {
    if (isGuestMode) {
      setGuestAuthReason('design');
      setShowGuestAuthModal(true);
      return true; // action is blocked
    }
    return false; // action is allowed
  };
  
  // Settings for the active invitation design
  const [projectSlug, setProjectSlug] = useState('');
  const [projectPaid, setProjectPaid] = useState(false);

  // Profile completion states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormName, setProfileFormName] = useState('');
  const [profileFormUsername, setProfileFormUsername] = useState('');
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkProfile = async (userId: string, email: string, currentSession: any) => {
    try {
      const res = await fetch(`/api/profiles/${userId}`);
      const result = await res.json();

      if (result.success && result.data) {
        // Profile exists — go straight to dashboard regardless of login method
        setShowProfileModal(false);
        return;
      }

      // No profile found.
      // Only prompt Google OAuth users to complete their profile.
      // Email-registered users always save their profile during signup,
      // so if they somehow have no profile we still don't block them with a modal.
      const provider = currentSession?.user?.app_metadata?.provider || 'email';
      if (provider === 'google') {
        // Pre-fill name from Google account metadata
        const userMetadata = currentSession?.user?.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || '';
        setProfileFormName(fullName);
        setShowProfileModal(true);
      } else {
        // Email/password user — skip modal
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("Failed to check profile:", err);
      // On error, don't block the user
      setShowProfileModal(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    if (!profileFormName.trim() || !profileFormUsername.trim()) {
      setProfileFormError('Nama lengkap dan username wajib diisi.');
      return;
    }

    const cleanUsername = profileFormUsername.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    if (cleanUsername.length < 3) {
      setProfileFormError('Username minimal 3 karakter.');
      return;
    }

    setCheckingUsername(true);
    setProfileFormError(null);

    try {
      const checkRes = await fetch(`/api/profiles/username/${encodeURIComponent(cleanUsername)}`);
      const checkData = await checkRes.json();
      if (checkData.success && checkData.taken) {
        setProfileFormError('Username ini sudah terdaftar. Silakan pilih username lain!');
        setCheckingUsername(false);
        return;
      }

      const saveRes = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          fullName: profileFormName.trim(),
          username: cleanUsername
        })
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        setShowProfileModal(false);
      } else {
        setProfileFormError(saveData.error || 'Gagal menyimpan profil.');
      }
    } catch (err) {
      console.error("Profile submit error:", err);
      setProfileFormError('Terjadi kesalahan koneksi.');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleGuestAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim() || !guestPassword.trim()) return;

    if (guestAuthMode === 'register') {
      if (!guestFullName.trim()) { setGuestAuthError('Nama lengkap wajib diisi.'); return; }
      const cleanUname = guestUsername.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
      if (cleanUname.length < 3) { setGuestAuthError('Username minimal 3 karakter.'); return; }
      try {
        const chk = await fetch(`/api/profiles/username/${encodeURIComponent(cleanUname)}`);
        const chkData = await chk.json();
        if (chkData.success && chkData.taken) { setGuestAuthError('Username sudah digunakan.'); return; }
      } catch {}
    }

    setGuestAuthLoading(true);
    setGuestAuthError(null);

    try {
      if (guestAuthMode === 'register') {
        const cleanUname = guestUsername.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
        const { data, error } = await supabase.auth.signUp({ email: guestEmail.trim(), password: guestPassword.trim() });
        if (error) throw error;
        if (data.user) {
          await fetch('/api/profiles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.user.id, email: data.user.email, fullName: guestFullName.trim(), username: cleanUname })
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: guestEmail.trim(), password: guestPassword.trim() });
        if (error) throw error;
      }
      setShowGuestAuthModal(false);
      // After login, session listener will update session → isGuestMode = false → dashboard
    } catch (err: any) {
      setGuestAuthError(err.message || 'Terjadi kesalahan.');
    } finally {
      setGuestAuthLoading(false);
    }
  };

  const handleGoogleLoginGuest = async () => {
    setGuestAuthLoading(true);
    setGuestAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err: any) {
      setGuestAuthError(err.message || 'Gagal login Google.');
      setGuestAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleSession = async (currentSession: any) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setIsGuestMode(false);
        setShowGuestAuthModal(false);
        try {
          const res = await fetch(`/api/profiles/${currentSession.user.id}`);
          const result = await res.json();
          if (result.success && result.data) {
            setUserProfile(result.data);
          }
        } catch (err) {
          console.error("Failed to load user profile in App.tsx handleSession:", err);
        }
        await checkProfile(currentSession.user.id, currentSession.user.email, currentSession);
      } else {
        setIsGuestMode(true);
        setUserProfile(null);
        setShowProfileModal(false);
      }
      setAuthLoading(false);
    };

    // Load platform features configuration
    fetch('/api/features-config')
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setFeaturesConfig(result.data);
        }
      })
      .catch(err => console.error("Failed to load features config on mount:", err));

    // Load dynamic templates — and seed built-in ones if on admin route
    const path = window.location.pathname;
    const isAdminPath = path === '/sys-admin' || path === '/super-admin';
    fetchCustomTemplates().then((existingTemplates) => {
      if (isAdminPath) {
        // Silently seed built-in templates so admin can edit them
        seedBuiltinTemplatesToDB(existingTemplates);
      }
    });


    // Read session
    supabase.auth.getSession().then(({ data: { session: currentSession } }: any) => {
      handleSession(currentSession);
      // If ?showLogin=true in URL, auto-open the login modal for guests
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('showLogin') === 'true' && !currentSession) {
        setShowGuestAuthModal(true);
        setGuestAuthMode('login');
        // Clean the URL
        window.history.replaceState({}, '', '/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, newSession: any) => {
      await handleSession(newSession);
      if (!newSession) {
        // Clear active project on sign out
        setActiveProjectId(null);
        setIsGuestMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  // --- 2. Core Editor Canvas State ---
  // Load a demo template for guest mode so users immediately see a beautiful invitation
  // Get active template key from query params or fallback
  const getInitialTemplateKey = () => {
    const params = new URLSearchParams(window.location.search);
    const tplParam = params.get('template');
    if (tplParam && (DEFAULT_TEMPLATES as any)[tplParam]) {
      return tplParam;
    }
    return 'premiumIndonesianFloral';
  };

  const initialTemplateKey = getInitialTemplateKey();
  const _guestDemoTemplate = (DEFAULT_TEMPLATES as any)[initialTemplateKey] || Object.values(DEFAULT_TEMPLATES)[0];
  const [title, setTitle] = useState(_guestDemoTemplate?.name || 'Wedding Invitation Demo');
  const [pages, setPages] = useState<InvitationPage[]>(_guestDemoTemplate?.pages || []);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [background, setBackground] = useState<BackgroundSettings>({
    type: 'color',
    color: '#FFFFFF',
    gradientStart: '#FFFFFF',
    gradientEnd: '#E6D2B1',
    gradientAngle: 135,
    overlayOpacity: 0.1,
    overlayColor: '#D4AF37'
  });
  const [settings, setSettings] = useState<InvitationTemplate['settings']>(_guestDemoTemplate?.settings || {
    musicUrl: '',
    musicName: '',
    title: 'Wedding of Sophia & William',
    safeArea: true,
    grid: false,
    snap: true,
    ruler: false,
    zoom: 0.85, 
    showCover: true,
    openAnimation: 'fade',
    showBottomNavigation: true,
    bottomNavigationStyle: 'glass',
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animationPreview, setAnimationPreview] = useState<{ elementId: string; tempType?: string; timestamp: number } | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<string | null>('upload');
  const [showPreview, setShowPreview] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState(700);
  const [embedRounded, setEmbedRounded] = useState(true);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [copiedElement, setCopiedElement] = useState<InvitationElement | null>(null);

  // --- Responsive Screen / Zoom Adjustment for Mobile ---
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Mock phone size is 390 + 28 = 418px. Adjust zoom so that mockup fits the screen width with a small margin.
        const availableWidth = window.innerWidth - 32;
        const targetWidth = 390 + 28;
        const newZoom = Math.min(1, Math.max(0.4, availableWidth / targetWidth));
        setSettings((prev) => ({ ...prev, zoom: Number(newZoom.toFixed(2)) }));
      } else {
        // Reset/stabilize desktop default zoom
        setSettings((prev) => ({ ...prev, zoom: Math.max(0.85, prev.zoom) }));
      }
    };
    
    // Run once on load/mount and listen on resize
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Global Keyboard Shortcuts (Nudge, Delete) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('[contenteditable]'))
      ) {
        return;
      }

      if (!selectedId) return;

      const selectedEl = pages[activePageIndex]?.elements.find((el) => el.id === selectedId);
      if (!selectedEl || selectedEl.locked) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleUpdateElement(selectedId, { y: selectedEl.y - step });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleUpdateElement(selectedId, { y: selectedEl.y + step });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleUpdateElement(selectedId, { x: selectedEl.x - step });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleUpdateElement(selectedId, { x: selectedEl.x + step });
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDeleteElement(selectedId);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, pages, activePageIndex]);

  // --- Database Save States ---
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'unsaved'>('idle');
  const [dbError, setDbError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);
  const stageRef = useRef<any>(null);

  // --- 3. Undo / Redo History State ---
  const [historyState, setHistoryState] = useState<{ list: EditorHistoryState[]; index: number }>({
    list: [],
    index: -1,
  });
  const isUndoRedoAction = useRef(false);

  // Helper to get current elements
  const currentElements = pages[activePageIndex]?.elements || [];

  // Proxy for setElements to update current page elements
  const setElements = (updater: InvitationElement[] | ((prev: InvitationElement[]) => InvitationElement[])) => {
    setPages((prevPages) => 
      prevPages.map((page, idx) => {
        if (idx === activePageIndex) {
          const newElements = typeof updater === 'function' ? updater(page.elements) : updater;
          return { ...page, elements: newElements };
        }
        return page;
      })
    );
  };

  // --- Page Management Handlers ---
  const handleAddPage = () => {
    if (checkGuestAction()) return;
    const newPage: InvitationPage = {
      id: `page-${generateId()}`,
      name: `Page ${pages.length + 1}`,
      elements: [],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = (index: number) => {
    if (checkGuestAction()) return;
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(newPages.length - 1);
    }
  };

  const handleDuplicatePage = (index: number) => {
    if (checkGuestAction()) return;
    const pageToDuplicate = pages[index];
    if (!pageToDuplicate) return;

    const newPageId = `page-${generateId()}`;
    const duplicatedElements = (pageToDuplicate.elements || []).map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type === 'widget' ? 'wdg' : el.type === 'text' ? 'txt' : 'elm'}-${generateId()}`,
    }));

    const duplicatedPage: InvitationPage = {
      id: newPageId,
      name: `${pageToDuplicate.name} (Copy)`,
      elements: duplicatedElements,
      background: pageToDuplicate.background ? JSON.parse(JSON.stringify(pageToDuplicate.background)) : undefined,
    };

    const newPages = [...pages];
    newPages.splice(index + 1, 0, duplicatedPage);
    setPages(newPages);
    setActivePageIndex(index + 1);
  };

  const handleReorderPages = (reordered: InvitationPage[]) => {
    if (checkGuestAction()) return;
    setPages(reordered);
  };

  const handleUpdatePage = (index: number, updates: Partial<InvitationPage>) => {
    if (checkGuestAction()) return;
    setPages((prev) => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const handleUpdateSettings = (updates: any) => {
    if (checkGuestAction()) return;
    // Intercept premium scroll and particle effects for free accounts
    // const isPremiumUser = userProfile?.premium === true;
    const isPremiumUser = true;
    
    if (updates.scrollEffect && updates.scrollEffect !== 'none') {
      const isScrollPremium = featuresConfig.find(f => f.feature_id === updates.scrollEffect && f.feature_type === 'effect')?.is_premium === true;
      if (isScrollPremium && !isPremiumUser) {
        setShowUpgradeModal(true);
        return;
      }
    }

    if (updates.particleEffect && updates.particleEffect !== 'none') {
      const isParticlePremium = featuresConfig.find(f => f.feature_id === updates.particleEffect && f.feature_type === 'effect')?.is_premium === true;
      if (isParticlePremium && !isPremiumUser) {
        setShowUpgradeModal(true);
        return;
      }
    }

    setSettings((prev) => ({ ...prev, ...updates }));

    if (updates.musicUrl !== undefined) {
      setPages((prevPages) => 
        prevPages.map((page) => {
          const elements = page.elements.map((el) => {
            if (el.widgetType === 'music') {
              return {
                ...el,
                widgetConfig: {
                  ...el.widgetConfig,
                  audioUrl: updates.musicUrl,
                  audioName: updates.musicName || el.widgetConfig?.audioName || 'Wedding Background Music',
                }
              };
            }
            return el;
          });
          return { ...page, elements };
        })
      );
    }
  };

  // Sync history whenever pages, background, or core settings change
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    if (pages.length === 0 && background.color === '#FFFFFF') return;

    const newState: EditorHistoryState = {
      background: JSON.parse(JSON.stringify(background)),
      pages: JSON.parse(JSON.stringify(pages)),
      settings: JSON.parse(JSON.stringify(settings)),
    };

    setHistoryState((prev) => {
      // Clean history up to the current index
      const cleanHistory = prev.list.slice(0, prev.index + 1);
      const updatedHistory = [...cleanHistory, newState];
      // Limit undo/redo history to 20 steps to prevent memory leaks (Out of Memory browser crash)
      if (updatedHistory.length > 20) {
        updatedHistory.shift();
      }
      return {
        list: updatedHistory,
        index: updatedHistory.length - 1,
      };
    });
  }, [pages, background, settings]);

  const loadTemplatePreset = async (templateKey: string) => {
    // Refresh lightweight templates list (id, title, slug, thumbnail only)
    const latestTemplates = await fetchCustomTemplates();

    // Priority 1: Check if there's an admin-edited version of a built-in template in DB
    const builtinDbId = `builtin-${templateKey}`;
    const foundBuiltinDb = latestTemplates.find(t => t.id === builtinDbId);
    let targetTemplate: InvitationTemplate | undefined;

    if (foundBuiltinDb) {
      // Fetch FULL template data (pages/background/settings) from the dedicated endpoint
      try {
        const res = await fetch(`/api/templates/${builtinDbId}`);
        const result = await res.json();
        if (result.success && result.data) {
          targetTemplate = {
            name: result.data.title,
            background: result.data.background,
            settings: result.data.settings,
            pages: result.data.pages
          };
          console.log(`[Load Preset] Loaded admin-edited version of template '${templateKey}'`);
        }
      } catch (err) {
        console.error(`[Load Preset] Failed to fetch full template data for ${builtinDbId}:`, err);
      }
    }

    if (!targetTemplate) {
      // Priority 2: Check static DEFAULT_TEMPLATES in code
      targetTemplate = DEFAULT_TEMPLATES[templateKey] as InvitationTemplate | undefined;
      if (targetTemplate) {
        console.log(`[Load Preset] Loaded static code version of template '${templateKey}'`);
      }
    }

    if (!targetTemplate) {
      // Priority 3: Check custom template from DB — fetch full data by ID
      const foundCustom = latestTemplates.find(t => t.id === templateKey);
      if (foundCustom) {
        try {
          const res = await fetch(`/api/templates/${templateKey}`);
          const result = await res.json();
          if (result.success && result.data) {
            targetTemplate = {
              name: result.data.title,
              background: result.data.background,
              settings: result.data.settings,
              pages: result.data.pages
            };
            console.log(`[Load Preset] Loaded custom template '${templateKey}'`);
          }
        } catch (err) {
          console.error(`[Load Preset] Failed to fetch full data for custom template ${templateKey}:`, err);
        }
      }
    }

    if (!targetTemplate) {
      alert("Template tidak ditemukan.");
      return;
    }

    const clone = JSON.parse(JSON.stringify(targetTemplate));
    setTitle(clone.name);
    setBackground(clone.background);
    setPages(clone.pages || []);
    setSettings(clone.settings);
    setActivePageIndex(0);
    setSelectedId(null);
  };

  const triggerAnimationPreview = (elementId: string, tempType?: string) => {
    setAnimationPreview({ elementId, tempType, timestamp: Date.now() });
  };

  // --- Multi-User CRUD Trigger Handlers ---
  const handleEditProject = async (projectId: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`/api/invitations/${projectId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const proj = result.data;
        isInitialLoad.current = true; // Block auto-saves temporarily during loading
        setTitle(proj.title);
        setBackground(proj.background);
        setSettings(proj.settings);
        setPages(proj.pages || []);
        setProjectSlug(proj.slug);
        setProjectPaid(proj.paid);
        setActiveProjectId(proj.id);
        
        if (proj.pages && proj.pages.length > 0) {
          setActivePageIndex(0);
        }
        
        setSelectedId(null);
        setHistoryState({ list: [], index: -1 });
        setSaveStatus('saved');
      }
    } catch (err) {
      alert('Gagal memuat projek.');
    } finally {
      setAuthLoading(false);
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 300);
    }
  };

  const handleCreateNewProject = async (projTitle: string, slug: string, templateKey: string) => {
    console.log("[Create Project] Started with:", { projTitle, slug, templateKey });
    
    // Intercept premium templates for free accounts
    // const isPremiumUser = userProfile?.premium === true;
    const isPremiumUser = true;
    const isTemplatePremium = featuresConfig.find(f => f.feature_id === templateKey && f.feature_type === 'template')?.is_premium === true;
    if (isTemplatePremium && !isPremiumUser) {
      setShowUpgradeModal(true);
      return;
    }

    const newId = `proj-${generateId()}`;
    let baseTemplate: InvitationTemplate;

    try {
      // Refresh templates list first to ensure we use the latest admin edits
      const latestTemplates = await fetchCustomTemplates() || [];

      if (templateKey && templateKey !== 'blank') {
        // Priority 1: Check if there's an admin-edited version of a built-in template in DB
        const builtinDbId = `builtin-${templateKey}`;
        const foundBuiltinDb = latestTemplates.find(t => t.id === builtinDbId);
        let rawTemplate: InvitationTemplate | undefined;

        if (foundBuiltinDb) {
          try {
            const res = await fetch(`/api/templates/${builtinDbId}`);
            const result = await res.json();
            if (result.success && result.data) {
              rawTemplate = {
                name: result.data.title,
                background: result.data.background,
                settings: result.data.settings,
                pages: result.data.pages
              };
              console.log(`[Create Project] Loaded admin-edited version of template '${templateKey}'`);
            }
          } catch (err) {
            console.error(`[Create Project] Failed to fetch full template data for ${builtinDbId}:`, err);
          }
        }

        if (!rawTemplate) {
          // Priority 2: Check static DEFAULT_TEMPLATES in code
          rawTemplate = DEFAULT_TEMPLATES[templateKey] as InvitationTemplate | undefined;
          if (rawTemplate) {
            console.log(`[Create Project] Using static DEFAULT_TEMPLATES['${templateKey}']`);
          }
        }

        if (!rawTemplate) {
          // Priority 3: Check user-created custom templates from DB
          const foundCustom = latestTemplates.find(t => t.id === templateKey);
          if (foundCustom) {
            try {
              const res = await fetch(`/api/templates/${templateKey}`);
              const result = await res.json();
              if (result.success && result.data) {
                rawTemplate = {
                  name: result.data.title,
                  background: result.data.background,
                  settings: result.data.settings,
                  pages: result.data.pages
                };
                console.log(`[Create Project] Loaded custom template '${templateKey}' from DB`);
              }
            } catch (err) {
              console.error(`[Create Project] Failed to fetch full custom template data for ${templateKey}:`, err);
            }
          }
        }

        if (!rawTemplate) {
          console.warn(`[Create Project] Template '${templateKey}' not found, fallback to luxuryGold`);
          const fallbackTemplate = DEFAULT_TEMPLATES['luxuryGold'] || Object.values(DEFAULT_TEMPLATES)[0];
          baseTemplate = JSON.parse(JSON.stringify(fallbackTemplate));
        } else {
          baseTemplate = JSON.parse(JSON.stringify(rawTemplate));
        }
      } else {
        baseTemplate = {
          name: projTitle,
          settings: {
            musicUrl: '',
            musicName: '',
            title: `Wedding of ${projTitle}`,
            safeArea: true,
            grid: false,
            snap: true,
            zoom: 0.85,
            showCover: true,
            openAnimation: 'fade',
          },
          background: {
            type: 'color',
            color: '#F9F6F0',
            gradientStart: '#FFFFFF',
            gradientEnd: '#E6D2B1',
            gradientAngle: 135,
            overlayOpacity: 0.05,
            overlayColor: '#D4AF37'
          },
          pages: [{ id: 'page-1', name: 'Main Page', elements: [] }]
        };
      }

      console.log("[Create Project] baseTemplate loaded:", baseTemplate);

      const payload = {
        id: newId,
        title: projTitle,
        background: baseTemplate.background,
        settings: baseTemplate.settings,
        pages: baseTemplate.pages,
        userId: session?.user?.id,
        slug,
        paid: false
      };

      // Block autosave and template rendering side-effects during initial state setup
      isInitialLoad.current = true;

      console.log("[Create Project] Setting state for project ID:", newId);
      // Immediately set the active project and canvas state — don't wait for DB response
      // so the canvas editor opens right away without going through dashboard
      setTitle(projTitle);
      setBackground(baseTemplate.background);
      setSettings(baseTemplate.settings);
      setPages(baseTemplate.pages);
      setProjectSlug(slug);
      setProjectPaid(false);
      setActiveProjectId(newId);
      setActivePageIndex(0);
      setSelectedId(null);
      setHistoryState({ list: [], index: -1 });
      setSaveStatus('saving');

      // Save to DB in background
      fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(result => {
        console.log("[Create Project] DB Save result:", result);
        if (result.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      })
      .catch(err => {
        console.error("[Create Project] DB Save error:", err);
        setSaveStatus('error');
      });

      // Release initial load lock after a brief timeout to let React finish rendering the new states
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 300);

    } catch (error) {
      console.error("[Create Project] Error in handleCreateNewProject:", error);
      alert("Terjadi kesalahan saat menginisialisasi projek baru: " + (error as Error).message);
    }
  };

  // Auto-detect template creation parameters in URL (e.g. ?newProject=true&template=luxuryGold)
  useEffect(() => {
    if (authLoading) return; // Wait until session state is determined

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newProject') === 'true') {
      const templateKey = urlParams.get('template') || 'premiumIndonesianFloral';
      
      if (session) {
        // Logged in: auto create project in DB
        const templateName = (DEFAULT_TEMPLATES as any)[templateKey]?.name || 'Undangan';
        const cleanSlug = `undangan-${Math.random().toString(36).substring(2, 8)}`;
        
        // Clean URL first to avoid duplicate calls on re-renders
        window.history.replaceState({}, '', '/');
        
        handleCreateNewProject(`Undangan ${templateName}`, cleanSlug, templateKey);
      } else {
        // Guest mode: since they are not logged in, they are already on the editor canvas with the template preloaded by getInitialTemplateKey()!
        // We just need to clean the URL query params so the URL looks clean
        window.history.replaceState({}, '', '/');
      }
    }
  }, [authLoading, session]);

  const handleSelectTemplateFromCatalog = async (key: string) => {
    setIsTemplatesRoute(false);
    setIsBlogRoute(false);
    window.history.pushState({}, '', '/');
    
    setIsTemplateLoading(true);
    try {
      if (session) {
        // Logged in: auto create project in DB
        const templateName = (DEFAULT_TEMPLATES as any)[key]?.name || 'Undangan';
        const cleanSlug = `undangan-${Math.random().toString(36).substring(2, 8)}`;
        await handleCreateNewProject(`Undangan ${templateName}`, cleanSlug, key);
      } else {
        // Guest mode: load template directly in editor
        await loadTemplatePreset(key);
      }
    } catch (err) {
      console.error("Failed to select template:", err);
    } finally {
      // Small timeout to allow transition to settle before closing loader
      setTimeout(() => {
        setIsTemplateLoading(false);
      }, 450);
    }
  };

  const handleUpgradeAccount = async () => {
    if (isGuestMode) {
      alert("Harap login atau daftarkan akun terlebih dahulu untuk melakukan upgrade premium!");
      setShowUpgradeModal(false);
      setShowGuestAuthModal(true);
      return;
    }
    
    setUpgradingProcessing(true);
    try {
      const res = await fetch(`/api/profiles/pay/${session.user.id}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        // Reload user profile immediately
        const profileRes = await fetch(`/api/profiles/${session.user.id}`);
        const profileResult = await profileRes.json();
        if (profileResult.success && profileResult.data) {
          setUserProfile(profileResult.data);
          alert("Selamat! Akun Anda berhasil di-upgrade ke Premium. Semua fitur studio kini terbuka!");
        }
      } else {
        alert("Gagal melakukan upgrade: " + result.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat melakukan upgrade.");
    } finally {
      setUpgradingProcessing(false);
      setShowUpgradeModal(false);
    }
  };

  const handleEditTemplate = async (templateId: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`/api/invitations/${templateId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const item = result.data;
        setTitle(item.title);
        setBackground(item.background);
        setSettings(item.settings);
        setPages(item.pages);
        setProjectSlug(item.slug);
        setProjectPaid(true);
        setIsEditingTemplate(true);
        setActiveProjectId(item.id);
        setActivePageIndex(0);
        setSelectedId(null);
        setHistoryState({ list: [], index: -1 });
      }
    } catch (err) {
      alert("Gagal memuat template: " + err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateNewTemplate = () => {
    const templateId = `tpl-${generateId()}`;
    setTitle("Template Pernikahan Baru");
    setBackground({
      type: 'color',
      color: '#F9F6F0',
      gradientStart: '#FFFFFF',
      gradientEnd: '#E6D2B1',
      gradientAngle: 135,
      overlayOpacity: 0.05,
      overlayColor: '#D4AF37'
    });
    setSettings({
      musicUrl: '',
      musicName: '',
      title: 'Undangan Pernikahan',
      safeArea: true,
      grid: false,
      snap: true,
      zoom: 0.85,
      showCover: true,
      openAnimation: 'fade',
    });
    setPages([{ id: 'page-1', name: 'Halaman Utama', elements: [] }]);
    setProjectSlug(`template-${generateId()}`);
    setProjectPaid(true);
    setIsEditingTemplate(true);
    setActiveProjectId(templateId);
    setActivePageIndex(0);
    setSelectedId(null);
    setHistoryState({ list: [], index: -1 });
  };

  const handleExitEditor = () => {
    setActiveProjectId(null);
    setIsEditingTemplate(false);
    if (isAdminRoute) {
      fetchCustomTemplates();
    }
  };

  const saveToDatabase = async () => {
    if (!activeProjectId) return;
    // Allow template saving without user session (admin uses local session storage auth)
    if (!isEditingTemplate && !session) return;
    setSaveStatus('saving');
    
    let thumbnail: string | null = null;
    if (stageRef.current) {
      try {
        const transformer = stageRef.current.findOne('Transformer');
        const activeTransformer = transformer || (stageRef.current.findOne('.transformer') as any);
        if (activeTransformer) {
          activeTransformer.visible(false);
        }
        
        thumbnail = stageRef.current.toDataURL({
          mimeType: 'image/jpeg',
          quality: 0.5,
          pixelRatio: 0.4
        });

        if (activeTransformer) {
          activeTransformer.visible(true);
          const layer = activeTransformer.getLayer();
          if (layer) layer.batchDraw();
        }
      } catch (err) {
        console.warn("Failed to generate stage thumbnail:", err);
      }
    }

    const payload = {
      id: activeProjectId,
      title,
      background,
      settings,
      pages,
      // Always use 'admin' userId for templates — prevents templates from
      // appearing in any user's dashboard project list
      userId: isEditingTemplate ? 'admin' : (session?.user?.id || 'mock-usr-admin'),
      slug: projectSlug,
      paid: projectPaid,
      isTemplate: isEditingTemplate,
      thumbnail
    };

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setSaveStatus('saved');
        setDbError(null);
        // Refresh custom templates list so other parts of the UI get the updated templates
        fetchCustomTemplates();
      } else {
        setSaveStatus('error');
        setDbError(result.error || 'Failed to save elements');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setDbError(err.message || 'Database error');
    }
  };

  // Mark changes as unsaved on state tweaks
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (pages.length === 0) return;
    setSaveStatus('unsaved');
  }, [pages, background, settings, title]);

  // --- 4. History Actions (Undo / Redo) ---
  const handleUndo = () => {
    if (historyState.index > 0) {
      isUndoRedoAction.current = true;
      const targetIndex = historyState.index - 1;
      const prevState = historyState.list[targetIndex];

      setBackground(prevState.background);
      setPages(prevState.pages);
      setSettings(prevState.settings);
      setHistoryState((prev) => ({
        ...prev,
        index: targetIndex,
      }));
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyState.index < historyState.list.length - 1) {
      isUndoRedoAction.current = true;
      const targetIndex = historyState.index + 1;
      const nextState = historyState.list[targetIndex];

      setBackground(nextState.background);
      setPages(nextState.pages);
      setSettings(nextState.settings);
      setHistoryState((prev) => ({
        ...prev,
        index: targetIndex,
      }));
      setSelectedId(null);
    }
  };

  // --- 5. Element Manipulation Handlers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleChangeBackground = (bg: any) => {
    if (checkGuestAction()) return;
    setBackground(bg);
  };

  const handleAddImage = (url: string, name: string, overrides?: Partial<InvitationElement>) => {
    if (checkGuestAction()) return;
    const newImage: InvitationElement = {
      id: `img-${generateId()}`,
      type: 'image',
      name: name || 'Uploaded Photo',
      x: 70,
      y: 200,
      width: 250,
      height: 180,
      rotation: 0,
      opacity: 1,
      src: url,
      borderRadius: 12,
      animation: { type: 'zoom', duration: 1.2, delay: 0.3, easing: 'power2.out' },
      ...overrides,
    };

    setElements((prev) => [...prev, newImage]);
    setSelectedId(newImage.id);
  };

  const handleAddShape = (shapeType: string, path?: string, isDivider?: boolean) => {
    if (checkGuestAction()) return;
    const id = generateId();
    let newElement: InvitationElement;

    if (isDivider) {
      newElement = {
        id: `div-${id}`,
        type: 'divider',
        name: 'Divider Line',
        x: 120,
        y: 350,
        width: 150,
        height: 2,
        rotation: 0,
        opacity: 0.8,
        backgroundColor: '#D4AF37',
      };
    } else {
      newElement = {
        id: `shp-${id}`,
        type: 'shape',
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Block`,
        shapeType,
        path,
        x: 120,
        y: 300,
        width: 150,
        height: 150,
        rotation: 0,
        opacity: 0.6,
        backgroundColor: '#E6D2B1',
        borderRadius: shapeType === 'circle' ? 100 : shapeType === 'frame' ? 12 : 8,
        borderColor: '#D4AF37',
        borderWidth: shapeType === 'frame' ? 2 : 0,
      };
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  const handleAddText = (config: any) => {
    if (checkGuestAction()) return;
    const newText: InvitationElement = {
      id: `txt-${generateId()}`,
      type: 'text',
      name: 'Text Layer',
      x: 45,
      y: 180,
      rotation: 0,
      opacity: 1,
      ...config,
    };

    setElements((prev) => [...prev, newText]);
    setSelectedId(newText.id);
  };

  const handleAddMusicWidget = (audioUrl: string, audioName: string) => {
    if (checkGuestAction()) return;
    let updated = false;

    setPages((prevPages) => 
      prevPages.map((page) => {
        const elements = page.elements.map((el) => {
          if (el.widgetType === 'music') {
            updated = true;
            return {
              ...el,
              widgetConfig: {
                ...el.widgetConfig,
                audioUrl,
                audioName,
              }
            };
          }
          return el;
        });
        return { ...page, elements };
      })
    );

    // Keep settings synchronized
    setSettings((prev) => ({
      ...prev,
      musicUrl: audioUrl,
      musicName: audioName,
    }));

    if (!updated) {
      const newWidget: InvitationElement = {
        id: `wgt-music-${generateId()}`,
        type: 'widget',
        widgetType: 'music',
        name: 'Music Player Icon',
        x: 310,
        y: 760,
        width: 60,
        height: 60,
        rotation: 0,
        opacity: 1,
        borderRadius: 30,
        widgetConfig: {
          audioUrl,
          audioName,
          autoplay: true,
          musicStyle: 'vinyl',
        },
        animation: { type: 'fade', duration: 1.0, delay: 0.5, easing: 'power2.out' },
      };
      setElements((prev) => [...prev, newWidget]);
      setSelectedId(newWidget.id);
    }
  };

  const handleAddComponent = (
    type: 'hero' | 'brideGroom' | 'countdown' | 'story' | 'gallery' | 'video' | 'event' | 'location' | 'rsvp' | 'gift' | 'footer' | 'button',
    presetStyle: 'classic' | 'rustic' | 'emerald' | 'royal' = 'classic'
  ) => {
    if (checkGuestAction()) return;
    // Intercept premium widgets for free accounts
    // const isPremiumUser = userProfile?.premium === true;
    const isPremiumUser = true;
    const isWidgetPremium = featuresConfig.find(f => f.feature_id === type && f.feature_type === 'widget')?.is_premium === true;
    if (isWidgetPremium && !isPremiumUser) {
      setShowUpgradeModal(true);
      return;
    }

    const id = generateId();
    
    if (type === 'hero') {
      const preset = COMPONENT_STYLE_PRESETS.hero[presetStyle];
      const titleEl = {
        id: `txt-${generateId()}`,
        x: 45,
        y: 120,
        rotation: 0,
        opacity: 0.9,
        ...preset.elements[0],
        type: 'text',
        animation: { type: 'fade', duration: 1.2, delay: 0.2, easing: 'power1.out' },
      } as any as InvitationElement;
      const namesEl = {
        id: `txt-${generateId()}`,
        x: 45,
        y: 155,
        rotation: 0,
        opacity: 1,
        ...preset.elements[1],
        type: 'text',
        animation: { type: 'zoom', duration: 1.5, delay: 0.4, easing: 'power2.out' },
      } as any as InvitationElement;

      setElements((prev) => [...prev, titleEl, namesEl]);
      setSelectedId(namesEl.id);
    } 
    else if (type === 'brideGroom') {
      const preset = COMPONENT_STYLE_PRESETS.brideGroom[presetStyle];
      const groom = {
        id: `img-${generateId()}`,
        x: 50,
        y: 240,
        rotation: 0,
        opacity: 1,
        ...preset.elements[0],
        type: 'image',
        name: preset.elements[0].name,
        animation: { type: 'slide-up', duration: 1.2, delay: 0.3, easing: 'power2.out' },
      } as any as InvitationElement;
      const bride = {
        id: `img-${generateId()}`,
        x: 220,
        y: 240,
        rotation: 0,
        opacity: 1,
        ...preset.elements[1],
        type: 'image',
        name: preset.elements[1].name,
        animation: { type: 'slide-up', duration: 1.2, delay: 0.5, easing: 'power2.out' },
      } as any as InvitationElement;

      setElements((prev) => [...prev, groom, bride]);
      setSelectedId(bride.id);
    } 
    else if (type === 'story') {
      const preset = COMPONENT_STYLE_PRESETS.story[presetStyle];
      const storyTitle: InvitationElement = {
        id: `txt-${generateId()}`,
        type: 'text',
        name: preset.name,
        x: 50,
        y: 400,
        width: 290,
        height: 30,
        rotation: 0,
        opacity: 1,
        text: preset.title,
        fontFamily: preset.fontFamily,
        fontSize: 14,
        fontWeight: '600',
        textColor: preset.textColor,
        textAlign: 'center',
        letterSpacing: 3,
      };
      const storyBody: InvitationElement = {
        id: `txt-${generateId()}`,
        type: 'text',
        name: 'Story Paragraph Text',
        x: 50,
        y: 435,
        width: 290,
        height: 80,
        rotation: 0,
        opacity: 0.9,
        text: presetStyle === 'rustic' 
          ? 'Dimulai dari pertemuan sederhana yang penuh berkah, tumbuh benih cinta yang tulus dan murni. Hari ini kami mengundang Bapak/Ibu sekalian untuk menyaksikan ikrar suci janji pernikahan kami.'
          : 'It started with a simple hello, growing into late-night talks, sharing dreams and building futures. Today, we invite you to share our happily ever after.',
        fontFamily: presetStyle === 'rustic' ? 'Montserrat' : 'Cormorant Garamond',
        fontSize: 12,
        fontWeight: '400',
        textColor: '#475569',
        textAlign: 'center',
        lineHeight: 1.5,
        fontStyle: presetStyle === 'rustic' ? 'normal' : 'italic',
      };

      setElements((prev) => [...prev, storyTitle, storyBody]);
      setSelectedId(storyBody.id);
    }
    else if (type === 'footer') {
      const preset = COMPONENT_STYLE_PRESETS.footer[presetStyle];
      const footerText: InvitationElement = {
        id: `txt-${generateId()}`,
        type: 'text',
        name: preset.name,
        x: 50,
        y: 780,
        width: 290,
        height: 40,
        rotation: 0,
        opacity: 0.9,
        text: preset.text,
        fontFamily: preset.fontFamily,
        fontSize: 9,
        fontWeight: '500',
        textColor: preset.textColor,
        textAlign: 'center',
        letterSpacing: 2.5,
        lineHeight: 1.6,
      };

      setElements((prev) => [...prev, footerText]);
      setSelectedId(footerText.id);
    }
    else if (type === 'button') {
      let bgColor = '#8C7A5B';
      let font = 'Montserrat';
      let borderRad = 8;
      
      if (presetStyle === 'classic') {
        bgColor = '#B39254';
        font = 'Playfair Display';
        borderRad = 4;
      } else if (presetStyle === 'emerald') {
        bgColor = '#14532D';
        font = 'Inter';
        borderRad = 0;
      }

      const buttonEl: InvitationElement = {
        id: `btn-${generateId()}`,
        type: 'button',
        name: 'Tombol Buka Undangan / Tautan',
        x: 105,
        y: 600,
        width: 180,
        height: 45,
        rotation: 0,
        opacity: 1,
        text: 'BUKA UNDANGAN',
        fontFamily: font,
        fontSize: 12,
        fontWeight: '600',
        textColor: '#FFFFFF',
        backgroundColor: bgColor,
        borderRadius: borderRad,
        buttonAction: 'open_invitation',
        buttonLink: '',
        animation: { type: 'bounce', duration: 1.2, delay: 0.5, easing: 'bounce.out' },
      };

      setElements((prev) => [...prev, buttonEl]);
      setSelectedId(buttonEl.id);
    }
    else {
      const preset = COMPONENT_STYLE_PRESETS[type as 'countdown' | 'rsvp' | 'gift' | 'location' | 'event' | 'gallery' | 'video'][presetStyle];
      if (!preset) return;

      const widgetElement: InvitationElement = {
        id: `wdg-${id}`,
        type: 'widget',
        widgetType: type as any,
        name: preset.name,
        x: 45,
        y: 500,
        width: 300,
        height: 
          type === 'rsvp' ? 380 : 
          type === 'countdown' ? 90 : 
          type === 'event' ? 110 : 
          type === 'gallery' ? 240 : 
          type === 'video' ? 180 : 
          85,
        rotation: 0,
        opacity: 1,
        backgroundColor: preset.backgroundColor,
        borderColor: (preset as any).borderColor,
        borderWidth: (preset as any).borderWidth,
        borderRadius: preset.borderRadius,
        widgetConfig: JSON.parse(JSON.stringify(preset.widgetConfig)),
        animation: { type: 'fade', duration: 1.2, delay: 0.3, easing: 'power2.out' },
      };

      setElements((prev) => [...prev, widgetElement]);
      setSelectedId(widgetElement.id);
    }
  };

  const handleUpdateElement = (id: string, updates: Partial<InvitationElement>) => {
    if (checkGuestAction()) return;
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleDuplicateElement = (id: string) => {
    if (checkGuestAction()) return;
    const target = currentElements.find((el) => el.id === id);
    if (!target) return;

    const clone: InvitationElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type === 'widget' ? 'wdg' : target.type === 'text' ? 'txt' : 'elm'}-${generateId()}`,
      name: `${target.name} (Copy)`,
      x: Math.min(300, target.x + 15),
      y: Math.min(750, target.y + 15),
    };

    setElements((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  };

  const handleCopyElement = (id: string) => {
    if (checkGuestAction()) return;
    const target = currentElements.find((el) => el.id === id);
    if (target) {
      setCopiedElement(target);
    }
  };

  const handlePasteElement = () => {
    if (checkGuestAction()) return;
    if (!copiedElement) return;

    const clone: InvitationElement = {
      ...JSON.parse(JSON.stringify(copiedElement)),
      id: `${copiedElement.type === 'widget' ? 'wdg' : copiedElement.type === 'text' ? 'txt' : 'elm'}-${generateId()}`,
      name: `${copiedElement.name} (Copy)`,
      x: Math.min(300, copiedElement.x + 15),
      y: Math.min(750, copiedElement.y + 15),
    };

    setElements((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedId(id);
    if (id !== null) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        (activeEl as HTMLElement).blur();
      }
    }
  };

  const handleDeleteElement = (id: string) => {
    if (checkGuestAction()) return;
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const handleReorderElements = (reordered: InvitationElement[]) => {
    if (checkGuestAction()) return;
    setElements(reordered);
  };

  const handleUpdateElementAnimation = (elementId: string, animation: InvitationAnimation) => {
    if (checkGuestAction()) return;
    handleUpdateElement(elementId, { animation });
    triggerAnimationPreview(elementId);
  };

  const handleSaveTemplate = () => {
    const exportData: InvitationTemplate = {
      name: title,
      background,
      pages,
      settings,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '-')}-template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.background && (parsed.pages || parsed.elements)) {
            if (!parsed.pages && parsed.elements) {
              parsed.pages = [{ id: 'page-1', name: 'Main Page', elements: parsed.elements }];
              delete parsed.elements;
            }
            loadTemplatePreset(parsed);
          } else {
            alert("Format JSON tidak valid untuk Template Undangan.");
          }
        } catch (err) {
          alert("Gagal membaca file JSON.");
        }
      };
    }
  };

  const handleClearCanvas = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan canvas editor?")) {
      setPages([{ id: 'page-1', name: 'Main Page', elements: [] }]);
      setActivePageIndex(0);
      setBackground({
        type: 'color',
        color: '#FFFFFF',
        gradientStart: '#FFFFFF',
        gradientEnd: '#E6D2B1',
        gradientAngle: 135,
        overlayOpacity: 0.1,
        overlayColor: '#D4AF37'
      });
      setSelectedId(null);
    }
  };

  const handleClearOrDelete = () => {
    if (selectedId) {
      handleDeleteElement(selectedId);
    } else {
      handleClearCanvas();
    }
  };

  // --- 6. Keyboard Shortcuts & Movement Arrow keys ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (isInputActive) return;

      // Element deletion
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDeleteElement(selectedId);
      }

      // Arrows fine-tuning movement controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id === selectedId && !el.locked) {
              let nextX = el.x;
              let nextY = el.y;
              if (e.key === 'ArrowUp') nextY -= step;
              if (e.key === 'ArrowDown') nextY += step;
              if (e.key === 'ArrowLeft') nextX -= step;
              if (e.key === 'ArrowRight') nextX += step;
              return { ...el, x: nextX, y: nextY };
            }
            return el;
          })
        );
      }

      // Modifier key shortcuts (Ctrl / Cmd)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          if (selectedId) handleDuplicateElement(selectedId);
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          if (selectedId) handleCopyElement(selectedId);
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          if (copiedElement) handlePasteElement();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, copiedElement, pages, activePageIndex]);

  // Listen for scroll reveal effect updates from Sidebar / AnimationPanel
  useEffect(() => {
    const handleScrollUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.id) {
        handleUpdateElement(customEvent.detail.id, customEvent.detail.updates);
      }
    };
    window.addEventListener('update-element-scroll', handleScrollUpdate);
    return () => window.removeEventListener('update-element-scroll', handleScrollUpdate);
  }, [activePageIndex]);


  // ==========================================
  // RENDER ROUTING RESOLUTIONS
  // ==========================================

  // A. ADMIN ROUTING RESOLUTION
  if (isAdminRoute && !activeProjectId) {
    return (
      <SuperAdminPanel 
        onExit={() => {
          setIsAdminRoute(false);
          window.history.pushState({}, '', '/');
        }}
        onEditTemplate={handleEditTemplate}
        onCreateNewTemplate={handleCreateNewTemplate}
      />
    );
  }

  // A.1 TEMPLATES CATALOG PUBLIC PAGE
  if (isTemplatesRoute) {
    return (
      <>
        <TemplatesCatalog
          onBack={() => {
            setIsTemplatesRoute(false);
            window.history.pushState({}, '', '/');
          }}
          onSelectTemplate={handleSelectTemplateFromCatalog}
          customTemplates={customTemplates}
        />
        <AdsterraAd zoneIdKey="socialBarZoneId" format="socialbar" />
      </>
    );
  }

  // A.2 BLOG PORTAL PUBLIC PAGE
  if (isBlogRoute) {
    return (
      <>
        <BlogPortal
          onBack={() => {
            setIsBlogRoute(false);
            window.history.pushState({}, '', '/');
          }}
          onSelectTemplate={handleSelectTemplateFromCatalog}
        />
        <AdsterraAd zoneIdKey="socialBarZoneId" format="socialbar" />
      </>
    );
  }

  // B. PUBLIC VIEWING RESOLUTION
  if (publicSlug) {
    if (publicLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <span className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-sans tracking-widest uppercase">Loading Invitation...</span>
        </div>
      );
    }

    if (publicError || !publicInvitation) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase">Undangan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 max-w-xs">{publicError || 'Tautan ini tidak terhubung dengan undangan aktif mana pun.'}</p>
          <a href="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all">
            Ke Halaman Utama
          </a>
        </div>
      );
    }

    // Checking paid activation (Bypassed: all public invitations are free to view, monetized via ads)
    const isPaid = true;

    if (!isPaid) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Glassmorphic Paywall Card */}
          <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce" style={{ animationDuration: '3s' }}>
              <Smartphone className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                Undangan Belum Aktif
              </span>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">{publicInvitation.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[285px] mx-auto">
                Undangan pernikahan digital ini sedang ditangguhkan. Silakan selesaikan proses pembayaran aktivasi untuk mempublikasikan dan menyebarkan undangan ke para tamu.
              </p>
            </div>

            {/* Simulating checkout payment trigger */}
            <button
              onClick={() => setShowPublicCheckout(true)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs tracking-wider rounded-xl transition-all transform active:scale-98 shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>Simulasi Bayar & Aktifkan</span>
            </button>
          </div>

          {/* checkout modal paywall simulator */}
          {showPublicCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 text-slate-800">
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 text-center relative">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metode Pembayaran Sandbox</h3>
                  <button onClick={() => setShowPublicCheckout(false)} className="absolute top-4.5 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center text-left">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Produk Aktivasi</span>
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">Langganan Akun Premium</span>
                    </div>
                    <span className="text-xs font-black text-blue-600">Rp 25.000</span>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] rounded-xl leading-relaxed">
                    Aktivasi instan. Setelah pembayaran akun Premium sukses, tautan undangan pernikahan ini beserta semua undangan Anda lainnya akan langsung aktif.
                  </div>
                  <button
                    onClick={handleSimulatePublicPayment}
                    disabled={publicCheckoutProcessing}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {publicCheckoutProcessing ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                        <span>KIRIM PEMBAYARAN MOCK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Invitation is Paid -> Render the preview modal full viewport (public sharing viewer mode)
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-950">
        <PreviewModal 
          template={publicInvitation}
          onClose={() => {}}
          isPublicView={true}
        />
        <AdsterraAd zoneIdKey="socialBarZoneId" format="socialbar" />
      </div>
    );
  }



  if (isTemplateLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#090d15] flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center">
          {/* Spinning luxury outer ring */}
          <div className="w-16 h-16 border-2 border-amber-500/15 border-t-amber-500 rounded-full animate-spin duration-1000"></div>
          {/* Inner pulsing sparkle */}
          <div className="absolute flex items-center justify-center animate-pulse duration-1000">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="text-center space-y-1.5 px-4 max-w-xs">
          <p className="text-xs font-black text-amber-400 uppercase tracking-widest font-sans">Menyiapkan Workspace ✨</p>
          <p className="text-[10px] text-slate-500 font-bold leading-normal font-sans">Memuat aset dan struktur template pilihan Anda. Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (showProfileModal) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
        {/* Light Luxury Gold & Ivory Background Ornaments */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(212,175,55,0.06)] relative z-10 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-[#0B132B] uppercase mt-4">Lengkapi Profil Anda</h2>
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed mt-1">
              Harap isi data diri Anda untuk mengelola undangan dan mengakses Studio Desain.
            </p>
          </div>

          {profileFormError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{profileFormError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={profileFormName}
                onChange={(e) => setProfileFormName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Username Unik</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                <input
                  type="text"
                  required
                  value={profileFormUsername}
                  onChange={(e) => setProfileFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="username_anda"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-8 pr-4 py-3.5 outline-none transition-all"
                />
              </div>
              <span className="text-[9px] text-slate-400 block pl-1 leading-normal">
                Hanya huruf kecil, angka, dot (.), dash (-), dan underscore (_). Minimal 3 karakter.
              </span>
            </div>

            <button
              type="submit"
              disabled={checkingUsername}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wider transition-all transform active:scale-98 shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase font-sans"
            >
              {checkingUsername ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Simpan & Masuk Studio</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer font-bold uppercase tracking-wider font-sans"
            >
              Keluar / Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // C. PROJECT PORTAL DASHBOARD ROUTING (logged in, no active project)
  // Only show Dashboard when: logged in session exists AND no project is currently open
  if (session && activeProjectId === null) {
    return (
      <Dashboard 
        user={session.user}
        onEditProject={handleEditProject}
        onCreateNew={handleCreateNewProject}
        customTemplates={customTemplates}
        onOpenCreate={fetchCustomTemplates}
        onNavigateTemplates={() => {
          setIsTemplatesRoute(true);
          window.history.pushState({}, '', '/templates');
        }}
        onNavigateBlog={() => {
          setIsBlogRoute(true);
          window.history.pushState({}, '', '/blog');
        }}
      />
    );
  }


  // D. FULL CANVAS WORKSPACE EDITOR (guest mode OR logged in with active project)

  return (
    <div className={`h-screen bg-slate-50 flex flex-col font-sans select-none overflow-hidden transition-all duration-300 ${editorTheme === 'dark' ? 'dark bg-slate-950' : ''}`} id="invitation-builder-root">

      {/* Guest Auth Modal Overlay — shown when guest clicks save */}
      {showGuestAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[28px] p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowGuestAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            ><X className="w-4 h-4" /></button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                {guestAuthReason === 'design' ? (
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                ) : (
                  <Heart className="w-5 h-5 text-blue-600 fill-blue-100" />
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mt-3">
                {guestAuthReason === 'design' ? 'Mulai Mendesain Undangan' : 'Simpan Desain Anda'}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {guestAuthReason === 'design' ? (
                  guestAuthMode === 'register'
                    ? 'Daftar akun gratis sekarang untuk mulai mendesain dan menyimpan undangan pernikahan digital Anda.'
                    : 'Masuk ke akun Anda untuk mulai mendesain.'
                ) : (
                  guestAuthMode === 'register'
                    ? 'Buat akun gratis untuk menyimpan dan mempublikasikan undangan Anda.'
                    : 'Masuk ke akun Anda untuk menyimpan desain ini.'
                )}
              </p>
            </div>

            {guestAuthError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{guestAuthError}</span>
              </div>
            )}

            {/* Tab Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => { setGuestAuthMode('register'); setGuestAuthError(null); }}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  guestAuthMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >Daftar Gratis</button>
              <button
                onClick={() => { setGuestAuthMode('login'); setGuestAuthError(null); }}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  guestAuthMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >Sudah Punya Akun</button>
            </div>

            <form onSubmit={handleGuestAuthSubmit} className="space-y-3">
              {guestAuthMode === 'register' && (
                <>
                  <input
                    type="text" required placeholder="Nama Lengkap"
                    value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 outline-none transition-all font-semibold"
                  />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                    <input
                      type="text" required placeholder="username_unik"
                      value={guestUsername} onChange={(e) => setGuestUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-8 pr-4 py-3 outline-none transition-all font-semibold"
                    />
                  </div>
                </>
              )}
              <input
                type="email" required placeholder="Email"
                value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 outline-none transition-all font-semibold"
              />
              <input
                type="password" required placeholder="Password (min. 6 karakter)"
                value={guestPassword} onChange={(e) => setGuestPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 outline-none transition-all font-semibold"
              />
              <button
                type="submit" disabled={guestAuthLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                {guestAuthLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : (
                    <span>
                      {guestAuthReason === 'design' ? (
                        guestAuthMode === 'register' ? 'Daftar & Mulai Desain' : 'Masuk & Mulai Desain'
                      ) : (
                        guestAuthMode === 'register' ? 'Buat Akun & Simpan' : 'Masuk & Simpan'
                      )}
                    </span>
                  )}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">atau</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <button
              onClick={handleGoogleLoginGuest} disabled={guestAuthLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide flex items-center justify-center gap-2.5 cursor-pointer transition-all"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.78 0 3.39.61 4.65 1.8l3.47-3.47C17.98 1.19 15.22 0 12 0 7.35 0 3.36 2.67 1.45 6.57l3.89 3.01C6.27 6.87 8.9 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3.01c2.27-2.09 3.54-5.17 3.54-8.74z" />
                <path fill="#FBBC05" d="M5.34 14.73c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.45 7.1C.53 8.94 0 11.01 0 13.18c0 2.17.53 4.24 1.45 6.08l3.89-3.01s-.38-.72-.38-1.52z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.09 7.96-2.96l-3.89-3.01c-1.1.74-2.51 1.18-4.07 1.18-3.1 0-5.73-1.83-6.66-4.51l-3.89 3.01C3.36 21.33 7.36 24 12 24z" />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 1. Top Menu Navigation */}
      <Topbar
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        title={title}
        setTitle={setTitle}
        canUndo={historyState.index > 0}
        canRedo={historyState.index < historyState.list.length - 1}
        undo={handleUndo}
        redo={handleRedo}
        zoom={settings.zoom}
        setZoom={(z) => setSettings({ ...settings, zoom: z })}
        gridEnabled={settings.grid}
        setGridEnabled={(g) => setSettings({ ...settings, grid: g })}
        snapEnabled={settings.snap}
        setSnapEnabled={(s) => setSettings({ ...settings, snap: s })}
        safeAreaEnabled={settings.safeArea}
        setSafeAreaEnabled={(sa) => setSettings({ ...settings, safeArea: sa })}
        rulerEnabled={settings.ruler === true}
        setRulerEnabled={(r) => setSettings({ ...settings, ruler: r })}
        onEmbedClick={() => setShowEmbedModal(true)}
        onPreview={() => setShowPreview(true)}
        onClear={handleClearOrDelete}
        selectedElementId={selectedId}
        onLoadTemplate={loadTemplatePreset}
        onImportJSON={handleImportJSON}
        saveStatus={saveStatus}
        dbError={dbError}
        onSaveToDb={saveToDatabase}
        onNewProjectClick={() => {
          fetchCustomTemplates();
          setShowNewProjectModal(true);
        }}
        onExit={isEditingTemplate ? handleExitEditor : (isGuestMode ? undefined : handleExitEditor)}
        isGuestMode={isEditingTemplate ? false : isGuestMode}
        onGuestSave={() => { setGuestAuthReason('save'); setShowGuestAuthModal(true); }}
        isEditingTemplate={isEditingTemplate}
        customTemplates={customTemplates}
        onOpenPresets={fetchCustomTemplates}
        onReportBugClick={() => setShowBugReportModal(true)}
      />

      {/* 2. Main Studio Panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar controls */}
        <Sidebar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          elements={currentElements}
          pages={pages}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onReorderPages={handleReorderPages}
          onUpdatePage={handleUpdatePage}
          selectedId={selectedId}
          background={background}
          onAddImage={handleAddImage}
          onChangeBackground={handleChangeBackground}
          onAddShape={handleAddShape}
          onAddText={handleAddText}
          onAddComponent={handleAddComponent}
          onAddMusicWidget={handleAddMusicWidget}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onReorderElements={handleReorderElements}
          onUpdateElementAnimation={handleUpdateElementAnimation}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          isPremium={true} // userProfile?.premium === true
          onRequestUpgrade={() => {}} // setShowUpgradeModal(true)
          onPlayAnimation={triggerAnimationPreview}
        />

        {/* Center Live Canvas Stage */}
        <CanvasEditor
          isDarkMode={editorTheme === 'dark'}
          stageRef={stageRef}
          elements={currentElements}
          selectedId={selectedId}
          background={background}
          zoom={settings.zoom}
          setZoom={(z) => setSettings({ ...settings, zoom: z })}
          gridEnabled={settings.grid}
          snapEnabled={settings.snap}
          safeAreaEnabled={settings.safeArea}
          rulerEnabled={settings.ruler === true}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          animationPreview={animationPreview}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onCopyElement={handleCopyElement}
          onPasteElement={handlePasteElement}
          copiedElement={copiedElement}
          onReorderElements={handleReorderElements}
        />

        {/* Floating Zoom Controls for all devices (centered top overlay) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-45 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl flex xl:hidden items-center p-1.5 space-x-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setSettings((prev) => ({ ...prev, zoom: Number(Math.max(0.4, prev.zoom - 0.1).toFixed(2)) }))}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-700 min-w-[40px] text-center select-none">
            {Math.round(settings.zoom * 100)}%
          </span>
          <button
            onClick={() => setSettings((prev) => ({ ...prev, zoom: Number(Math.min(2, prev.zoom + 0.1).toFixed(2)) }))}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {settings.zoom !== 1 && (
            <>
              <div className="w-[1px] h-4 bg-slate-200"></div>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, zoom: 1 }))}
                className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider px-2 border-0 bg-transparent"
                title="Reset Zoom"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Right Properties Inspector */}
        {selectedId && (
          <PropertiesPanel
            selectedElement={currentElements.find((el) => el.id === selectedId) || null}
            onUpdateElement={handleUpdateElement}
            onDuplicateElement={handleDuplicateElement}
            onDeleteElement={handleDeleteElement}
            onCopyElement={handleCopyElement}
            onPasteElement={handlePasteElement}
            copiedElement={copiedElement}
            onSelectElement={handleSelectElement}
            onCropClick={setCropElementId}
            onPlayAnimation={triggerAnimationPreview}
          />
        )}
      </div>

      {/* 3. Luxury Animated Interactive Preview Modal */}
      {showPreview && (
        <PreviewModal
          template={{
            name: title,
            background,
            pages,
            settings,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* BUG REPORT MODAL */}
      {showBugReportModal && (
        <BugReportModal 
          userEmail={session?.user?.email || ''} 
          userId={session?.user?.id || ''} 
          onClose={() => setShowBugReportModal(false)} 
        />
      )}

      {/* 4. New Project Creation Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          customTemplates={customTemplates}
          onCreateProject={(newTitle, templateKey, template) => {
            // Generates a mock slug
            const slug = `wedding-${newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${generateId()}`;
            handleCreateNewProject(newTitle, slug, templateKey);
            setShowNewProjectModal(false);
          }}
        />
      )}
      {/* 5. Embed HTML Integration Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEmbedModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-blue-600">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Embed Undangan Digital HTML</h3>
                <p className="text-[10px] text-slate-400 font-medium">Sisipkan undangan digital Anda ke situs web lain</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Gunakan kode HTML di bawah ini untuk menyisipkan undangan digital premium Anda langsung di halaman web atau blog pribadi Anda menggunakan tag <code>&lt;iframe&gt;</code>.
            </p>

            {/* Customizer settings */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 border border-slate-100 rounded-2xl text-left">
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Lebar (Width)</label>
                <input
                  type="text"
                  value={embedWidth}
                  onChange={(e) => setEmbedWidth(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700 focus:border-blue-400 transition-all"
                  placeholder="e.g. 100%"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Tinggi (Height px)</label>
                <input
                  type="number"
                  value={embedHeight}
                  onChange={(e) => setEmbedHeight(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700 focus:border-blue-400 transition-all"
                  placeholder="e.g. 700"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Borders Bulat</label>
                <button
                  onClick={() => setEmbedRounded(!embedRounded)}
                  className={`w-full text-xs font-semibold py-1.5 border rounded-lg transition-all ${
                    embedRounded 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {embedRounded ? 'Ya, 16px' : 'Tidak, Siku'}
                </button>
              </div>
            </div>

            {/* Generated Code Area */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] text-slate-400 font-bold uppercase block">Salin Kode Iframe</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={`<iframe src="${window.location.origin}/v/${projectSlug || 'default-invitation'}" width="${embedWidth}" height="${embedHeight}px" style="border:none;${embedRounded ? 'border-radius:16px;' : ''}box-shadow:0 10px 30px rgba(0,0,0,0.06);"></iframe>`}
                  className="w-full h-24 text-[10px] font-mono bg-slate-900 text-slate-200 border-none rounded-xl p-3 outline-none select-all"
                />
                <button
                  onClick={() => {
                    const code = `<iframe src="${window.location.origin}/v/${projectSlug || 'default-invitation'}" width="${embedWidth}" height="${embedHeight}px" style="border:none;${embedRounded ? 'border-radius:16px;' : ''}box-shadow:0 10px 30px rgba(0,0,0,0.06);"></iframe>`;
                    navigator.clipboard.writeText(code);
                    setEmbedCopied(true);
                    setTimeout(() => setEmbedCopied(false), 2000);
                  }}
                  className={`absolute bottom-3 right-3 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    embedCopied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  {embedCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{embedCopied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-slate-800 font-sans p-6 text-center space-y-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-600 animate-bounce" style={{ animationDuration: '3s' }}>
              <Crown className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                Fitur Premium Terkunci
              </span>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Upgrade ke Akun Premium</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[300px] mx-auto">
                Fitur ini memerlukan akses akun Premium. Nikmati akses tanpa batas ke semua template premium, widget interaktif, efek partikel, dan bingkai estetik hanya dengan sekali bayar.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center text-left">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Produk Aktivasi</span>
                <span className="text-xs font-bold text-slate-800 block">Langganan Akun Premium</span>
              </div>
              <span className="text-xs font-black text-blue-600">Rp 25.000</span>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={handleUpgradeAccount}
                disabled={upgradingProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs tracking-wider rounded-xl transition-all transform active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                {upgradingProcessing ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4 stroke-[2.5]" />
                    <span>Bayar & Aktifkan Premium</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
              >
                Mungkin Nanti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal Overlay */}
      {cropElementId && (() => {
        const element = currentElements.find(el => el.id === cropElementId);
        if (!element || element.type !== 'image') return null;
        return (
          <ImageCropModal
            element={element}
            onClose={() => setCropElementId(null)}
            onSave={(cropX, cropY, cropWidth, cropHeight) => {
              handleUpdateElement(element.id, {
                cropX,
                cropY,
                cropWidth,
                cropHeight
              });
              setCropElementId(null);
            }}
          />
        );
      })()}
    </div>
  );
}

interface ImageCropModalProps {
  element: any;
  onClose: () => void;
  onSave: (cropX: number, cropY: number, cropWidth: number, cropHeight: number) => void;
}

const ImageCropModal = ({ element, onClose, onSave }: ImageCropModalProps) => {
  // cropX, cropY, cropWidth, cropHeight represent percentages
  const initialLeft = typeof element.cropX === 'number' ? element.cropX : 0;
  const initialTop = typeof element.cropY === 'number' ? element.cropY : 0;
  const initialRight = typeof element.cropWidth === 'number' ? 100 - element.cropX - element.cropWidth : 0;
  const initialBottom = typeof element.cropHeight === 'number' ? 100 - element.cropY - element.cropHeight : 0;

  const [leftPct, setLeftPct] = useState(initialLeft);
  const [rightPct, setRightPct] = useState(initialRight);
  const [topPct, setTopPct] = useState(initialTop);
  const [bottomPct, setBottomPct] = useState(initialBottom);

  const maxLeft = 100 - rightPct - 20;
  const maxRight = 100 - leftPct - 20;
  const maxTop = 100 - bottomPct - 20;
  const maxBottom = 100 - topPct - 20;

  const handleReset = () => {
    setLeftPct(0);
    setRightPct(0);
    setTopPct(0);
    setBottomPct(0);
  };

  const handlePreset = (preset: '1:1' | '4:3' | '16:9' | '9:16') => {
    if (preset === '1:1') {
      setLeftPct(20);
      setRightPct(20);
      setTopPct(0);
      setBottomPct(0);
    } else if (preset === '4:3') {
      setLeftPct(15);
      setRightPct(15);
      setTopPct(5);
      setBottomPct(5);
    } else if (preset === '16:9') {
      setLeftPct(0);
      setRightPct(0);
      setTopPct(22);
      setBottomPct(22);
    } else if (preset === '9:16') {
      setLeftPct(22);
      setRightPct(22);
      setTopPct(0);
      setBottomPct(0);
    }
  };

  const handleSave = () => {
    const cropX = leftPct;
    const cropY = topPct;
    const cropWidth = 100 - leftPct - rightPct;
    const cropHeight = 100 - topPct - bottomPct;
    onSave(cropX, cropY, cropWidth, cropHeight);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>✂️</span>
              <span>Potong Gambar (Crop Image)</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Potong border gambar secara non-destruktif untuk menyesuaikan layout canvas.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-lg transition-all cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="flex flex-wrap gap-2 justify-center py-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase self-center mr-1">Rasio Cepat:</span>
          <button
            onClick={() => handlePreset('1:1')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            ⏹ 1:1 Square
          </button>
          <button
            onClick={() => handlePreset('4:3')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            📺 4:3 Classic
          </button>
          <button
            onClick={() => handlePreset('16:9')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            🌅 16:9 Landscape
          </button>
          <button
            onClick={() => handlePreset('9:16')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            📱 9:16 Story
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200 transition-all cursor-pointer"
          >
            🔄 Reset
          </button>
        </div>

        {/* Main Crop Workspace View */}
        <div className="relative border border-slate-200 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center p-8 min-h-[320px]">
          <div className="relative max-w-full max-h-[350px]">
            {/* Base Image */}
            <img 
              src={element.src} 
              className="max-w-full max-h-[350px] object-contain select-none pointer-events-none" 
              alt="Crop Workspace"
            />
            
            {/* Shaded Area Backdrop overlays */}
            <div className="absolute top-0 left-0 right-0 bg-black/65 transition-all" style={{ height: `${topPct}%` }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/65 transition-all" style={{ height: `${bottomPct}%` }} />
            <div className="absolute top-0 bottom-0 left-0 bg-black/65 transition-all" style={{ top: `${topPct}%`, bottom: `${bottomPct}%`, width: `${leftPct}%` }} />
            <div className="absolute top-0 bottom-0 right-0 bg-black/65 transition-all" style={{ top: `${topPct}%`, bottom: `${bottomPct}%`, width: `${rightPct}%` }} />

            {/* Active Crop Box Outline */}
            <div 
              className="absolute border-2 border-dashed border-amber-400 transition-all"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                right: `${rightPct}%`,
                bottom: `${bottomPct}%`,
              }}
            >
              {/* Highlight Crop Corners */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />
              
              {/* Inner grid lines for rule of thirds guidance */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Range Sliders Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {/* Left Crop Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
              <span>Potong Kiri (Left)</span>
              <span className="font-mono text-slate-700">{leftPct}%</span>
            </div>
            <input 
              type="range" min="0" max={Math.max(0, maxLeft)} value={leftPct}
              onChange={(e) => setLeftPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Right Crop Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
              <span>Potong Kanan (Right)</span>
              <span className="font-mono text-slate-700">{rightPct}%</span>
            </div>
            <input 
              type="range" min="0" max={Math.max(0, maxRight)} value={rightPct}
              onChange={(e) => setRightPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Top Crop Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
              <span>Potong Atas (Top)</span>
              <span className="font-mono text-slate-700">{topPct}%</span>
            </div>
            <input 
              type="range" min="0" max={Math.max(0, maxTop)} value={topPct}
              onChange={(e) => setTopPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Bottom Crop Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
              <span>Potong Bawah (Bottom)</span>
              <span className="font-mono text-slate-700">{bottomPct}%</span>
            </div>
            <input 
              type="range" min="0" max={Math.max(0, maxBottom)} value={bottomPct}
              onChange={(e) => setBottomPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button 
            type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
          >
            Batal
          </button>
          <button 
            type="button" onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer border border-blue-700"
          >
            Terapkan Potongan
          </button>
        </div>
      </div>
    </div>
  );
};
