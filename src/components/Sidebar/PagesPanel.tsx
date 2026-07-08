
import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Copy, 
  FileText,
  ChevronUp,
  ChevronDown,
  Layout,
  Check,
  X
} from 'lucide-react';
import { InvitationPage } from '../../types';

interface PagesPanelProps {
  pages: InvitationPage[];
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onReorderPages: (pages: InvitationPage[]) => void;
  onUpdatePage: (index: number, updates: Partial<InvitationPage>) => void;
}

export default function PagesPanel({
  pages,
  activePageIndex,
  setActivePageIndex,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
  onUpdatePage,
}: PagesPanelProps) {
  
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const newPages = [...pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);
    onReorderPages(newPages);
    
    // Maintain active page focus
    if (activePageIndex === fromIndex) {
      setActivePageIndex(toIndex);
    } else if (activePageIndex === toIndex) {
      setActivePageIndex(fromIndex);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Pages</h2>
          <p className="text-xs text-slate-400 font-medium">Manage invitation sections</p>
        </div>
        <button
          onClick={onAddPage}
          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm"
          title="Add New Page"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const isCover = index === 0;

          return (
            <div 
              key={page.id}
              className={`group flex items-center p-1.5 pr-3 rounded-xl border transition-all ${
                isActive 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Clickable Area for Selection */}
              <div 
                className="flex-1 flex items-center space-x-3 p-1.5 cursor-pointer min-w-0"
                onClick={() => setActivePageIndex(index)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCover ? <Layout className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => onUpdatePage(index, { name: e.target.value })}
                    className={`bg-transparent border-none p-0 focus:ring-0 text-sm font-bold w-full truncate ${
                      isActive ? 'text-blue-900' : 'text-slate-700'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    {page.elements.length} Elements {isCover ? '• Cover Page' : ''}
                  </p>
                </div>
              </div>

              {/* Sibling Actions Area - no bubbling or overlap issues */}
              <div className={`flex items-center space-x-1 transition-opacity ${
                confirmDeleteIndex === index ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}>
                {confirmDeleteIndex === index ? (
                  <div className="flex items-center space-x-1 animate-in fade-in slide-in-from-right-1 duration-200">
                    <span className="text-[10px] text-rose-500 font-bold mr-1">Yakin hapus?</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                        setConfirmDeleteIndex(null);
                      }}
                      className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                      title="Confirm Delete"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteIndex(null);
                      }}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      title="Cancel Delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => movePage(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(index, index + 1)}
                      disabled={index === pages.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicatePage(index)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Duplicate Page"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteIndex(index);
                      }}
                      disabled={pages.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Big Add Page button at the bottom of the list */}
      <button
        onClick={onAddPage}
        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-200 text-blue-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-[0.99] mb-4"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Halaman Baru</span>
      </button>

      {pages.length > 1 && (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Multi-page Tip</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The first page is treated as the <strong>Cover</strong>. In preview mode, guests will see the cover first and click "Open" to scroll through the rest of the pages.
          </p>
        </div>
      )}
    </div>
  );
}