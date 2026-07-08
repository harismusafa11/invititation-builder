
export interface InvitationAnimation {
  type: 'fade' | 'zoom' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'rotate' | 'scale' | 'bounce' | 'flip' | 'float' | 'none';
  duration: number; // seconds
  delay: number; // seconds
  easing: 'power1.out' | 'power2.out' | 'power3.out' | 'bounce.out' | 'back.out' | 'elastic.out' | 'none';
  loop?: boolean;
}

export interface InvitationElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'divider' | 'button' | 'widget';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  hidden?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;

  // Background and borders
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  gradientText?: boolean;
  gradientColors?: string[];
  textShadowColor?: string;
  textShadowBlur?: number;
  outlineColor?: string;
  outlineWidth?: number;

  // Image & asset
  src?: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  frameStyle?: string;
  shapeType?: string;
  colorTint?: string;
  path?: string;
  hueRotate?: number;
  hideBackground?: boolean;
  isGalleryPhoto?: boolean;

  // Widget types
  widgetType?:
    | 'countdown'
    | 'maps'
    | 'location'
    | 'rsvp'
    | 'gift'
    | 'music'
    | 'gallery'
    | 'video'
    | 'hero'
    | 'brideGroom'
    | 'story'
    | 'event'
    | 'footer';

  widgetConfig?: {
    title?: string;
    targetDate?: string;
    mapUrl?: string;
    latitude?: number;
    longitude?: number;
    rsvpFields?: string[];
    rsvpSubmissionCount?: number;
    giftBankName?: string;
    giftAccountNumber?: string;
    giftRecipientName?: string;
    giftCardStyle?: string;
    audioUrl?: string;
    audioName?: string;
    autoplay?: boolean;
    videoUrl?: string;
    images?: string[];
    galleryStyle?: string;
    aspectRatio?: string;
    brideName?: string;
    groomName?: string;
    storyTitle?: string;
    storyText?: string;
    eventTime?: string;
    eventLocationName?: string;
    musicStyle?: string;
    subtitle?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    inputBgColor?: string;
    inputTextColor?: string;
    accentColor?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonStyle?: string;
    inputPlaceholder?: string;
    eventCardStyle?: string;
    eventTitle?: string;
    eventDate?: string;
    eventLocation?: string;
    eventAddress?: string;
  };

  // Entrance animation
  animation?: InvitationAnimation;

  // Scroll-triggered effect
  scrollEffect?: 'none' | 'parallax' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'rotate-in' | 'slide-left' | 'slide-right';
  scrollEffectStrength?: number;

  // Button
  buttonAction?: 'open_invitation' | 'open_link';
  buttonLink?: string;

  // Grouping
  groupId?: string;

  // Additional settings
  visualEffect?: string;
  hoverEffect?: string;

  // Visual effects
  effectType?: 'none' | 'glow' | 'pulse' | 'glow-pulse' | 'float' | 'spin';
  effectColor?: string;
  effectSpeed?: number;

  // Hover effects
  hoverEffectEnabled?: boolean;
  hoverEffectType?: 'scale-up' | 'glow' | 'shine' | 'fade' | 'none';
  hoverBgColor?: string;
}

export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image';
  color: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  imageUrl?: string;
  overlayOpacity: number;
  overlayColor: string;
}

export interface InvitationPage {
  id: string;
  name: string;
  elements: InvitationElement[];
  background?: BackgroundSettings;
}

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  category: 'romantic' | 'classical' | 'modern' | 'traditional' | 'uploaded';
  duration?: string;
  premium?: boolean;
}

export interface InvitationTemplate {
  id?: string;
  name: string;
  settings: {
    musicUrl?: string;
    musicName?: string;
    title?: string;
    safeArea?: boolean;
    grid?: boolean;
    snap?: boolean;
    ruler?: boolean;
    zoom: number;
    showCover?: boolean;
    openAnimation?: 'fade' | 'door-left' | 'door-right' | 'curtain-up' | 'curtain-down' | 'zoom-out' | 'none';
    scrollEffect?: 'none' | 'fade-sections' | 'parallax-bg' | 'slide-sections';
    previewViewMode?: 'mobile' | 'desktop';
    showBottomNavigation?: boolean;
    bottomNavigationStyle?: 'gold' | 'glass' | 'terracotta' | 'navy' | 'botanical';
    particleEffect?: 'none' | 'sakura' | 'rose-petals' | 'autumn-leaves' | 'botanical-leaves' | 'gold-dust' | 'glittering-stars' | 'love-balloons' | 'snow' | 'rain' | 'bubbles';

    // Auto scroll options
    autoScrollEnabled?: boolean;
    autoScrollSpeed?: number;
    autoScrollButtonIcon?: 'chevron' | 'play' | 'scroll' | 'arrow';
    autoScrollButtonStyle?: 'circular' | 'floating' | 'pill';
    autoScrollButtonColor?: string;
  };
  background: BackgroundSettings;
  pages: InvitationPage[];
  slug?: string;
  paid?: boolean;
  views?: number;
  updated_at?: string;
}

export interface EditorHistoryState {
  background: BackgroundSettings;
  pages: InvitationPage[];
  settings: InvitationTemplate['settings'];
}
