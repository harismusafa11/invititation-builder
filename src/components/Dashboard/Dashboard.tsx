import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import {
  Plus, LogOut, ExternalLink, Trash2, Edit3, CreditCard,
  CheckCircle, AlertCircle, Sparkles, Heart, Grid,
  BarChart3, Send, Clock, X, Eye, Zap, Crown,
  ChevronDown, Bell, MoreVertical, Globe, Lock,
  Activity, PieChart, Layers, Settings, Users, ArrowUpRight, Upload, Share2, ClipboardList, AlertTriangle,
  Compass, BookOpen
} from 'lucide-react';
import { ProjectStatsModal } from './ProjectStatsModal';
import { ShareModal } from './ShareModal';
import PreviewModal from '../Preview/PreviewModal';
import BugReportModal from '../BugReport/BugReportModal';
import AdsterraAd from '../Ads/AdsterraAd';

interface DashboardProps {
  user: any;
  onEditProject: (projectId: string) => void;
  onCreateNew: (title: string, slug: string, templateKey: string) => void;
  customTemplates?: any[];
  onOpenCreate?: () => void;
  onNavigateTemplates?: () => void;
  onNavigateBlog?: () => void;
}

type NavView = 'dashboard' | 'undangan' | 'analytics' | 'settings' | 'premium' | 'templates' | 'blog';

