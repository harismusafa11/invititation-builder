
import React, { useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Play, 
  Grid, 
  Magnet, 
  Smartphone, 
  Trash2, 
  FileJson, 
  Wand2, 
  FolderOpen,
  Cloud,
  CloudOff,
  Database,
  Plus,
  Code,
  Ruler,
  AlertCircle,
  Sun,
  Moon,
  SlidersHorizontal
} from 'lucide-react';
import { InvitationTemplate } from '../../types';
import { DEFAULT_TEMPLATES } from '../../utils/defaults';

interface TopbarProps {
  title: string;
  setTitle: (t: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  gridEnabled: boolean;
  setGridEnabled: (g: boolean) => void;
  snapEnabled: boolean;
  setSnapEnabled: (s: boolean) => void;
  safeAreaEnabled: boolean;
  setSafeAreaEnabled: (sa: boolean) => void;
  rulerEnabled: boolean;
  setRulerEnabled: (r: boolean) => void;
  onEmbedClick: () => void;
  onPreview: () => void;
  onClear: () => void;
  onLoadTemplate: (key: string) => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';
  dbError: string | null;
  onSaveToDb: () => void;
  onNewProjectClick: () => void;
  onExit?: () => void;
  selectedElementId?: string | null;
  isGuestMode?: boolean;
  onGuestSave?: () => void;
  isEditingTemplate?: boolean;
  customTemplates?: any[];
  onOpenPresets?: () => void;
  onReportBugClick?: () => void;
  editorTheme?: 'light' | 'dark';
  setEditorTheme?: (t: 'light' | 'dark') => void;
}

export default function Topbar({
  title,
  setTitle,
  canUndo,
  canRedo,
  undo,
  redo,
  zoom,
  setZoom,
  gridEnabled,
  setGridEnabled,
  snapEnabled,
  setSnapEnabled,
  safeAreaEnabled,
  setSafeAreaEnabled,
  rulerEnabled,
  setRulerEnabled,
  onEmbedClick,
  onPreview,
  onClear,
  onLoadTemplate,
  onImportJSON,
  saveStatus,
  dbError,
  onSaveToDb,
  onNewProjectClick,
  onExit,
  selectedElementId,
  isGuestMode = false,
  onGuestSave,
  isEditingTemplate = false,
  customTemplates = [],
  onOpenPresets,
  onReportBugClick,
  editorTheme = 'light',
  setEditorTheme,
}: TopbarProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);

