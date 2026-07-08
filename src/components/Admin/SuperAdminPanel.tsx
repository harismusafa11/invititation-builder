
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  CreditCard, 
  TrendingUp, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Search, 
  ArrowLeft,
  DollarSign,
  Activity,
  Globe,
  Music,
  Play,
  Pause,
  Plus,
  Upload,
  Image as ImageIcon,
  Volume2,
  Wand2
} from 'lucide-react';

interface SuperAdminPanelProps {
  onExit: () => void;
  onEditTemplate?: (id: string) => void;
  onCreateNewTemplate?: () => void;
}

export default function SuperAdminPanel({ onExit, onEditTemplate, onCreateNewTemplate }: SuperAdminPanelProps) {
  // Auth state for the admin panel
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data states
  const [stats, setStats] = useState({
    totalProjects: 0,
    paidProjects: 0,
    totalUsers: 0,
    totalRevenue: 0,
    conversionRate: '0.0'
  });
  const [invitations, setInvitations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'music' | 'assets' | 'features' | 'templates' | 'bugs'>('projects');

  // Music & Assets states
  const [musicList, setMusicList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [featuresList, setFeaturesList] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [bugReports, setBugReports] = useState<any[]>([]);

  // New Music Form states
  const [newMusicName, setNewMusicName] = useState('');
  const [newMusicArtist, setNewMusicArtist] = useState('');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [newMusicCategory, setNewMusicCategory] = useState('romantic');
  const [newMusicDuration, setNewMusicDuration] = useState('3:00');
  const [musicUploading, setMusicUploading] = useState(false);

  // New Asset Form states
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('luxury');
  const [assetUploading, setAssetUploading] = useState(false);

  // Confirm delete states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<'music' | 'assets' | 'invitation' | 'user' | null>(null);

  const initiateDelete = (id: string, type: 'music' | 'assets' | 'invitation' | 'user') => {
    setConfirmDeleteId(id);
    setConfirmDeleteType(type);
    setTimeout(() => {
      setConfirmDeleteId(prevId => prevId === id ? null : prevId);
      setConfirmDeleteType(prevType => prevType === type ? null : prevType);
    }, 4000);
  };

  // Preview audio state
  const [adminPreviewAudio, setAdminPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [adminPreviewingId, setAdminPreviewingId] = useState<string | null>(null);

  // Helper function to compress images using HTML5 Canvas
  const compressAdminImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          const isTransparent = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp' || file.name.endsWith('.png') || file.name.endsWith('.svg') || file.name.endsWith('.webp');
          const outputType = isTransparent ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputType, isTransparent ? undefined : quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // Custom fetch wrapper to automatically inject the Bearer token to all requests
  const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = sessionStorage.getItem('sys_admin_token') || '';
    const headers = {
      ...(init?.headers || {}),
      'Authorization': `Bearer ${token}`
    };
    return window.fetch(input, {
      ...init,
      headers
    });
  };

  useEffect(() => {
    // Check session storage for both authorization flag and token
    const isAuth = sessionStorage.getItem('sys_admin_authorized') === 'true' && sessionStorage.getItem('sys_admin_token');
    if (isAuth) {
      setIsAdminAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await window.fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const result = await res.json();
      if (result.success) {
        sessionStorage.setItem('sys_admin_authorized', 'true');
        sessionStorage.setItem('sys_admin_token', result.token);
        setIsAdminAuthenticated(true);
        setLoginError('');
        fetchAdminData();
      } else {
        setLoginError(result.error || 'Kredensial admin salah. Silakan coba lagi.');
      }
    } catch (err) {
      setLoginError('Gagal terhubung ke server untuk verifikasi login.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch invitations
      const invRes = await fetch('/api/admin/invitations');
      const invData = await invRes.json();
      if (invData.success) {
        setInvitations(invData.data);
      }

      // Fetch music
      const musicRes = await fetch('/api/music');
      const musicData = await musicRes.json();
      if (musicData.success) {
        setMusicList(musicData.data);
      }

      // Fetch assets
      const assetsRes = await fetch('/api/assets');
      const assetsData = await assetsRes.json();
      if (assetsData.success) {
        setAssetsList(assetsData.data);
      }

      // Fetch profiles
      const profilesRes = await fetch('/api/admin/profiles');
      const profilesData = await profilesRes.json();
      if (profilesData.success) {
        setProfiles(profilesData.data);
      }

      // Fetch platform features config
      const featuresRes = await fetch('/api/features-config');
      const featuresData = await featuresRes.json();
      if (featuresData.success) {
        setFeaturesList(featuresData.data);
      }

      // Fetch dynamic templates
      const templatesRes = await fetch('/api/templates');
      const templatesData = await templatesRes.json();
      if (templatesData.success && Array.isArray(templatesData.data)) {
        setTemplateList(templatesData.data);
      }

      // Fetch bug reports
      const bugsRes = await fetch('/api/admin/bug-reports');
      const bugsData = await bugsRes.json();
      if (bugsData.success && Array.isArray(bugsData.data)) {
        setBugReports(bugsData.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (id: string, currentPaid: boolean) => {
    try {
      const res = await fetch(`/api/admin/invitations/${id}/paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: !currentPaid })
      });
      const result = await res.json();
      if (result.success) {
        // Refresh local state list
        setInvitations(prev => 
          prev.map(p => p.id === id ? { ...p, paid: !currentPaid } : p)
        );
        // Re-fetch stats to update revenue counters
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      alert('Gagal memperbarui status pembayaran.');
    }
  };
  const handleToggleBugStatus = async (id: string, currentStatus: 'open' | 'resolved') => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      const res = await fetch(`/api/admin/bug-reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await res.json();
      if (result.success) {
        setBugReports(prev =>
          prev.map(b => b.id === id ? { ...b, status: nextStatus } : b)
        );
      } else {
        alert('Gagal memperbarui status bug.');
      }
    } catch (err) {
      console.error('Error updating bug status:', err);
      alert('Gagal memperbarui status bug.');
    }
  };
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invitations/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setInvitations(prev => prev.filter(p => p.id !== id));
        // Re-fetch stats
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      alert('Gagal menghapus proyek.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setProfiles(prev => prev.filter(p => p.id !== id));
        setConfirmDeleteId(null);
        setConfirmDeleteType(null);
        fetchAdminData();
      } else {
        alert("Gagal menghapus pengguna");
      }
    } catch (_) {
      alert("Gagal menghapus pengguna");
    }
  };

  const handleTogglePremiumStatus = async (id: string, currentPremium: boolean) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}/premium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium: !currentPremium })
      });
      const result = await res.json();
      if (result.success) {
        // Refresh local state list
        setProfiles(prev => 
          prev.map(p => p.id === id ? { ...p, premium: !currentPremium } : p)
        );
        // Refresh stats
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      alert('Gagal memperbarui status premium.');
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('sys_admin_authorized');
    setIsAdminAuthenticated(false);
    onExit();
  };

  // Music Handlers
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMusicUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewMusicUrl(event.target.result as string);
          setNewMusicDuration("3:30");
          setNewMusicName(file.name.split('.')[0]);
        }
        setMusicUploading(false);
      };
      reader.onerror = () => setMusicUploading(false);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMusicName.trim() || !newMusicUrl.trim()) return;

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMusicName.trim(),
          artist: newMusicArtist.trim() || 'Unknown',
          url: newMusicUrl.trim(),
          category: newMusicCategory,
          duration: newMusicDuration,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMusicList(prev => [...prev, result.data]);
        setNewMusicName('');
        setNewMusicArtist('');
        setNewMusicUrl('');
        const fileInput = document.getElementById('music-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Gagal menambah musik: ' + result.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleDeleteMusic = async (id: string) => {
    try {
      const res = await fetch(`/api/music/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setMusicList(prev => prev.filter(m => m.id !== id));
        if (adminPreviewingId === id) {
          stopAdminAudio();
        }
      } else {
        alert('Gagal menghapus musik: ' + result.error);
      }
    } catch (err) {
      alert('Gagal menghapus musik.');
    } finally {
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
    }
  };

  const handleAdminAudioPreview = (track: any) => {
    if (adminPreviewAudio) {
      adminPreviewAudio.pause();
      adminPreviewAudio.currentTime = 0;
    }
    if (adminPreviewingId === track.id) {
      setAdminPreviewingId(null);
      setAdminPreviewAudio(null);
      return;
    }
    const audio = new Audio(track.url);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => setAdminPreviewingId(null));
    setAdminPreviewAudio(audio);
    setAdminPreviewingId(track.id);
  };

  const stopAdminAudio = () => {
    if (adminPreviewAudio) {
      adminPreviewAudio.pause();
    }
    setAdminPreviewingId(null);
    setAdminPreviewAudio(null);
  };

  useEffect(() => {
    return () => {
      if (adminPreviewAudio) {
        adminPreviewAudio.pause();
      }
    };
  }, [adminPreviewAudio]);

  // Asset Handlers - Supports bulk uploading simultaneously
  const handleAssetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setAssetUploading(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressAdminImage(file, 600, 600, 0.7);
        const name = file.name.split('.')[0];
        
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            url: compressed,
            category: newAssetCategory,
            premium: false
          })
        });
        const result = await res.json();
        if (result.success) {
          setAssetsList(prev => [...prev, result.data]);
          successCount++;
        }
      }
      if (successCount > 0) {
        alert(`Berhasil mengunggah ${successCount} aset custom sekaligus!`);
      }
    } catch (err) {
      console.error('Failed to upload custom assets in bulk:', err);
      alert('Terjadi kesalahan saat mengunggah aset.');
    } finally {
      setAssetUploading(false);
      const fileInput = document.getElementById('asset-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleToggleAssetPremium = async (id: string, currentPremium: boolean) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}/premium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium: !currentPremium })
      });
      const result = await res.json();
      if (result.success) {
        setAssetsList(prev =>
          prev.map(a => a.id === id ? { ...a, premium: !currentPremium } : a)
        );
      }
    } catch (err) {
      alert('Gagal mengubah status premium aset.');
    }
  };

  const handleToggleMusicPremium = async (id: string, currentPremium: boolean) => {
    try {
      const res = await fetch(`/api/admin/music/${id}/premium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium: !currentPremium })
      });
      const result = await res.json();
      if (result.success) {
        setMusicList(prev =>
          prev.map(m => m.id === id ? { ...m, premium: !currentPremium } : m)
        );
      }
    } catch (err) {
      alert('Gagal mengubah status premium musik.');
    }
  };

  const handleToggleFeaturePremium = async (id: string, currentIsPremium: boolean) => {
    try {
      const res = await fetch(`/api/admin/features-config/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: !currentIsPremium })
      });
      const result = await res.json();
      if (result.success) {
        setFeaturesList(prev =>
          prev.map(f => f.feature_id === id ? { ...f, is_premium: !currentIsPremium } : f)
        );
      }
    } catch (err) {
      alert('Gagal memperbarui status premium fitur.');
    }
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetUrl.trim()) return;

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssetName.trim(),
          url: newAssetUrl.trim(),
          category: newAssetCategory,
          premium: false
        }),
      });
      const result = await res.json();
      if (result.success) {
        setAssetsList(prev => [...prev, result.data]);
        setNewAssetName('');
        setNewAssetUrl('');
        const fileInput = document.getElementById('asset-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Gagal menambah aset: ' + result.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setAssetsList(prev => prev.filter(a => a.id !== id));
      } else {
        alert('Gagal menghapus aset: ' + result.error);
      }
    } catch (err) {
      alert('Gagal menghapus aset.');
    } finally {
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
    }
  };

  // Helper to format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Extract unique users with project counts, enriched with profile details
  const usersList = React.useMemo(() => {
    const userCounts: Record<string, { count: number; paidCount: number; lastActive: string }> = {};
    invitations.forEach(p => {
      const uid = p.user_id || 'mock-usr-admin';
      if (!userCounts[uid]) {
        userCounts[uid] = { count: 0, paidCount: 0, lastActive: p.updated_at };
      }
      userCounts[uid].count += 1;
      if (p.paid) userCounts[uid].paidCount += 1;
      if (new Date(p.updated_at) > new Date(userCounts[uid].lastActive)) {
        userCounts[uid].lastActive = p.updated_at;
      }
    });

    const list: any[] = [];
    const processedIds = new Set<string>();

    profiles.forEach((prof) => {
      const counts = userCounts[prof.id] || { count: 0, paidCount: 0, lastActive: prof.created_at };
      list.push({
        id: prof.id,
        email: prof.email,
        fullName: prof.full_name,
        username: prof.username,
        premium: !!prof.premium,
        count: counts.count,
        paidCount: counts.paidCount,
        lastActive: counts.lastActive,
        registeredAt: prof.created_at
      });
      processedIds.add(prof.id);
    });

    // Add any users from invitations that don't have a profile record yet
    Object.entries(userCounts).forEach(([uid, data]) => {
      if (!processedIds.has(uid)) {
        list.push({
          id: uid,
          email: uid.includes('@') ? uid : 'N/A',
          fullName: 'Belum Melengkapi Profil',
          username: '-',
          count: data.count,
          paidCount: data.paidCount,
          lastActive: data.lastActive,
          registeredAt: data.lastActive
        });
      }
    });

    return list;
  }, [invitations, profiles]);

  // Filtered invitations list
  const filteredInvitations = invitations.filter(p => {
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterPaid === 'paid') return matchesSearch && p.paid;
    if (filterPaid === 'unpaid') return matchesSearch && !p.paid;
    return matchesSearch;
  });

  // --- LOGIN SCREEN ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl space-y-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Super Admin Portal</h2>
            <p className="text-[10px] text-slate-400 font-medium">Masukkan kredensial otorisasi sistem untuk mengelola platform</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium animate-shake">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Username Admin</label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                placeholder="Username admin"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                placeholder="Password admin"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 uppercase"
            >
              Autentikasi & Masuk
            </button>
          </form>

          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-white transition-all flex items-center justify-center mx-auto space-x-1 cursor-pointer pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Situs Utama</span>
          </button>
        </div>
      </div>
    );
  }

  // --- ADMIN MAIN DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">
              Super Admin <span className="text-blue-500">Panel</span>
            </h1>
            <p className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase leading-none mt-0.5">Platform Controller</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 transition-all cursor-pointer"
          >
            <span>🔄 Reload</span>
          </button>
          <button
            onClick={handleLogoutAdmin}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-rose-600/10"
          >
            <span>Keluar Admin</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Analytics Counter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1: Users */}
          <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pengguna</span>
              <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Invitations */}
          <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Undangan</span>
              <span className="text-2xl font-black text-white">{stats.totalProjects}</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Konversi Aktif</span>
              <span className="text-2xl font-black text-white">{stats.conversionRate}%</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Revenue */}
          <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-xl bg-gradient-to-br from-blue-950/20 to-slate-900/50">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Total Pendapatan</span>
              <span className="text-xl font-black text-blue-400">{formatRupiah(stats.totalRevenue)}</span>
            </div>
            <div className="p-3 bg-blue-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-blue-500/10">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Controls & Search tools */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-3 mt-4">
          <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Undangan & Project
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar User
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'music' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kelola Musik
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kelola Aset
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'features' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kelola Fitur & Premium
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kelola Template
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bugs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Laporan Bug ({bugReports.filter(b => b.status === 'open').length})
            </button>
          </div>

          {activeTab === 'projects' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-all font-semibold"
                  placeholder="Cari undangan, slug, user..."
                />
              </div>

              {/* Status Select Filter */}
              <select
                value={filterPaid}
                onChange={e => setFilterPaid(e.target.value as any)}
                className="text-xs bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Semua Pembayaran</option>
                <option value="paid">Paid (Aktif)</option>
                <option value="unpaid">Unpaid (Ditangguhkan)</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Project List Table */}
        {activeTab === 'projects' && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-[24px] overflow-hidden shadow-xl animate-in fade-in duration-300">
            {loading ? (
              <div className="text-center py-20 space-y-3">
                <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Memuat Data Proyek...</p>
              </div>
            ) : filteredInvitations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                      <th className="p-4 pl-6">Judul Desain</th>
                      <th className="p-4">Link Undangan</th>
                      <th className="p-4">Pemilik (User ID)</th>
                      <th className="p-4 text-center">Aktivasi Link</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvitations.map((p) => {
                      const publicLink = `${window.location.origin}/v/${p.slug}`;
                      return (
                        <tr key={p.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-all font-medium">
                          <td className="p-4 pl-6">
                            <span className="font-bold text-white block text-sm">{p.title}</span>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{p.id}</span>
                          </td>
                          <td className="p-4">
                            <a 
                              href={publicLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1"
                            >
                              <span className="truncate max-w-[150px]">{p.slug}</span>
                              <Globe className="w-3 h-3 shrink-0" />
                            </a>
                          </td>
                          <td className="p-4 font-mono text-slate-400 text-[10px]">
                            {p.user_id}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleTogglePaymentStatus(p.id, p.paid)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                p.paid 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {p.paid ? '🟢 Paid (Aktif)' : '🟡 Unpaid'}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            {confirmDeleteId === p.id && confirmDeleteType === 'invitation' ? (
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer animate-pulse inline-block"
                                title="Klik sekali lagi untuk menghapus"
                              >
                                Yakin?
                              </button>
                            ) : (
                              <button
                                onClick={() => initiateDelete(p.id, 'invitation')}
                                className="p-2 bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-800 hover:border-rose-900/50 cursor-pointer mx-auto"
                                title="Hapus Paksa Proyek"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 space-y-2 text-slate-500">
                <Layers className="w-8 h-8 mx-auto text-slate-700" />
                <h4 className="text-sm font-bold text-slate-400">Tidak ada undangan ditemukan</h4>
                <p className="text-[10px] text-slate-600 max-w-sm mx-auto">
                  Coba sesuaikan kata kunci pencarian Anda atau filter status pembayaran untuk menemukan proyek undangan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users Management List */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-[24px] overflow-hidden shadow-xl animate-in fade-in duration-300">
            {loading ? (
              <div className="text-center py-20 space-y-3">
                <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Mengolah Daftar Pengguna...</p>
              </div>
            ) : usersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                      <th className="p-4 pl-6">Username</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Jumlah Proyek</th>
                      <th className="p-4 text-center">Status Akun</th>
                      <th className="p-4">Terakhir Aktif</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-all font-medium">
                        <td className="p-4 pl-6 font-bold text-amber-400">
                          {usr.username !== '-' ? `@${usr.username}` : '-'}
                        </td>
                        <td className="p-4 text-slate-200">
                          {usr.fullName}
                        </td>
                        <td className="p-4 text-slate-400 font-mono">
                          {usr.email}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-200">
                          {usr.count}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleTogglePremiumStatus(usr.id, usr.premium)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              usr.premium 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-500/20' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            {usr.premium ? '👑 PREMIUM' : '⭐ FREE'}
                          </button>
                        </td>
                        <td className="p-4 text-slate-400 font-sans">
                          {new Date(usr.lastActive).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center">
                          {confirmDeleteId === usr.id && confirmDeleteType === 'user' ? (
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] rounded-lg transition-all cursor-pointer uppercase"
                              >
                                Yakin?
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(null);
                                  setConfirmDeleteType(null);
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold text-[9px] rounded-lg transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => initiateDelete(usr.id, 'user')}
                              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer mx-auto"
                              title="Hapus User & Proyek"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 space-y-2 text-slate-500">
                <Users className="w-8 h-8 mx-auto text-slate-700" />
                <h4 className="text-sm font-bold text-slate-400">Belum ada pengguna terdaftar</h4>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Kelola Musik */}
        {activeTab === 'music' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Form Column */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-[24px] p-6 space-y-5 h-fit">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tambah Musik Baru</h3>
                <p className="text-[10px] text-slate-400 mt-1">Tambahkan musik latar belakang untuk perpustakaan pengguna.</p>
              </div>

              <form onSubmit={handleAddMusicSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Nama/Judul Lagu</label>
                  <input
                    type="text"
                    required
                    value={newMusicName}
                    onChange={e => setNewMusicName(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Beautiful In White"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Artis/Kreator</label>
                  <input
                    type="text"
                    value={newMusicArtist}
                    onChange={e => setNewMusicArtist(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Shane Filan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Kategori</label>
                    <select
                      value={newMusicCategory}
                      onChange={e => setNewMusicCategory(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="romantic">Romantis</option>
                      <option value="classical">Klasik</option>
                      <option value="traditional">Tradisional</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Durasi (MM:SS)</label>
                    <input
                      type="text"
                      required
                      value={newMusicDuration}
                      onChange={e => setNewMusicDuration(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                      placeholder="e.g. 3:45"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">File Audio Lokal (Upload)</label>
                  <div className="border border-dashed border-slate-800 hover:border-blue-500 bg-slate-950/50 rounded-xl p-4 text-center transition-all cursor-pointer relative">
                    <input
                      id="music-file-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-1 text-slate-400">
                      <Upload className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-[10px] font-bold">Pilih File Lagu (.mp3/.ogg)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Atau Masukkan URL Musik</label>
                  <input
                    type="text"
                    value={newMusicUrl}
                    onChange={e => setNewMusicUrl(e.target.value)}
                    disabled={musicUploading}
                    className="w-full text-[10px] font-mono bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="p-3.5 bg-blue-950/30 border border-blue-900/30 rounded-xl space-y-1.5 text-left font-sans">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide block">💡 Saran File Musik</span>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Gunakan file audio berformat <strong>MP3</strong> atau <strong>OGG</strong> dengan durasi 2-4 menit. Disarankan ukuran file <strong>di bawah 5MB</strong> agar tamu undangan dapat memuat musik latar dengan cepat tanpa buffering.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!newMusicName.trim() || !newMusicUrl.trim() || musicUploading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-40 uppercase flex items-center justify-center gap-1.5"
                >
                  {musicUploading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambah Musik</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900 rounded-[24px] overflow-hidden shadow-xl">
              {loading ? (
                <div className="text-center py-20 space-y-3">
                  <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Memuat Data Musik...</p>
                </div>
              ) : musicList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                        <th className="p-4 pl-6">Detail Lagu</th>
                        <th className="p-4 text-center">Kategori</th>
                        <th className="p-4 text-center">Durasi</th>
                        <th className="p-4 text-center">Akses</th>
                        <th className="p-4 text-center">Preview</th>
                        <th className="p-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {musicList.map((m) => {
                        const isPlaying = adminPreviewingId === m.id;
                        return (
                          <tr key={m.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-all font-medium">
                            <td className="p-4 pl-6 text-left">
                              <span className="font-bold text-white block text-sm">{m.name}</span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{m.artist}</span>
                              <span className="text-[8px] font-mono text-slate-655 block mt-0.5 truncate max-w-[200px]" title={m.url}>{m.url}</span>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-300">
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                                {m.category}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono text-slate-350">{m.duration}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleMusicPremium(m.id, m.premium)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                                  m.premium 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500'
                                }`}
                              >
                                {m.premium ? '👑 Premium' : '🔓 Free'}
                              </button>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleAdminAudioPreview(m)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isPlaying 
                                    ? 'bg-blue-500 text-white animate-pulse' 
                                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                              </button>
                            </td>
                            <td className="p-4 text-center">
                              {confirmDeleteId === m.id && confirmDeleteType === 'music' ? (
                                <button
                                  onClick={() => handleDeleteMusic(m.id)}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer animate-pulse inline-block"
                                  title="Klik sekali lagi untuk menghapus"
                                >
                                  Yakin?
                                </button>
                              ) : (
                                <button
                                  onClick={() => initiateDelete(m.id, 'music')}
                                  className="p-2 bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-800 hover:border-rose-900/50 cursor-pointer mx-auto"
                                  title="Hapus Musik"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 space-y-2 text-slate-500">
                  <Music className="w-8 h-8 mx-auto text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-400">Tidak ada musik ditemukan</h4>
                  <p className="text-[10px] text-slate-600 max-w-xs mx-auto">Tambahkan lagu baru menggunakan formulir di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Kelola Aset */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Form Column */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-[24px] p-6 space-y-5 h-fit">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tambah Aset & Bingkai Baru</h3>
                <p className="text-[10px] text-slate-400 mt-1">Tambahkan ilustrasi elemen dekoratif atau bingkai kolase untuk desainer undangan.</p>
              </div>

              <form onSubmit={handleAddAssetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Nama Aset (Untuk Upload Manual Satu-Satu)</label>
                  <input
                    type="text"
                    value={newAssetName}
                    onChange={e => setNewAssetName(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Golden Mandala Wreath"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Kategori Aset / Konten</label>
                  <select
                    value={newAssetCategory}
                    onChange={e => setNewAssetCategory(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="luxury">Luxury (Ornamen Mewah)</option>
                    <option value="florals">Florals (Dedaunan & Bunga)</option>
                    <option value="wedding">Wedding (Ikon Pernikahan)</option>
                    <option value="frames">Frames (Bingkai Foto Kolase)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Pilih Gambar / Upload (Bisa Banyak Sekaligus)</label>
                  <div className="border border-dashed border-slate-800 hover:border-blue-500 bg-slate-950/50 rounded-xl p-5 text-center transition-all cursor-pointer relative">
                    <input
                      id="asset-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAssetImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-1.5 text-slate-400">
                      <Upload className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-bold">Pilih Gambar (PNG/JPG/SVG)</span>
                      <span className="text-[8px] text-slate-500">Mendukung multi-select upload bulk</span>
                    </div>
                  </div>
                </div>

                {newAssetUrl && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 text-left">
                    <img 
                      src={newAssetUrl} 
                      alt="Preview" 
                      className="w-12 h-12 object-contain bg-slate-900 rounded-lg border border-slate-800 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-white block truncate">{newAssetName}</span>
                      <span className="text-[8px] text-slate-500 block font-mono">Data URL ready</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 bg-blue-950/30 border border-blue-900/30 rounded-xl space-y-1.5 text-left font-sans">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide block">💡 Saran Ukuran Aset</span>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Gunakan gambar berasio <strong>1:1 (persegi)</strong> dengan resolusi <strong>400x400px</strong> hingga <strong>600x600px</strong>. Format terbaik adalah <strong>PNG transparan</strong> atau <strong>SVG</strong> agar dekorasi terlihat rapi, bersih, dan tidak pecah saat diperbesar di canvas undangan.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!newAssetName.trim() || !newAssetUrl.trim() || assetUploading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-40 uppercase flex items-center justify-center gap-1.5"
                >
                  {assetUploading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambah Aset</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Grid List Column */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900 rounded-[24px] p-6 shadow-xl h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-20 space-y-3">
                  <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Memuat Data Aset...</p>
                </div>
              ) : assetsList.length > 0 ? (
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aset Tambahan Aktif</h3>
                    <p className="text-[9px] text-slate-500">{assetsList.length} Aset buatan admin terdaftar.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {assetsList.map((a) => (
                      <div 
                        key={a.id} 
                        className="group relative bg-slate-950 border border-slate-850 rounded-2xl p-3 flex flex-col items-center justify-center h-36 hover:border-blue-500 transition-all text-center"
                      >
                        <img 
                          src={a.url} 
                          alt={a.name} 
                          className="w-16 h-16 object-contain bg-slate-900 p-1 rounded-lg border border-slate-900"
                        />
                        <span className="text-[10px] font-bold text-white truncate max-w-full block mt-2 px-1">{a.name}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-mono mt-0.5">{a.category}</span>
                        
                        {/* Premium Switch Control */}
                        <div className="mt-1.5 z-20">
                          <button
                            onClick={() => handleToggleAssetPremium(a.id, a.premium)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                              a.premium 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500'
                            }`}
                          >
                            {a.premium ? '👑 Premium' : '🔓 Free'}
                          </button>
                        </div>

                        {confirmDeleteId === a.id && confirmDeleteType === 'assets' ? (
                          <button
                            onClick={() => handleDeleteAsset(a.id)}
                            className="absolute top-2 right-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-extrabold rounded-lg transition-all cursor-pointer shadow-md z-20 animate-pulse"
                            title="Klik sekali lagi untuk menghapus"
                          >
                            Yakin?
                          </button>
                        ) : (
                          <button
                            onClick={() => initiateDelete(a.id, 'assets')}
                            className="absolute top-2 right-2 p-1.5 bg-slate-900 text-rose-500 border border-slate-800 hover:bg-rose-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm z-20"
                            title="Hapus Aset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 space-y-2 text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-400">Tidak ada aset custom ditemukan</h4>
                  <p className="text-[10px] text-slate-600 max-w-xs mx-auto">Tambahkan ilustrasi premium baru menggunakan form di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Kelola Fitur & Premium Platform */}
        {activeTab === 'features' && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-[24px] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left">Pengaturan Akses Fitur Platform</h3>
              <p className="text-[10px] text-slate-400 mt-1 text-left">
                Tentukan fitur mana yang memerlukan akun premium dan mana yang bisa diakses secara gratis oleh pengguna akun free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Category: Templates */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <span className="text-base">🎨</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Template Undangan</span>
                </div>
                <div className="space-y-3">
                  {featuresList.filter(f => f.feature_type === 'template').map(f => (
                    <div key={f.feature_id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold text-left">{f.name}</span>
                      <button
                        onClick={() => handleToggleFeaturePremium(f.feature_id, f.is_premium)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                          f.is_premium 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500'
                        }`}
                      >
                        {f.is_premium ? '👑 Premium' : '🔓 Free'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Scroll Effects */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <span className="text-base">↕️</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Efek Page Scroll</span>
                </div>
                <div className="space-y-3">
                  {featuresList.filter(f => f.feature_type === 'effect' && f.name.startsWith('Page Scroll')).map(f => (
                    <div key={f.feature_id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold text-left">{f.name.replace('Page Scroll: ', '')}</span>
                      <button
                        onClick={() => handleToggleFeaturePremium(f.feature_id, f.is_premium)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                          f.is_premium 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500'
                        }`}
                      >
                        {f.is_premium ? '👑 Premium' : '🔓 Free'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Particle Effects */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <span className="text-base">✨</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Efek Partikel Latar</span>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {featuresList.filter(f => f.feature_type === 'effect' && f.name.startsWith('Particle')).map(f => (
                    <div key={f.feature_id} className="flex items-center justify-between text-xs py-1 border-b border-slate-900/40">
                      <span className="text-slate-300 font-semibold text-left">{f.name.replace('Particle: ', '')}</span>
                      <button
                        onClick={() => handleToggleFeaturePremium(f.feature_id, f.is_premium)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                          f.is_premium 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500'
                        }`}
                      >
                        {f.is_premium ? '👑 Premium' : '🔓 Free'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Widgets */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 md:col-span-2 lg:col-span-3">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <span className="text-base">🧩</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Fitur & Widget Interaktif Canvas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuresList.filter(f => f.feature_type === 'widget').map(f => (
                    <div key={f.feature_id} className="flex items-center justify-between text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                      <span className="text-slate-300 font-bold text-left">{f.name.replace('Widget: ', '')}</span>
                      <button
                        onClick={() => handleToggleFeaturePremium(f.feature_id, f.is_premium)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                          f.is_premium 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-950 text-slate-400 border border-slate-850 hover:border-blue-550'
                        }`}
                      >
                        {f.is_premium ? '👑 Premium' : '🔓 Free'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Template Undangan Dinamis</h3>
                <p className="text-xs text-slate-500 font-medium">Buat, edit, dan hapus preset desain undangan yang muncul untuk semua user</p>
              </div>
              <button
                onClick={onCreateNewTemplate}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Template Baru</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-950 rounded-2xl overflow-hidden p-6">
              {templateList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-medium">
                  Belum ada template dinamis. Klik tombol di atas untuk membuat template pertama Anda!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {templateList.map(tpl => (
                    <div
                      key={tpl.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all group"
                    >
                      {/* Template Cover Preview */}
                      <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-850 shrink-0 group/cover">
                        {tpl.thumbnail ? (
                          <img 
                            src={tpl.thumbnail} 
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                            alt="Cover Template" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-[#090c15]">
                            <Wand2 className="w-5 h-5 text-slate-750 animate-pulse" />
                            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">No Cover Preview</span>
                          </div>
                        )}

                        <input 
                          id={`cover-upload-admin-${tpl.id}`}
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
                                const res = await fetch(`/api/invitations/${tpl.id}/thumbnail`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ thumbnail: base64 })
                                });
                                const r = await res.json();
                                if (r.success) {
                                  alert('Cover template berhasil diperbarui!');
                                  fetchAdminData();
                                } else {
                                  alert('Gagal mengunggah cover template.');
                                }
                              } catch (_) {
                                alert('Gagal mengunggah cover template.');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />

                        {/* Mobile Change cover button (always visible) */}
                        <label htmlFor={`cover-upload-admin-${tpl.id}`} className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800/80 px-2 py-1 rounded-lg text-white flex items-center space-x-1.5 cursor-pointer z-10 md:hidden shadow-lg active:scale-95 transition-all">
                          <Upload className="w-3 h-3 text-white" />
                          <span className="text-[8px] font-extrabold uppercase tracking-wider">Ubah Cover</span>
                        </label>

                        {/* Desktop Change cover button overlay (hover only) */}
                        <label htmlFor={`cover-upload-admin-${tpl.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity hidden md:flex flex-col items-center justify-center cursor-pointer space-y-1 z-10">
                          <Upload className="w-5 h-5 text-white animate-pulse" />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">Ubah Cover</span>
                        </label>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block">Template ID: {tpl.id}</span>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">{tpl.title}</h4>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Terakhir diupdate: {new Date(tpl.updated_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <button
                          onClick={() => onEditTemplate?.(tpl.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                        >
                          Edit di Canvas
                        </button>
                        {confirmDeleteId === tpl.id && confirmDeleteType === 'invitation' ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/admin/invitations/${tpl.id}`, { method: 'DELETE' });
                                  const result = await res.json();
                                  if (result.success) {
                                    setTemplateList(prev => prev.filter(t => t.id !== tpl.id));
                                    setConfirmDeleteId(null);
                                    setConfirmDeleteType(null);
                                  } else {
                                    alert("Gagal menghapus template");
                                  }
                                } catch (_) {
                                  alert("Gagal menghapus template");
                                }
                              }}
                              className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              Yakin?
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(null);
                                setConfirmDeleteType(null);
                              }}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                        <button
                          onClick={() => initiateDelete(tpl.id, 'invitation')}
                          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer"
                          title="Hapus Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BUG REPORTS */}
        {activeTab === 'bugs' && (
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Laporan Bug dari User</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  Menampilkan semua kendala teknis yang dilaporkan oleh pengguna secara realtime
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Total: {bugReports.length} Laporan
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Open: {bugReports.filter(b => b.status === 'open').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {bugReports.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Activity className="w-8 h-8 opacity-25 mx-auto animate-pulse" />
                  <p className="text-xs font-semibold">Tidak ada laporan bug</p>
                  <p className="text-[10px] text-slate-650 max-w-xs mx-auto leading-relaxed">
                    Kerja bagus! Sistem Anda bersih dan belum ada bug yang dilaporkan oleh pengguna saat ini.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="pb-3 pr-4">Pengirim / User</th>
                      <th className="pb-3 pr-4 w-1/2">Deskripsi Bug</th>
                      <th className="pb-3 pr-4">URL Masalah</th>
                      <th className="pb-3 pr-4">Tanggal</th>
                      <th className="pb-3 pr-4 text-center">Status</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugReports.map((bug) => {
                      const dateStr = new Date(bug.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      });
                      const isOpen = bug.status === 'open';

                      return (
                        <tr key={bug.id} className="border-b border-slate-900/60 hover:bg-white/2 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-white">{bug.user_email}</div>
                            {bug.user_id && <div className="text-[9px] text-slate-500 mt-0.5">UID: {bug.user_id}</div>}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {bug.description}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400 font-mono text-[9px] truncate max-w-[180px]" title={bug.page_url}>
                            {bug.page_url ? (
                              <a href={bug.page_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
                                {bug.page_url}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400 font-medium whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3.5 pr-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${
                              isOpen
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {isOpen ? 'Open' : 'Resolved'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleToggleBugStatus(bug.id, bug.status)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border ${
                                isOpen
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-600/15'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              }`}
                            >
                              {isOpen ? 'Tandai Selesai' : 'Buka Kembali'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