export default function Dashboard({ 
  user, 
  onEditProject, 
  onCreateNew, 
  customTemplates = [], 
  onOpenCreate,
  onNavigateTemplates,
  onNavigateBlog
}: DashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statsProject, setStatsProject] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('Pernikahan Sophia & William');
  const [newSlug, setNewSlug] = useState('sophia-william');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [payingProject, setPayingProject] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank' | 'card'>('qris');
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [shareProject, setShareProject] = useState<any | null>(null);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  const handleOpenPreview = async (projId: string) => {
    try {
      const res = await fetch(`/api/invitations/${projId}`);
      const result = await res.json();
      if (result.success) {
        setPreviewProject(result.data);
      } else {
        showToast('Gagal memuat pratinjau.', 'error');
      }
    } catch (_) {
      showToast('Gagal memuat pratinjau.', 'error');
    }
  };

  // Settings State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [preferredLang, setPreferredLang] = useState('id');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [insights, setInsights] = useState<{ totalViews: number; totalRsvps: number; attendingGuests: number } | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const idStr = encodeURIComponent(user.id);
      const [invRes, insRes, actRes] = await Promise.all([
        fetch(`/api/invitations?userId=${idStr}`),
        fetch(`/api/dashboard/insights?userId=${idStr}`),
        fetch(`/api/dashboard/activities?userId=${idStr}`)
      ]);
      const [invResult, insResult, actResult] = await Promise.all([
        invRes.json(),
        insRes.json(),
        actRes.json()
      ]);
      if (invResult.success) setProjects(invResult.data);
      if (insResult.success) setInsights(insResult.data);
      if (actResult.success) setActivities(actResult.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(user.id)}`);
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setFullName(result.data.full_name || 'Kreator');
        setUsername(result.data.username || user.email?.split('@')[0] || 'kreator');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();

    // Polling interval to keep dashboard stats and project list updated in real-time
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setNewSlug(clean);
    setSlugError(clean.length < 3 ? 'Tautan minimal 3 karakter.' : null);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSlug.length < 3) {
      setSlugError('Tautan minimal 3 karakter.');
      return;
    }
    setCheckoutProcessing(true);
    try {
      const checkRes = await fetch(`/api/invitations/slug/${encodeURIComponent(newSlug)}`);
      const checkData = await checkRes.json();
      if (checkData.success && checkData.data) {
        setSlugError('Slug sudah digunakan!');
        setCheckoutProcessing(false);
        return;
      }
    } catch (_) {}
    setCheckoutProcessing(false);
    setShowCreateModal(false);
    onCreateNew(newTitle.trim(), newSlug, selectedTemplate);
  };

  const handleConfirmDeleteProject = async () => {
    if (!deletingProject) return;
    setCheckoutProcessing(true);
    try {
      const res = await fetch(`/api/invitations/${deletingProject.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('Proyek undangan berhasil dihapus.');
        setDeletingProject(null);
        fetchDashboardData();
      } else {
        showToast('Gagal menghapus desain.', 'error');
      }
    } catch (_) {
      showToast('Gagal menghapus desain.', 'error');
    } finally {
      setCheckoutProcessing(false);
    }
  };

  const triggerMockPayment = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setPayingProject(project);
  };

  const handleConfirmMockPayment = async () => {
    setCheckoutProcessing(true);
    try {
      const res = await fetch(`/api/profiles/pay/${user.id}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('Aktivasi Berhasil! Status akun Anda sekarang aktif sebagai PREMIUM.');
        setPayingProject(null);
        await fetchProfile();
        await fetchDashboardData();
        if (currentView === 'premium') {
          setCurrentView('dashboard');
        }
      } else {
        showToast('Gagal memproses pembayaran.', 'error');
      }
    } catch (_) {
      showToast('Kesalahan koneksi internet.', 'error');
    } finally {
      setCheckoutProcessing(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Pengaturan profil berhasil disimpan secara lokal.');
  };

  const openCreate = () => {
    onOpenCreate?.();
    setNewTitle('Pernikahan Sophia & William');
    setNewSlug(`wedding-${Math.random().toString(36).substring(2, 6)}`);
    setSlugError(null);
    setShowCreateModal(true);
  };

  const emailInitials = ((user.email as string) || 'U').slice(0, 2).toUpperCase();
  const isAccountPremium = profile?.premium === true;
  
  // Calculations
  const totalViews = insights ? insights.totalViews : projects.reduce((s, p) => s + (p.views || 0), 0);
  const totalRsvps = insights ? insights.totalRsvps : projects.reduce((s, p) => s + (p.rsvp_count || 0), 0);
  const attendingGuests = insights ? insights.attendingGuests : 0;

  // Setup Progress Checklist Calculation
  const latestProject = projects[0];
  let progressSteps: { label: string; done: boolean }[] = [];
  let progressPct = 0;
  let showProgressCard = false;
  if (latestProject) {
    let pagesList = [];
    try {
      pagesList = Array.isArray(latestProject.pages) 
        ? latestProject.pages 
        : (typeof latestProject.pages === 'string' ? JSON.parse(latestProject.pages) : []);
    } catch (_) {}
    const elementsList = pagesList.flatMap((p: any) => p.elements || []);
    
    const hasBride = elementsList.some((el: any) => el.id?.includes('bride') || el.name?.toLowerCase().includes('mempelai') || el.name?.toLowerCase().includes('bride'));
    const hasCover = elementsList.some((el: any) => el.id?.includes('hero') || el.name?.toLowerCase().includes('cover') || el.name?.toLowerCase().includes('hero') || (el.type === 'image' && el.name?.toLowerCase().includes('banner')));
    const hasSchedule = elementsList.some((el: any) => el.widgetType === 'event' || el.name?.toLowerCase().includes('acara') || el.name?.toLowerCase().includes('jadwal'));
    const hasLocation = elementsList.some((el: any) => el.widgetType === 'location' || el.widgetType === 'maps' || el.name?.toLowerCase().includes('peta') || el.name?.toLowerCase().includes('lokasi'));
    const hasGallery = elementsList.some((el: any) => el.widgetType === 'gallery' || el.name?.toLowerCase().includes('galeri') || el.name?.toLowerCase().includes('gallery'));
    const hasMusic = elementsList.some((el: any) => el.widgetType === 'music' || el.name?.toLowerCase().includes('musik') || el.name?.toLowerCase().includes('audio'));
    const hasStory = elementsList.some((el: any) => el.widgetType === 'story' || el.id?.includes('story') || el.name?.toLowerCase().includes('kisah') || el.name?.toLowerCase().includes('story'));
    const hasGuests = latestProject.rsvp_count > 0;

    progressSteps = [
      { label: 'Data Mempelai', done: hasBride },
      { label: 'Cover Undangan', done: hasCover },
      { label: 'Jadwal Acara', done: hasSchedule },
      { label: 'Lokasi Peta', done: hasLocation },
      { label: 'Galeri Foto', done: hasGallery },
      { label: 'Musik Latar', done: hasMusic },
      { label: 'Love Story', done: hasStory },
      { label: 'Daftar Tamu', done: hasGuests },
    ];
    const completedCount = progressSteps.filter(s => s.done).length;
    progressPct = Math.round((completedCount / progressSteps.length) * 100);
    showProgressCard = progressPct < 100;
  }

  // Relative Time Formatter
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Baru saja';
    try {
      const past = new Date(dateStr).getTime();
      const diffMs = Date.now() - past;
      if (diffMs < 60000) return 'Baru saja';
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari yang lalu`;
    } catch (_) {
      return 'Baru saja';
    }
  };

  // Map real database union activities
  const displayActivities = activities.map((act: any) => {
    if (act.type === 'rsvp') {
      const statusText = act.attending === 'yes' ? 'hadir' : 'tidak hadir';
      return {
        text: `Tamu "${act.name}" mengisi RSVP ${statusText} untuk "${act.invitation_title}"`,
        time: formatRelativeTime(act.created_at),
        type: 'rsvp'
      };
    } else {
      return {
        text: `Undangan "${act.invitation_title}" diperbarui`,
        time: formatRelativeTime(act.created_at),
        type: 'update'
      };
    }
  });

  const finalActivities = displayActivities.length > 0 
    ? displayActivities 
    : [{ text: 'Memulai perjalanan Anda di InviteStudio', time: 'Baru saja', type: 'signup' }];

  // Navigation config
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: Grid },
    { id: 'undangan' as NavView, label: 'Undangan Saya', icon: Layers },
    { id: 'templates' as NavView, label: 'Katalog Desain', icon: Compass },
    { id: 'blog' as NavView, label: 'Tips & Blog', icon: BookOpen },
    { id: 'analytics' as NavView, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavView, label: 'Pengaturan', icon: Settings },
    // { id: 'premium' as NavView, label: 'Upgrade Premium', icon: Crown },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-contain shadow-md" />
          <div>
            <p className="text-white text-sm font-bold tracking-tight">InviteStudio</p>
            {/* <span className="text-[10px] text-slate-500 font-semibold block">{isAccountPremium ? '✨ Premium Plan' : 'Free Plan'}</span> */}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'templates') {
                    if (onNavigateTemplates) onNavigateTemplates();
                  } else if (item.id === 'blog') {
                    if (onNavigateBlog) onNavigateBlog();
                  } else {
                    setCurrentView(item.id);
                  }
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  active 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User settings / Sign out */}
      <div className="space-y-4 pt-4 border-t border-slate-900">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            {emailInitials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-none">{user.email?.split('@')[0]}</p>
            <span className="text-[9px] text-slate-500 truncate mt-0.5 block">{user.email}</span>
          </div>
        </div>

        <button 
          onClick={() => setShowBugReportModal(true)}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 cursor-pointer transition-all border border-dashed border-amber-500/20"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Laporkan Bug / Masalah</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 cursor-pointer transition-all border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-900 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-white text-sm font-bold tracking-tight">InviteStudio</span>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(true)} 
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" />
          <aside className="relative flex flex-col w-64 bg-[#090b16] h-full border-r border-slate-900 p-5 space-y-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setMobileSidebarOpen(false)} 
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-60 border-r border-slate-900/60 p-6 shrink-0 bg-slate-950/10">
          <SidebarContent />
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8 space-y-6 overflow-y-auto min-w-0">

          {/* ============================================================== */}
          {/* 1. VIEW: DASHBOARD (Saas Workspace Layout) */}
          {/* ============================================================== */}
          {currentView === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
                    Halo, {fullName} 👋
                  </h1>
                  <p className="text-xs text-slate-400 font-medium mt-1.5">
                    Selamat datang kembali. Kelola seluruh undangan digital Anda dari satu tempat.
                  </p>
                </div>
                <button 
                  onClick={() => openCreate()}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buat Undangan Baru</span>
                </button>
              </div>

              {/* STATS SECTION */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Undangan', value: projects.length, icon: Layers, color: '#3b82f6' },
                  { 
                    label: 'Status Premium', 
                    value: isAccountPremium ? 'PREMIUM' : 'FREE', 
                    icon: Crown, 
                    color: isAccountPremium ? '#eab308' : '#64748b' 
                  },
                  { label: 'Pengunjung Hari Ini', value: totalViews, icon: Eye, color: '#a855f7' },
                  { label: 'Total RSVP Tamu', value: totalRsvps, icon: Users, color: '#10b981' }
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-900/50">
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider truncate">{stat.label}</p>
                      <p className="text-white text-base font-black mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* QUICK ACTION & INSIGHTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Quick Actions */}
                <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => openCreate()} 
                      className="flex items-center space-x-3 p-3 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition-colors">Buat Undangan</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">Mulai desain baru</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setShowImportModal(true)} 
                      className="flex items-center space-x-3 p-3 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition-colors">Import Daftar Tamu</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">Format Excel / CSV</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        if (latestProject) {
                          setShareProject(latestProject);
                        } else {
                          showToast('Belum ada undangan untuk dibagikan.', 'error');
                        }
                      }}
                      className="flex items-center space-x-3 p-3 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-indigo-400 transition-colors">Bagikan Semua Link</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">Sebar undangan</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setCurrentView('analytics')} 
                      className="flex items-center space-x-3 p-3 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-purple-400 transition-colors">Lihat Analytics</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">Performa kunjungan</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Insights Section */}
                <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Insight Singkat</h3>
                  <div className="space-y-3">
                    {[
                      { text: `Total ${totalViews} kali undangan digital Anda telah dibuka oleh pengunjung.`, em: '🔥' },
                      { text: `Sebanyak ${attendingGuests} tamu terkonfirmasi akan menghadiri acara pernikahan Anda.`, em: '📈' },
                      { text: `Rata-rata ${projects.length ? Math.round(totalRsvps / projects.length) : 0} RSVP masuk untuk setiap undangan yang Anda buat.`, em: '💌' },
                    ].map((ins, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/10 border border-slate-900/30 text-xs text-slate-300">
                        <span className="text-base shrink-0 leading-none">{ins.em}</span>
                        <p className="leading-relaxed">{ins.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* PROJECTS SECTION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Proyek Terbaru</h2>
                  <button 
                    onClick={() => setCurrentView('undangan')} 
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center space-x-1"
                  >
                    <span>Lihat Semua ({projects.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="bg-slate-950/40 border border-slate-900/80 rounded-2xl animate-pulse h-64" />
                    ))}
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.slice(0, 3).map(proj => {
                      const publicUrl = `${window.location.origin}/v/${proj.slug}`;
                      const updatedDate = proj.updated_at
                        ? new Date(proj.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';
                      
                      // Couple name logic
                      const coupleName = proj.title.toLowerCase().startsWith('wedding of')
                        ? proj.title.substring(10)
                        : proj.title;

                      return (
                        <div 
                          key={proj.id} 
                          className="group bg-slate-950/40 border border-slate-900/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-800 transition-all duration-300 relative"
                        >
                          {/* Cover Image Wrapper */}
                          <div className="relative w-full aspect-[4/3] bg-slate-900 border-b border-slate-900 overflow-hidden shrink-0 group/cover">
                            {proj.thumbnail ? (
                              <img 
                                src={proj.thumbnail} 
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 animate-in fade-in duration-300"
                                alt="Cover Undangan" 
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-[#090c15]">
                                <Sparkles className="w-5 h-5 text-slate-700 animate-bounce" />
                                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Generating Cover...</span>
                              </div>
                            )}

                            <input 
                              id={`cover-upload-tmpl-${proj.id}`}
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  const base64 = reader.result as string;
                                  try {
                                    const res = await fetch(`/api/invitations/${proj.id}/thumbnail`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ thumbnail: base64 })
                                    });
                                    const r = await res.json();
                                    if (r.success) {
                                      showToast('Cover berhasil diperbarui!', 'success');
                                      fetchDashboardData(true);
                                    } else {
                                      showToast('Gagal mengunggah cover.', 'error');
                                    }
                                  } catch (_) {
                                    showToast('Gagal mengunggah cover.', 'error');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />

                            {/* Mobile Change cover button (always visible) */}
                            <label htmlFor={`cover-upload-tmpl-${proj.id}`} className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800/80 px-2 py-1 rounded-lg text-white flex items-center space-x-1.5 cursor-pointer z-10 md:hidden shadow-lg active:scale-95 transition-all">
                              <Upload className="w-3 h-3 text-white" />
                              <span className="text-[8px] font-extrabold uppercase tracking-wider">Ubah Cover</span>
                            </label>

                            {/* Desktop Change cover button overlay (hover only) */}
                            <label htmlFor={`cover-upload-tmpl-${proj.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity hidden md:flex flex-col items-center justify-center cursor-pointer space-y-1 z-10">
                              <Upload className="w-5 h-5 text-white animate-pulse" />
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Ubah Cover</span>
                            </label>

                            <span 
                              className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider"
                              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                            >
                              LIVE
                            </span>
                          </div>

                          {/* Info area */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-slate-500 truncate leading-none">Wedding Invitation</h4>
                              <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate">{proj.title}</h3>
                              <p className="text-[10px] text-[#D4AF37] font-bold tracking-wide truncate">{coupleName}</p>
                            </div>

                            {/* Details row */}
                            <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-900/60 text-slate-400">
                              <div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase block">Updated</span>
                                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{updatedDate}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase block">Views</span>
                                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{proj.views || 0}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase block">RSVP</span>
                                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{proj.rsvp_count || 0} Tamu</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="px-4 py-3 bg-slate-950/20 border-t border-slate-900/80 flex items-center justify-between gap-1.5">
                            <div className="flex items-center space-x-1.5">
                              <button 
                                onClick={() => onEditProject(proj.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleOpenPreview(proj.id)}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Preview
                              </button>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => {
                                  setShareProject(proj);
                                }}
                                title="Bagikan Undangan"
                                className="p-1.5 text-slate-500 hover:text-indigo-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              
                              <button 
                                onClick={() => setStatsProject(proj)}
                                title="Lihat Analytics"
                                className="p-1.5 text-slate-500 hover:text-purple-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => setDeletingProject(proj)}
                                title="Hapus Proyek"
                                className="p-1.5 text-slate-600 hover:text-rose-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 rounded-2xl bg-slate-950/20 border border-dashed border-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400">
                      <Heart className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                    </div>
                    <div className="text-center space-y-1 max-w-xs">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Belum Ada Undangan</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Mulai buat undangan pertama Anda dan bagikan kepada orang-orang terkasih.</p>
                    </div>
                    <button 
                      onClick={() => openCreate()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      Buat Undangan Pertama
                    </button>
                  </div>
                )}
              </div>

              {/* Adsterra Native Banner Placement (Dashboard Footer) */}
              <div className="pt-4 border-t border-slate-900/60">
                <AdsterraAd
                  zoneIdKey="nativeZoneId"
                  format="native"
                  fallbackComponent={
                    <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Rekomendasi Cincin, Souvenir, & Paket WO Terbaik</span>
                        <p className="text-[10px] text-slate-500 font-medium">IKLAN SPONSOR (Adsterra Native Recommendation Placeholders)</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-1">
                        {[
                          { title: 'Logam Mulia & Cincin Kawin Custom', desc: 'Diskon 10% khusus pengantin baru', img: '💍' },
                          { title: 'Undangan Cetak Premium Hemat', desc: 'Mulai Rp1.500/pcs + gratis ongkir', img: '✉️' },
                          { title: 'Souvenir Pernikahan Pilihan Estetik', desc: 'Unik, ramah lingkungan, diskon partai', img: '🎁' },
                          { title: 'Paket Honeymoon Bali / Lombok', desc: 'Resort bintang 5 promo all-inclusive', img: '✈️' }
                        ].map((ad, idx) => (
                          <div key={idx} className="bg-slate-900/20 border border-slate-900 p-3 rounded-xl hover:border-slate-800 transition-colors text-left flex flex-col justify-between space-y-2">
                            <span className="text-xl">{ad.img}</span>
                            <div>
                              <span className="text-[10px] font-bold text-slate-350 block truncate">{ad.title}</span>
                              <span className="text-[8px] text-slate-500 block mt-0.5">{ad.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                />
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* 2. VIEW: ALL PROJECTS CATALOG */}
          {/* ============================================================== */}
          {currentView === 'undangan' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between py-2 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Undangan Saya</h2>
                  <p className="text-xs text-slate-500 mt-1">Daftar semua undangan digital yang Anda rancang</p>
                </div>
                <button 
                  onClick={() => openCreate()}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Undangan</span>
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-slate-950/40 border border-slate-900/80 rounded-2xl animate-pulse h-72" />
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map(proj => {
                    const publicUrl = `${window.location.origin}/v/${proj.slug}`;
                    const updatedDate = proj.updated_at
                      ? new Date(proj.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';
                    
                    const coupleName = proj.title.toLowerCase().startsWith('wedding of')
                      ? proj.title.substring(10)
                      : proj.title;

                    return (
                      <div 
                        key={proj.id} 
                        className="group bg-slate-950/40 border border-slate-900/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-800 transition-all duration-300 relative"
                      >
                        <div className="relative w-full aspect-[4/3] bg-slate-900 border-b border-slate-900 overflow-hidden shrink-0 group/cover">
                          {proj.thumbnail ? (
                            <img 
                              src={proj.thumbnail} 
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 animate-in fade-in"
                              alt="Cover Undangan" 
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-[#090c15]">
                              <Sparkles className="w-5 h-5 text-slate-700 animate-bounce" />
                              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Generating Cover...</span>
                            </div>
                          )}

                          <input 
                            id={`cover-upload-proj-${proj.id}`}
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64 = reader.result as string;
                                try {
                                  const res = await fetch(`/api/invitations/${proj.id}/thumbnail`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ thumbnail: base64 })
                                  });
                                  const r = await res.json();
                                  if (r.success) {
                                    showToast('Cover berhasil diperbarui!', 'success');
                                    fetchDashboardData(true);
                                  } else {
                                    showToast('Gagal mengunggah cover.', 'error');
                                  }
                                } catch (_) {
                                  showToast('Gagal mengunggah cover.', 'error');
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />

                          {/* Mobile Change cover button (always visible) */}
                          <label htmlFor={`cover-upload-proj-${proj.id}`} className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800/80 px-2 py-1 rounded-lg text-white flex items-center space-x-1.5 cursor-pointer z-10 md:hidden shadow-lg active:scale-95 transition-all">
                            <Upload className="w-3 h-3 text-white" />
                            <span className="text-[8px] font-extrabold uppercase tracking-wider">Ubah Cover</span>
                          </label>

                          {/* Desktop Change cover button overlay (hover only) */}
                          <label htmlFor={`cover-upload-proj-${proj.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity hidden md:flex flex-col items-center justify-center cursor-pointer space-y-1 z-10">
                            <Upload className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Ubah Cover</span>
                          </label>

                          <span 
                            className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                          >
                            LIVE
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-slate-500 truncate leading-none">Wedding Invitation</h4>
                            <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate">{proj.title}</h3>
                            <p className="text-[10px] text-[#D4AF37] font-bold tracking-wide truncate">{coupleName}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-900/60 text-slate-400">
                            <div>
                              <span className="text-[8px] text-slate-500 font-bold uppercase block">Updated</span>
                              <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{updatedDate}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-500 font-bold uppercase block">Views</span>
                              <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{proj.views || 0}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-500 font-bold uppercase block">RSVP</span>
                              <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{proj.rsvp_count || 0} Tamu</span>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 bg-slate-950/20 border-t border-slate-900/80 flex items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => onEditProject(proj.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleOpenPreview(proj.id)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Preview
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => {
                                setShareProject(proj);
                              }}
                              className="p-1.5 text-slate-500 hover:text-indigo-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => setStatsProject(proj)}
                              className="p-1.5 text-slate-500 hover:text-purple-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => setDeletingProject(proj)}
                              className="p-1.5 text-slate-600 hover:text-rose-400 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 rounded-2xl bg-slate-950/20 border border-dashed border-slate-900">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-center space-y-1 max-w-xs">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Belum Ada Undangan</h3>
                    <p className="text-xs text-slate-500">Mulai rancang undangan digital premium pertama Anda.</p>
                  </div>
                  <button 
                    onClick={() => openCreate()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Tambah Undangan Baru
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. VIEW: ANALYTICS */}
          {/* ============================================================== */}
          {currentView === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="py-2 border-b border-slate-900">
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Laporan Analitik</h2>
                <p className="text-xs text-slate-500 mt-1">Performa sebar tautan dan statistik kunjungan real-time</p>
              </div>

              {/* Stats KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Total Views', value: totalViews, sub: 'Semua undangan', icon: Eye, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                  { label: 'Total Proyek', value: projects.length, sub: 'Dibuat oleh Anda', icon: Layers, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
                  { label: 'Status Akun', value: isAccountPremium ? 'Premium (Aktif)' : 'Free Account', icon: Crown, color: isAccountPremium ? '#eab308' : '#64748b', bg: 'rgba(234,179,8,0.1)' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-slate-950/40 border border-slate-900/85 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                        <kpi.icon className="w-4.5 h-4.5" style={{ color: kpi.color }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{kpi.value}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 leading-none">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table details */}
              <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-900 bg-slate-950/20">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-blue-500" />
                    <span>Rincian Trafik Undangan</span>
                  </h3>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Memuat data analitik...</div>
                ) : projects.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                    <Activity className="w-8 h-8 mx-auto text-slate-700" />
                    <p>Belum ada proyek undangan untuk dianalisis</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-5 py-3">Nama Undangan</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-center">Views</th>
                          <th className="px-5 py-3 text-center">RSVP Count</th>
                          <th className="px-5 py-3 text-center">Tautan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-xs">
                        {projects.map((proj, idx) => (
                          <tr key={proj.id} className="hover:bg-slate-900/20 transition-all">
                            <td className="px-5 py-4 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm shrink-0">
                                {idx % 2 === 0 ? '💌' : '📋'}
                              </div>
                              <span className="font-bold text-white truncate max-w-[200px]">{proj.title}</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span 
                                className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider inline-block"
                                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                              >
                                LIVE
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center font-mono font-bold text-white">{proj.views || 0}</td>
                            <td className="px-5 py-3 text-center font-mono font-bold text-slate-400">{proj.rsvp_count || 0}</td>
                            <td className="px-5 py-3 text-center">
                              <button 
                                onClick={() => window.open(`${window.location.origin}/v/${proj.slug}`, '_blank')}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">/v/{proj.slug}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. VIEW: SETTINGS */}
          {/* ============================================================== */}
          {currentView === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="py-2 border-b border-slate-900">
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Pengaturan Akun</h2>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi profil personal dan preferensi studio Anda</p>
              </div>

              <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 max-w-xl shadow-sm">
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Alamat Email</label>
                    <input 
                      type="text" 
                      disabled 
                      value={user.email} 
                      className="w-full text-xs font-semibold px-4 py-3 bg-slate-900/50 border border-slate-900 rounded-xl outline-none text-slate-500 cursor-not-allowed" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="Masukkan nama Anda"
                      className="w-full text-xs font-semibold px-4 py-3 bg-slate-900/20 border border-slate-900 focus:border-slate-800 rounded-xl outline-none text-white placeholder:text-slate-700 transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Username Kreator</label>
                    <input 
                      type="text" 
                      required 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder="Contoh: budisatoso"
                      className="w-full text-xs font-semibold px-4 py-3 bg-slate-900/20 border border-slate-900 focus:border-slate-800 rounded-xl outline-none text-white placeholder:text-slate-700 transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Bahasa Studio</label>
                    <select 
                      value={preferredLang} 
                      onChange={e => setPreferredLang(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-3 bg-slate-900/20 border border-slate-900 focus:border-slate-800 rounded-xl outline-none text-white cursor-pointer"
                    >
                      <option value="id" style={{ background: '#070913' }}>Bahasa Indonesia (ID)</option>
                      <option value="en" style={{ background: '#070913' }}>English (US)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. VIEW: PREMIUM UPGRADE BILLING */}
          {/* ============================================================== */}
          {currentView === 'premium' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="py-2 border-b border-slate-900">
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Upgrade Premium </h2>
                <p className="text-xs text-slate-500 mt-1">Aktivasi akun tanpa batas untuk fitur undangan tingkat lanjut</p>
              </div>

              {isAccountPremium ? (
                <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 max-w-xl space-y-4">
                  <div className="flex items-center space-x-3 text-emerald-400">
                    <CheckCircle className="w-6 h-6 fill-emerald-500/10" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Akun Premium Anda Aktif ✨</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Berlangganan Seumur Hidup (Lifetime Account)</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 text-xs text-slate-400 space-y-2 border border-slate-900">
                    <p className="text-white font-bold">Fitur yang telah terbuka:</p>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>Akses ke seluruh template premium berbayar.</li>
                      <li>Impor massal data nama tamu undangan via spreadsheet.</li>
                      <li>Kapasitas tamu RSVP dan Wishlist tanpa batas.</li>
                      <li>Penayangan web undangan secara LIVE tanpa penangguhan.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 max-w-xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[#eab308] px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 uppercase tracking-widest">Penawaran Terbatas</span>
                      <h3 className="text-base font-extrabold text-white mt-2">Studio Lifetime Premium</h3>
                      <p className="text-xs text-slate-500 mt-1">Hanya satu kali bayar. Tanpa biaya bulanan tersembunyi.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 line-through block">Rp 99.000</span>
                      <span className="text-lg font-black text-[#eab308] block">Rp 25.000</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 border-t border-slate-900 pt-4 text-xs text-slate-300">
                    {[
                      'Buka semua template desain undangan modern',
                      'Impor nama tamu sekaligus banyak via Excel/CSV',
                      'Ubah tautan slug sesuka hati tanpa batas',
                      'Bebas iklan banner platform di web undangan',
                      'Fitur RSVP tamu real-time tanpa penundaan'
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center space-x-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={(e) => triggerMockPayment({ title: 'Aktivasi Akun Premium' }, e)}
                    className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8943A] hover:from-[#E6C048] hover:to-[#C8A44A] text-white text-xs font-bold rounded-xl transition-all shadow-lg cursor-pointer text-center block uppercase tracking-wider"
                  >
                    Aktifkan Premium — Rp 25.000
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ============================================================== */}
      {/* ═══ SYSTEM MODALS ═══ */}
      {/* ============================================================== */}

      {/* CREATE NEW PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-[#0a0d18] border border-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            
            <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Buat Undangan Baru</h3>
                  <p className="text-[9px] text-slate-500 font-medium">Lengkapi parameter utama undangan</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Nama / Judul Desain</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="Contoh: Pernikahan Sophia & William"
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-900 focus:border-slate-800 outline-none text-white transition-all placeholder:text-slate-700" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Tautan Sebar Unik</label>
                <div className="flex items-center rounded-xl bg-slate-900/20 border border-slate-900 focus-within:border-slate-800 overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-600 pl-4 pr-1 select-none shrink-0">{window.location.origin}/v/</span>
                  <input 
                    type="text" 
                    required 
                    value={newSlug} 
                    onChange={e => handleSlugChange(e.target.value)} 
                    placeholder="sophia-william"
                    className="w-full text-xs font-mono font-bold py-3 pr-4 outline-none border-0 bg-transparent text-[#D4AF37]" 
                  />
                </div>
                {slugError && <p className="text-[9px] text-rose-500 font-semibold">{slugError}</p>}
                <p className="text-[8px] text-slate-600">Hanya karakter huruf kecil, angka, dan tanda hubung (-).</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Template Undangan</label>
                <select 
                  value={selectedTemplate} 
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-900 focus:border-slate-800 outline-none text-white cursor-pointer"
                >
                  <option value="blank" style={{ background: '#0a0d18' }}>Blank Canvas</option>
                  {customTemplates.map((t: any) => (
                    <option key={t.id} value={t.id} style={{ background: '#0a0d18' }}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-white cursor-pointer transition-all border border-slate-900"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={!!slugError || checkoutProcessing}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white cursor-pointer transition-all disabled:opacity-40"
                >
                  {checkoutProcessing ? 'Memvalidasi...' : 'Mulai Mendesain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MULTIPLE GUEST MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowImportModal(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#0a0d18] border border-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            
            <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Import Daftar Tamu</h3>
                  <p className="text-[9px] text-slate-500 font-medium">Unggah spreadsheet nama-nama tamu sekaligus</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isAccountPremium ? (
                <div className="space-y-4 text-slate-300 text-xs">
                  <div className="border border-dashed border-slate-900 rounded-xl p-6 text-center space-y-3 bg-slate-950/20">
                    <ClipboardList className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-400 leading-normal">Tarik file Excel (.xlsx) atau CSV Anda ke sini untuk mulai mengimpor data tamu.</p>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer">
                      Pilih Dokumen
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 text-center leading-normal">Pastikan file Anda memiliki kolom header bernama "Nama" dan "No Telp / WhatsApp".</p>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-500 text-xs text-left leading-relaxed">
                    Fitur <strong>Import Massal Nama Tamu</strong> eksklusif bagi pengguna akun Premium InviteStudio.
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">Untuk menikmati kemudahan menyebar undangan ribuan tamu sekaligus via WhatsApp, silakan upgrade akun Anda ke Premium.</p>
                  <button 
                    onClick={() => {
                      setShowImportModal(false);
                      setCurrentView('premium');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8943A] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                  >
                    Upgrade Premium — Rp 25.000
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOCK CHECKOUT MODAL */}
      {payingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#0a0d18] border border-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Aktivasi Akun Premium</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Sandbox Billing Checkout</p>
              </div>
              <button onClick={() => setPayingProject(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase block">Langganan Lifetime</span>
                  <span className="text-xs font-black text-white block mt-0.5">Aktivasi Akun Premium</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Akses tanpa batas untuk semua undangan digital</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 line-through block">Rp 99.000</span>
                  <span className="text-sm font-black text-[#D4AF37] block">Rp 25.000</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['qris', 'bank', 'card'] as const).map(m => (
                  <button 
                    key={m} 
                    type="button" 
                    onClick={() => setPaymentMethod(m)}
                    className="p-3 rounded-xl flex flex-col items-center text-center space-y-1 cursor-pointer transition-all border"
                    style={paymentMethod === m
                      ? { border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)', color: '#D4AF37' }
                      : { border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#64748b' }}
                  >
                    <span className="text-[9px] font-bold uppercase">{m === 'qris' ? 'QRIS' : m === 'bank' ? 'Transfer' : 'Kartu'}</span>
                    <span className="text-[8px]">Instan</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl text-amber-500 text-[10px] flex items-start space-x-2 bg-yellow-500/5 border border-yellow-500/10 leading-normal">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Mode simulasi pembayaran aman. Setelah dikonfirmasi, akun Anda langsung berstatus PREMIUM lifetime.</span>
              </div>

              <button 
                onClick={handleConfirmMockPayment} 
                disabled={checkoutProcessing}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white uppercase flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#B8943A] shadow-md shadow-amber-500/5 hover:opacity-90"
              >
                {checkoutProcessing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Bayar Rp 25.000</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#180a0a] border border-red-950 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-red-950 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-400">Hapus Undangan</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Tindakan ini permanen dan tidak dapat dibatalkan</p>
              </div>
              <button onClick={() => setDeletingProject(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl flex items-center space-x-3 bg-red-950/20 border border-red-950/50">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Trash2 className="w-4.5 h-4.5" /></div>
                <div>
                  <span className="text-xs font-bold text-white block">{deletingProject.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono">/v/{deletingProject.slug}</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda benar-benar yakin ingin menghapus data undangan pernikahan ini? Semua RSVP tamu, ucapan, dan galeri desain akan ikut terhapus secara permanen.
              </p>

              <div className="flex space-x-2.5 pt-2">
                <button onClick={() => setDeletingProject(null)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer border border-slate-900">Batal</button>
                <button 
                  onClick={handleConfirmDeleteProject} 
                  disabled={checkoutProcessing}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-rose-700 shadow-md"
                >
                  {checkoutProcessing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewProject && (
        <PreviewModal
          template={previewProject}
          onClose={() => setPreviewProject(null)}
          isPublicView={false}
        />
      )}

      {/* SHARE MODAL INTEGRATION */}
      {shareProject && <ShareModal projectTitle={shareProject.title} projectSlug={shareProject.slug} onClose={() => setShareProject(null)} />}
      
      {/* STATS MODAL INTEGRATION */}
      {statsProject && <ProjectStatsModal projectId={statsProject.id} projectTitle={statsProject.title} views={statsProject.views || 0} onClose={() => setStatsProject(null)} />}

      {/* BUG REPORT MODAL */}
      {showBugReportModal && (
        <BugReportModal 
          userEmail={user.email || ''} 
          userId={user.id || ''} 
          onClose={() => setShowBugReportModal(false)} 
        />
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4.5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' 
            ? 'bg-slate-950 border-emerald-500/30 text-emerald-400' 
            : 'bg-slate-950 border-rose-500/30 text-rose-400'
        }`} style={{ backdropFilter: 'blur(20px)' }}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