  return (
    <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-3 md:px-6 z-50 select-none gap-2">
      {/* App Branding & Title */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-md shrink-0 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-xs md:text-sm font-semibold tracking-tight uppercase text-slate-500 leading-none">
              Invitation <span className="text-slate-900">Builder</span>
            </h1>
            <p className="text-[8px] md:text-[9px] font-sans text-slate-400 font-medium tracking-widest uppercase mt-0.5">Studio</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

        {onExit && (
          <button
            onClick={onExit}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-[9px] md:text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-200 shrink-0"
            title={isEditingTemplate ? "Kembali ke Panel Admin" : "Kembali ke Dashboard"}
          >
            <span>←</span>
            <span className="hidden sm:inline">{isEditingTemplate ? " Panel Admin" : " Dashboard"}</span>
          </button>
        )}

        {/* Editable Document Title */}
        <div className="flex items-center space-x-1.5">
          <input
            id="template-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs font-sans font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 transition-all outline-none w-20 sm:w-32 md:w-48"
            placeholder="Title"
          />
          {isEditingTemplate && (
            <span className="bg-amber-100 border border-amber-300 text-amber-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 hidden md:inline-block">
              👑 Template Admin
            </span>
          )}
        </div>

        {/* Database Save Status Indicator */}
        <div className="flex items-center space-x-2 pl-1">
          {isGuestMode ? (
            // Guest mode: call-to-action to login
            <button
              onClick={onGuestSave}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm animate-pulse shrink-0"
              title="Daftar atau masuk untuk menyimpan desain Anda"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Simpan — Login Dulu</span>
            </button>
          ) : (
            <>
              {saveStatus === 'saving' && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium rounded-full animate-pulse shrink-0">
                  <Cloud className="w-3.5 h-3.5 animate-bounce text-amber-500" />
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              )}
              {saveStatus === 'unsaved' && (
                <button
                  onClick={onSaveToDb}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 border border-amber-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm animate-pulse shrink-0"
                  title="Click to save design"
                >
                  <Cloud className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              )}
              {saveStatus === 'saved' && (
                <button
                  onClick={onSaveToDb}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-medium rounded-full hover:bg-emerald-100 transition-all cursor-pointer shrink-0"
                  title="All changes saved. Click to save again."
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Saved</span>
                </button>
              )}
              {saveStatus === 'error' && (
                <button
                  onClick={onSaveToDb}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium rounded-full hover:bg-rose-100 transition-all cursor-pointer shrink-0"
                  title={`Save failed: ${dbError}. Click to retry.`}
                >
                  <CloudOff className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline text-rose-600 font-semibold">DB Error</span>
                </button>
              )}
              {saveStatus === 'idle' && (
                <button
                  onClick={onSaveToDb}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-medium rounded-full hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                  title="Save design to database"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center Toolsets: Undo, Redo, Zoom, Grid, Snap */}
      <div className="flex items-center space-x-1 bg-slate-50/80 p-0.5 rounded-xl border border-slate-200">
        {/* Undo */}
        <button
          id="btn-undo"
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all ${
            canUndo 
              ? 'text-slate-600 hover:bg-white hover:shadow-xs' 
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          id="btn-redo"
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-all ${
            canRedo 
              ? 'text-slate-600 hover:bg-white hover:shadow-xs' 
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {/* Mobile-only: Tools dropdown trigger */}
        <div className="relative md:hidden">
          <button
            id="btn-mobile-tools"
            onClick={() => setShowMobileTools(!showMobileTools)}
            className={`p-1.5 rounded-lg transition-all ${
              showMobileTools
                ? 'bg-blue-50 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title="Pengaturan Tampilan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMobileTools && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowMobileTools(false)}
              />
              {/* Dropdown panel */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pengaturan Tampilan</div>

                {/* Grid */}
                <button
                  onClick={() => { setGridEnabled(!gridEnabled); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                    gridEnabled ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Grid className="w-4 h-4" />
                    <span className="text-xs font-semibold">Tampilkan Grid</span>
                  </span>
                  {gridEnabled && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">ON</span>}
                </button>

                {/* Ruler */}
                <button
                  onClick={() => { setRulerEnabled(!rulerEnabled); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                    rulerEnabled ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Ruler className="w-4 h-4" />
                    <span className="text-xs font-semibold">Penggaris</span>
                  </span>
                  {rulerEnabled && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">ON</span>}
                </button>

                {/* Snap */}
                <button
                  onClick={() => { setSnapEnabled(!snapEnabled); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                    snapEnabled ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Magnet className="w-4 h-4" />
                    <span className="text-xs font-semibold">Snap ke Grid</span>
                  </span>
                  {snapEnabled && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">ON</span>}
                </button>

                {/* Safe Area */}
                <button
                  onClick={() => { setSafeAreaEnabled(!safeAreaEnabled); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                    safeAreaEnabled ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-semibold">Safe Area HP</span>
                  </span>
                  {safeAreaEnabled && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">ON</span>}
                </button>

                {/* Dark Mode */}
                <button
                  onClick={() => { setEditorTheme?.(editorTheme === 'dark' ? 'light' : 'dark'); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                    editorTheme === 'dark' ? 'bg-slate-800 text-amber-400' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    {editorTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="text-xs font-semibold">{editorTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                  </span>
                  {editorTheme === 'dark' && <span className="text-[9px] font-bold bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded-full">ON</span>}
                </button>

                <div className="mx-4 my-1 h-[1px] bg-slate-100" />

                {/* Delete / Clear */}
                <button
                  onClick={() => { onClear(); setShowMobileTools(false); }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    {selectedElementId ? 'Hapus Elemen Terpilih' : 'Reset Kanvas'}
                  </span>
                </button>

                {/* Report Bug */}
                {onReportBugClick && (
                  <button
                    onClick={() => { onReportBugClick(); setShowMobileTools(false); }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 pb-3 text-amber-600 hover:bg-amber-50 transition-all"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">Laporkan Bug</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Desktop-only inline tools */}
        <div className="hidden md:flex items-center space-x-1">
          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>

          {/* Zoom Out */}
          <button
            id="btn-zoom-out"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-1.5 text-slate-600 hover:bg-white hover:shadow-xs rounded-lg transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Display */}
          <span className="text-[11px] font-mono text-slate-600 w-12 text-center select-none font-semibold">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            id="btn-zoom-in"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-1.5 text-slate-600 hover:bg-white hover:shadow-xs rounded-lg transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>

          {/* Toggle Grid */}
          <button
            id="btn-toggle-grid"
            onClick={() => setGridEnabled(!gridEnabled)}
            className={`p-1.5 rounded-lg transition-all ${
              gridEnabled 
                ? 'bg-blue-50 text-blue-600 shadow-xs' 
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title="Toggle Grid Lines"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Ruler */}
          <button
            id="btn-toggle-ruler"
            onClick={() => setRulerEnabled(!rulerEnabled)}
            className={`p-1.5 rounded-lg transition-all ${
              rulerEnabled 
                ? 'bg-blue-50 text-blue-600 shadow-xs' 
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title="Toggle Ruler (Penggaris)"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Snap */}
          <button
            id="btn-toggle-snap"
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`p-1.5 rounded-lg transition-all ${
              snapEnabled 
                ? 'bg-blue-50 text-blue-600 shadow-xs' 
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title="Snap to Grid"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Safe Area */}
          <button
            id="btn-toggle-safe-area"
            onClick={() => setSafeAreaEnabled(!safeAreaEnabled)}
            className={`p-1.5 rounded-lg transition-all ${
              safeAreaEnabled 
                ? 'bg-blue-50 text-blue-600 shadow-xs' 
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title="Show Phone Safe Area Margins"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>

          {/* Toggle Theme */}
          <button
            onClick={() => setEditorTheme?.(editorTheme === 'dark' ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg transition-all ${
              editorTheme === 'dark' 
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
                : 'text-slate-500 hover:bg-white hover:shadow-xs'
            }`}
            title={editorTheme === 'dark' ? "Mode Terang" : "Mode Gelap"}
          >
            {editorTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Right Toolsets: Presets, Upload JSON, Save, Preview, Reset */}
      <div className="flex items-center space-x-1.5">
        {/* New Project Button */}
        <button
          id="btn-new-project-trigger"
          onClick={onNewProjectClick}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-sans font-semibold rounded-lg transition-all"
          title="Create a brand new invitation project"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>New Project</span>
        </button>

        {/* Templates Presets Dropdown */}
        <div className="hidden md:block relative">
          <button
            id="btn-presets"
            onClick={() => {
              if (!showPresets) {
                onOpenPresets?.();
              }
              setShowPresets(!showPresets);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-sans font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          {showPresets && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-20 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Load Luxury Presets
              </div>
            {Object.keys(DEFAULT_TEMPLATES)
              .filter((key) => {
                const builtinDbId = `builtin-${key}`;
                return customTemplates.length === 0 || customTemplates.some(t => t.id === builtinDbId);
              })
              .map((key) => {
                 const builtinDbId = `builtin-${key}`;
                 const foundBuiltinDb = customTemplates.find(t => t.id === builtinDbId);
                 const displayName = foundBuiltinDb ? foundBuiltinDb.title : DEFAULT_TEMPLATES[key].name;
                 return (
                   <button
                     key={key}
                     onClick={() => {
                       onLoadTemplate(key);
                       setShowPresets(false);
                     }}
                     className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center space-x-2 cursor-pointer"
                   >
                     <Wand2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                     <span className="font-semibold truncate">{displayName}</span>
                   </button>
                 );
               })}

              {customTemplates
                .filter((t: any) => !t.id.startsWith('builtin-'))
                .map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onLoadTemplate(t.id);
                      setShowPresets(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold truncate">{t.title}</span>
                  </button>
                ))}

            </div>
          )}
        </div>

        {/* Import JSON Input */}
        <label
          id="label-import-json"
          htmlFor="import-json-file"
          className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs"
          title="Import invitation JSON template"
        >
          <FileJson className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
          <input
            id="import-json-file"
            type="file"
            accept=".json"
            onChange={onImportJSON}
            className="hidden"
          />
        </label>

        {/* Clear Button */}
        <button
          id="btn-clear-canvas"
          onClick={onClear}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          title={selectedElementId ? "Hapus Elemen Terpilih" : "Reset Kanvas"}
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>

        {/* Report Bug Button */}
        {onReportBugClick && (
          <button
            onClick={onReportBugClick}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
            title="Laporkan Bug / Kendala"
          >
            <AlertCircle className="w-4.5 h-4.5" />
          </button>
        )}

        <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

        {/* Embed HTML Button */}
        <button
          id="btn-embed-html"
          onClick={onEmbedClick}
          className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
          title="Salin kode embed iframe"
        >
          <Code className="w-3.5 h-3.5 text-blue-600" />
          <span>Embed HTML</span>
        </button>

        {/* Live Animated Preview Button */}
        <button
          id="btn-preview-invitation"
          onClick={onPreview}
          className="flex items-center space-x-1.5 px-3 md:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
          title="Preview Undangan"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>
    </header>
  );
}
