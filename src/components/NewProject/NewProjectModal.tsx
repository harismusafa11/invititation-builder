
import React, { useState } from 'react';
import { X, Sparkles, FolderPlus, FilePlus, Heart, Check } from 'lucide-react';
import { InvitationTemplate } from '../../types';
import { DEFAULT_TEMPLATES } from '../../utils/defaults';

interface NewProjectModalProps {
  onClose: () => void;
  onCreateProject: (title: string, templateKey: string, template: InvitationTemplate | null) => void;
  customTemplates?: any[];
}

export default function NewProjectModal({ onClose, onCreateProject, customTemplates = [] }: NewProjectModalProps) {
  const [projectTitle, setProjectTitle] = useState('My Dream Wedding Invitation');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('premiumIndonesianFloral');

  const templatesList = [
    {
      key: 'blank',
      name: 'Blank Canvas',
      description: 'Start from scratch. Create your own bespoke layout page by page.',
      badge: 'Bespoke',
      color: 'from-slate-100 to-slate-200 text-slate-700',
    },
    ...Object.keys(DEFAULT_TEMPLATES)
      .filter((key) => {
        const builtinDbId = `builtin-${key}`;
        return customTemplates.length === 0 || customTemplates.some(t => t.id === builtinDbId);
      })
      .map((key) => {
        const builtinDbId = `builtin-${key}`;
        const foundBuiltinDb = customTemplates.find(t => t.id === builtinDbId);
        const displayName = foundBuiltinDb ? foundBuiltinDb.title : DEFAULT_TEMPLATES[key].name;
        
        let badge = 'Preset';
        let color = 'from-blue-100 to-blue-200 text-blue-800';
        let description = 'Template premium.';
        if (key === 'premiumIndonesianFloral') {
          badge = 'Popular';
          color = 'from-amber-100 to-amber-200 text-amber-800';
          description = 'Elegant batik accent, classical serif font, warm beige-gold mood.';
        } else if (key === 'luxuryGold') {
          badge = 'Classic Luxe';
          color = 'from-yellow-100 to-yellow-200 text-yellow-800';
          description = 'Stunning gold borders, high contrast floral displays, timeless elegant serif typography.';
        } else if (key === 'emeraldGreen') {
          badge = 'Modern Elegant';
          color = 'from-emerald-100 to-emerald-200 text-emerald-800';
          description = 'Modern gold & deep dark green contrast, luxurious geometric frames.';
        } else if (key === 'batikHeritage') {
          badge = 'Premium Cultural';
          color = 'from-amber-800 to-amber-950 text-amber-100 border border-amber-600/35';
          description = 'Luxurious Javanese gold ornaments, dark teakwood brown tone, and elegant illustrations.';
        }
        
        return {
          key,
          name: displayName,
          description,
          badge,
          color
        };
      }),
    ...customTemplates
      .filter((t: any) => !t.id.startsWith('builtin-'))
      .map((t: any) => ({
        key: t.id,
        name: t.title,
        description: `Desain dinamis kreasi Administrator. Fitur lengkap, siap pakai dan kustomisasi.`,
        badge: 'Admin Design',
        color: 'from-purple-100 to-pink-200 text-purple-800',
      }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    let selectedTemplate: InvitationTemplate | null = null;
    if (selectedTemplateKey !== 'blank') {
      selectedTemplate = DEFAULT_TEMPLATES[selectedTemplateKey];
    }

    onCreateProject(projectTitle.trim(), selectedTemplateKey, selectedTemplate);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        id="new-project-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create New Project</h2>
              <p className="text-[11px] text-slate-400 font-medium">Reset your workspace and start crafting a fresh invitation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Project Title / Name</label>
            <input 
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Wedding of Sarah & Dave"
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition-all shadow-inner"
              maxLength={40}
              autoFocus
            />
          </div>

          {/* Preset Selector Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Starting Preset Template</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {templatesList.map((tpl) => {
                const isSelected = selectedTemplateKey === tpl.key;
                return (
                  <div
                    key={tpl.key}
                    onClick={() => setSelectedTemplateKey(tpl.key)}
                    className={`relative p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between h-[120px] select-none group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-50/50' 
                        : 'border-slate-100 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Name & Badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{tpl.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${tpl.color} uppercase tracking-wider shadow-xs`}>
                          {tpl.badge}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed pr-6 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    {/* Selected state tick or icon */}
                    <div className="absolute bottom-3.5 right-3.5">
                      {isSelected ? (
                        <div className="p-1 bg-blue-600 text-white rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="p-1 bg-slate-100 text-slate-400 rounded-full group-hover:bg-slate-200">
                          {tpl.key === 'blank' ? <FilePlus className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer warning */}
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2.5">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-700 leading-relaxed font-semibold">
              Warning: Creating a new project will clear the current canvas and reset the history. Be sure to save your current design (Save JSON) if you wish to preserve it.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
