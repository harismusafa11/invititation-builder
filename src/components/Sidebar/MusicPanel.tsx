import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Plus, Volume2, Search, Upload, CheckCircle, Radio } from 'lucide-react';
import { MusicTrack } from '../../types';

interface MusicPanelProps {
  currentMusicUrl?: string;
  currentMusicName?: string;
  onSelectMusic: (url: string, name: string) => void;
  onAddMusicWidget: (url: string, name: string) => void;
  isPremium?: boolean;
  onRequestUpgrade?: () => void;
}

const MUSIC_LIBRARY: MusicTrack[] = [
  // Romantic
  {
    id: 'r1', name: 'A Thousand Years', artist: 'Piano Cover', url: '/sample.mp3',
    category: 'romantic', duration: '4:45'
  },
  {
    id: 'r2', name: 'Perfect Wedding', artist: 'Acoustic Guitar', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'romantic', duration: '3:28'
  },
  {
    id: 'r3', name: 'Canon in D', artist: 'String Quartet', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    category: 'romantic', duration: '5:12'
  },
  {
    id: 'r4', name: 'All of Me', artist: 'Jazz Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    category: 'romantic', duration: '4:30'
  },
  {
    id: 'r5', name: 'Marry You', artist: 'Acoustic Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    category: 'romantic', duration: '3:52'
  },
  // Classical
  {
    id: 'c1', name: 'Clair de Lune', artist: 'Debussy (Piano)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    category: 'classical', duration: '5:20'
  },
  {
    id: 'c2', name: 'Air on the G String', artist: 'Bach Orchestra', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    category: 'classical', duration: '4:55'
  },
  {
    id: 'c3', name: 'Pachelbel Canon', artist: 'Chamber Orchestra', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    category: 'classical', duration: '6:10'
  },
  // Traditional
  {
    id: 't1', name: 'Gamelan Pernikahan', artist: 'Gending Jawa', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    category: 'traditional', duration: '4:00'
  },
  {
    id: 't2', name: 'Keroncong Malam', artist: 'Keroncong Classic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    category: 'traditional', duration: '3:45'
  },
  {
    id: 't3', name: 'Sunda Sekar', artist: 'Kecapi Suling', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    category: 'traditional', duration: '5:00'
  },
  // Modern
  {
    id: 'm1', name: 'Vows of Love', artist: 'Lo-Fi Wedding', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    category: 'modern', duration: '3:30'
  },
  {
    id: 'm2', name: 'Forever Young', artist: 'Indie Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    category: 'modern', duration: '4:15'
  },
  {
    id: 'm3', name: 'Kau & Aku', artist: 'Pop Indonesia', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    category: 'modern', duration: '3:58'
  },
  {
    id: 'm4', name: 'Selamanya', artist: 'Ballad Melayu', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    category: 'modern', duration: '4:22'
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: '🎵 Semua',
  romantic: '💕 Romantis',
  classical: '🎻 Klasik',
  traditional: '🪘 Tradisional',
  modern: '🎧 Modern',
};

export default function MusicPanel({ currentMusicUrl, currentMusicName, onSelectMusic, onAddMusicWidget, isPremium = false, onRequestUpgrade }: MusicPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Cleanup preview audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  useEffect(() => {
    let active = true;
    fetch('/api/music')
      .then(res => res.json())
      .then(result => {
        if (active) {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setTracks(result.data);
          } else {
            setTracks(MUSIC_LIBRARY);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setTracks(MUSIC_LIBRARY);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const filtered = tracks.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePreview = (track: MusicTrack) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
    if (previewingId === track.id) {
      setPreviewingId(null);
      setPreviewAudio(null);
      return;
    }
    const audio = new Audio(track.url);
    audio.play().catch((err) => {
      console.warn("Music panel preview blocked or failed:", err);
    });
    audio.addEventListener('ended', () => {
      setPreviewingId(null);
      setPreviewAudio(null);
    });
    setPreviewAudio(audio);
    setPreviewingId(track.id);
  };

  const handleSelect = (track: MusicTrack) => {
    if (track.premium && !isPremium) {
      onRequestUpgrade?.();
      return;
    }
    if (previewAudio) { 
      previewAudio.pause(); 
    }
    setPreviewingId(null);
    setPreviewAudio(null);
    onSelectMusic(track.url, track.name);
  };

  const handleAddWidget = (track: MusicTrack) => {
    if (track.premium && !isPremium) {
      onRequestUpgrade?.();
      return;
    }
    onAddMusicWidget(track.url, track.name);
  };

  const handleCustomAdd = () => {
    if (!customUrl.trim()) return;
    onSelectMusic(customUrl.trim(), customName.trim() || 'Custom Track');
    setCustomUrl('');
    setCustomName('');
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-purple-50 rounded-lg">
          <Music className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-700">Musik Latar</h3>
          <p className="text-[10px] text-slate-400">Pilih lagu untuk undangan Anda</p>
        </div>
      </div>

      {/* Current Playing */}
      {currentMusicUrl && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0 animate-spin" style={{ animationDuration: '4s' }}>
            <Music className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-purple-700 truncate">{currentMusicName || 'Custom Track'}</p>
            <p className="text-[9px] text-purple-400">Sedang diputar di undangan</p>
          </div>
          <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari lagu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-400 focus:bg-white"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${activeCategory === key
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-0.5">
        {filtered.map(track => {
          const isSelected = currentMusicUrl === track.url;
          const isPreviewing = previewingId === track.id;
          return (
            <div
              key={track.id}
              className={`group flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-slate-100 hover:border-purple-100 hover:bg-purple-50/30'
                }`}
            >
              {/* Play preview button */}
              <button
                onClick={() => handlePreview(track)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isPreviewing
                    ? 'bg-purple-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-500 hover:bg-purple-100 hover:text-purple-600'
                  }`}
              >
                {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              {/* Track info */}
              <div className="flex-1 min-w-0 text-left" onClick={() => handleSelect(track)}>
                <p className="text-[11px] font-bold text-slate-700 truncate flex items-center gap-1">
                  {track.name}
                  {track.premium && (
                    <span className="bg-amber-100 text-amber-600 text-[7px] px-1 py-0.2 rounded-full font-black uppercase tracking-wider scale-90 inline-flex items-center shrink-0">
                      👑 Premium
                    </span>
                  )}
                </p>
                <p className="text-[9px] text-slate-400 truncate">{track.artist} · {track.duration}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Set as background music */}
                <button
                  onClick={() => handleSelect(track)}
                  title="Set sebagai musik latar"
                  className={`p-1.5 rounded-lg text-xs transition-all ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-purple-100 hover:text-purple-600'
                    }`}
                >
                  <Volume2 className="w-3 h-3" />
                </button>
                {/* Add music player to canvas */}
                <button
                  onClick={() => handleAddWidget(track)}
                  title="Tambahkan player musik ke canvas"
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-600 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {isSelected && <CheckCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Custom URL input */}
      <div className="border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center space-x-2 text-xs text-slate-500 hover:text-purple-600 font-semibold w-full"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Tambah URL Musik Custom</span>
        </button>
        {showCustom && (
          <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-150">
            <input
              type="text"
              placeholder="Nama lagu (opsional)"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400"
            />
            <input
              type="url"
              placeholder="URL file audio (.mp3, .ogg...)"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400"
            />
            <button
              onClick={handleCustomAdd}
              disabled={!customUrl.trim()}
              className="w-full py-2 bg-purple-500 text-white text-xs font-bold rounded-lg disabled:opacity-40 hover:bg-purple-600 transition-all"
            >
              Gunakan URL Ini
            </button>
          </div>
        )}
      </div>

      {/* Add floating music widget note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <div className="flex items-start space-x-2">
          <Radio className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700">Musik Player di Canvas</p>
            <p className="text-[9px] text-amber-600 leading-relaxed mt-0.5">
              Klik ikon <strong>+</strong> pada lagu untuk menambahkan widget musik yang bisa digeser di canvas. Widget akan tampil di dalam tampilan HP preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
