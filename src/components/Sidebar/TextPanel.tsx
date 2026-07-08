
import React from 'react';
import { Type, Quote, AlignCenter } from 'lucide-react';

interface TextPanelProps {
  onAddText: (config: {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: 'normal' | 'italic';
    textColor: string;
    letterSpacing: number;
    lineHeight: number;
    width: number;
    height: number;
  }) => void;
}

export default function TextPanel({ onAddText }: TextPanelProps) {
  const textPresets = [
    {
      name: 'Dynamic Guest Name (Nama Tamu)',
      desc: 'Dynamic guest name linked to URL parameter (?to=Name)',
      icon: 'Inter',
      config: {
        text: 'Kepada Yth.\n{{guest_name}}',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: '500',
        fontStyle: 'normal' as const,
        textColor: '#1E293B',
        letterSpacing: 1,
        lineHeight: 1.5,
        width: 250,
        height: 60,
      },
    },
    {
      name: 'Luxury Initials (Script)',
      desc: 'Beautiful calligraphy for bride & groom names',
      icon: 'Great Vibes',
      config: {
        text: 'Sophia & William',
        fontFamily: 'Great Vibes',
        fontSize: 48,
        fontWeight: '400',
        fontStyle: 'normal' as const,
        textColor: '#2D271E',
        letterSpacing: 0,
        lineHeight: 1.2,
        width: 320,
        height: 65,
      },
    },
    {
      name: 'Aristocratic Cursive (Pinyon)',
      desc: 'Luxurious calligraphic script for elegant names',
      icon: 'Pinyon Script',
      config: {
        text: 'Haris & partner',
        fontFamily: 'Pinyon Script',
        fontSize: 54,
        fontWeight: '400',
        fontStyle: 'normal' as const,
        textColor: '#D4AF37',
        letterSpacing: 0.5,
        lineHeight: 1.2,
        width: 320,
        height: 70,
      },
    },
    {
      name: 'Royal Decorative (Cinzel Dec)',
      desc: 'Ornate, flourished serifs for royal title cards',
      icon: 'Cinzel Dec',
      config: {
        text: 'SAVE THE DATE',
        fontFamily: 'Cinzel Decorative',
        fontSize: 24,
        fontWeight: '700',
        fontStyle: 'normal' as const,
        textColor: '#2D271E',
        letterSpacing: 4,
        lineHeight: 1.2,
        width: 300,
        height: 40,
      },
    },
    {
      name: 'Modern Editorial (Bodoni)',
      desc: 'High-contrast fashion serif for titles & details',
      icon: 'Bodoni Moda',
      config: {
        text: 'The Wedding Celebration',
        fontFamily: 'Bodoni Moda',
        fontSize: 20,
        fontWeight: '400',
        fontStyle: 'italic' as const,
        textColor: '#111625',
        letterSpacing: 1.5,
        lineHeight: 1.2,
        width: 300,
        height: 35,
      },
    },
    {
      name: 'Flowing Calligraphy (Allura)',
      desc: 'Smooth, graceful feminine cursive script',
      icon: 'Allura',
      config: {
        text: 'Together with our families...',
        fontFamily: 'Allura',
        fontSize: 32,
        fontWeight: '400',
        fontStyle: 'normal' as const,
        textColor: '#8C7A5B',
        letterSpacing: 0,
        lineHeight: 1.2,
        width: 320,
        height: 45,
      },
    },
    {
      name: 'Thin Monoline Script (Sacramento)',
      desc: 'Trendy, clean thin script for romantic verses',
      icon: 'Sacramento',
      config: {
        text: 'we request the honor of your presence',
        fontFamily: 'Sacramento',
        fontSize: 34,
        fontWeight: '400',
        fontStyle: 'normal' as const,
        textColor: '#64748B',
        letterSpacing: 0.5,
        lineHeight: 1.2,
        width: 320,
        height: 48,
      },
    },
    {
      name: 'Ornate Display (Cinzel)',
      desc: 'Roman uppercase style for headers & titles',
      icon: 'Cinzel',
      config: {
        text: 'THE WEDDING OF',
        fontFamily: 'Cinzel',
        fontSize: 22,
        fontWeight: '600',
        fontStyle: 'normal' as const,
        textColor: '#D4AF37',
        letterSpacing: 5,
        lineHeight: 1.3,
        width: 300,
        height: 35,
      },
    },
    {
      name: 'Classy Roman Serif (Cormorant)',
      desc: 'Tall, delicate serif display titling',
      icon: 'Cormorant Infant',
      config: {
        text: 'WALIMATUL URSY',
        fontFamily: 'Cormorant Infant',
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'normal' as const,
        textColor: '#1E293B',
        letterSpacing: 3,
        lineHeight: 1.3,
        width: 300,
        height: 30,
      },
    },
    {
      name: 'Elegant Serif (Cormorant)',
      desc: 'Classic italic verse for quotes & poems',
      icon: 'Cormorant',
      config: {
        text: '"Because you have shared in our lives by your friendship and love..."',
        fontFamily: 'Cormorant Garamond',
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'italic' as const,
        textColor: '#7C6B50',
        letterSpacing: 0,
        lineHeight: 1.4,
        width: 300,
        height: 50,
      },
    },
    {
      name: 'Modern Sans (Montserrat)',
      desc: 'Clean, bold details text for dates & addresses',
      icon: 'Montserrat',
      config: {
        text: 'SATURDAY, DECEMBER 18, 2026',
        fontFamily: 'Montserrat',
        fontSize: 10,
        fontWeight: '500',
        fontStyle: 'normal' as const,
        textColor: '#1E293B',
        letterSpacing: 3,
        lineHeight: 1.4,
        width: 300,
        height: 25,
      },
    },
    {
      name: 'Clean Body Text (Inter)',
      desc: 'Simple paragraph text for instructions or schedules',
      icon: 'Inter',
      config: {
        text: 'We request the honor of your presence as we celebrate our marriage.',
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: '300',
        fontStyle: 'normal' as const,
        textColor: '#64748B',
        letterSpacing: 0,
        lineHeight: 1.6,
        width: 290,
        height: 40,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Add Text Elements</h3>
        <p className="text-xs text-slate-400 mt-1">Select and customize high-fidelity typography preset groupings designed for luxury wedding stationery.</p>
      </div>

      {/* Preset List */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Typography Presets</h4>
        <div className="space-y-2.5">
          {textPresets.map((preset) => {
            return (
              <button
                key={preset.name}
                onClick={() => onAddText(preset.config)}
                className="w-full text-left p-3 border border-slate-100 bg-white hover:border-blue-400 hover:shadow-md rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-all">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{preset.desc}</div>
                </div>

                {/* Preview Thumbnail */}
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-700 w-16 h-10 flex items-center justify-center font-semibold overflow-hidden">
                  <span
                    className="text-sm truncate"
                    style={{
                      fontFamily: preset.config.fontFamily,
                      fontStyle: preset.config.fontStyle,
                      fontWeight: preset.config.fontWeight,
                    }}
                  >
                    Abc
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Adders */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Custom Styles</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddText({
              text: 'Add Heading',
              fontFamily: 'Cinzel',
              fontSize: 24,
              fontWeight: '600',
              fontStyle: 'normal',
              textColor: '#0F172A',
              letterSpacing: 2,
              lineHeight: 1.2,
              width: 250,
              height: 40,
            })}
            className="flex items-center space-x-2 p-2.5 border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 rounded-lg transition-all text-xs font-semibold text-slate-600 justify-center"
          >
            <Type className="w-3.5 h-3.5 text-blue-500" />
            <span>Heading</span>
          </button>
          <button
            onClick={() => onAddText({
              text: 'Add Quote',
              fontFamily: 'Cormorant Garamond',
              fontSize: 16,
              fontWeight: '400',
              fontStyle: 'italic',
              textColor: '#475569',
              letterSpacing: 0,
              lineHeight: 1.4,
              width: 250,
              height: 40,
            })}
            className="flex items-center space-x-2 p-2.5 border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 rounded-lg transition-all text-xs font-semibold text-slate-600 justify-center"
          >
            <Quote className="w-3.5 h-3.5 text-blue-500" />
            <span>Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
