
import React from 'react';
import { 
  Type, 
  Settings, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Clipboard,
  FlipHorizontal,
  FlipVertical,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { InvitationElement } from '../../types';
import { PRESET_FONTS } from '../../utils/defaults';

function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
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
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Helper to sanitize any color string so that HTML5 color inputs never receive invalid value
const toValid7CharHex = (color: string | undefined, fallback: string = '#ffffff'): string => {
  if (!color) return fallback;
  const trimmed = color.trim();
  // If it's already a valid 6-digit hex with hash
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }
  // If it's a 3-digit hex, expand it (e.g., #fff -> #ffffff)
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
};

interface PropertiesPanelProps {
  selectedElement: InvitationElement | null;
  onUpdateElement: (id: string, updates: Partial<InvitationElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onCopyElement: (id: string) => void;
  onPasteElement: () => void;
  copiedElement: InvitationElement | null;
  onSelectElement?: (id: string | null) => void;
  onCropClick?: (id: string) => void;
  onPlayAnimation?: (elementId: string, tempType?: string) => void;
}

export default function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onCopyElement,
  onPasteElement,
  copiedElement,
  onSelectElement,
  onCropClick,
  onPlayAnimation,
}: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-center items-center h-[200px] md:h-[calc(100vh-56px)] shrink-0 select-none text-slate-400 text-center">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-full mb-3">
          <Settings className="w-6 h-6 text-slate-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Inspector</h3>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed mb-4">
          Select any design element on the mobile canvas to view and customize its styling attributes.
        </p>
        {copiedElement && (
          <button
            onClick={onPasteElement}
            className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all border border-amber-200 animate-in fade-in duration-200 cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste "{copiedElement.name}"</span>
          </button>
        )}
      </div>
    );
  }

  const [nudgeStep, setNudgeStep] = React.useState<number>(5);
  const [showAnimSection, setShowAnimSection] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);

  React.useEffect(() => {
    setIsMinimized(false);
  }, [selectedElement?.id]);

  const handleUpdate = (updates: Partial<InvitationElement>) => {
    onUpdateElement(selectedElement.id, updates);
  };

  const handleWidgetConfigUpdate = (updates: any) => {
    handleUpdate({
      widgetConfig: {
        ...(selectedElement.widgetConfig || {}),
        ...updates,
      }
    });
  };

  // Minimized layout on mobile viewports
  if (isMinimized) {
    return (
      <div className="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200 h-[62px] md:h-full absolute md:absolute xl:relative bottom-[56px] md:bottom-0 md:top-0 left-0 right-0 md:left-auto md:right-0 rounded-t-3xl md:rounded-t-none shadow-[0_-8px_30px_rgba(0,0,0,0.15)] md:shadow-none shrink-0 px-5 py-3 flex items-center justify-between select-none z-40 transition-all duration-300">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
          <div className="overflow-hidden">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Mengedit Elemen</p>
            <p className="text-xs font-bold text-slate-800 truncate">{selectedElement.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsMinimized(false)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer border border-blue-200/40"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          {onSelectElement && (
            <button
              onClick={() => onSelectElement(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer border-0"
            >
              <span>Selesai</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200 h-[380px] md:h-full absolute md:absolute xl:relative bottom-[56px] md:bottom-0 md:top-0 left-0 right-0 md:left-auto md:right-0 rounded-t-3xl md:rounded-t-none shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-none shrink-0 overflow-y-auto overscroll-contain p-5 space-y-6 select-none z-40">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties</h3>
            <span className="text-[11px] font-bold text-slate-800 block truncate max-w-[120px]">{selectedElement.name}</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="md:hidden p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all border border-slate-200/50 cursor-pointer flex items-center justify-center shrink-0"
            title="Minimize Panel"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center space-x-1">
          {onSelectElement && (
            <button
              onClick={() => onSelectElement(null)}
              className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer mr-1.5 xl:hidden shadow-xs uppercase tracking-wider"
              title="Selesai Mengedit"
            >
              <span>Selesai</span>
            </button>
          )}
          <button
            onClick={() => handleUpdate({ locked: !selectedElement.locked })}
            className={`p-1.5 rounded-lg transition-all ${selectedElement.locked ? 'bg-indigo-50 text-indigo-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title={selectedElement.locked ? 'Unlock' : 'Lock'}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleUpdate({ hidden: !selectedElement.hidden })}
            className={`p-1.5 rounded-lg transition-all ${selectedElement.hidden ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title={selectedElement.hidden ? 'Show' : 'Hide'}
          >
            {selectedElement.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onCopyElement(selectedElement.id)}
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-all"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-all"
            title="Duplicate (Ctrl+D)"
          >
            <div className="relative">
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-amber-500 font-sans leading-none">+</span>
            </div>
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Style / Animation Toggle */}
      <div className="flex border border-slate-100 p-0.5 bg-slate-50/80 rounded-xl mb-4 shrink-0">
        <button
          onClick={() => setShowAnimSection(false)}
          className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer border-0 ${
            !showAnimSection
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
              : 'text-slate-400 hover:text-slate-700 bg-transparent'
          }`}
        >
          🎨 Desain
        </button>
        <button
          onClick={() => setShowAnimSection(true)}
          className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer border-0 ${
            showAnimSection
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
              : 'text-slate-400 hover:text-slate-700 bg-transparent'
          }`}
        >
          ⚡ Animasi
        </button>
      </div>

      {/* Animation Panel - shows when showAnimSection is true */}
      {showAnimSection && (() => {
        const basicAnimations = [
          { value: 'none', label: 'None' },
          { value: 'fade', label: 'Fade' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'scale', label: 'Wipe' },
          { value: 'slide-up', label: 'Rise ↑' },
          { value: 'slide-down', label: 'Drop ↓' },
          { value: 'slide-left', label: 'Pan ←' },
          { value: 'slide-right', label: 'Pan →' },
        ];
        const motionAnimations = [
          { value: 'bounce', label: 'Bounce' },
          { value: 'flip', label: '3D Flip' },
          { value: 'rotate', label: 'Spin' },
          { value: 'float', label: 'Float' },
        ];
        const easingTypes = [
          { value: 'power2.out', label: 'Smooth Ease Out' },
          { value: 'power1.out', label: 'Linear-ish' },
          { value: 'power3.out', label: 'Fast Out' },
          { value: 'bounce.out', label: 'Springy' },
          { value: 'back.out', label: 'Overshoot' },
          { value: 'elastic.out', label: 'Elastic' },
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
        const currentAnim = selectedElement.animation || { type: 'none', duration: 1.2, delay: 0, easing: 'power2.out', loop: false };
        const currentScrollEffect = (selectedElement as any).scrollEffect || 'none';
        const handleAnimationChange = (field: string, value: any) => {
          onUpdateElement(selectedElement.id, {
            animation: { ...currentAnim, [field]: value }
          });
        };
        return (
          <div className="space-y-5 animate-in fade-in duration-200 text-left">
            {onPlayAnimation && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-blue-700">Test Animasi Elemen</span>
                <button
                  onClick={() => onPlayAnimation(selectedElement.id)}
                  className="flex items-center space-x-1 text-blue-600 text-[10px] font-black border-0 bg-transparent cursor-pointer"
                >
                  <span>▶ Test</span>
                </button>
              </div>
            )}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Entrance</span>
              <div className="grid grid-cols-2 gap-1.5">
                {basicAnimations.map((anim) => {
                  const isActive = currentAnim.type === anim.value;
                  return (
                    <button
                      key={anim.value}
                      onClick={() => handleAnimationChange('type', anim.value)}
                      onMouseEnter={() => onPlayAnimation?.(selectedElement.id, anim.value)}
                      className={`flex items-center space-x-2 p-2 text-left border rounded-xl transition-all cursor-pointer ${
                        isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{anim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Motion / Loop</span>
              <div className="grid grid-cols-2 gap-1.5">
                {motionAnimations.map((anim) => {
                  const isActive = currentAnim.type === anim.value;
                  return (
                    <button
                      key={anim.value}
                      onClick={() => handleAnimationChange('type', anim.value)}
                      onMouseEnter={() => onPlayAnimation?.(selectedElement.id, anim.value)}
                      className={`flex items-center space-x-2 p-2 text-left border rounded-xl transition-all cursor-pointer ${
                        isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{anim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {currentAnim.type !== 'none' && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timing & Easing</span>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                    <span>Duration</span><span>{currentAnim.duration || 1.2}s</span>
                  </div>
                  <input type="range" min="0.2" max="5" step="0.1" value={currentAnim.duration || 1.2}
                    onChange={(e) => handleAnimationChange('duration', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                    <span>Delay</span><span>{currentAnim.delay || 0}s</span>
                  </div>
                  <input type="range" min="0" max="3" step="0.1" value={currentAnim.delay || 0}
                    onChange={(e) => handleAnimationChange('delay', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Easing</label>
                  <select value={currentAnim.easing || 'power2.out'} onChange={(e) => handleAnimationChange('easing', e.target.value)}
                    className="w-full text-[10px] bg-white border border-slate-200 rounded-lg p-2 outline-none font-semibold text-slate-700">
                    {easingTypes.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 block">Looping</span>
                    <span className="text-[8px] text-slate-400">Mainkan tanpa henti</span>
                  </div>
                  <input type="checkbox" checked={currentAnim.loop || false}
                    onChange={(e) => handleAnimationChange('loop', e.target.checked)}
                    className="w-4 h-4 accent-blue-600" />
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scroll Reveal</span>
                <span className="text-[8px] bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-bold">Efek Masuk</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {scrollEffects.map((eff) => {
                  const isActive = currentScrollEffect === eff.value;
                  return (
                    <button
                      key={eff.value}
                      onClick={() => {
                        onUpdateElement(selectedElement.id, { scrollEffect: eff.value } as any);
                        onPlayAnimation?.(selectedElement.id, eff.value);
                      }}
                      className={`px-2 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
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
        );
      })()}

      {/* Geometry Panel - hidden when animation tab is active */}
      <div className="space-y-3" style={{ display: showAnimSection ? 'none' : undefined }}>



        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geometry</h4>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1">POS X (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1">POS Y (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1">WIDTH (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 10 })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1">HEIGHT (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 10 })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
            />
          </div>
        </div>

        {/* Rotate and Opacity */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div>
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Rotation</span>
              <div className="flex items-center space-x-0.5 bg-slate-50 border border-slate-200 rounded px-1 py-0.5">
                <input
                  type="number"
                  value={selectedElement.rotation || 0}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 0;
                    handleUpdate({ rotation: val });
                  }}
                  className="w-8 text-[10px] font-mono text-slate-600 bg-transparent text-right outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[9px] text-slate-450 font-mono">°</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedElement.rotation || 0}
              onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Opacity</span>
              <span className="font-mono text-slate-600">{Math.round((selectedElement.opacity || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedElement.opacity ?? 1}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Flip Element */}
        <div className="pt-3 border-t border-slate-100/50">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">Flip Direction</div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate({ flipHorizontal: !selectedElement.flipHorizontal })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                selectedElement.flipHorizontal
                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span>Horizontal</span>
            </button>
            <button
              onClick={() => handleUpdate({ flipVertical: !selectedElement.flipVertical })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                selectedElement.flipVertical
                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FlipVertical className="w-4 h-4" />
              <span>Vertical</span>
            </button>
          </div>
        </div>

        {/* Nudge Controls */}
        <div className="pt-3 border-t border-slate-100/50">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">Geser Presisi (Nudge)</div>
          
          <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {/* Step size selector */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-semibold">Langkah (Step)</span>
              <div className="flex gap-1">
                {[1, 5, 10, 20].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setNudgeStep(step)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      nudgeStep === step
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {step}px
                  </button>
                ))}
              </div>
            </div>

            {/* D-Pad Buttons */}
            <div className="flex flex-col items-center gap-1 mt-1">
              {/* Up */}
              <button
                type="button"
                onClick={() => handleUpdate({ y: selectedElement.y - nudgeStep })}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all text-xs"
                title="Geser Atas"
              >
                ▲
              </button>
              
              <div className="flex gap-3">
                {/* Left */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ x: selectedElement.x - nudgeStep })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all text-xs"
                  title="Geser Kiri"
                >
                  ◀
                </button>
                
                {/* Step indicator */}
                <div className="w-8 h-8 flex items-center justify-center text-[9px] text-slate-500 font-sans font-bold">
                  {nudgeStep}px
                </div>

                {/* Right */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ x: selectedElement.x + nudgeStep })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all text-xs"
                  title="Geser Kanan"
                >
                  ▶
                </button>
              </div>

              {/* Down */}
              <button
                type="button"
                onClick={() => handleUpdate({ y: selectedElement.y + nudgeStep })}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all text-xs"
                title="Geser Bawah"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TEXT SPECIFIC PROPERTIES */}
      {selectedElement.type === 'text' && !showAnimSection && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Type className="w-3.5 h-3.5 text-blue-500" />
            <span>Typography Config</span>
          </h4>

          {/* Edit Text Content */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Text Value</label>
            <textarea
              id="property-text-content"
              value={selectedElement.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              rows={2}
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 font-medium"
            />
            <p className="text-[10px] text-slate-400 leading-normal mt-1">
              Tip: Gunakan <code className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold text-[9px]">{"{{guest_name}}"}</code> untuk menampilkan nama tamu secara dinamis dari URL (misal: <code className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono text-[9px]">?to=Nama+Tamu</code>).
            </p>
          </div>

          {/* Font Family Dropdown */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Font Family</label>
            <select
              value={selectedElement.fontFamily || 'Inter'}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-semibold text-slate-700"
            >
              {PRESET_FONTS.map((font) => (
                <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                  {font.name} ({font.type})
                </option>
              ))}
            </select>
          </div>

          {/* Size & Color */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Font Size (px)</label>
              <input
                type="number"
                value={selectedElement.fontSize || 12}
                onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 8 })}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-1.5 outline-none text-slate-700 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Text Color</label>
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-1.5 py-1 rounded-lg">
                <input
                  type="color"
                  value={toValid7CharHex(selectedElement.textColor, '#000000')}
                  onChange={(e) => handleUpdate({ textColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={(selectedElement.textColor || '#000000').toUpperCase()}
                  onChange={(e) => handleUpdate({ textColor: e.target.value })}
                  className="text-[9px] font-mono text-slate-600 outline-none w-full font-bold"
                />
              </div>
            </div>
          </div>

          {/* Alignment and Styles */}
          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Alignment & Emphasis</label>
            <div className="flex items-center justify-between">
              {/* Align Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 space-x-0.5">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                  const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                  const isActive = selectedElement.textAlign === align;
                  return (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ textAlign: align })}
                      className={`p-1.5 rounded transition-all ${isActive ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Bold & Italic Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 space-x-1">
                <button
                  onClick={() => handleUpdate({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded transition-all ${selectedElement.fontWeight === 'bold' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  B
                </button>
                <button
                  onClick={() => handleUpdate({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`px-2.5 py-1 text-xs italic font-semibold rounded transition-all ${selectedElement.fontStyle === 'italic' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  I
                </button>
              </div>
            </div>

            {/* Capitalization Case Toggles */}
            <div className="pt-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Text Case</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 space-x-1">
                {([
                  { value: 'none', label: 'As Typed', title: 'Normal text case as typed' },
                  { value: 'uppercase', label: 'UPPER', title: 'All letters capitalized (ABC)' },
                  { value: 'lowercase', label: 'lower', title: 'All letters small (abc)' },
                  { value: 'capitalize', label: 'Capital', title: 'First letter of each word capitalized (Abc)' }
                ] as const).map((caseOpt) => {
                  const isActive = (selectedElement.textTransform || 'none') === caseOpt.value;
                  return (
                    <button
                      key={caseOpt.value}
                      type="button"
                      onClick={() => handleUpdate({ textTransform: caseOpt.value })}
                      className={`flex-1 text-[9px] font-bold py-1 rounded transition-all ${
                        isActive ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={caseOpt.title}
                    >
                      {caseOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Letter Spacing (px)</label>
              <input
                type="number"
                step="0.5"
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => handleUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-1.5 outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Line Height</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="3"
                value={selectedElement.lineHeight || 1.2}
                onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) || 1.2 })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-1.5 outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Luxury Text Gradient */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Gradient Text</span>
              <input
                type="checkbox"
                checked={selectedElement.gradientText || false}
                onChange={(e) => handleUpdate({ gradientText: e.target.checked, gradientColors: e.target.checked ? ['#c5a880', '#e5cba3'] : undefined })}
                className="accent-blue-600 rounded border-slate-300"
              />
            </div>
            {selectedElement.gradientText && selectedElement.gradientColors && (
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center space-x-1 bg-white p-1 rounded border border-slate-200">
                  <input
                    type="color"
                    value={toValid7CharHex(selectedElement.gradientColors[0], '#c5a880')}
                    onChange={(e) => {
                      const colors = [...(selectedElement.gradientColors || [])];
                      colors[0] = e.target.value;
                      handleUpdate({ gradientColors: colors });
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[8px] font-mono font-bold">{selectedElement.gradientColors[0]}</span>
                </div>
                <div className="flex items-center space-x-1 bg-white p-1 rounded border border-slate-200">
                  <input
                    type="color"
                    value={toValid7CharHex(selectedElement.gradientColors[1], '#e5cba3')}
                    onChange={(e) => {
                      const colors = [...(selectedElement.gradientColors || [])];
                      colors[1] = e.target.value;
                      handleUpdate({ gradientColors: colors });
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[8px] font-mono font-bold">{selectedElement.gradientColors[1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Text Border / Outline */}
          <div className="space-y-3 pt-2 border-t border-slate-100/50">
            <label className="text-[9px] text-slate-400 font-bold uppercase block">Garis Tepi Teks (Text Outline)</label>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 font-bold uppercase">Ketebalan (px)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={selectedElement.outlineWidth || 0}
                  onChange={(e) => handleUpdate({ outlineWidth: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 font-bold uppercase">Warna Outline</label>
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                  <input
                    type="color"
                    value={toValid7CharHex(selectedElement.outlineColor, '#D4AF37')}
                    onChange={(e) => handleUpdate({ outlineColor: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(selectedElement.outlineColor || '#D4AF37').toUpperCase()}
                    onChange={(e) => handleUpdate({ outlineColor: e.target.value })}
                    className="text-[9px] font-mono text-slate-600 outline-none w-14 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PROPERTIES */}
      {selectedElement.type === 'image' && !showAnimSection && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <span>🖼</span>
            <span>Image & Frame</span>
          </h4>

          {/* Frame Style Selector */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Frame Style</label>
            <select
              value={selectedElement.frameStyle || ''}
              onChange={(e) => handleUpdate({ frameStyle: e.target.value || undefined })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-semibold text-slate-700"
            >
              <option value="">No Frame</option>
              <option value="classic_arch_gold">Classic Arch Gold</option>
              <option value="organic_asymmetric">Organic Asymmetric</option>
              <option value="gilded_vintage_filigree">Gilded Filigree</option>
              <option value="javanese_joglo_gunungan">Javanese Gunungan</option>
              <option value="royal_double_fine">Royal Double</option>
              <option value="torn_paper_boho">Torn Paper Boho</option>
              <option value="minimal_circle">Minimalist Circle</option>
              <option value="boho_hexagon">Boho Hexagon</option>
              <option value="luxury_heart">Luxury Heart</option>
              <option value="retro_polaroid">Retro Polaroid</option>
            </select>
          </div>

          {/* Filter Controls */}
          <div className="space-y-3">
            <label className="text-[9px] text-slate-400 font-bold uppercase block">Image Filters</label>

            {/* Blur */}
            <div>
              <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                <span>Blur</span>
                <span className="font-mono">{selectedElement.blur || 0}px</span>
              </div>
              <input
                type="range" min="0" max="20" step="0.5"
                value={selectedElement.blur || 0}
                onChange={(e) => handleUpdate({ blur: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                <span>Brightness</span>
                <span className="font-mono">{(selectedElement.brightness ?? 1).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.2" max="2" step="0.05"
                value={selectedElement.brightness ?? 1}
                onChange={(e) => handleUpdate({ brightness: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                <span>Contrast</span>
                <span className="font-mono">{(selectedElement.contrast ?? 1).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.2" max="2" step="0.05"
                value={selectedElement.contrast ?? 1}
                onChange={(e) => handleUpdate({ contrast: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hue */}
            <div>
              <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                <span>Hue</span>
                <span className="font-mono">{selectedElement.hueRotate || 0}°</span>
              </div>
              <input
                type="range" min="0" max="360" step="1"
                value={selectedElement.hueRotate || 0}
                onChange={(e) => handleUpdate({ hueRotate: parseInt(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Corner Rounding</span>
              <span className="font-mono text-slate-600">{selectedElement.borderRadius || 0}px</span>
            </div>
            <input
              type="range" min="0" max="200"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Width (px)</label>
              <input
                type="number" min="0" max="20"
                value={selectedElement.borderWidth || 0}
                onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Color</label>
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
                <input
                  type="color"
                  value={toValid7CharHex(selectedElement.borderColor, '#D4AF37')}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={(selectedElement.borderColor || '#D4AF37').toUpperCase()}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  className="text-[9px] font-mono text-slate-600 outline-none w-14 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Drop Shadow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Drop Shadow</span>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.shadowColor, '#000000')}
                onChange={(e) => handleUpdate({ shadowColor: e.target.value })}
                className="w-4 h-4 cursor-pointer p-0 border-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div>
                <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                  <span>Blur</span>
                  <span className="font-mono">{selectedElement.shadowBlur || 0}px</span>
                </div>
                <input
                  type="range" min="0" max="50"
                  value={selectedElement.shadowBlur || 0}
                  onChange={(e) => handleUpdate({ shadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                  <span>Offset Y</span>
                  <span className="font-mono">{selectedElement.shadowOffsetY || 0}px</span>
                </div>
                <input
                  type="range" min="-20" max="20"
                  value={selectedElement.shadowOffsetY || 0}
                  onChange={(e) => handleUpdate({ shadowOffsetY: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Color Tint for SVG/Vector assets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Vector Tint / Recolor</span>
              <input
                type="checkbox"
                checked={!!(selectedElement.colorTint && selectedElement.colorTint !== 'none')}
                onChange={(e) => handleUpdate({ colorTint: e.target.checked ? '#D4AF37' : 'none' })}
                className="accent-blue-600 rounded"
              />
            </div>
            {selectedElement.colorTint && selectedElement.colorTint !== 'none' && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl animate-in slide-in-from-top-1 duration-150">
                <input
                  type="color"
                  value={toValid7CharHex(selectedElement.colorTint, '#D4AF37')}
                  onChange={(e) => handleUpdate({ colorTint: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={(selectedElement.colorTint || '#D4AF37').toUpperCase()}
                  onChange={(e) => handleUpdate({ colorTint: e.target.value })}
                  className="text-xs font-mono font-semibold text-slate-700 bg-transparent outline-none flex-1"
                />
              </div>
            )}
          </div>

          {/* Lightbox / Gallery Option */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Lightbox Foto Gallery</span>
                <span className="text-[7.5px] text-slate-450 leading-none block">Bisa diklik untuk memperbesar gambar di preview</span>
              </div>
              <input
                type="checkbox"
                checked={!!selectedElement.isGalleryPhoto}
                onChange={(e) => handleUpdate({ isGalleryPhoto: e.target.checked })}
                className="accent-blue-600 rounded cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        </div>
      )}

      {/* SHAPE/DECORATIVE PROPERTIES */}
      {selectedElement.type === 'shape' && !showAnimSection && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shape Styles</h4>
          
          {/* Fill Color */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Fill Color</label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
              <input
                type="color"
                value={toValid7CharHex(selectedElement.backgroundColor, '#E6D2B1')}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={(selectedElement.backgroundColor || '#E6D2B1').toUpperCase()}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="text-xs font-mono font-semibold text-slate-700 bg-transparent outline-none flex-1"
              />
            </div>
          </div>

          {/* Borders */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Width (px)</label>
              <input
                type="number"
                value={selectedElement.borderWidth || 0}
                onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Color</label>
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
                <input
                  type="color"
                  value={toValid7CharHex(selectedElement.borderColor, '#D4AF37')}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={(selectedElement.borderColor || '#D4AF37').toUpperCase()}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  className="text-[9px] font-mono text-slate-600 outline-none w-14 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Corner Rounding</span>
              <span className="font-mono text-slate-600">{selectedElement.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Shadows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Drop Shadow</span>
              <div className="flex items-center space-x-1">
                <input
                  type="color"
                  value={toValid7CharHex(selectedElement.shadowColor, '#000000')}
                  onChange={(e) => handleUpdate({ shadowColor: e.target.value })}
                  className="w-4 h-4 cursor-pointer p-0 border-0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                  <span>Blur</span>
                  <span className="font-mono">{selectedElement.shadowBlur || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={selectedElement.shadowBlur || 0}
                  onChange={(e) => handleUpdate({ shadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[8px] font-semibold text-slate-500 mb-0.5">
                  <span>Offset Y</span>
                  <span className="font-mono">{selectedElement.shadowOffsetY || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={selectedElement.shadowOffsetY || 0}
                  onChange={(e) => handleUpdate({ shadowOffsetY: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIVIDER PROPERTIES */}
      {selectedElement.type === 'divider' && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Divider line</h4>
          
          {/* Accent Color */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Divider Color</label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
              <input
                type="color"
                value={toValid7CharHex(selectedElement.backgroundColor, '#D4AF37')}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={(selectedElement.backgroundColor || '#D4AF37').toUpperCase()}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="text-xs font-mono font-semibold text-slate-700 bg-transparent outline-none flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* BUTTON STYLING */}
      {selectedElement.type === 'button' && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Button Styling</h4>
          
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Button Text</label>
            <input
              type="text"
              value={selectedElement.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Background</label>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.backgroundColor, '#0F172A')}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded border-0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Text Color</label>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.textColor, '#FFFFFF')}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded border-0"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Corner Rounding</span>
              <span className="font-mono text-slate-600">{selectedElement.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Action Settings */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Aksi Tombol (Button Action)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ buttonAction: 'open_invitation' })}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  (!selectedElement.buttonAction || selectedElement.buttonAction === 'open_invitation')
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Buka Undangan
              </button>
              <button
                type="button"
                onClick={() => handleUpdate({ buttonAction: 'open_link' })}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  selectedElement.buttonAction === 'open_link'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Buka Link URL
              </button>
            </div>
          </div>

          {selectedElement.buttonAction === 'open_link' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Tautan Link URL</label>
              <input
                type="text"
                value={selectedElement.buttonLink || ''}
                onChange={(e) => handleUpdate({ buttonLink: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700 placeholder-slate-400 font-mono"
              />
            </div>
          )}
        </div>
      )}

      {/* IMAGE PROPERTIES */}
      {selectedElement.type === 'image' && !showAnimSection && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image Filter & Frame</h4>

          {onCropClick && (
            <button
              onClick={() => onCropClick(selectedElement.id)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all border border-blue-700 cursor-pointer"
              title="Crop or edit image aspect ratio"
            >
              <span>✂️</span>
              <span>Potong Gambar (Crop)</span>
            </button>
          )}

          {/* Edit Image Source directly */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase">Source URL</label>
            <input
              id="property-image-src"
              type="text"
              value={selectedElement.src || ''}
              onChange={(e) => handleUpdate({ src: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 outline-none text-slate-700 font-mono truncate"
            />
          </div>

          {/* Corner Rounding */}
          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
              <span>Border Radius</span>
              <span className="font-mono text-slate-600">{selectedElement.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Border details */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Width (px)</label>
              <input
                type="number"
                value={selectedElement.borderWidth || 0}
                onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Color</label>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.borderColor, '#D4AF37')}
                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                className="w-full h-8 cursor-pointer border-0 rounded"
              />
            </div>
          </div>

          {/* CSS Filter Sliders: Blur, Brightness, Contrast */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Filters</span>
            
            {/* Blur */}
            <div>
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                <span>Blur</span>
                <span className="font-mono">{selectedElement.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedElement.blur || 0}
                onChange={(e) => handleUpdate({ blur: parseInt(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                <span>Brightness</span>
                <span className="font-mono">{Math.round((selectedElement.brightness ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={selectedElement.brightness ?? 1}
                onChange={(e) => handleUpdate({ brightness: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                <span>Contrast</span>
                <span className="font-mono">{Math.round((selectedElement.contrast ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={selectedElement.contrast ?? 1}
                onChange={(e) => handleUpdate({ contrast: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hue */}
            <div>
              <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                <span>Hue</span>
                <span className="font-mono">{selectedElement.hueRotate || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={selectedElement.hueRotate || 0}
                onChange={(e) => handleUpdate({ hueRotate: parseInt(e.target.value) })}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Vector Tint / Recolor Option */}
            <div className="space-y-2 pt-2 border-t border-slate-150">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Vector Tint / Recolor</span>
                <input
                  type="checkbox"
                  checked={!!selectedElement.colorTint && selectedElement.colorTint !== 'none'}
                  onChange={(e) => handleUpdate({ colorTint: e.target.checked ? '#D4AF37' : 'none' })}
                  className="w-4 h-4 accent-blue-600 rounded border-slate-300 cursor-pointer"
                />
              </div>
              {selectedElement.colorTint && selectedElement.colorTint !== 'none' && (
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl animate-in slide-in-from-top-1">
                  <input
                    type="color"
                    value={toValid7CharHex(selectedElement.colorTint, '#D4AF37')}
                    onChange={(e) => handleUpdate({ colorTint: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={selectedElement.colorTint.toUpperCase()}
                    onChange={(e) => handleUpdate({ colorTint: e.target.value })}
                    className="text-xs font-mono font-bold text-slate-700 bg-transparent outline-none flex-1"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* WIDGET INTERACTIVE SETTINGS */}
      {selectedElement.type === 'widget' && !showAnimSection && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="capitalize">{selectedElement.widgetType} Config</span>
          </h4>

          {/* Widget Backdrop Styling */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Backpack Fill</label>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.backgroundColor, '#FFFFFF')}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded border-0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Border Color</label>
              <input
                type="color"
                value={toValid7CharHex(selectedElement.borderColor, '#E2E8F0')}
                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded border-0"
              />
            </div>
          </div>

          {/* Widget Type Specific Config Inputs */}
          {selectedElement.widgetType === 'countdown' && (
            <div className="space-y-3.5 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Countdown Title</span>
                </label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.title || 'DAYS UNTIL WEDDING'}
                  onChange={(e) => handleWidgetConfigUpdate({ title: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Target Date & Time</label>
                <input
                  type="datetime-local"
                  value={selectedElement.widgetConfig?.targetDate || '2026-12-18T16:00:00'}
                  onChange={(e) => handleWidgetConfigUpdate({ targetDate: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="flex items-center justify-between p-1 pt-1.5 border-t border-slate-100">
                <label className="text-[9px] text-slate-500 font-bold uppercase cursor-pointer" htmlFor="hide-bg-countdown">
                  Sembunyikan Background
                </label>
                <input
                  id="hide-bg-countdown"
                  type="checkbox"
                  checked={selectedElement.hideBackground || false}
                  onChange={(e) => handleUpdate({ hideBackground: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {selectedElement.widgetType === 'rsvp' && (
            <div className="space-y-4 animate-in slide-in-from-top-1">
              {/* Content configuration */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RSVP Content</h4>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">RSVP Title</label>
                  <input
                    type="text"
                    value={selectedElement.widgetConfig?.title || 'Konfirmasi Kehadiran'}
                    onChange={(e) => handleWidgetConfigUpdate({ title: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 outline-none text-slate-700 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">RSVP Subtitle</label>
                  <textarea
                    value={selectedElement.widgetConfig?.subtitle || 'Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan jamuan terbaik.'}
                    onChange={(e) => handleWidgetConfigUpdate({ subtitle: e.target.value })}
                    rows={2}
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 outline-none text-slate-700 transition-all resize-none font-medium text-slate-600"
                  />
                </div>
              </div>

              {/* Styles configuration */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RSVP Theme & Colors</h4>
                
                {/* 1. Background Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Background Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.backgroundColor, '#FFFFFF')}
                      onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.backgroundColor || '#FFFFFF').toUpperCase()}
                      onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-600 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 2. Text Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Text & Label Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.textColor, '#2D271E')}
                      onChange={(e) => handleUpdate({ textColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.textColor || '#2D271E').toUpperCase()}
                      onChange={(e) => handleUpdate({ textColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 3. Border Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-455 font-bold uppercase">Border Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.borderColor, '#D4AF37')}
                      onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.borderColor || '#D4AF37').toUpperCase()}
                      onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 4. Button Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Button Background Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.widgetConfig?.buttonColor, '#D4AF37')}
                      onChange={(e) => handleWidgetConfigUpdate({ buttonColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.widgetConfig?.buttonColor || '#D4AF37').toUpperCase()}
                      onChange={(e) => handleWidgetConfigUpdate({ buttonColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 5. Button Text Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Button Text Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.widgetConfig?.buttonTextColor, '#111625')}
                      onChange={(e) => handleWidgetConfigUpdate({ buttonTextColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.widgetConfig?.buttonTextColor || '#111625').toUpperCase()}
                      onChange={(e) => handleWidgetConfigUpdate({ buttonTextColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 6. Input Background Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Input Field Background Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.widgetConfig?.inputBgColor, '#F8FAFC')}
                      onChange={(e) => handleWidgetConfigUpdate({ inputBgColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.widgetConfig?.inputBgColor || '#F8FAFC').toUpperCase()}
                      onChange={(e) => handleWidgetConfigUpdate({ inputBgColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>

                {/* 7. Input Text Color */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 font-bold uppercase">Input Field Text Color</label>
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input
                      type="color"
                      value={toValid7CharHex(selectedElement.widgetConfig?.inputTextColor, '#1E293B')}
                      onChange={(e) => handleWidgetConfigUpdate({ inputTextColor: e.target.value })}
                      className="w-6 h-6 rounded border-0 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={(selectedElement.widgetConfig?.inputTextColor || '#1E293B').toUpperCase()}
                      onChange={(e) => handleWidgetConfigUpdate({ inputTextColor: e.target.value })}
                      className="text-[9px] font-mono text-slate-650 outline-none w-full font-bold bg-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2 pt-3">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>Current Responses</span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{selectedElement.widgetConfig?.rsvpSubmissionCount || 0} RSVPs</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleWidgetConfigUpdate({ rsvpSubmissionCount: (selectedElement.widgetConfig?.rsvpSubmissionCount || 0) + 1 })}
                  className="w-full py-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded transition-all cursor-pointer"
                >
                  Simulate New RSVP (+1)
                </button>
              </div>
            </div>
          )}

          {selectedElement.widgetType === 'gift' && (
            <div className="space-y-3 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase block">Desain Kartu Rekening</label>
                <select
                  value={selectedElement.widgetConfig?.giftCardStyle || 'bca-blue'}
                  onChange={(e) => handleWidgetConfigUpdate({ giftCardStyle: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700 cursor-pointer"
                >
                  <option value="bca-blue">BCA Blue Debit Card</option>
                  <option value="mandiri-navy">Mandiri Navy & Gold Card</option>
                  <option value="bni-emerald">BNI Emerald Green Card</option>
                  <option value="luxury-gold">Luxury Gold & Black VIP</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <CreditCard className="w-3 h-3 text-slate-500" />
                  <span>Bank or Wallet Name</span>
                </label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.giftBankName || 'Bank BCA'}
                  onChange={(e) => handleWidgetConfigUpdate({ giftBankName: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Account Number</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.giftAccountNumber || '843-0912-881'}
                  onChange={(e) => handleWidgetConfigUpdate({ giftAccountNumber: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Recipient Name</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.giftRecipientName || 'Groom/Bride Name'}
                  onChange={(e) => handleWidgetConfigUpdate({ giftRecipientName: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
            </div>
          )}

          {(selectedElement.widgetType === 'maps' || selectedElement.widgetType === 'location') && (
            <div className="space-y-3 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>Venue Location Name</span>
                </label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.eventLocationName || 'The Glass Greenhouse'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventLocationName: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Google Maps URL</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.mapUrl || 'https://maps.google.com/?q=New+York'}
                  onChange={(e) => handleWidgetConfigUpdate({ mapUrl: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700 font-mono text-[10px]"
                />
              </div>
              <div className="flex items-center justify-between p-1 pt-1.5 border-t border-slate-100">
                <label className="text-[9px] text-slate-500 font-bold uppercase cursor-pointer" htmlFor="hide-bg-maps">
                  Sembunyikan Background
                </label>
                <input
                  id="hide-bg-maps"
                  type="checkbox"
                  checked={selectedElement.hideBackground || false}
                  onChange={(e) => handleUpdate({ hideBackground: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {selectedElement.widgetType === 'event' && (
            <div className="space-y-3 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase block">Gaya Kartu Acara</label>
                <select
                  value={selectedElement.widgetConfig?.eventCardStyle || 'classic-arch'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventCardStyle: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700 cursor-pointer"
                >
                  <option value="classic-arch">🏛️ Classic Arch (Melengkung Atas)</option>
                  <option value="rustic-oval">🍃 Rustic Oval (Bulat Telur)</option>
                  <option value="modern-square">⬛ Modern Square (Kotak Tegas)</option>
                  <option value="luxury-ticket">🎫 Luxury Ticket (Kupon Prive)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Event Title</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.title || 'THE RECEPTION'}
                  onChange={(e) => handleWidgetConfigUpdate({ title: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Event Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={selectedElement.widgetConfig?.eventDate || '2026-10-24'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventDate: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Event Time</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.eventTime || '06:00 PM - 10:00 PM'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventTime: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Location Name</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.eventLocationName || 'The Ballroom'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventLocationName: e.target.value })}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Full Address</label>
                <textarea
                  value={selectedElement.widgetConfig?.eventAddress || '123 Main Street, New York'}
                  onChange={(e) => handleWidgetConfigUpdate({ eventAddress: e.target.value })}
                  rows={2}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-700"
                />
              </div>
            </div>
          )}
          
          {selectedElement.widgetType === 'music' && (
            <div className="space-y-3 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Gaya Piringan Musik</label>
                <select
                  value={selectedElement.widgetConfig?.musicStyle || 'vinyl'}
                  onChange={(e) => handleWidgetConfigUpdate({ musicStyle: e.target.value })}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 transition-all focus:border-blue-400"
                >
                  <option value="vinyl">🕶️ Classic Vinyl (Black & Gold)</option>
                  <option value="gold-wreath">🌸 Rose Gold Wreath</option>
                  <option value="traditional-gong">🪘 Traditional Gong Jawa</option>
                  <option value="neon-heart">❤️ Modern Neon Heart</option>
                  <option value="royal-lace">👑 Vintage Royal Lace</option>
                </select>
              </div>
            </div>
          )}

          {selectedElement.widgetType === 'gallery' && (() => {
            const currentImages = selectedElement.widgetConfig?.images || [];
            const layoutStyle = selectedElement.widgetConfig?.galleryStyle || 'slide';
            const ratio = selectedElement.widgetConfig?.aspectRatio || '1:1';

            const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.files) return;
              const files = Array.from(e.target.files);
              
              const newImages = [...currentImages];
              for (const file of files) {
                if (newImages.length >= 10) {
                  alert('Maksimal 10 foto diperbolehkan di galeri!');
                  break;
                }
                try {
                  const compressed = await compressImage(file, 800, 800, 0.7);
                  newImages.push(compressed);
                } catch (err) {
                  console.error('Failed to compress file:', err);
                }
              }
              handleWidgetConfigUpdate({ images: newImages });
            };

            const handleRemoveImage = (indexToRemove: number) => {
              const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
              handleWidgetConfigUpdate({ images: newImages });
            };

            return (
              <div className="space-y-3 animate-in slide-in-from-top-1 text-slate-800">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Judul Galeri</label>
                  <input
                    type="text"
                    value={selectedElement.widgetConfig?.title || 'Galeri Foto'}
                    onChange={(e) => handleWidgetConfigUpdate({ title: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Gallery Layout Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Layout Galeri</label>
                  <select
                    value={layoutStyle}
                    onChange={(e) => handleWidgetConfigUpdate({ galleryStyle: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 focus:border-blue-400 transition-all cursor-pointer"
                  >
                    <option value="slide">🎠 Slide Carousel (Geser Kiri/Kanan)</option>
                    <option value="grid">🔲 Grid Masonry (Kotak Tiled)</option>
                    <option value="collage">🖼️ Collage (Kolase Artistik)</option>
                  </select>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Rasio Foto</label>
                  <select
                    value={ratio}
                    onChange={(e) => handleWidgetConfigUpdate({ aspectRatio: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 focus:border-blue-400 transition-all cursor-pointer"
                  >
                    <option value="1:1">1:1 Square (Kotak)</option>
                    <option value="4:3">4:3 Classic (Foto Standar)</option>
                    <option value="16:9">16:9 Landscape (Lebar)</option>
                    <option value="9:16">9:16 Portrait (Tinggi/Story)</option>
                  </select>
                </div>

                {/* Thumbnails & Upload section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Daftar Foto ({currentImages.length}/10)</label>
                  </div>
                  
                  {/* Thumbnails grid */}
                  {currentImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-28 overflow-y-auto">
                      {currentImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 bg-white">
                          <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[10px]"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button wrapper */}
                  {currentImages.length < 10 && (
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUploadFile}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full py-2 bg-blue-50 border border-dashed border-blue-200 text-blue-600 text-center rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center space-x-1 cursor-pointer">
                        <span className="text-xs font-bold">📤 Upload Foto Galeri (+)</span>
                      </div>
                    </div>
                  )}
                  <p className="text-[8px] text-slate-400 leading-normal">
                    Pilih file gambar dari komputer/HP Anda. Gambar akan otomatis di-resize dan dikompres sebelum dimasukkan.
                  </p>
                </div>
              </div>
            );
          })()}

          {selectedElement.widgetType === 'video' && (
            <div className="space-y-3 animate-in slide-in-from-top-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Judul Video</label>
                <input
                  type="text"
                  value={selectedElement.widgetConfig?.title || 'Video Undangan'}
                  onChange={(e) => handleWidgetConfigUpdate({ title: e.target.value })}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Tautan Youtube</label>
                <input
                  type="text"
                  placeholder="Contoh: https://www.youtube.com/watch?v=..."
                  value={selectedElement.widgetConfig?.videoUrl || ''}
                  onChange={(e) => handleWidgetConfigUpdate({ videoUrl: e.target.value })}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 outline-none text-slate-700 focus:border-blue-400 transition-all font-mono text-[10px]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
