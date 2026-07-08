import React from 'react';
import { Milestone } from 'lucide-react';
import * as defaults from '../../utils/defaults';

interface ShapesPanelProps {
  onAddShape: (shapeType: string, path?: string, isDivider?: boolean) => void;
}

export default function ShapesPanel({ onAddShape }: ShapesPanelProps) {

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Shapes & Ornaments</h3>
        <p className="text-xs text-slate-400 mt-1">Add background backing cards, geometric accents, and flourish scroll dividers.</p>
      </div>

      {/* Shapes Grid */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Geometric Accents</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {defaults.PRESET_SHAPES.map((shape) => {
            return (
              <button
                key={shape.name}
                type="button"
                onClick={() => onAddShape(shape.type, shape.path)}
                className="flex flex-col items-center justify-center p-3 border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md rounded-2xl transition-all text-slate-650 space-y-2 group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* SVG Visual Preview for Canva parity */}
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50/20 transition-all p-2">
                  {shape.type === 'rect' && (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  )}
                  {shape.type === 'circle' && (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                  {shape.type === 'frame' && (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="1.5 1.5" />
                    </svg>
                  )}
                  {/* custom paths shapes */}
                  {shape.path && (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                      <path d={shape.path} />
                    </svg>
                  )}
                </div>
                
                <span className="text-[10px] font-bold text-slate-600 block leading-none">{shape.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dividers */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Ornate Dividers</h4>
        <div className="space-y-2">
          {defaults.PRESET_DIVIDERS.map((div) => {
            return (
              <button
                key={div.name}
                type="button"
                onClick={() => onAddShape(div.type, div.path, true)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md rounded-2xl transition-all text-slate-600 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center space-x-2.5">
                  <Milestone className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-bold text-slate-700">{div.name}</span>
                </div>
                
                {/* Visual line showcase */}
                <div className="w-24 flex items-center justify-center select-none">
                  {div.name === 'Simple Line' && <div className="w-full h-[2px] bg-slate-300 group-hover:bg-blue-500 rounded transition-colors" />}
                  {div.name === 'Dashed Line' && <div className="w-full h-0 border-t-2 border-dashed border-slate-300 group-hover:border-blue-500 transition-colors" />}
                  {div.name === 'Ornate Leaves' && (
                    <span className="text-[11px] text-slate-400 group-hover:text-blue-500 font-serif tracking-wider transition-colors">❦ ❧ ❦</span>
                  )}
                  {div.name === 'Flourish Accent' && (
                    <span className="text-xs text-slate-400 group-hover:text-blue-500 font-serif tracking-wider transition-colors">❀ ❀ ❀</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
