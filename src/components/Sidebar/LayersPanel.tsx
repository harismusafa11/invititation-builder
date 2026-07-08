
import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Grid, 
  ChevronRight, 
  Edit2, 
  Check 
} from 'lucide-react';
import { InvitationElement } from '../../types';

interface LayersPanelProps {
  elements: InvitationElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<InvitationElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (reordered: InvitationElement[]) => void;
}

export default function LayersPanel({
  elements,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onReorderElements,
}: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Reverse list so that items rendered on TOP (end of array) appear at the TOP of the layers list
  const layeredElements = [...elements].reverse();

  const handleStartRename = (el: InvitationElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(el.id);
    setNewName(el.name);
  };

  const handleFinishRename = (id: string) => {
    if (newName.trim()) {
      onUpdateElement(id, { name: newName.trim() });
    }
    setEditingId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down' | 'front' | 'back') => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    const item = newElements.splice(index, 1)[0];

    if (direction === 'up') {
      const newIdx = Math.min(elements.length - 1, index + 1);
      newElements.splice(newIdx, 0, item);
    } else if (direction === 'down') {
      const newIdx = Math.max(0, index - 1);
      newElements.splice(newIdx, 0, item);
    } else if (direction === 'front') {
      newElements.push(item);
    } else if (direction === 'back') {
      newElements.unshift(item);
    }

    onReorderElements(newElements);
  };

  const getElementIcon = (el: InvitationElement) => {
    if (el.type === 'text') return Type;
    if (el.type === 'image') return ImageIcon;
    if (el.type === 'shape') return Square;
    return Grid; // Widgets & others
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Layers Panel</h3>
        <p className="text-xs text-slate-400 mt-1">Manage element stack order, visibility locks, and duplications.</p>
      </div>

      {/* Layers List */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {layeredElements.length > 0 ? (
          layeredElements.map((el, revIndex) => {
            const actualIndex = elements.length - 1 - revIndex;
            const isSelected = selectedId === el.id;
            const ElementIcon = getElementIcon(el);

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                  {/* Icon depending on type */}
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    <ElementIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Name field (with inline edit) */}
                  <div className="flex-1 min-w-0">
                    {editingId === el.id ? (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFinishRename(el.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="text-xs font-semibold px-2 py-1 border border-blue-400 bg-white rounded outline-none w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleFinishRename(el.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 group/name">
                        <span className="text-xs font-semibold text-slate-700 truncate">{el.name}</span>
                        <button
                          id={`btn-edit-layer-name-${el.id}`}
                          onClick={(e) => handleStartRename(el, e)}
                          className="opacity-60 md:opacity-0 md:group-hover/name:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 transition-all rounded cursor-pointer"
                          title="Rename Layer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-slate-400 capitalize">
                      {el.type === 'widget' ? el.widgetType || 'widget' : el.type}
                    </div>
                  </div>
                </div>

                {/* Layer Control Toggles: Lock, Hide, Duplicate, Delete, Move depth */}
                <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Hide / Show Toggle */}
                  <button
                    id={`btn-hide-layer-${el.id}`}
                    onClick={() => onUpdateElement(el.id, { hidden: !el.hidden })}
                    className={`p-1 rounded transition-all ${
                      el.hidden ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                    title={el.hidden ? 'Show Element' : 'Hide Element'}
                  >
                    {el.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock / Unlock Toggle */}
                  <button
                    id={`btn-lock-layer-${el.id}`}
                    onClick={() => onUpdateElement(el.id, { locked: !el.locked })}
                    className={`p-1 rounded transition-all ${
                      el.locked ? 'bg-indigo-50 text-indigo-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                    title={el.locked ? 'Unlock Element' : 'Lock Element'}
                  >
                    {el.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Move Up Depth */}
                  <button
                    id={`btn-moveup-layer-${el.id}`}
                    onClick={() => moveLayer(el.id, 'up')}
                    disabled={actualIndex === elements.length - 1}
                    className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Layer Up (Bring Forward)"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down Depth */}
                  <button
                    id={`btn-movedown-layer-${el.id}`}
                    onClick={() => moveLayer(el.id, 'down')}
                    disabled={actualIndex === 0}
                    className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Layer Down (Send Backward)"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3 bg-slate-100 mx-1"></div>

                  {/* Duplicate */}
                  <button
                    id={`btn-duplicate-layer-${el.id}`}
                    onClick={() => onDuplicateElement(el.id)}
                    className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    id={`btn-delete-layer-${el.id}`}
                    onClick={() => onDeleteElement(el.id)}
                    className="p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            <span className="text-xs font-medium">No layers yet</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Add shapes, text, or components to populate layers.</p>
          </div>
        )}
      </div>

      {/* Layer Depth Helpers */}
      {selectedId && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Depth Controls</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => moveLayer(selectedId, 'front')}
              className="flex items-center justify-center space-x-1 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-lg transition-all"
            >
              <span>Bring to Front</span>
            </button>
            <button
              onClick={() => moveLayer(selectedId, 'back')}
              className="flex items-center justify-center space-x-1 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-lg transition-all"
            >
              <span>Send to Back</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
