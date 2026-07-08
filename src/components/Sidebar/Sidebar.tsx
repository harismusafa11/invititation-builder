
import React from 'react';
import {
  Upload,
  Palette,
  Shapes,
  Type,
  Grid,
  Activity,
  Layers,
  FileText,
  Music,
  X,
} from 'lucide-react';

import UploadPanel from './UploadPanel';
import BackgroundPanel from './BackgroundPanel';
import ShapesPanel from './ShapesPanel';
import TextPanel from './TextPanel';
import ComponentsPanel from './ComponentsPanel';
import AnimationPanel from './AnimationPanel';
import LayersPanel from './LayersPanel';
import PagesPanel from './PagesPanel';
import MusicPanel from './MusicPanel';

import {
  InvitationElement,
  BackgroundSettings,
  InvitationAnimation,
  InvitationPage,
} from '../../types';

interface SidebarProps {
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
  elements: InvitationElement[];
  pages: InvitationPage[];
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onReorderPages: (pages: InvitationPage[]) => void;
  onUpdatePage: (index: number, updates: Partial<InvitationPage>) => void;
  selectedId: string | null;
  background: BackgroundSettings;

  // Element Actions
  onAddImage: (url: string, name: string, overrides?: any) => void;
  onChangeBackground: (bg: BackgroundSettings) => void;
  onAddShape: (shapeType: string, path?: string, isDivider?: boolean) => void;
  onAddText: (config: any) => void;
  onAddComponent: (type: 'hero' | 'brideGroom' | 'countdown' | 'story' | 'gallery' | 'video' | 'event' | 'location' | 'rsvp' | 'gift' | 'footer' | 'button', presetStyle?: 'classic' | 'rustic' | 'emerald' | 'royal') => void;
  onAddMusicWidget: (url: string, name: string) => void;

  // Layers & Selection
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<InvitationElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (reordered: InvitationElement[]) => void;
  onUpdateElementAnimation: (elementId: string, animation: InvitationAnimation) => void;
  onPlayAnimation?: (elementId: string, tempType?: string) => void;

  // Global Settings
  settings: any;
  onUpdateSettings: (updates: any) => void;
  isPremium?: boolean;
  onRequestUpgrade?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isPremium = false,
  onRequestUpgrade,
  elements,
  selectedId,
  background,
  onAddImage,
  onChangeBackground,
  onAddShape,
  onAddText,
  onAddComponent,
  onAddMusicWidget,
  onSelectElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onReorderElements,
  onUpdateElementAnimation,
  onPlayAnimation,
  pages,
  activePageIndex,
  setActivePageIndex,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
  onUpdatePage,
  settings,
  onUpdateSettings,
}: SidebarProps) {
  const tabs = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'upload', label: 'Media', icon: Upload },
    { id: 'background', label: 'BG', icon: Palette },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'components', label: 'Widget', icon: Grid },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'animation', label: 'Anim', icon: Activity },
    { id: 'layers', label: 'Layers', icon: Layers },
  ];

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const handleSelectMusic = (url: string, name: string) => {
    onUpdateSettings({ musicUrl: url, musicName: name });
  };

  const isExpanded = activeTab !== null;

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div 
      className={`bg-white border-slate-200 flex select-none transition-all duration-300 z-30 md:h-full ${
        isExpanded
          ? 'w-full md:w-[380px] h-[400px] md:h-full absolute md:absolute xl:relative bottom-0 md:bottom-0 md:top-0 left-0 right-0 md:left-0 md:right-auto border-t md:border-t-0 md:border-r rounded-t-3xl md:rounded-t-none shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-none'
          : 'w-full md:w-[72px] h-14 md:h-full fixed md:absolute xl:relative bottom-0 md:bottom-0 md:top-0 left-0 right-0 md:left-0 md:right-auto border-t md:border-t-0 md:border-r'
      } flex-col-reverse md:flex-row`}
    >
      {/* Icon Vertical/Horizontal Rail */}
      <div className="w-full md:w-[72px] h-14 md:h-full bg-slate-50 border-t md:border-t-0 md:border-r border-slate-100 flex flex-row md:flex-col items-center justify-around md:justify-start py-1 md:py-3 gap-1 overflow-x-auto md:overflow-y-auto overscroll-contain shrink-0 scrollbar-hide">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              id={`tab-button-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(isActive ? null : tab.id)}
              className={`w-12 md:w-14 h-12 md:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={tab.label}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span className="text-[8px] font-sans font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slide-out Subpanel Content Box (Right/Upper Column) */}
      {isExpanded && (
        <div ref={contentRef} className="flex-1 p-4 overflow-y-auto overscroll-contain bg-white relative w-full h-[calc(400px-56px)] md:h-full min-w-[280px]">
          {/* Close button in top right */}
          <button
            onClick={() => setActiveTab(null)}
            className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer z-20"
            title="Tutup Panel"
          >
            <X className="w-4 h-4" />
          </button>

          {activeTab === 'pages' && (
            <PagesPanel
              pages={pages}
              activePageIndex={activePageIndex}
              setActivePageIndex={setActivePageIndex}
              onAddPage={onAddPage}
              onDeletePage={onDeletePage}
              onDuplicatePage={onDuplicatePage}
              onReorderPages={onReorderPages}
              onUpdatePage={onUpdatePage}
            />
          )}
          {activeTab === 'upload' && (
            <UploadPanel
              onAddImage={onAddImage}
              onChangeBackground={onChangeBackground}
              currentBackground={background}
              isPremium={isPremium}
              onRequestUpgrade={onRequestUpgrade}
            />
          )}
          {activeTab === 'background' && (
            <BackgroundPanel background={background} onChangeBackground={onChangeBackground} />
          )}
          {activeTab === 'shapes' && <ShapesPanel onAddShape={onAddShape} />}
          {activeTab === 'text' && <TextPanel onAddText={onAddText} />}
          {activeTab === 'components' && <ComponentsPanel onAddComponent={onAddComponent} />}
          {activeTab === 'music' && (
            <MusicPanel
              currentMusicUrl={settings.musicUrl}
              currentMusicName={settings.musicName}
              onSelectMusic={handleSelectMusic}
              onAddMusicWidget={onAddMusicWidget}
              isPremium={isPremium}
              onRequestUpgrade={onRequestUpgrade}
            />
          )}
          {activeTab === 'animation' && (
            <AnimationPanel
              selectedElement={selectedElement}
              allElements={elements}
              onUpdateElementAnimation={onUpdateElementAnimation}
              onSelectElement={onSelectElement}
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onPlayAnimation={onPlayAnimation}
            />
          )}
          {activeTab === 'layers' && (
            <LayersPanel
              elements={elements}
              selectedId={selectedId}
              onSelectElement={onSelectElement}
              onUpdateElement={onUpdateElement}
              onDuplicateElement={onDuplicateElement}
              onDeleteElement={onDeleteElement}
              onReorderElements={onReorderElements}
            />
          )}
        </div>
      )}
    </div>
  );
}
