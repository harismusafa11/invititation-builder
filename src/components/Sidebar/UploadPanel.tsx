
import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Plus, Trash2, Maximize, Heart, Crown, Flower, Shapes } from 'lucide-react';
import { BackgroundSettings } from '../../types';

interface UploadPanelProps {
  onAddImage: (url: string, name: string, overrides?: any) => void;
  onChangeBackground: (bg: BackgroundSettings) => void;
  currentBackground: BackgroundSettings;
  isPremium?: boolean;
  onRequestUpgrade?: () => void;
}

// Helper function to compress images using HTML5 Canvas
function compressImage(file: File, maxWidth = 600, maxHeight = 600, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
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
      img.onerror = () => reject(new Error('Failed to load image element'));
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function UploadPanel({ onAddImage, onChangeBackground, currentBackground, isPremium = false, onRequestUpgrade }: UploadPanelProps) {
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'florals' | 'luxury' | 'wedding'>('florals');
  const [globalTab, setGlobalTab] = useState<'uploads' | 'premium' | 'frames'>('premium');
  const [searchQuery, setSearchQuery] = useState('');

  const [assets, setAssets] = useState<{ id: string; name: string; url: string; category: string; premium?: boolean }[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const currentCategory = globalTab === 'frames' ? 'frames' : activeTab;

  useEffect(() => {
    setAssets([]);
    setPage(1);
    setHasMore(false);
    setAssetsLoading(true);

    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(() => {
      const fetchUrl = `/api/assets?page=1&limit=30&category=${currentCategory}&search=${encodeURIComponent(searchQuery)}`;
      fetch(fetchUrl, { signal })
        .then(res => res.json())
        .then(result => {
          if (result.success && Array.isArray(result.data)) {
            setAssets(result.data);
            setHasMore(result.hasMore || false);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to load assets:', err);
          }
        })
        .finally(() => {
          setAssetsLoading(false);
        });
    }, searchQuery ? 300 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentCategory, searchQuery]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const fetchUrl = `/api/assets?page=${nextPage}&limit=30&category=${currentCategory}&search=${encodeURIComponent(searchQuery)}`;

    fetch(fetchUrl)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setAssets(prev => [...prev, ...result.data]);
          setPage(nextPage);
          setHasMore(result.hasMore || false);
        }
      })
      .catch(err => console.error('Failed to load more assets:', err))
      .finally(() => {
        setLoadingMore(false);
      });
  };

  const handleSetBackground = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeBackground({
      ...currentBackground,
      type: 'image',
      imageUrl: url,
    });
  };

