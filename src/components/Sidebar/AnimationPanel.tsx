import React from 'react';
import {
  Zap, Play, Sliders, Eye, MoveUp, MoveRight, Maximize,
  RotateCw, RefreshCw, Square, CircleDot, Layers, Wind, Info,
} from 'lucide-react';
import { InvitationElement, InvitationAnimation } from '../../types';

interface AnimationPanelProps {
  selectedElement: InvitationElement | null;
  allElements: InvitationElement[];
  onUpdateElementAnimation: (elementId: string, animation: InvitationAnimation) => void;
  onSelectElement: (id: string | null) => void;
  settings: any;
  onUpdateSettings: (updates: any) => void;
  onPlayAnimation?: (elementId: string, tempType?: string) => void;
}

const toValid7CharHex = (color: string | undefined, fallback: string = '#ffffff'): string => {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
};

export default function AnimationPanel({
  selectedElement, allElements, onUpdateElementAnimation, onSelectElement,
  settings, onUpdateSettings, onPlayAnimation,
}: AnimationPanelProps) {

  const handleAnimationChange = (field: keyof InvitationAnimation, value: any) => {
    if (!selectedElement) return;
    const currentAnim = selectedElement.animation || { type: 'fade', duration: 1, delay: 0, easing: 'power2.out' };
    onUpdateElementAnimation(selectedElement.id, { ...currentAnim, [field]: value });
  };

  const basicAnimations = [
    { value: 'none', label: 'None', desc: 'No animation', icon: Square },
    { value: 'fade', label: 'Fade', desc: 'Fades in', icon: Eye },
    { value: 'zoom', label: 'Zoom', desc: 'Pops in', icon: Maximize },
    { value: 'scale', label: 'Wipe', desc: 'Scales up', icon: CircleDot },
    { value: 'slide-up', label: 'Rise ↑', desc: 'Slides up', icon: MoveUp },
    { value: 'slide-down', label: 'Drop ↓', desc: 'Slides down', icon: MoveUp },
    { value: 'slide-left', label: 'Pan ←', desc: 'Slides left', icon: MoveRight },
    { value: 'slide-right', label: 'Pan →', desc: 'Slides right', icon: MoveRight },
  ];

  const motionAnimations = [
    { value: 'bounce', label: 'Bounce', desc: 'Springy', icon: Zap },
    { value: 'flip', label: '3D Flip', desc: 'Flips 3D', icon: RefreshCw },
    { value: 'rotate', label: 'Spin', desc: 'Spins in', icon: RotateCw },
    { value: 'float', label: 'Float', desc: 'Float loop', icon: Play },
  ];

  const easingTypes = [
    { value: 'power2.out', label: 'Smooth Ease Out' },
    { value: 'power1.out', label: 'Linear-ish' },
    { value: 'power3.out', label: 'Fast Out' },
    { value: 'bounce.out', label: 'Springy' },
    { value: 'back.out', label: 'Overshoot' },
    { value: 'elastic.out', label: 'Elastic' },
  ];

  const openAnimations = [
    { value: 'fade', label: 'Fade', emoji: '✨' },
    { value: 'door-left', label: 'Door ←', emoji: '🚪' },
    { value: 'door-right', label: 'Door →', emoji: '🚪' },
    { value: 'curtain-up', label: 'Curtain ↑', emoji: '🎭' },
    { value: 'curtain-down', label: 'Curtain ↓', emoji: '🎭' },
    { value: 'zoom-out', label: 'Zoom', emoji: '🔭' },
    { value: 'none', label: 'Instant', emoji: '⚡' },
  ];

  const pageScrollEffects = [
    { value: 'none', label: 'No Effect', emoji: '📄' },
    { value: 'fade-sections', label: 'Fade', emoji: '✨' },
    { value: 'slide-sections', label: 'Slide', emoji: '↔️' },
    { value: 'parallax-bg', label: 'Parallax', emoji: '🌊' },
  ];

  const scrollEffects = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'rotate-in', label: 'Rotate' },
    { value: 'slide-left', label: 'Slide ←' },
    { value: 'slide-right', label: 'Slide →' },
    { value: 'slide-down', label: 'Slide Down' },
  ];

  const currentAnim = selectedElement?.animation || { type: 'none', duration: 1, delay: 0, easing: 'power2.out', loop: false };
  const currentScrollEffect = (selectedElement as any)?.scrollEffect || 'none';

  return (
    <div className="space-y-5">

      {/* 1. Open Invitation Transition */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-base">🚪</span>
          <div>
            <span className="text-xs font-bold text-amber-800 block">Efek Buka Undangan</span>
            <span className="text-[9px] text-amber-600">Saat tamu klik tombol undangan</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {openAnimations.map((anim) => {
            const isActive = (settings.openAnimation || 'fade') === anim.value;
            return (
              <button key={anim.value} onClick={() => onUpdateSettings({ openAnimation: anim.value })}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                  isActive ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-amber-100 text-amber-700 hover:border-amber-300'
                }`}
              >
                <span className="text-base leading-none">{anim.emoji}</span>
                <span className="text-[8px] font-bold">{anim.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Page Scroll Effect */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-blue-500" />
          <div>
            <span className="text-xs font-bold text-blue-800 block">Efek Scroll</span>
            <span className="text-[9px] text-blue-500">Efek saat scroll antar halaman</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {pageScrollEffects.map((eff) => {
            const isActive = (settings.scrollEffect || 'none') === eff.value;
            return (
              <button key={eff.value} onClick={() => onUpdateSettings({ scrollEffect: eff.value })}
                className={`px-3 py-2 rounded-xl border text-center transition-all flex items-center gap-2 ${
                  isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-blue-100 text-blue-700 hover:border-blue-300'
                }`}
              >
                <span className="text-sm">{eff.emoji}</span>
                <span className="text-[9px] font-bold">{eff.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.3. Dynamic Particle / Floating Effects */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-rose-800 block">Efek Melayang & Jatuh</span>
            <span className="text-[9px] text-rose-500">Partikel dekoratif latar belakang undangan</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: 'none', label: 'Tanpa Efek', emoji: '❌' },
            { value: 'sakura', label: 'Guguran Sakura', emoji: '🌸' },
            { value: 'rose-petals', label: 'Kelopak Mawar', emoji: '🌹' },
            { value: 'autumn-leaves', label: 'Daun Gugur', emoji: '🍁' },
            { value: 'botanical-leaves', label: 'Daun Botanical', emoji: '🍃' },
            { value: 'gold-dust', label: 'Debu Emas', emoji: '✨' },
            { value: 'glittering-stars', label: 'Bintang Berkelip', emoji: '⭐' },
            { value: 'love-balloons', label: 'Hati Melayang', emoji: '💖' },
            { value: 'snow', label: 'Salju Syahdu', emoji: '❄️' },
            { value: 'rain', label: 'Rintik Hujan', emoji: '🌧️' },
            { value: 'bubbles', label: 'Gelembung Udara', emoji: '🫧' }
          ].map((eff) => {
            const isActive = (settings.particleEffect || 'none') === eff.value;
            return (
              <button 
                key={eff.value} 
                onClick={() => onUpdateSettings({ particleEffect: eff.value })}
                className={`px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'bg-rose-500 border-rose-500 text-white shadow-xs scale-[1.02]' 
                    : 'bg-white border-rose-100 text-rose-700 hover:border-rose-300 hover:bg-rose-50/10'
                }`}
              >
                <span className="text-sm">{eff.emoji}</span>
                <span className="text-[9px] font-bold whitespace-nowrap">{eff.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.4. Auto Scroll Options */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-base">📜</span>
            <div>
              <span className="text-xs font-bold text-violet-800 block">Auto Scroll Undangan</span>
              <span className="text-[9px] text-violet-500">Gulir otomatis setelah undangan dibuka</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              id="checkbox-toggle-auto-scroll"
              type="checkbox" 
              className="sr-only peer"
              checked={!!settings.autoScrollEnabled}
              onChange={(e) => onUpdateSettings({ autoScrollEnabled: e.target.checked })}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
          </label>
        </div>

        {settings.autoScrollEnabled && (
          <div className="space-y-3 pt-2 border-t border-violet-100 animate-in slide-in-from-top-1 duration-150">
            {/* Speed slider */}
            <div>
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                <span>Kecepatan Gulir (Speed)</span>
                <span className="font-mono">{settings.autoScrollSpeed || 30} px/s</span>
              </div>
              <input
                id="range-auto-scroll-speed"
                type="range" min="10" max="100" step="5"
                value={settings.autoScrollSpeed || 30}
                onChange={(e) => onUpdateSettings({ autoScrollSpeed: parseInt(e.target.value) })}
                className="w-full accent-violet-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Button Style selector */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Gaya Tombol</label>
                <select
                  id="select-auto-scroll-style"
                  value={settings.autoScrollButtonStyle || 'circular'}
                  onChange={(e) => onUpdateSettings({ autoScrollButtonStyle: e.target.value })}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg p-1.5 outline-none font-semibold text-slate-700"
                >
                  <option value="circular">Bulat / Circular</option>
                  <option value="floating">Floating / Melayang</option>
                  <option value="pill">Pill / Kapsul</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Ikon Tombol</label>
                <select
                  id="select-auto-scroll-icon"
                  value={settings.autoScrollButtonIcon || 'chevron'}
                  onChange={(e) => onUpdateSettings({ autoScrollButtonIcon: e.target.value })}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg p-1.5 outline-none font-semibold text-slate-700"
                >
                  <option value="chevron">Chevron (Panah)</option>
                  <option value="play">Play (Segitiga)</option>
                  <option value="scroll">Scroll (Gulung)</option>
                  <option value="arrow">Arrow (Panah)</option>
                </select>
              </div>
            </div>

            {/* Button Color selector */}
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Warna Tombol Auto-Scroll</label>
              <div className="flex items-center space-x-2 bg-white border border-slate-200 p-2 rounded-xl">
                <input
                  id="color-auto-scroll"
                  type="color"
                  value={toValid7CharHex(settings.autoScrollButtonColor, '#D4AF37')}
                  onChange={(e) => onUpdateSettings({ autoScrollButtonColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={(settings.autoScrollButtonColor || '#D4AF37').toUpperCase()}
                  onChange={(e) => onUpdateSettings({ autoScrollButtonColor: e.target.value })}
                  className="text-xs font-mono font-semibold text-slate-700 bg-transparent outline-none flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2.5. Bottom Navigation Menu */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-base font-sans">📱</span>
            <div>
              <span className="text-xs font-bold text-emerald-800 block">Navigasi Bawah (Navbar)</span>
              <span className="text-[9px] text-emerald-600">Menu navigasi halaman di isi undangan</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              id="checkbox-toggle-bottom-nav"
              type="checkbox" 
              className="sr-only peer"
              checked={!!settings.showBottomNavigation}
              onChange={(e) => onUpdateSettings({ showBottomNavigation: e.target.checked })}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {settings.showBottomNavigation && (
          <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Pilih Gaya Desain Navbar</label>
            <select
              id="select-bottom-nav-style"
              value={settings.bottomNavigationStyle || 'glass'}
              onChange={(e) => onUpdateSettings({ bottomNavigationStyle: e.target.value })}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 transition-all focus:border-emerald-400"
            >
              <option value="glass">💎 Glassmorphism Capsule</option>
              <option value="gold">👑 Ornate Gold & Navy</option>
              <option value="terracotta">🌸 Earthy Terracotta</option>
              <option value="navy">🌌 Royal Velvet Navy</option>
              <option value="botanical">🌿 Sage Green Leaves</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. Element Animations */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Animasi Elemen</h4>

        {!selectedElement ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="text-[10px] text-slate-400 font-semibold">Pilih elemen di canvas</span>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <span className="text-[10px] font-bold text-blue-700">{selectedElement.name}</span>
              <button onClick={() => onPlayAnimation?.(selectedElement.id)}
                className="flex items-center space-x-1 text-blue-600 text-[10px] font-black">
                <Play className="w-3 h-3 fill-current" /><span>Test</span>
              </button>
            </div>

            {/* Basic */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Entrance</span>
              <div className="grid grid-cols-2 gap-1.5">
                {basicAnimations.map((anim) => {
                  const Icon = anim.icon;
                  const isActive = currentAnim.type === anim.value;
                  return (
                    <button key={anim.value}
                      onClick={() => handleAnimationChange('type', anim.value)}
                      onMouseEnter={() => onPlayAnimation?.(selectedElement.id, anim.value)}
                      className={`flex items-center space-x-2 p-2 text-left border rounded-xl transition-all ${
                        isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[9px] font-bold">{anim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Motion</span>
              <div className="grid grid-cols-2 gap-1.5">
                {motionAnimations.map((anim) => {
                  const Icon = anim.icon;
                  const isActive = currentAnim.type === anim.value;
                  return (
                    <button key={anim.value}
                      onClick={() => handleAnimationChange('type', anim.value)}
                      onMouseEnter={() => onPlayAnimation?.(selectedElement.id, anim.value)}
                      className={`flex items-center space-x-2 p-2 text-left border rounded-xl transition-all ${
                        isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[9px] font-bold">{anim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tweaker */}
            {currentAnim.type !== 'none' && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Timing</span>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1">
                    <span>Duration</span><span>{currentAnim.duration || 1.2}s</span>
                  </div>
                  <input type="range" min="0.2" max="5" step="0.1" value={currentAnim.duration || 1.2}
                    onChange={(e) => handleAnimationChange('duration', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1">
                    <span>Delay</span><span>{currentAnim.delay || 0}s</span>
                  </div>
                  <input type="range" min="0" max="3" step="0.1" value={currentAnim.delay || 0}
                    onChange={(e) => handleAnimationChange('delay', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <select value={currentAnim.easing || 'power2.out'}
                  onChange={(e) => handleAnimationChange('easing', e.target.value)}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg p-2 outline-none font-semibold text-slate-700">
                  {easingTypes.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[9px] font-bold text-slate-700 block">Loop</span>
                    <span className="text-[8px] text-slate-400">Ulangi tanpa henti</span>
                  </div>
                  <input type="checkbox" checked={currentAnim.loop || false}
                    onChange={(e) => handleAnimationChange('loop', e.target.checked)}
                    className="w-4 h-4 accent-blue-600" />
                </div>
              </div>
            )}

            {/* Per-element scroll reveal */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Scroll Reveal</span>
                </div>
                <span className="text-[8px] bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-bold">
                  Efek Scroll
                </span>
              </div>

              {/* Premium Info Box */}
              <div className="p-3 bg-teal-50/40 border border-teal-100 rounded-2xl flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-teal-900 font-semibold leading-normal">
                    Apa itu Scroll Reveal?
                  </p>
                  <p className="text-[9px] text-teal-700/80 leading-relaxed font-medium">
                    Efek transisi masuk yang terpicu secara otomatis saat tamu melakukan scroll halaman dan elemen ini memasuki layar. Membuat undangan digital Anda tampak premium, dinamis, dan hidup.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {scrollEffects.map((eff) => {
                  const isActive = currentScrollEffect === eff.value;
                  return (
                    <button key={eff.value}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('update-element-scroll', {
                          detail: { id: selectedElement.id, updates: { scrollEffect: eff.value } }
                        }));
                        onPlayAnimation?.(selectedElement.id, eff.value);
                      }}
                      onMouseEnter={() => {
                        onPlayAnimation?.(selectedElement.id, eff.value);
                      }}
                      className={`px-2 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isActive 
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-150' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/20'
                      }`}
                    >
                      <span>{eff.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
