
import React from 'react';
import { Palette, Layers, RefreshCw, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { BackgroundSettings } from '../../types';
import { PRESET_BACKGROUNDS } from '../../utils/defaults';



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

interface BackgroundPanelProps {
  background: BackgroundSettings;
  onChangeBackground: (bg: BackgroundSettings) => void;
}

export default function BackgroundPanel({ background, onChangeBackground }: BackgroundPanelProps) {
  const [bgUploading, setBgUploading] = React.useState(false);

  // Helper to compress background image to avoid massive state
  const compressBackgroundImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
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
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setBgUploading(true);
      try {
        const compressed = await compressBackgroundImage(file, 800, 800, 0.7);
        onChangeBackground({
          ...background,
          imageUrl: compressed,
        });
      } catch (err) {
        console.error('Failed to compress background image:', err);
      } finally {
        setBgUploading(false);
      }
    }
  };

  const handleClearBgImage = () => {
    onChangeBackground({
      ...background,
      imageUrl: '',
    });
  };

  const setSolidColor = (color: string) => {
    onChangeBackground({
      ...background,
      type: 'color',
      color,
    });
  };

  const setGradient = (start: string, end: string, angle = 135) => {
    onChangeBackground({
      ...background,
      type: 'gradient',
      gradientStart: start,
      gradientEnd: end,
      gradientAngle: angle,
    });
  };

  const handlePresetClick = (preset: any) => {
    if (preset.type === 'color') {
      setSolidColor(preset.color);
    } else if (preset.type === 'gradient') {
      setGradient(preset.gradientStart, preset.gradientEnd, preset.gradientAngle);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Canvas Background</h3>
        <p className="text-xs text-slate-400 mt-1">Set a luxury backdrop theme for your single-page invitation card.</p>
      </div>

      {/* Mode Select */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => onChangeBackground({ ...background, type: 'color' })}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            background.type === 'color' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color</span>
        </button>
        <button
          onClick={() => onChangeBackground({ ...background, type: 'gradient' })}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            background.type === 'gradient' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Gradient</span>
        </button>
        <button
          onClick={() => onChangeBackground({ ...background, type: 'image' })}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            background.type === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>
      </div>

      {/* Image Setup */}
      {background.type === 'image' && (
        <div className="space-y-4 animate-in fade-in duration-200 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Background Image</label>
            
            {background.imageUrl ? (
              // Image preview & manage
              <div className="space-y-3">
                <div className="relative group w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <img 
                    src={background.imageUrl} 
                    alt="Background Preview" 
                    className="w-full h-full object-cover transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      type="button"
                      onClick={handleClearBgImage}
                      className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all shadow-md cursor-pointer"
                      title="Hapus Background"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('bg-file-replace-input')?.click()}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Ganti Gambar
                  </button>
                  <input
                    id="bg-file-replace-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleClearBgImage}
                    className="px-3 py-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              // Empty state dropzone
              <div 
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[140px]"
                onClick={() => document.getElementById('bg-file-input')?.click()}
              >
                <input
                  id="bg-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                />
                
                {bgUploading ? (
                  <div className="space-y-2">
                    <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mengunggah...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2.5 bg-blue-50 text-blue-500 rounded-full">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">
                      Pilih Foto Background Lokal
                    </div>
                    <div className="text-[9px] text-slate-400">PNG, JPEG, SVG (Kompres otomatis)</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solid Color Selection */}
      {background.type === 'color' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-2">Custom Color</label>
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <input
                type="color"
                value={toValid7CharHex(background.color, '#ffffff')}
                onChange={(e) => setSolidColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={background.color.toUpperCase()}
                onChange={(e) => setSolidColor(e.target.value)}
                className="text-xs font-mono font-semibold text-slate-700 bg-transparent outline-none flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      )}

      {/* Gradient Setup */}
      {background.type === 'gradient' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Start Color</label>
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-2 rounded-xl">
                <input
                  type="color"
                  value={toValid7CharHex(background.gradientStart, '#ffffff')}
                  onChange={(e) => setGradient(e.target.value, background.gradientEnd, background.gradientAngle)}
                  className="w-6 h-6 rounded-md cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={background.gradientStart.toUpperCase()}
                  onChange={(e) => setGradient(e.target.value, background.gradientEnd, background.gradientAngle)}
                  className="text-[10px] font-mono font-semibold text-slate-600 bg-transparent outline-none w-16"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">End Color</label>
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-2 rounded-xl">
                <input
                  type="color"
                  value={toValid7CharHex(background.gradientEnd, '#ffffff')}
                  onChange={(e) => setGradient(background.gradientStart, e.target.value, background.gradientAngle)}
                  className="w-6 h-6 rounded-md cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={background.gradientEnd.toUpperCase()}
                  onChange={(e) => setGradient(background.gradientStart, e.target.value, background.gradientAngle)}
                  className="text-[10px] font-mono font-semibold text-slate-600 bg-transparent outline-none w-16"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Gradient Angle</span>
              <span className="font-mono">{background.gradientAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={background.gradientAngle}
              onChange={(e) => setGradient(background.gradientStart, background.gradientEnd, parseInt(e.target.value))}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Preset Luxury Backgrounds */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Luxury Color Schemes</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {PRESET_BACKGROUNDS.map((preset, index) => {
            const isSelected = 
              background.type === preset.type &&
              (preset.type === 'color' 
                ? background.color.toLowerCase() === preset.color.toLowerCase()
                : background.gradientStart.toLowerCase() === preset.gradientStart.toLowerCase() &&
                  background.gradientEnd.toLowerCase() === preset.gradientEnd.toLowerCase());

            return (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className={`flex items-center space-x-2 p-2 rounded-xl text-left border hover:shadow-sm transition-all text-slate-700 ${
                  isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 border border-black/10"
                  style={{
                    background: preset.type === 'color' 
                      ? preset.color 
                      : `linear-gradient(${preset.gradientAngle}deg, ${preset.gradientStart}, ${preset.gradientEnd})`
                  }}
                />
                <span className="text-[10px] font-semibold truncate leading-tight">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Texture/Overlay Options */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Texture Overlays</h4>
        
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Overlay Opacity</span>
            <span className="font-mono">{Math.round(background.overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={background.overlayOpacity}
            onChange={(e) => onChangeBackground({ ...background, overlayOpacity: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Overlay Tint Color</label>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-2 rounded-xl">
            <input
              type="color"
              value={toValid7CharHex(background.overlayColor, '#000000')}
              onChange={(e) => onChangeBackground({ ...background, overlayColor: e.target.value })}
              className="w-6 h-6 rounded-md cursor-pointer border-0"
            />
            <input
              type="text"
              value={background.overlayColor.toUpperCase()}
              onChange={(e) => onChangeBackground({ ...background, overlayColor: e.target.value })}
              className="text-[10px] font-mono font-semibold text-slate-600 bg-transparent outline-none w-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