const compressImageClient = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1000;
        const maxH = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG at 75% quality for a very small file size (Base64)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

  // Upload file to server for auto-compression into dynamic webp static assets
  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.url) {
            const newImage = {
              id: Date.now().toString(),
              url: result.url,
              name: file.name.split('.')[0],
            };
            setUploadedImages((prev) => [newImage, ...prev]);
            // Auto add to canvas using optimized WebP URL
            onAddImage(newImage.url, newImage.name);
            return; // Successful server upload
          }
        }
      } catch (err) {
        console.warn('Server-side image upload failed, falling back to client-side compression:', err);
      }

      // Fallback: compress client-side and use Base64 data URL
      try {
        const compressedBase64 = await compressImageClient(file);
        const newImage = {
          id: Date.now().toString(),
          url: compressedBase64,
          name: file.name.split('.')[0],
        };
        setUploadedImages((prev) => [newImage, ...prev]);
        // Auto add to canvas
        onAddImage(newImage.url, newImage.name);
      } catch (fallbackErr) {
        console.error('Failed to compress image on client-side:', fallbackErr);
        alert('Gagal memproses gambar. Silakan coba file gambar lainnya.');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const deleteUploaded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // category definitions moved to top useEffect hook

  return (
    <div className="space-y-5">
      {/* Premium Main Tab Switcher */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
        <button
          type="button"
          onClick={() => setGlobalTab('premium')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${globalTab === 'premium'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Shapes className="w-3.5 h-3.5 text-blue-650 shrink-0" />
          <span>Elemen</span>
        </button>
        <button
          type="button"
          onClick={() => setGlobalTab('frames')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${globalTab === 'frames'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <span>🖼 Bingkai</span>
        </button>
        <button
          type="button"
          onClick={() => setGlobalTab('uploads')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${globalTab === 'uploads'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <span>📤 Upload</span>
        </button>
      </div>

      {/* RENDER TAB: UPLOADS */}
      {globalTab === 'uploads' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xs font-bold text-slate-700">File Unggahan Anda</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Unggah gambar pribadi Anda (foto mempelai, denah, dll) untuk ditaruh di canvas.</p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed border-slate-200 rounded-xl p-6 text-center transition-all cursor-pointer relative ${dragActive ? 'border-blue-400 bg-blue-50/50' : 'bg-slate-50 hover:bg-slate-100/50'
              }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2 text-slate-400">
              <Upload className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold">Pilih file atau seret ke sini</span>
              <span className="text-[9px] text-slate-500">Mendukung format PNG, JPG, SVG hingga 10MB</span>
            </div>
          </div>

          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Galeri Unggahan</span>
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onAddImage(img.url, img.name)}
                    className="group relative border border-slate-100 hover:border-blue-400 p-1.5 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-all h-16"
                  >
                    <img src={img.url} className="w-8 h-8 object-contain rounded" alt={img.name} />
                    <button
                      onClick={(e) => deleteUploaded(img.id, e)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-rose-600 rounded text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Hapus gambar"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Removed Gunakan Gambar Sampel section as requested */}
        </div>
      )}

      {/* RENDER TAB: PREMIUM LIBRARY */}
      {globalTab === 'premium' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xs font-bold text-slate-700">Elemen Ilustrasi</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Dekorasi ilustrasi vector untuk undangan yang elegan.</p>
          </div>

          {/* Search bar inside premium library */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari ilustrasi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Premium Categories sub-tabs */}
          <div className="flex border-b border-slate-100 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('florals')}
              className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${activeTab === 'florals'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              🌸 Florals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('luxury')}
              className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${activeTab === 'luxury'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              👑 Gold Luxury
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wedding')}
              className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${activeTab === 'wedding'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              💖 Icons
            </button>
          </div>

          {/* Premium Assets list */}
          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-0.5 pt-0.5">
            {assetsLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-slate-100 p-2 rounded-xl flex flex-col items-center justify-center bg-white animate-pulse h-20">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                  <div className="w-12 h-2 bg-slate-100 rounded mt-2"></div>
                </div>
              ))
            ) : (
              assets.map((asset, idx) => {
                const isLocked = asset.premium && !isPremium;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isLocked) {
                        onRequestUpgrade?.();
                        return;
                      }
                      onAddImage(asset.url, asset.name);
                    }}
                    className="group relative border border-slate-100 hover:border-blue-400 hover:shadow p-2 rounded-xl flex flex-col items-center justify-center bg-white cursor-pointer hover:scale-105 transition-all h-20"
                    title={isLocked ? `Premium - ${asset.name}` : `Tambah ${asset.name} ke canvas`}
                  >
                    <img
                      src={asset.url}
                      className="w-10 h-10 object-contain drop-shadow-sm group-hover:rotate-6 transition-all"
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <span className="text-[8px] text-slate-500 font-bold text-center truncate max-w-full block mt-1.5 px-0.5">
                      {asset.name}
                    </span>

                    {isLocked ? (
                      <div className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center text-white">
                        <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 uppercase tracking-wider">
                          👑 Lock
                        </span>
                      </div>
                    ) : (
                      /* Plus Overlay */
                      <div className="absolute inset-0 bg-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {!assetsLoading && assets.length === 0 && (
              <div className="col-span-3 text-center py-8 text-slate-400 text-[10px] font-semibold">
                Ilustrasi tidak ditemukan.
              </div>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="col-span-3 mt-3 py-2 bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 text-[9px] font-bold rounded-xl transition-all border border-slate-200/40 disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
              >
                {loadingMore ? (
                  <>
                    <span className="w-2.5 h-2.5 border border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    Memuat...
                  </>
                ) : (
                  <>Muat Lebih Banyak ✨</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER TAB: BINGKAI */}
      {globalTab === 'frames' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xs font-bold text-slate-700">Bingkai Foto Kolase</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Unggah dan gunakan frame estetik agar foto mempelai terlihat berkelas.</p>
          </div>

          {/* Search bar inside frames */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari bingkai..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-0.5">
            {assetsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-slate-150 p-2 rounded-xl bg-white animate-pulse h-32 flex flex-col justify-between">
                  <div className="w-full h-24 bg-slate-100 rounded-lg"></div>
                  <div className="w-16 h-2.5 bg-slate-100 rounded mt-2 mx-1"></div>
                </div>
              ))
            ) : (
              assets.map((asset, idx) => {
                const isLocked = asset.premium && !isPremium;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isLocked) {
                        onRequestUpgrade?.();
                        return;
                      }
                      onAddImage(asset.url, asset.name);
                    }}
                    className="group relative border border-slate-150 hover:border-blue-400 hover:shadow-md p-2 rounded-xl flex flex-col bg-white cursor-pointer hover:scale-[1.02] transition-all text-left"
                    title={isLocked ? `Premium - ${asset.name}` : `Tambah ${asset.name} ke canvas`}
                  >
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" loading="lazy" />

                      {isLocked ? (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white z-10">
                          <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-1 rounded-full shadow-md flex items-center gap-0.5 uppercase tracking-wider">
                            👑 Premium
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                          <span className="bg-blue-600 text-white font-bold text-[8px] px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Gunakan Bingkai
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-800 font-bold mt-1.5 block leading-tight truncate px-1">
                      {asset.name}
                    </span>
                  </div>
                );
              })
            )}

            {!assetsLoading && assets.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-400 text-[10px] font-semibold">
                Bingkai tidak ditemukan.
              </div>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="col-span-2 mt-3 py-2 bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 text-[9px] font-bold rounded-xl transition-all border border-slate-200/40 disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
              >
                {loadingMore ? (
                  <>
                    <span className="w-2.5 h-2.5 border border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    Memuat...
                  </>
                ) : (
                  <>Muat Lebih Banyak ✨</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
