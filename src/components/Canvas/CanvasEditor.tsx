
import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Line, Path, Group, Transformer, Shape, Circle, Ellipse } from 'react-konva';
import { gsap } from 'gsap';
import Konva from 'konva';
import { InvitationElement, BackgroundSettings } from '../../types';
import ParticleEffect from '../ParticleEffect';
import { ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';

// Custom color overlay filter for Konva color tinting of SVG assets
const colorOverlayFilter = function(this: any, imageData: any) {
  const data = imageData.data;
  const r = this.getAttr('overlayRed') || 0;
  const g = this.getAttr('overlayGreen') || 0;
  const b = this.getAttr('overlayBlue') || 0;
  const active = this.getAttr('overlayActive') || false;
  
  if (!active) return;
  
  for (let i = 0; i < data.length; i += 4) {
    // Modify RGB channels of opaque/partially opaque pixels
    if (data[i + 3] > 5) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
};

// Register custom filter inside Konva namespace
if (Konva && !((Konva as any).Filters.ColorOverlay)) {
  ((Konva as any).Filters.ColorOverlay) = colorOverlayFilter;
}

// Custom Hue Rotate filter matching CSS hue-rotate exactly
const cssHueRotateFilter = function(this: any, imageData: any) {
  const data = imageData.data;
  const angle = this.getAttr('cssHueRotate') || 0;
  if (angle === 0) return;

  const angleRad = (angle % 360) * Math.PI / 180;
  const costheta = Math.cos(angleRad);
  const sintheta = Math.sin(angleRad);

  const m00 = 0.213 + costheta * 0.787 - sintheta * 0.213;
  const m01 = 0.715 - costheta * 0.715 - sintheta * 0.715;
  const m02 = 0.072 - costheta * 0.072 + sintheta * 0.928;

  const m10 = 0.213 - costheta * 0.213 + sintheta * 0.143;
  const m11 = 0.715 + costheta * 0.285 + sintheta * 0.140;
  const m12 = 0.072 - costheta * 0.072 - sintheta * 0.283;

  const m20 = 0.213 - costheta * 0.213 - sintheta * 0.787;
  const m21 = 0.715 - costheta * 0.715 + sintheta * 0.715;
  const m22 = 0.072 + costheta * 0.928 + sintheta * 0.072;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    const newR = r * m00 + g * m01 + b * m02;
    const newG = r * m10 + g * m11 + b * m12;
    const newB = r * m20 + g * m21 + b * m22;

    data[i] = Math.max(0, Math.min(255, newR));
    data[i+1] = Math.max(0, Math.min(255, newG));
    data[i+2] = Math.max(0, Math.min(255, newB));
  }
};

if (Konva && !((Konva as any).Filters.CssHueRotate)) {
  ((Konva as any).Filters.CssHueRotate) = cssHueRotateFilter;
}

// Helper to sanitize any color string so that canvas operations never crash on invalid/temporary user input
const getSafeColor = (color: string | undefined, fallback: string): string => {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    // Valid hex formats: #rgb, #rgba, #rrggbb, #rrggbbaa
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
      return trimmed;
    }
    return fallback;
  }
  // Allow valid rgba/rgb/hsl/hsla/named colors, reject partial typing constructs like "rgb(" or "hsl("
  if (/^(rgb|rgba|hsl|hsla)\([0-9a-fA-F\s,%()./-]+\)$/.test(trimmed) || /^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
};

// Helper to dynamically recolor SVG data URLs
const recolorSvgDataUrl = (dataUrl: string | undefined, tintColor: string | undefined): string => {
  if (!dataUrl) return '';
  if (!tintColor || tintColor === 'none' || tintColor === '') return dataUrl;
  
  try {
    if (dataUrl.startsWith('data:image/svg+xml')) {
      let svgText = '';
      if (dataUrl.includes(';base64,')) {
        const base64Str = dataUrl.split(';base64,')[1];
        svgText = atob(base64Str);
      } else {
        const urlEncodedStr = dataUrl.split('data:image/svg+xml;utf8,')[1] || dataUrl.split('data:image/svg+xml,')[1] || '';
        svgText = decodeURIComponent(urlEncodedStr);
      }
      
      if (svgText) {
        // Replace fill and stroke attributes that have a hex color or other colors, keeping fill="none"
        const recoloredSvg = svgText
          .replace(/fill="((?!none)[^"]+)"/gi, `fill="${tintColor}"`)
          .replace(/stroke="((?!none)[^"]+)"/gi, `stroke="${tintColor}"`)
          .replace(/stroke:#([0-9a-fA-F]{3,6})/gi, `stroke:${tintColor}`)
          .replace(/fill:#([0-9a-fA-F]{3,6})/gi, `fill:${tintColor}`);
          
        return `data:image/svg+xml;utf8,${encodeURIComponent(recoloredSvg)}`;
      }
    }
  } catch (e) {
    console.warn("SVG Recolor error:", e);
  }
  return dataUrl;
};

interface CanvasEditorProps {
  elements: InvitationElement[];
  selectedId: string | null;
  background: BackgroundSettings;
  zoom: number;
  setZoom?: (zoom: number) => void;
  gridEnabled: boolean;
  snapEnabled: boolean;
  safeAreaEnabled: boolean;
  rulerEnabled?: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<InvitationElement>) => void;
  animationPreview?: { elementId: string; tempType?: string; timestamp: number } | null;
  settings?: any;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onCopyElement?: (id: string) => void;
  onPasteElement?: () => void;
  copiedElement?: InvitationElement | null;
  onReorderElements?: (reordered: InvitationElement[]) => void;
  stageRef?: React.RefObject<any>;
  isDarkMode?: boolean;
}

// Custom Image Loader Component for React Konva
const URLImage = ({ 
  src, 
  borderRadius = 0, 
  blur = 0,
  brightness = 1,
  contrast = 1,
  hueRotate = 0,
  frameStyle,
  width,
  height,
  stroke,
  strokeWidth,
  shadowColor,
  shadowBlur,
  shadowOffset,
  shadowOpacity,
  colorTint,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  ...props 
 }: any) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<any>(null);

  // Load and recolor image safely
  useEffect(() => {
    if (!src) return;
    const resolvedSrc = recolorSvgDataUrl(src, colorTint);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    let isMounted = true;
    img.onload = () => {
      if (isMounted) {
        setImage(img);
      }
    };
    img.src = resolvedSrc;

    return () => {
      isMounted = false;
      img.onload = null;
    };
  }, [src, colorTint]);

  // Apply filters via Konva cache (immediately for realtime responsiveness)
  useEffect(() => {
    if (imageRef.current && image) {
      try {
        imageRef.current.clearCache();
        const hasFilters = blur > 0 || brightness !== 1 || contrast !== 1 || hueRotate !== 0 || (colorTint && colorTint !== 'none' && colorTint !== '');
        if (hasFilters) {
          imageRef.current.cache();
        }
        const layer = imageRef.current.getLayer();
        if (layer) {
          layer.batchDraw();
        }
      } catch (e) {
        console.warn("Konva caching filter warning:", e);
      }
    }
  }, [
    image, 
    blur, 
    brightness, 
    contrast, 
    hueRotate, 
    colorTint, 
    width, 
    height, 
    stroke, 
    strokeWidth, 
    shadowColor, 
    shadowBlur, 
    shadowOffset?.x, 
    shadowOffset?.y, 
    shadowOpacity, 
    String(borderRadius)
  ]);

  // Unmount cleanup for cache and references
  useEffect(() => {
    return () => {
      if (imageRef.current) {
        try {
          imageRef.current.clearCache();
        } catch (e) {}
      }
      setImage(null);
    };
  }, []);

  const safeCornerRadius = typeof borderRadius === 'number'
    ? borderRadius
    : (Array.isArray(borderRadius) ? borderRadius[0] : 0);

  const safeStrokeColor = stroke ? getSafeColor(stroke, '#D4AF37') : undefined;
  const safeShadowColor = shadowColor ? getSafeColor(shadowColor, 'transparent') : 'transparent';

  // Parse color tint hex to RGB values for the Konva overlay filter
  let tintR = 0, tintG = 0, tintB = 0, tintActive = false;
  if (colorTint && colorTint !== 'none' && colorTint !== '') {
    tintActive = true;
    const cleanHex = colorTint.replace('#', '');
    if (cleanHex.length === 3) {
      tintR = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
      tintG = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
      tintB = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
    } else {
      tintR = parseInt(cleanHex.substring(0, 2), 16) || 0;
      tintG = parseInt(cleanHex.substring(2, 4), 16) || 0;
      tintB = parseInt(cleanHex.substring(4, 6), 16) || 0;
    }
  }

  // Konva Brightness expects offset value between -1 and 1 (0 is normal)
  const brightnessOffset = brightness - 1;
  // Konva Contrast expects value between -100 and 100 (0 is normal)
  const contrastOffset = (contrast - 1) * 100;

  // Native Konva Image crop calculation
  let konvaCrop = undefined;
  if (image && typeof cropX === 'number' && typeof cropY === 'number' && typeof cropWidth === 'number' && typeof cropHeight === 'number') {
    const originalWidth = image.naturalWidth || image.width || width;
    const originalHeight = image.naturalHeight || image.height || height;
    
    // Convert percentage to actual pixels relative to original image size
    const x = (cropX / 100) * originalWidth;
    const y = (cropY / 100) * originalHeight;
    const w = (cropWidth / 100) * originalWidth;
    const h = (cropHeight / 100) * originalHeight;
    
    konvaCrop = {
      x,
      y,
      width: Math.max(1, w),
      height: Math.max(1, h)
    };
  }

  // If no premium frameStyle is set, render as standard image with border/radius/shadow
  if (!frameStyle) {
    return (
      <Group 
        width={width}
        height={height}
        shadowColor={safeShadowColor}
        shadowBlur={shadowBlur}
        shadowOffset={shadowOffset}
        shadowOpacity={shadowColor && safeShadowColor !== 'transparent' ? (shadowOpacity ?? 0.5) : 0}
        {...props}
      >
        <KonvaImage
          ref={imageRef}
          image={image || undefined}
          crop={konvaCrop}
          cornerRadius={safeCornerRadius}
          width={width}
          height={height}
          filters={[Konva.Filters.Blur, Konva.Filters.Brighten, Konva.Filters.Contrast, (Konva.Filters as any).CssHueRotate, (Konva.Filters as any).ColorOverlay]}
          blurRadius={blur || 0}
          brightness={brightnessOffset}
          contrast={contrastOffset}
          cssHueRotate={hueRotate || 0}
          overlayRed={tintR}
          overlayGreen={tintG}
          overlayBlue={tintB}
          overlayActive={tintActive}
        />
        {strokeWidth > 0 && safeStrokeColor && (
          <Rect
            width={width}
            height={height}
            stroke={safeStrokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={safeCornerRadius}
            listening={false}
          />
        )}
      </Group>
    );
  }

  // Premium clipping functions
  const getClipFunc = () => {
    return (ctx: any) => {
      ctx.beginPath();
      if (frameStyle === 'classic_arch_gold' || frameStyle === 'javanese_joglo_gunungan') {
        const r = width / 2;
        ctx.arc(r, r, r, Math.PI, 0, false);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
      } else if (frameStyle === 'organic_asymmetric') {
        const r1 = Math.min(140, width / 2);
        const r2 = Math.min(40, width / 2);
        ctx.moveTo(r1, 0);
        ctx.quadraticCurveTo(width, 0, width, r2);
        ctx.lineTo(width, height - r1);
        ctx.quadraticCurveTo(width, height, width - r2, height);
        ctx.lineTo(r1, height);
        ctx.quadraticCurveTo(0, height, 0, height - r2);
        ctx.lineTo(0, r1);
        ctx.quadraticCurveTo(0, 0, r1, 0);
      } else if (frameStyle === 'gilded_vintage_filigree' || frameStyle === 'minimal_circle') {
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
      } else if (frameStyle === 'boho_hexagon') {
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height / 4);
        ctx.lineTo(width, (height * 3) / 4);
        ctx.lineTo(width / 2, height);
        ctx.lineTo(0, (height * 3) / 4);
        ctx.lineTo(0, height / 4);
      } else if (frameStyle === 'luxury_heart') {
        const w = width;
        const h = height;
        ctx.moveTo(w / 2, h / 5);
        ctx.bezierCurveTo(w / 2 - w / 10, 0, 0, 0, 0, h / 2);
        ctx.bezierCurveTo(0, (h * 3) / 4, w / 2 - w / 10, h - 10, w / 2, h);
        ctx.bezierCurveTo(w / 2 + w / 10, h - 10, w, (h * 3) / 4, w, h / 2);
        ctx.bezierCurveTo(w, 0, w / 2 + w / 10, 0, w / 2, h / 5);
      } else if (frameStyle === 'torn_paper_boho') {
        ctx.rect(12, 12, width - 24, height - 24);
      } else if (frameStyle === 'retro_polaroid') {
        ctx.rect(10, 10, width - 20, height - 50);
      } else if (frameStyle === 'royal_double_fine') {
        const r = safeCornerRadius || 6;
        if (ctx.roundRect) {
          ctx.roundRect(0, 0, width, height, r);
        } else {
          ctx.rect(0, 0, width, height);
        }
      } else {
        ctx.rect(0, 0, width, height);
      }
      ctx.closePath();
    };
  };

  // Helper to draw the frame border path for stroke rendering
  const drawFrameBorderPath = (ctx: any) => {
    ctx.beginPath();
    if (frameStyle === 'classic_arch_gold' || frameStyle === 'javanese_joglo_gunungan') {
      const r = width / 2;
      ctx.arc(r, r, r, Math.PI, 0, false);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
    } else if (frameStyle === 'organic_asymmetric') {
      const r1 = Math.min(140, width / 2);
      const r2 = Math.min(40, width / 2);
      ctx.moveTo(r1, 0);
      ctx.quadraticCurveTo(width, 0, width, r2);
      ctx.lineTo(width, height - r1);
      ctx.quadraticCurveTo(width, height, width - r2, height);
      ctx.lineTo(r1, height);
      ctx.quadraticCurveTo(0, height, 0, height - r2);
      ctx.lineTo(0, r1);
      ctx.quadraticCurveTo(0, 0, r1, 0);
    } else if (frameStyle === 'gilded_vintage_filigree' || frameStyle === 'minimal_circle') {
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    } else if (frameStyle === 'boho_hexagon') {
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height / 4);
      ctx.lineTo(width, (height * 3) / 4);
      ctx.lineTo(width / 2, height);
      ctx.lineTo(0, (height * 3) / 4);
      ctx.lineTo(0, height / 4);
    } else if (frameStyle === 'luxury_heart') {
      const w = width;
      const h = height;
      ctx.moveTo(w / 2, h / 5);
      ctx.bezierCurveTo(w / 2 - w / 10, 0, 0, 0, 0, h / 2);
      ctx.bezierCurveTo(0, (h * 3) / 4, w / 2 - w / 10, h - 10, w / 2, h);
      ctx.bezierCurveTo(w / 2 + w / 10, h - 10, w, (h * 3) / 4, w, h / 2);
      ctx.bezierCurveTo(w, 0, w / 2 + w / 10, 0, w / 2, h / 5);
    } else if (frameStyle === 'royal_double_fine') {
      const r = safeCornerRadius || 6;
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, width, height, r);
      } else {
        ctx.rect(0, 0, width, height);
      }
    } else {
      ctx.rect(0, 0, width, height);
    }
    ctx.closePath();
  };

  return (
    <Group 
      width={width}
      height={height}
      shadowColor={safeShadowColor}
      shadowBlur={shadowBlur}
      shadowOffset={shadowOffset}
      shadowOpacity={shadowColor && safeShadowColor !== 'transparent' ? (shadowOpacity ?? 0.5) : 0}
      {...props}
    >
      {/* 1. Background for paper/thick frames */}
      {frameStyle === 'torn_paper_boho' && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#FAF7F0"
          stroke="#E6E2D8"
          strokeWidth={1}
          cornerRadius={4}
        />
      )}

      {frameStyle === 'retro_polaroid' && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={1}
          shadowColor="#000000"
          shadowBlur={6}
          shadowOpacity={0.15}
          cornerRadius={4}
        />
      )}

      {/* 2. Offset shadow line for organic curve style */}
      {frameStyle === 'organic_asymmetric' && (
        <Shape
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            const r1 = Math.min(140, width / 2);
            const r2 = Math.min(40, width / 2);
            // Offset drawing coordinates by +4, +4 for decorative shadow line
            const ox = 4;
            const oy = 4;
            ctx.moveTo(r1 + ox, oy);
            ctx.quadraticCurveTo(width + ox, oy, width + ox, r2 + oy);
            ctx.lineTo(width + ox, height - r1 + oy);
            ctx.quadraticCurveTo(width + ox, height + oy, width - r2 + ox, height + oy);
            ctx.lineTo(r1 + ox, height + oy);
            ctx.quadraticCurveTo(ox, height + oy, ox, height - r2 + oy);
            ctx.lineTo(ox, r1 + oy);
            ctx.quadraticCurveTo(ox, oy, r1 + ox, oy);
            ctx.closePath();
            ctx.strokeShape(shape);
          }}
          stroke={getSafeColor(stroke, '#E2D4C0')}
          strokeWidth={1.5}
          dash={[3, 5]}
          listening={false}
        />
      )}

      {/* 3. Clipped Image Container */}
      <Group clipFunc={getClipFunc()}>
        {/* We center or size the image properly depending on frame type */}
        <KonvaImage
          ref={imageRef}
          image={image || undefined}
          crop={konvaCrop}
          x={frameStyle === 'torn_paper_boho' ? 12 : (frameStyle === 'retro_polaroid' ? 10 : 0)}
          y={frameStyle === 'torn_paper_boho' ? 12 : (frameStyle === 'retro_polaroid' ? 10 : 0)}
          width={frameStyle === 'torn_paper_boho' ? width - 24 : (frameStyle === 'retro_polaroid' ? width - 20 : width)}
          height={frameStyle === 'torn_paper_boho' ? height - 24 : (frameStyle === 'retro_polaroid' ? height - 60 : height)}
          filters={[Konva.Filters.Blur, Konva.Filters.Brighten, Konva.Filters.Contrast, (Konva.Filters as any).CssHueRotate, (Konva.Filters as any).ColorOverlay]}
          blurRadius={blur || 0}
          brightness={brightnessOffset}
          contrast={contrastOffset}
          cssHueRotate={hueRotate || 0}
          overlayRed={tintR}
          overlayGreen={tintG}
          overlayBlue={tintB}
          overlayActive={tintActive}
        />
      </Group>

      {/* 4. Draw Main Custom Frame Border on Top */}
      {frameStyle !== 'torn_paper_boho' && (
        <Shape
          sceneFunc={(ctx, shape) => {
            drawFrameBorderPath(ctx);
            ctx.strokeShape(shape);
          }}
          stroke={getSafeColor(stroke, '#D4AF37')}
          strokeWidth={strokeWidth || 2}
          listening={false}
        />
      )}

      {/* 5. Additional Ornate Overlays/Decorations */}

      {/* Classic Arch: elegant top ornament */}
      {frameStyle === 'classic_arch_gold' && (
        <Group x={width / 2} y={-10} listening={false}>
          {/* Small crown star crest */}
          <Circle radius={3} fill="#D4AF37" y={0} />
          <Line
            points={[0, -5, -4, 2, 4, 2]}
            closed
            fill="#D4AF37"
          />
          <Line
            points={[-12, 10, 12, 10]}
            stroke="#D4AF37"
            strokeWidth={0.75}
            dash={[2, 2]}
          />
        </Group>
      )}

      {/* Royal Double Fine: Inner border and tiny L-shaped corner markers */}
      {frameStyle === 'royal_double_fine' && (
        <Group listening={false}>
          {/* Inner thin frame */}
          <Rect
            x={4}
            y={4}
            width={width - 8}
            height={height - 8}
            stroke={getSafeColor(stroke, '#C5A880')}
            strokeWidth={1}
            opacity={0.6}
            cornerRadius={Math.max(0, (safeCornerRadius || 6) - 2)}
          />
          {/* L corner top-left */}
          <Line points={[8, 12, 8, 8, 12, 8]} stroke={getSafeColor(stroke, '#C5A880')} strokeWidth={1} />
          {/* L corner top-right */}
          <Line points={[width - 8, 12, width - 8, 8, width - 12, 8]} stroke={getSafeColor(stroke, '#C5A880')} strokeWidth={1} />
          {/* L corner bottom-left */}
          <Line points={[8, height - 12, 8, height - 8, 12, height - 8]} stroke={getSafeColor(stroke, '#C5A880')} strokeWidth={1} />
          {/* L corner bottom-right */}
          <Line points={[width - 8, height - 12, width - 8, height - 8, width - 12, height - 8]} stroke={getSafeColor(stroke, '#C5A880')} strokeWidth={1} />
        </Group>
      )}

      {/* Gilded Vintage Filigree: Oval filigree flourishes */}
      {frameStyle === 'gilded_vintage_filigree' && (
        <Group listening={false}>
          {/* Top fleur-de-lis style ornament */}
          <Group x={width / 2} y={15}>
            <Circle radius={2.5} fill="#E5CBA3" />
            <Line points={[-8, 0, 8, 0]} stroke="#E5CBA3" strokeWidth={0.5} />
          </Group>
          {/* Bottom center ornament */}
          <Group x={width / 2} y={height - 15}>
            <Circle radius={2.5} fill="#E5CBA3" />
            <Line points={[-8, 0, 8, 0]} stroke="#E5CBA3" strokeWidth={0.5} />
          </Group>
          {/* Concentric dotted inner ring */}
          <Shape
            sceneFunc={(ctx, shape) => {
              ctx.beginPath();
              ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 8, 0, Math.PI * 2);
              ctx.closePath();
              ctx.strokeShape(shape);
            }}
            stroke="#E5CBA3"
            strokeWidth={0.75}
            dash={[2, 4]}
          />
        </Group>
      )}

      {/* Javanese Joglo Gunungan: Traditional Indonesian heritage silhouette ornaments */}
      {frameStyle === 'javanese_joglo_gunungan' && (
        <Group x={width / 2} y={-15} listening={false}>
          {/* Triangular Gunungan silhouette contour at peak */}
          <Line
            points={[0, -12, -18, 15, 18, 15]}
            closed
            stroke="#D4AF37"
            strokeWidth={1}
            fill="#FFFDF9"
            opacity={0.9}
          />
          <Line
            points={[0, -12, 0, 15]}
            stroke="#D4AF37"
            strokeWidth={1}
          />
          {/* Tiny decorative branch arches */}
          <Line points={[-10, 0, 10, 0]} stroke="#D4AF37" strokeWidth={0.75} />
          <Line points={[-14, 8, 14, 8]} stroke="#D4AF37" strokeWidth={0.75} />
        </Group>
      )}

      {/* Vintage Boho Torn Paper & Dried Leaves: Eucalyptus spray decoration */}
      {frameStyle === 'torn_paper_boho' && (
        <Group listening={false}>
          {/* Inset border indicator */}
          <Rect
            x={12}
            y={12}
            width={width - 24}
            height={height - 24}
            stroke="#FAF7F0"
            strokeWidth={1}
            shadowColor="#502a20"
            shadowBlur={4}
            shadowOpacity={0.12}
          />
          {/* Eucalyptus stem overlay cascading from top-right */}
          <Group x={width - 15} y={15}>
            {/* Draw stem line */}
            <Line
              points={[0, 0, -25, 45]}
              stroke="#8C826E"
              strokeWidth={1.5}
              tension={0.5}
            />
            {/* Draw a few leafy circles with soft bohemian fill */}
            <Circle x={-5} y={10} radius={6} fill="#A2B29F" stroke="#8C826E" strokeWidth={0.5} />
            <Circle x={-15} y={22} radius={5} fill="#A2B29F" stroke="#8C826E" strokeWidth={0.5} />
            <Circle x={-22} y={35} radius={4} fill="#A2B29F" stroke="#8C826E" strokeWidth={0.5} />
            {/* Small golden twig berry dots */}
            <Circle x={0} y={12} radius={2} fill="#D4AF37" />
            <Circle x={-10} y={25} radius={1.5} fill="#D4AF37" />
          </Group>
        </Group>
      )}
    </Group>
  );
};

export default function CanvasEditor({
  elements,
  selectedId,
  background,
  zoom,
  setZoom,
  gridEnabled,
  snapEnabled,
  safeAreaEnabled,
  rulerEnabled = false,
  onSelectElement,
  onUpdateElement,
  animationPreview,
  settings,
  onDeleteElement,
  onDuplicateElement,
  onCopyElement,
  onPasteElement,
  copiedElement,
  onReorderElements,
  stageRef: parentStageRef,
  isDarkMode = false,
}: CanvasEditorProps) {
  const localStageRef = useRef<any>(null);
  const stageRef = parentStageRef || localStageRef;
  const transformerRef = useRef<any>(null);
  const [guidelines, setGuidelines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string | null;
  }>({ visible: false, x: 0, y: 0, elementId: null });

  useEffect(() => {
    const closeMenu = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const clickedOnBg = e.target === stage || 
                        e.target.name() === 'canvas-background-rect' || 
                        e.target.name() === 'canvas-background-image';
    
    let elementId: string | null = null;
    if (!clickedOnBg) {
      let node = e.target;
      while (node && node !== stage) {
        if (node.id()) {
          elementId = node.id();
          break;
        }
        node = node.getParent();
      }
    }

    setContextMenu({
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      elementId,
    });

    if (elementId) {
      onSelectElement(elementId);
    }
  };

  // Handle animation previews on the canvas using GSAP
  useEffect(() => {
    if (!animationPreview || !animationPreview.elementId) return;

    const elId = animationPreview.elementId;
    const el = elements.find((item) => item.id === elId);
    if (!el) return;

    const stage = stageRef.current;
    if (!stage) return;

    const node = stage.findOne('#' + elId);
    if (!node) return;

    // Save original properties to restore them perfectly after animation finishes or is killed
    const originalAttrs = {
      opacity: node.opacity() !== undefined ? node.opacity() : 1,
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX() !== undefined ? node.scaleX() : 1,
      scaleY: node.scaleY() !== undefined ? node.scaleY() : 1,
      rotation: node.rotation() !== undefined ? node.rotation() : 0,
    };

    // Kill any active GSAP tweens on this specific Konva node
    gsap.killTweensOf(node);

    const duration = el.animation?.duration || 1.2;
    const delay = animationPreview.tempType ? 0 : (el.animation?.delay || 0); // No delay for hover previews
    const ease = el.animation?.easing || 'power2.out';
    const isLoop = el.animation?.loop || false;

    const onUpdate = () => {
      if (stageRef.current) {
        stageRef.current.batchDraw();
      }
    };

    const onComplete = () => {
      node.setAttrs(originalAttrs);
      if (stageRef.current) {
        stageRef.current.batchDraw();
      }
    };

    const playTween = (type: string, isAfterScroll: boolean, onCompleteCallback: () => void) => {
      const isLoopAnim = el.animation?.loop || false;
      const shouldLoop = isLoopAnim && (type === el.animation?.type);
      const loopProps = shouldLoop ? { repeat: -1, yoyo: true, repeatDelay: 0.5 } : {};

      const tweenProps: gsap.TweenVars = {
        duration: (type === el.scrollEffect) ? 1.0 : duration,
        delay: isAfterScroll ? 0 : (animationPreview.tempType ? 0 : delay),
        ease: (type === el.scrollEffect) ? 'power2.out' : ease,
        onUpdate,
        onComplete: onCompleteCallback,
        ...loopProps,
      };

      switch (type) {
        case 'fade':
        case 'fade-in':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { opacity: el.opacity ?? 1 },
              { ...tweenProps, opacity: (el.opacity ?? 1) * 0.3 }
            );
          } else if (isAfterScroll) {
            gsap.to(node, { opacity: el.opacity ?? 1, duration: 0.1, onComplete: onCompleteCallback });
          } else {
            gsap.fromTo(
              node,
              { opacity: 0 },
              { ...tweenProps, opacity: el.opacity ?? 1 }
            );
          }
          break;

        case 'zoom':
        case 'zoom-in': {
          const scaleXStart = (el.flipHorizontal ? -1 : 1) * 0.7;
          const scaleYStart = (el.flipVertical ? -1 : 1) * 0.7;
          const scaleXEnd = el.flipHorizontal ? -1 : 1;
          const scaleYEnd = el.flipVertical ? -1 : 1;
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { scaleX: scaleXEnd, scaleY: scaleYEnd },
              { ...tweenProps, scaleX: scaleXEnd * 0.8, scaleY: scaleYEnd * 0.8 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { scaleX: scaleXStart, scaleY: scaleYStart },
              { ...tweenProps, scaleX: scaleXEnd, scaleY: scaleYEnd }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, scaleX: scaleXStart, scaleY: scaleYStart },
              { ...tweenProps, opacity: el.opacity ?? 1, scaleX: scaleXEnd, scaleY: scaleYEnd }
            );
          }
          break;
        }

        case 'slide-up':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { y: el.y },
              { ...tweenProps, y: el.y - 20 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { y: el.y + 40 },
              { ...tweenProps, y: el.y }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, y: el.y + 100 },
              { ...tweenProps, opacity: el.opacity ?? 1, y: el.y }
            );
          }
          break;

        case 'slide-down':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { y: el.y },
              { ...tweenProps, y: el.y + 20 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { y: el.y - 40 },
              { ...tweenProps, y: el.y }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, y: el.y - 100 },
              { ...tweenProps, opacity: el.opacity ?? 1, y: el.y }
            );
          }
          break;

        case 'slide-left':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { x: el.x },
              { ...tweenProps, x: el.x - 20 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { x: el.x + 40 },
              { ...tweenProps, x: el.x }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, x: el.x + 100 },
              { ...tweenProps, opacity: el.opacity ?? 1, x: el.x }
            );
          }
          break;

        case 'slide-right':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { x: el.x },
              { ...tweenProps, x: el.x + 20 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { x: el.x - 40 },
              { ...tweenProps, x: el.x }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, x: el.x - 100 },
              { ...tweenProps, opacity: el.opacity ?? 1, x: el.x }
            );
          }
          break;

        case 'rotate':
        case 'rotate-in': {
          const rotScaleXStart = (el.flipHorizontal ? -1 : 1) * 0.8;
          const rotScaleYStart = (el.flipVertical ? -1 : 1) * 0.8;
          const rotScaleXEnd = el.flipHorizontal ? -1 : 1;
          const rotScaleYEnd = el.flipVertical ? -1 : 1;
          if (isAfterScroll && shouldLoop) {
            gsap.to(node, { ...tweenProps, rotation: el.rotation + 360, ease: 'none' });
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { rotation: el.rotation - 25, scaleX: rotScaleXStart, scaleY: rotScaleYStart },
              { ...tweenProps, rotation: el.rotation, scaleX: rotScaleXEnd, scaleY: rotScaleYEnd }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, rotation: el.rotation - 45, scaleX: rotScaleXStart, scaleY: rotScaleYStart },
              { ...tweenProps, opacity: el.opacity ?? 1, rotation: el.rotation, scaleX: rotScaleXEnd, scaleY: rotScaleYEnd }
            );
          }
          break;
        }

        case 'scale': {
          const sYStart = 0;
          const sYEnd = el.flipVertical ? -1 : 1;
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { scaleY: sYEnd },
              { ...tweenProps, scaleY: sYEnd * 0.7 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { scaleY: sYStart },
              { ...tweenProps, scaleY: sYEnd }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, scaleY: sYStart },
              { ...tweenProps, opacity: el.opacity ?? 1, scaleY: sYEnd }
            );
          }
          break;
        }

        case 'bounce':
          if (isAfterScroll && shouldLoop) {
            gsap.fromTo(
              node,
              { y: el.y },
              { ...tweenProps, y: el.y - 20 }
            );
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { y: el.y - 40 },
              { ...tweenProps, y: el.y, ease: 'bounce.out' }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, y: el.y - 80 },
              { ...tweenProps, opacity: el.opacity ?? 1, y: el.y, ease: 'bounce.out' }
            );
          }
          break;

        case 'flip': {
          const fXStart = (el.flipHorizontal ? 1 : -1) * 0.1;
          const fXEnd = el.flipHorizontal ? -1 : 1;
          if (isAfterScroll && shouldLoop) {
            gsap.to(node, { ...tweenProps, scaleX: fXEnd * -1 });
          } else if (isAfterScroll) {
            gsap.fromTo(
              node,
              { scaleX: fXStart },
              { ...tweenProps, scaleX: fXEnd }
            );
          } else {
            gsap.fromTo(
              node,
              { opacity: 0, scaleX: fXStart },
              { ...tweenProps, opacity: el.opacity ?? 1, scaleX: fXEnd }
            );
          }
          break;
        }

        case 'float':
          if (shouldLoop) {
            if (isAfterScroll) {
              gsap.to(node, {
                y: el.y - 10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                onUpdate,
              });
            } else {
              gsap.fromTo(
                node,
                { opacity: 0, y: el.y + 20 },
                {
                  opacity: el.opacity ?? 1,
                  y: el.y,
                  duration,
                  delay,
                  ease,
                  onUpdate,
                  onComplete: () => {
                    gsap.to(node, {
                      y: el.y - 10,
                      duration: 2,
                      repeat: -1,
                      yoyo: true,
                      ease: 'sine.inOut',
                      onUpdate,
                    });
                  }
                }
              );
            }
          } else {
            if (isAfterScroll) {
              gsap.fromTo(
                node,
                { y: el.y + 20 },
                { ...tweenProps, y: el.y }
              );
            } else {
              gsap.fromTo(
                node,
                { opacity: 0, y: el.y + 20 },
                { ...tweenProps, opacity: el.opacity ?? 1, y: el.y }
              );
            }
          }
          break;

        default:
          onCompleteCallback();
          break;
      }
    };

    const tempType = animationPreview.tempType;
    const hasScrollEffect = el.scrollEffect && el.scrollEffect !== 'none';
    const hasAnimation = el.animation && el.animation.type !== 'none';

    if (tempType) {
      gsap.set(node, { opacity: 0 });
      playTween(tempType, false, onComplete);
    } else {
      if (hasScrollEffect) {
        gsap.set(node, { opacity: 0 });
        playTween(el.scrollEffect!, false, () => {
          if (hasAnimation) {
            playTween(el.animation!.type, true, onComplete);
          } else {
            onComplete();
          }
        });
      } else if (hasAnimation) {
        gsap.set(node, { opacity: 0 });
        playTween(el.animation!.type, false, onComplete);
      } else {
        onComplete();
      }
    }

    return () => {
      gsap.killTweensOf(node);
      node.setAttrs(originalAttrs);
      if (stageRef.current) {
        stageRef.current.batchDraw();
      }
    };
  }, [animationPreview, elements]);  const canvasWidth = 390;
  const canvasHeight = 844;
  const gridGap = 20;

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: any) => {
    const stage = stageRef.current;
    if (stage) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
        setMousePos({
          x: pointer.x / zoom,
          y: pointer.y / zoom,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const renderTopRuler = () => {
    const ticks = [];
    for (let x = 0; x <= canvasWidth; x += 10) {
      const isMajor = x % 50 === 0;
      const tickHeight = isMajor ? 10 : 5;
      ticks.push(
        <line
          key={`tick-h-${x}`}
          x1={x * zoom}
          y1={20 - tickHeight}
          x2={x * zoom}
          y2={20}
          stroke={isDarkMode ? '#475569' : '#94A3B8'}
          strokeWidth={1}
        />
      );
      if (isMajor) {
        ticks.push(
          <text
            key={`text-h-${x}`}
            x={x * zoom + 2}
            y={8}
            fill={isDarkMode ? '#94A3B8' : '#64748B'}
            fontSize="7px"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {x}
          </text>
        );
      }
    }
    return (
      <svg 
        style={{
          position: 'absolute',
          top: '-20px',
          left: '0',
          width: `${canvasWidth * zoom}px`,
          height: '20px',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 10
        }}
      >
        <rect x={0} y={0} width={canvasWidth * zoom} height={20} fill={isDarkMode ? '#0f172a' : '#F8FAFC'} stroke={isDarkMode ? '#1e293b' : '#E2E8F0'} strokeWidth={1} />
        {ticks}
        {mousePos && (
          <line
            x1={mousePos.x * zoom}
            y1={0}
            x2={mousePos.x * zoom}
            y2={20}
            stroke="#3B82F6"
            strokeWidth={1.5}
            strokeDasharray="2,2"
          />
        )}
      </svg>
    );
  };

  const renderLeftRuler = () => {
    const ticks = [];
    for (let y = 0; y <= canvasHeight; y += 10) {
      const isMajor = y % 50 === 0;
      const tickWidth = isMajor ? 10 : 5;
      ticks.push(
        <line
          key={`tick-v-${y}`}
          x1={20 - tickWidth}
          y1={y * zoom}
          x2={20}
          y2={y * zoom}
          stroke={isDarkMode ? '#475569' : '#94A3B8'}
          strokeWidth={1}
        />
      );
      if (isMajor) {
        ticks.push(
          <text
            key={`text-v-${y}`}
            x={2}
            y={y * zoom + 6}
            fill={isDarkMode ? '#94A3B8' : '#64748B'}
            fontSize="7px"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {y}
          </text>
        );
      }
    }
    return (
      <svg 
        style={{
          position: 'absolute',
          left: '-20px',
          top: '0',
          width: '20px',
          height: `${canvasHeight * zoom}px`,
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 10
        }}
      >
        <rect x={0} y={0} width={20} height={canvasHeight * zoom} fill={isDarkMode ? '#0f172a' : '#F8FAFC'} stroke={isDarkMode ? '#1e293b' : '#E2E8F0'} strokeWidth={1} />
        {ticks}
        {mousePos && (
          <line
            x1={0}
            y1={mousePos.y * zoom}
            x2={20}
            y2={mousePos.y * zoom}
            stroke="#3B82F6"
            strokeWidth={1.5}
            strokeDasharray="2,2"
          />
        )}
      </svg>
    );
  };

  const getElementShadowProps = (el: InvitationElement) => {
    if (el.visualEffect === 'glow') {
      const glowColor = el.outlineColor || el.textColor || '#D4AF37';
      return {
        shadowColor: getSafeColor(glowColor, '#3b82f6'),
        shadowBlur: 20,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.9,
      };
    }
    return {
      shadowColor: getSafeColor(el.shadowColor, 'transparent'),
      shadowBlur: el.shadowBlur || 0,
      shadowOffset: { x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 },
      shadowOpacity: el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0,
    };
  };

  // Deselect on clicking stage background
  const handleStageMouseDown = (e: any) => {
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'canvas-background-rect';
    if (clickedOnEmpty) {
      onSelectElement(null);
    }
  };

  // Drag element handles
  const handleDragMove = (e: any, el: InvitationElement) => {
    if (el.locked) return;
    const node = e.target;
    
    // Read current coordinates
    let x = node.x();
    let y = node.y();
    
    const width = el.width;
    const height = el.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const elCenterX = x + width / 2;
    const elCenterY = y + height / 2;
    
    const threshold = 10; // Pixels distance to snap to center
    let guideX: number | null = null;
    let guideY: number | null = null;
    
    if (snapEnabled) {
      // Horizontal Center Snapping
      if (Math.abs(elCenterX - centerX) < threshold) {
        x = centerX - width / 2;
        node.x(x);
        guideX = centerX;
      } else {
        // Fallback to standard grid snapping
        x = Math.round(x / gridGap) * gridGap;
        node.x(x);
      }
      
      // Vertical Center Snapping
      if (Math.abs(elCenterY - centerY) < threshold) {
        y = centerY - height / 2;
        node.y(y);
        guideY = centerY;
      } else {
        // Fallback to standard grid snapping
        y = Math.round(y / gridGap) * gridGap;
        node.y(y);
      }
    }
    
    setGuidelines({ x: guideX, y: guideY });
  };

  const handleDragEnd = (e: any, el: InvitationElement) => {
    if (el.locked) return;

    let newX = e.target.x();
    let newY = e.target.y();

    if (snapEnabled) {
      const width = el.width;
      const height = el.height;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const elCenterX = newX + width / 2;
      const elCenterY = newY + height / 2;
      const threshold = 10;

      if (Math.abs(elCenterX - centerX) < threshold) {
        newX = centerX - width / 2;
      } else {
        newX = Math.round(newX / gridGap) * gridGap;
      }

      if (Math.abs(elCenterY - centerY) < threshold) {
        newY = centerY - height / 2;
      } else {
        newY = Math.round(newY / gridGap) * gridGap;
      }
    }

    // Reset guidelines
    setGuidelines({ x: null, y: null });

    onUpdateElement(el.id, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handleTransformEnd = (e: any, el: InvitationElement) => {
    if (el.locked) return;
    const node = e.target;
    
    // Read the current transformed values from Konva
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    const x = node.x();
    const y = node.y();

    // Calculate new width and height based on the scale magnitude
    const newWidth = Math.max(5, node.width() * Math.abs(scaleX));
    const newHeight = Math.max(5, node.height() * Math.abs(scaleY));

    // Determine if the element is flipped (based on negative scale)
    const isFlippedX = scaleX < 0;
    const isFlippedY = scaleY < 0;

    // To prevent the element from jumping due to shifts in offsetX/offsetY when width/height changes,
    // we calculate the difference in local coordinates and rotate it to parent coordinates.
    const offsetX_old = el.flipHorizontal ? el.width : 0;
    const offsetY_old = el.flipVertical ? el.height : 0;

    const dx_local = -scaleX * offsetX_old - (isFlippedX ? newWidth : 0);
    const dy_local = -scaleY * offsetY_old - (isFlippedY ? newHeight : 0);

    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx_parent = dx_local * cos - dy_local * sin;
    const dy_parent = dx_local * sin + dy_local * cos;

    const x_new = x + dx_parent;
    const y_new = y + dy_parent;

    const roundedX = Math.round(x_new);
    const roundedY = Math.round(y_new);
    const roundedRot = Math.round(rotation);
    const roundedWidth = Math.round(newWidth);
    const roundedHeight = Math.round(newHeight);

    // Apply the exact post-transform properties directly to the Konva node
    // to prevent any temporary shrinking or shifting before React finishes updating the state.
    node.x(roundedX);
    node.y(roundedY);
    node.rotation(roundedRot);

    const isPathNode = el.type === 'shape' && !!el.path;
    const isEllipseNode = el.type === 'shape' && el.shapeType === 'circle';

    if (isPathNode) {
      node.width(24);
      node.height(24);
      node.scaleX((roundedWidth / 24) * (isFlippedX ? -1 : 1));
      node.scaleY((roundedHeight / 24) * (isFlippedY ? -1 : 1));
      node.offsetX(isFlippedX ? 24 : 0);
      node.offsetY(isFlippedY ? 24 : 0);
    } else if (isEllipseNode) {
      node.width(roundedWidth);
      node.height(roundedHeight);
      node.radiusX(roundedWidth / 2);
      node.radiusY(roundedHeight / 2);
      node.offsetX(-roundedWidth / 2);
      node.offsetY(-roundedHeight / 2);
      node.scaleX(isFlippedX ? -1 : 1);
      node.scaleY(isFlippedY ? -1 : 1);
    } else {
      node.width(roundedWidth);
      node.height(roundedHeight);
      node.offsetX(isFlippedX ? roundedWidth : 0);
      node.offsetY(isFlippedY ? roundedHeight : 0);
      node.scaleX(isFlippedX ? -1 : 1);
      node.scaleY(isFlippedY ? -1 : 1);
    }

    onUpdateElement(el.id, {
      x: roundedX,
      y: roundedY,
      width: roundedWidth,
      height: roundedHeight,
      rotation: roundedRot,
      flipHorizontal: isFlippedX,
      flipVertical: isFlippedY,
    });
  };

  // Attach transformer to selected element node
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne('#' + selectedId);
        if (selectedNode) {
          const el = elements.find(item => item.id === selectedId);
          if (el && el.locked) {
            transformerRef.current.nodes([]); // Hide transform handles if locked
          } else {
            transformerRef.current.nodes([selectedNode]);
          }
          transformerRef.current.getLayer().batchDraw();
          return;
        }
      }
      transformerRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  // Preload Google Fonts when selected in design elements to force Konva refresh
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;

    const fontFamilies = new Set<string>();
    elements.forEach((el) => {
      if (el.type === 'text' && el.fontFamily) {
        fontFamilies.add(el.fontFamily);
      }
    });

    fontFamilies.forEach((fontFamily) => {
      document.fonts.load(`12px "${fontFamily}"`).then(() => {
        if (stageRef.current) {
          stageRef.current.batchDraw();
        }
      }).catch((err) => {
        console.warn(`[Canvas] Failed to preload font: ${fontFamily}`, err);
      });
    });
  }, [elements]);

  // Render decorative gridlines
  const renderGridLines = () => {
    if (!gridEnabled) return null;
    const lines = [];
    
    // Vertical lines
    for (let i = gridGap; i < canvasWidth; i += gridGap) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke="rgba(59, 130, 246, 0.28)"
          strokeWidth={1}
        />
      );
    }
    // Horizontal lines
    for (let i = gridGap; i < canvasHeight; i += gridGap) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, canvasWidth, i]}
          stroke="rgba(59, 130, 246, 0.28)"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  // Check if background color or gradient should be drawn
  const getBackgroundFillProps = () => {
    if (background.type === 'color') {
      return { fill: getSafeColor(background.color, '#ffffff') };
    } else {
      // Linear Gradient configuration
      const angleRad = (background.gradientAngle * Math.PI) / 180;
      const x1 = Math.cos(angleRad) * 0.5 + 0.5;
      const y1 = Math.sin(angleRad) * -0.5 + 0.5;
      const x2 = Math.cos(angleRad) * -0.5 + 0.5;
      const y2 = Math.sin(angleRad) * 0.5 + 0.5;

      return {
        fillLinearGradientStartPoint: { x: x1 * canvasWidth, y: y1 * canvasHeight },
        fillLinearGradientEndPoint: { x: x2 * canvasWidth, y: y2 * canvasHeight },
        fillLinearGradientColorStops: [
          0, getSafeColor(background.gradientStart, '#ffffff'), 
          1, getSafeColor(background.gradientEnd, '#e2e8f0')
        ],
      };
    }
  };

  return (
    <div 
      className={`flex-1 overflow-auto flex items-start justify-center p-8 select-none relative transition-all duration-300 ${
        isDarkMode ? 'bg-[#0f172a]' : 'bg-[#eef2f6]'
      }`} 
      id="editor-workspace-canvas"
    >
      {/* Subtle Dot Grid Background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-300" 
        style={{ 
          backgroundImage: isDarkMode 
            ? 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)' 
            : 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}
      ></div>

      {/* Phone Case Silhouette Mockup */}
      <div 
        className="relative bg-slate-900 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 transition-all duration-300"
        style={{
          width: `${(canvasWidth + 28) * zoom}px`,
          height: `${(canvasHeight + 28) * zoom}px`,
        }}
      >
        {/* Notch / Speaker bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center space-x-1.5">
          <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* Canvas stage viewport wrapper positioned with Top and Left Rulers */}
        <div className="relative">
          {rulerEnabled && renderTopRuler()}
          {rulerEnabled && renderLeftRuler()}

          <div 
            className="bg-white rounded-[32px] overflow-hidden relative shadow-inner"
            style={{
              width: `${canvasWidth * zoom}px`,
              height: `${canvasHeight * zoom}px`,
            }}
          >
            {settings?.particleEffect && settings.particleEffect !== 'none' && (
              <ParticleEffect type={settings.particleEffect} />
            )}
            <Stage
              ref={stageRef}
              width={canvasWidth * zoom}
              height={canvasHeight * zoom}
              scaleX={zoom}
              scaleY={zoom}
              onMouseDown={handleStageMouseDown}
              onTouchStart={handleStageMouseDown}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onContextMenu={handleContextMenu}
            >
            {/* Background Layer */}
            <Layer>
              {/* Base Color / Gradient Rect */}
              {background.type === 'image' ? (
                <URLImage
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  src={background.imageUrl}
                  listening={false}
                  name="canvas-background-image"
                />
              ) : (
                <Rect
                  name="canvas-background-rect"
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  {...getBackgroundFillProps()}
                />
              )}

              {/* Tint Overlay for Texture */}
              {background.overlayOpacity > 0 && (
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill={getSafeColor(background.overlayColor, '#000000')}
                  opacity={background.overlayOpacity}
                  listening={false}
                />
              )}

              {/* Safe Area Guides (Light outline) */}
              {safeAreaEnabled && (
                <Group listening={false}>
                  {/* Inside safe area outline */}
                  <Rect
                    x={20}
                    y={35}
                    width={canvasWidth - 40}
                    height={canvasHeight - 70}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.6}
                  />
                  <Text
                    text="SAFE DESIGN ZONE"
                    x={25}
                    y={42}
                    fontSize={7}
                    fontFamily="Montserrat"
                    fill="#3b82f6"
                    letterSpacing={1.5}
                    opacity={0.8}
                  />
                </Group>
              )}

              {/* Thin Grid overlay */}
              {renderGridLines()}
            </Layer>

            {/* Design Elements Layer */}
            <Layer>
              {elements.map((el) => {
                if (el.hidden) return null;

                const isSelected = selectedId === el.id;

                // 1. Text rendering
                if (el.type === 'text') {
                  const isBold = el.fontWeight === 'bold';
                  const isItalic = el.fontStyle === 'italic';
                  let fontStyleStr = 'normal';
                  if (isBold && isItalic) fontStyleStr = 'italic bold';
                  else if (isBold) fontStyleStr = 'bold';
                  else if (isItalic) fontStyleStr = 'italic';

                  let displayText = el.text || '';
                  if (displayText.includes('{{guest_name}}')) {
                    displayText = displayText.replace(/\{\{guest_name\}\}/g, 'Kenzo Alfarezel');
                  }
                  if (el.textTransform === 'uppercase') {
                    displayText = displayText.toUpperCase();
                  } else if (el.textTransform === 'lowercase') {
                    displayText = displayText.toLowerCase();
                  } else if (el.textTransform === 'capitalize') {
                    displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
                  }

                  return (
                    <Text
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      text={displayText}
                      fontFamily={el.fontFamily || 'Inter'}
                      fontSize={el.fontSize || 14}
                      fontStyle={fontStyleStr}
                      fill={getSafeColor(el.textColor, '#000000')}
                      align={el.textAlign || 'center'}
                      letterSpacing={el.letterSpacing || 0}
                      lineHeight={el.lineHeight || 1.2}
                      shadowColor={getSafeColor(el.shadowColor, 'transparent')}
                      shadowBlur={el.shadowBlur}
                      shadowOffset={{ x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 }}
                      shadowOpacity={el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0}
                      stroke={el.outlineWidth && el.outlineWidth > 0 ? getSafeColor(el.outlineColor, '#D4AF37') : undefined}
                      strokeWidth={el.outlineWidth || 0}
                      fillAfterStroke={true}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    />
                  );
                }

                // 2. Image rendering
                if (el.type === 'image') {
                  return (
                    <URLImage
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      src={el.src}
                      cropX={el.cropX}
                      cropY={el.cropY}
                      cropWidth={el.cropWidth}
                      cropHeight={el.cropHeight}
                      frameStyle={el.frameStyle}
                      borderRadius={
                        el.frameStyle === 'classic_arch_gold' ? [el.width / 2, el.width / 2, 8, 8] :
                        el.frameStyle === 'organic_asymmetric' ? [140, 40, 140, 40] :
                        el.frameStyle === 'gilded_vintage_filigree' ? el.width / 2 :
                        el.frameStyle === 'javanese_joglo_gunungan' ? [90, 90, 12, 12] :
                        el.borderRadius || 0
                      }
                      blur={el.blur || 0}
                      brightness={el.brightness ?? 1}
                      contrast={el.contrast ?? 1}
                      hueRotate={el.hueRotate || 0}
                      stroke={getSafeColor(el.borderColor, '#D4AF37')}
                      strokeWidth={el.borderWidth || 0}
                      shadowColor={getSafeColor(el.shadowColor, 'transparent')}
                      shadowBlur={el.shadowBlur}
                      shadowOffset={{ x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 }}
                      shadowOpacity={el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    />
                  );
                }

                // 3. Shape / Accent vectors rendering
                if (el.type === 'shape') {
                  if (el.shapeType === 'circle') {
                    return (
                      <Ellipse
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        radiusX={el.width / 2}
                        radiusY={el.height / 2}
                        offsetX={-el.width / 2}
                        offsetY={-el.height / 2}
                        width={el.width}
                        height={el.height}
                        rotation={el.rotation}
                        scaleX={el.flipHorizontal ? -1 : 1}
                        scaleY={el.flipVertical ? -1 : 1}
                        opacity={el.opacity}
                        fill={getSafeColor(el.backgroundColor, 'transparent')}
                        stroke={el.borderColor ? getSafeColor(el.borderColor, '#D4AF37') : undefined}
                        strokeWidth={el.borderWidth || 0}
                        shadowColor={getSafeColor(el.shadowColor, 'transparent')}
                        shadowBlur={el.shadowBlur}
                        shadowOffset={{ x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 }}
                        shadowOpacity={el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0}
                        draggable={!el.locked}
                        onClick={() => onSelectElement(el.id)}
                        onTouchStart={() => onSelectElement(el.id)}
                        onDragMove={(e) => handleDragMove(e, el)}
                        onDragEnd={(e) => handleDragEnd(e, el)}
                        onTransformEnd={(e) => handleTransformEnd(e, el)}
                      />
                    );
                  }

                  if (el.path) {
                    // Standard original viewBox scale factor (24px grid)
                    const originalScaleX = el.width / 24;
                    const originalScaleY = el.height / 24;
                    
                    return (
                      <Path
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        width={24}
                        height={24}
                        rotation={el.rotation}
                        scaleX={originalScaleX * (el.flipHorizontal ? -1 : 1)}
                        scaleY={originalScaleY * (el.flipVertical ? -1 : 1)}
                        offsetX={el.flipHorizontal ? 24 : 0}
                        offsetY={el.flipVertical ? 24 : 0}
                        opacity={el.opacity}
                        data={el.path}
                        fill={getSafeColor(el.backgroundColor, 'transparent')}
                        stroke={el.borderColor ? getSafeColor(el.borderColor, '#D4AF37') : undefined}
                        strokeWidth={el.borderWidth ? el.borderWidth / originalScaleX : 0} // Scale strokeWidth inversely
                        shadowColor={getSafeColor(el.shadowColor, 'transparent')}
                        shadowBlur={el.shadowBlur}
                        shadowOffset={{ x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 }}
                        shadowOpacity={el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0}
                        draggable={!el.locked}
                        onClick={() => onSelectElement(el.id)}
                        onTouchStart={() => onSelectElement(el.id)}
                        onDragMove={(e) => handleDragMove(e, el)}
                        onDragEnd={(e) => handleDragEnd(e, el)}
                        onTransformEnd={(e) => handleTransformEnd(e, el)}
                      />
                    );
                  }

                  // Default Fallback: Rect
                  return (
                    <Rect
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      fill={getSafeColor(el.backgroundColor, 'transparent')}
                      stroke={el.borderColor ? getSafeColor(el.borderColor, '#D4AF37') : undefined}
                      strokeWidth={el.borderWidth || 0}
                      cornerRadius={el.borderRadius || 0}
                      shadowColor={getSafeColor(el.shadowColor, 'transparent')}
                      shadowBlur={el.shadowBlur}
                      shadowOffset={{ x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 }}
                      shadowOpacity={el.shadowColor && getSafeColor(el.shadowColor, 'transparent') !== 'transparent' ? 0.5 : 0}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    />
                  );
                }

                // 4. Divider rendering
                if (el.type === 'divider') {
                  return (
                    <Rect
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height || 2}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      fill={getSafeColor(el.backgroundColor, '#D4AF37')}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    />
                  );
                }

                // 5. Button rendering
                if (el.type === 'button') {
                  return (
                    <Group
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    >
                      {/* Button back */}
                      <Rect
                        x={0}
                        y={0}
                        width={el.width}
                        height={el.height}
                        fill={getSafeColor(el.backgroundColor, '#0F172A')}
                        cornerRadius={el.borderRadius || 99}
                      />
                      {/* Button text overlay */}
                      <Text
                        text={el.text || 'CLICK ME'}
                        x={0}
                        y={el.height / 2 - 6}
                        width={el.width}
                        align="center"
                        fontSize={el.fontSize || 11}
                        fontFamily={el.fontFamily || 'Montserrat'}
                        fill={getSafeColor(el.textColor, '#FFFFFF')}
                        fontStyle="bold"
                        letterSpacing={1.5}
                      />
                    </Group>
                  );
                }

                // 6. Interactive components elements / Widgets
                if (el.type === 'widget') {
                  const bgFill = getSafeColor(el.backgroundColor, 'rgba(255, 255, 255, 0.9)');
                  const borderStroke = getSafeColor(el.borderColor, '#E2E8F0');
                  const strokeWidth = el.borderWidth || 1;

                  return (
                    <Group
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      scaleX={el.flipHorizontal ? -1 : 1}
                      scaleY={el.flipVertical ? -1 : 1}
                      offsetX={el.flipHorizontal ? el.width : 0}
                      offsetY={el.flipVertical ? el.height : 0}
                      opacity={el.opacity}
                      draggable={!el.locked}
                      onClick={() => onSelectElement(el.id)}
                      onTouchStart={() => onSelectElement(el.id)}
                      onDragMove={(e) => handleDragMove(e, el)}
                      onDragEnd={(e) => handleDragEnd(e, el)}
                      onTransformEnd={(e) => handleTransformEnd(e, el)}
                    >
                      {/* Card frame (hide for custom shaped widgets) */}
                      {el.widgetType !== 'event' && el.widgetType !== 'gift' && (
                        <Rect
                          x={0}
                          y={0}
                          width={el.width}
                          height={el.height}
                          fill={el.hideBackground ? 'transparent' : bgFill}
                          stroke={el.hideBackground ? 'transparent' : borderStroke}
                          strokeWidth={el.hideBackground ? 0 : strokeWidth}
                          cornerRadius={el.borderRadius || 12}
                        />
                      )}

                      {/* Interactive Widget Visual Overlays */}
                      {el.widgetType === 'countdown' && (
                        <Group>
                          <Text
                            text={(el.widgetConfig?.title || 'SAVING THE DATE').toUpperCase()}
                            x={10}
                            y={14}
                            width={el.width - 20}
                            align="center"
                            fontSize={8}
                            fontFamily="Montserrat"
                            fill="#8C7A5B"
                            letterSpacing={2}
                            fontStyle="bold"
                          />
                          {/* Visual circles */}
                          <Text
                            text="05d : 12h : 44m : 18s"
                            x={10}
                            y={35}
                            width={el.width - 20}
                            align="center"
                            fontSize={16}
                            fontFamily="Cinzel"
                            fill="#1E293B"
                            letterSpacing={1}
                            fontStyle="bold"
                          />
                          <Text
                            text="Active Wedding Countdown (Live in Preview)"
                            x={10}
                            y={58}
                            width={el.width - 20}
                            align="center"
                            fontSize={7}
                            fontFamily="Inter"
                            fill="#94A3B8"
                          />
                        </Group>
                      )}

                      {el.widgetType === 'rsvp' && (() => {
                        const rsvpTextColor = el.textColor || '#2D271E';
                        const rsvpTitle = (el.widgetConfig?.title || 'Konfirmasi Kehadiran').toUpperCase();
                        const rsvpBtnColor = el.widgetConfig?.buttonColor || '#D4AF37';
                        const rsvpBtnTextColor = el.widgetConfig?.buttonTextColor || '#111625';
                        const rsvpInputBg = el.widgetConfig?.inputBgColor || '#F8FAFC';
                        const rsvpInputText = el.widgetConfig?.inputTextColor || '#1E293B';
                        const rsvpBorder = el.borderColor || '#E2E8F0';

                        return (
                          <Group>
                            <Text
                              text={rsvpTitle}
                              x={10}
                              y={12}
                              width={el.width - 20}
                              align="center"
                              fontSize={9}
                              fontFamily="Cinzel"
                              fill={rsvpTextColor}
                              letterSpacing={1.5}
                              fontStyle="bold"
                            />
                            {/* Subtitle */}
                            <Text
                              text="Mohon konfirmasi kehadiran Anda..."
                              x={10}
                              y={25}
                              width={el.width - 20}
                              align="center"
                              fontSize={6}
                              fontFamily="Inter"
                              fill={rsvpTextColor}
                              opacity={0.7}
                            />
                            {/* Input box mockup */}
                            <Rect
                              x={15}
                              y={38}
                              width={el.width - 30}
                              height={16}
                              fill={rsvpInputBg}
                              stroke={rsvpBorder}
                              strokeWidth={0.75}
                              cornerRadius={4}
                            />
                            <Text
                              text="Nama Lengkap Anda..."
                              x={22}
                              y={43}
                              fontSize={7}
                              fontFamily="Inter"
                              fill={rsvpInputText}
                              opacity={0.6}
                            />
                            {/* Buttons Hadir/Absen/Ragu row */}
                            <Rect
                              x={15}
                              y={60}
                              width={(el.width - 40) / 3}
                              height={16}
                              fill={rsvpBtnColor}
                              cornerRadius={4}
                            />
                            <Text
                              text="✓ Hadir"
                              x={15}
                              y={65}
                              width={(el.width - 40) / 3}
                              align="center"
                              fontSize={6.5}
                              fontFamily="Inter"
                              fontStyle="bold"
                              fill={rsvpBtnTextColor}
                            />

                            <Rect
                              x={15 + (el.width - 40) / 3 + 5}
                              y={60}
                              width={(el.width - 40) / 3}
                              height={16}
                              fill={rsvpInputBg}
                              stroke={rsvpBorder}
                              strokeWidth={0.75}
                              cornerRadius={4}
                            />
                            <Text
                              text="✗ Absen"
                              x={15 + (el.width - 40) / 3 + 5}
                              y={65}
                              width={(el.width - 40) / 3}
                              align="center"
                              fontSize={6.5}
                              fontFamily="Inter"
                              fill={rsvpTextColor}
                            />

                            <Rect
                              x={15 + 2 * ((el.width - 40) / 3) + 10}
                              y={60}
                              width={(el.width - 40) / 3}
                              height={16}
                              fill={rsvpInputBg}
                              stroke={rsvpBorder}
                              strokeWidth={0.75}
                              cornerRadius={4}
                            />
                            <Text
                              text="? Ragu"
                              x={15 + 2 * ((el.width - 40) / 3) + 10}
                              y={65}
                              width={(el.width - 40) / 3}
                              align="center"
                              fontSize={6.5}
                              fontFamily="Inter"
                              fill={rsvpTextColor}
                            />
                            {/* Wishes input mockup */}
                            <Rect
                              x={15}
                              y={84}
                              width={el.width - 30}
                              height={20}
                              fill={rsvpInputBg}
                              stroke={rsvpBorder}
                              strokeWidth={0.75}
                              cornerRadius={4}
                            />
                            <Text
                              text="Kirim Doa & Ucapan Terbaik Anda..."
                              x={22}
                              y={90}
                              fontSize={6.5}
                              fontFamily="Inter"
                              fill={rsvpInputText}
                              opacity={0.5}
                            />

                            {/* Submit button mockup */}
                            <Rect
                              x={15}
                              y={112}
                              width={el.width - 30}
                              height={18}
                              fill={rsvpBtnColor}
                              cornerRadius={4}
                            />
                            <Text
                              text="KIRIM KONFIRMASI"
                              x={15}
                              y={118}
                              width={el.width - 30}
                              align="center"
                              fontSize={7.5}
                              fontFamily="Montserrat"
                              fill={rsvpBtnTextColor}
                              fontStyle="bold"
                              letterSpacing={0.5}
                            />

                            {/* Total replies */}
                            <Text
                              text={`Join ${el.widgetConfig?.rsvpSubmissionCount || 24} guests already attending`}
                              x={10}
                              y={136}
                              width={el.width - 20}
                              align="center"
                              fontSize={6.5}
                              fontFamily="Inter"
                              fill={rsvpTextColor}
                              fontStyle="italic"
                              opacity={0.8}
                            />
                          </Group>
                        );
                      })()}

                      {el.widgetType === 'gift' && (() => {
                        const style = el.widgetConfig?.giftCardStyle || 'bca-blue';
                        const bankName = el.widgetConfig?.giftBankName || 'Bank BCA';
                        const accountNumber = el.widgetConfig?.giftAccountNumber || '843-0912-881';
                        const recipientName = el.widgetConfig?.giftRecipientName || 'Sophia & William';

                        // Set colors and branding text based on style for Konva rendering
                        let cardBg = '#1e40af'; // bca-blue
                        let titleColor = '#93c5fd';
                        let textColor = '#ffffff';
                        let cardLabel = 'DEBIT CARD';

                        if (style === 'mandiri-navy') {
                          cardBg = '#0f172a';
                          titleColor = '#94a3b8';
                          cardLabel = 'DEBIT CARD';
                        } else if (style === 'bni-emerald') {
                          cardBg = '#064e3b';
                          titleColor = '#6ee7b7';
                          cardLabel = 'DEBIT CARD';
                        } else if (style === 'luxury-gold') {
                          cardBg = '#171717';
                          titleColor = '#fbbf24';
                          textColor = '#fef3c7';
                          cardLabel = 'VIP PRIVE';
                        }

                        return (
                          <Group>
                            {/* Background Rect to override default widget white card */}
                            <Rect
                              width={el.width}
                              height={el.height}
                              fill={cardBg}
                              cornerRadius={10}
                            />
                            {/* Chip */}
                            <Rect
                              x={12}
                              y={12}
                              width={24}
                              height={18}
                              fill="#fbbf24"
                              cornerRadius={3}
                              stroke="#d97706"
                              strokeWidth={1}
                            />
                            {/* Label */}
                            <Text
                              text={cardLabel}
                              x={45}
                              y={12}
                              width={el.width - 60}
                              align="right"
                              fontSize={6}
                              fontFamily="Inter"
                              fill={titleColor}
                              fontStyle="bold"
                            />
                            {/* Bank name */}
                            <Text
                              text={bankName.toUpperCase()}
                              x={45}
                              y={20}
                              width={el.width - 60}
                              align="right"
                              fontSize={8}
                              fontFamily="Inter"
                              fill={textColor}
                              fontStyle="bold"
                            />
                            {/* Account number */}
                            <Text
                              text={accountNumber}
                              x={12}
                              y={el.height / 2 - 6}
                              width={el.width - 24}
                              align="left"
                              fontSize={11}
                              fontFamily="monospace"
                              fill={textColor}
                              fontStyle="bold"
                            />
                            {/* Recipient name */}
                            <Text
                              text={recipientName.toUpperCase()}
                              x={12}
                              y={el.height - 20}
                              width={el.width - 24}
                              align="left"
                              fontSize={8}
                              fontFamily="Inter"
                              fill={textColor}
                              fontStyle="bold"
                            />
                          </Group>
                        );
                      })()}

                      {(el.widgetType === 'maps' || el.widgetType === 'location') && (
                        <Group>
                          <Text
                            text="GOOGLE MAPS DIRECTIONS"
                            x={10}
                            y={12}
                            width={el.width - 20}
                            align="center"
                            fontSize={8}
                            fontFamily="Montserrat"
                            fill="#D4AF37"
                            letterSpacing={1.5}
                            fontStyle="bold"
                          />
                          <Text
                            text={el.widgetConfig?.eventLocationName || 'The Ballroom, Ritz-Carlton'}
                            x={10}
                            y={27}
                            width={el.width - 20}
                            align="center"
                            fontSize={9}
                            fontFamily="Cinzel"
                            fill="#1E293B"
                            fontStyle="bold"
                          />
                          {/* Mock Map pin icon representation */}
                          <Rect
                            x={15}
                            y={44}
                            width={el.width - 30}
                            height={22}
                            fill="#3B82F6"
                            cornerRadius={6}
                          />
                          <Text
                            text="📍 OPEN GOOGLE MAPS"
                            x={15}
                            y={51}
                            width={el.width - 30}
                            align="center"
                            fontSize={8}
                            fontFamily="Montserrat"
                            fill="#FFFFFF"
                            fontStyle="bold"
                            letterSpacing={1}
                          />
                        </Group>
                      )}

                      {el.widgetType === 'event' && (() => {
                        const style = el.widgetConfig?.eventCardStyle || 'classic-arch';
                        const title = (el.widgetConfig?.title || 'THE WEDDING CEREMONY').toUpperCase();
                        const date = el.widgetConfig?.eventDate || '2026-10-24';
                        const time = el.widgetConfig?.eventTime || '06:00 PM - 10:00 PM';
                        const location = el.widgetConfig?.eventLocationName || 'Glass Greenhouse, Jakarta';
                        const bgFill = getSafeColor(el.backgroundColor, 'rgba(255, 255, 255, 0.9)');
                        const borderStroke = getSafeColor(el.borderColor, '#E2E8F0');
                        const strokeWidth = el.borderWidth || 1;

                        const renderShape = () => {
                          if (style === 'classic-arch') {
                            return (
                              <Path
                                data={`M 0,${el.width / 2} A ${el.width / 2} ${el.width / 2} 0 0 1 ${el.width} ${el.width / 2} L ${el.width},${el.height} L 0,${el.height} Z`}
                                fill="#FDFBF7"
                                stroke="#D4AF37"
                                strokeWidth={2}
                                shadowColor="#000000"
                                shadowBlur={10}
                                shadowOpacity={0.1}
                                shadowOffsetY={4}
                              />
                            );
                          }
                          if (style === 'rustic-oval') {
                            return (
                              <Ellipse
                                x={el.width / 2}
                                y={el.height / 2}
                                radiusX={el.width / 2}
                                radiusY={el.height / 2}
                                fill="#FCF8EE"
                                stroke="#8C7A5B"
                                strokeWidth={1.5}
                                shadowColor="#000000"
                                shadowBlur={8}
                                shadowOpacity={0.1}
                                shadowOffsetY={2}
                              />
                            );
                          }
                          if (style === 'luxury-ticket') {
                            const r = 10;
                            return (
                              <Path
                                data={`M ${r},0 L ${el.width - r},0 A ${r} ${r} 0 0 0 ${el.width} ${r} L ${el.width},${el.height - r} A ${r} ${r} 0 0 0 ${el.width - r} ${el.height} L ${r},${el.height} A ${r} ${r} 0 0 0 0 ${el.height - r} L 0,${r} A ${r} ${r} 0 0 0 ${r} 0 Z`}
                                fill="#171717"
                                stroke="#D4AF37"
                                strokeWidth={1}
                                shadowColor="#000000"
                                shadowBlur={25}
                                shadowOpacity={0.3}
                                shadowOffsetY={10}
                              />
                            );
                          }
                          // Default modern-square
                          return (
                            <Rect
                              x={0}
                              y={0}
                              width={el.width}
                              height={el.height}
                              fill="#0F172A"
                              stroke="#334155"
                              strokeWidth={1}
                              cornerRadius={4}
                              shadowColor="#000000"
                              shadowBlur={15}
                              shadowOpacity={0.2}
                              shadowOffsetY={5}
                            />
                          );
                        };

                        const isLeftAligned = style === 'modern-square';
                        const textX = isLeftAligned ? 15 : 10;
                        const textW = el.width - (isLeftAligned ? 30 : 20);
                        const align = isLeftAligned ? "left" : "center";

                        let titleColor = "#8C7A5B";
                        if (style === 'modern-square' || style === 'luxury-ticket') titleColor = "#FFFFFF";

                        let dateColor = "#1E293B";
                        if (style === 'modern-square') dateColor = "#E2E8F0";
                        if (style === 'luxury-ticket') dateColor = "#D4AF37";

                        let timeColor = "#475569";
                        if (style === 'modern-square') timeColor = "#94A3B8";
                        if (style === 'luxury-ticket') timeColor = "#CBD5E1";

                        let btnBg = "#1E293B";
                        let btnText = "#FFFFFF";
                        if (style === 'modern-square') { btnBg = "#2563EB"; btnText = "#FFFFFF"; }
                        if (style === 'luxury-ticket') { btnBg = "#D4AF37"; btnText = "#000000"; }

                        return (
                          <Group>
                            {renderShape()}
                            <Text
                              text={title}
                              x={textX}
                              y={style === 'classic-arch' ? 24 : 14}
                              width={textW}
                              align={align}
                              fontSize={9}
                              fontFamily={style === 'classic-arch' ? "Cinzel" : "Montserrat"}
                              fill={titleColor}
                              letterSpacing={1.5}
                              fontStyle="bold"
                            />
                            <Text
                              text={date}
                              x={textX}
                              y={style === 'classic-arch' ? 45 : 35}
                              width={textW}
                              fontSize={10}
                              align={align}
                              fontFamily="Montserrat"
                              fill={dateColor}
                              fontStyle="bold"
                            />
                            <Text
                              text={`⏰ ${time}`}
                              x={textX}
                              y={style === 'classic-arch' ? 60 : 50}
                              width={textW}
                              fontSize={8.5}
                              align={align}
                              fontFamily="Inter"
                              fill={timeColor}
                            />
                            <Text
                              text={`📍 ${location}`}
                              x={textX}
                              y={style === 'classic-arch' ? 75 : 65}
                              width={textW}
                              fontSize={8.5}
                              align={align}
                              fontFamily="Cormorant Garamond"
                              fill={timeColor}
                              fontStyle="italic"
                            />
                            {/* Add to Calendar Button */}
                            <Rect
                              x={isLeftAligned ? 15 : el.width / 2 - 40}
                              y={style === 'classic-arch' ? 95 : 85}
                              width={80}
                              height={18}
                              fill={btnBg}
                              cornerRadius={9}
                            />
                            <Text
                              text="Save to Calendar"
                              x={isLeftAligned ? 15 : el.width / 2 - 40}
                              y={style === 'classic-arch' ? 101 : 91}
                              width={80}
                              align="center"
                              fontSize={6}
                              fontFamily="Inter"
                              fill={btnText}
                              fontStyle="bold"
                              letterSpacing={0.5}
                            />
                          </Group>
                        );
                      })()}

                      {el.widgetType === 'music' && (() => {
                        const style = el.widgetConfig?.musicStyle || 'vinyl';
                        const w = el.width || 60;
                        const h = el.height || 60;
                        const r = Math.min(w, h) / 2;
                        const cx = w / 2;
                        const cy = h / 2;

                        return (
                          <Group>
                            {/* 1. Base Disk */}
                            <Circle
                              x={cx}
                              y={cy}
                              radius={r - 4}
                              fill={
                                style === 'vinyl' ? '#111111' :
                                style === 'gold-wreath' ? '#FFF5F5' :
                                style === 'traditional-gong' ? '#D4AF37' :
                                style === 'neon-heart' ? '#FFF1F2' :
                                '#FAF9F6' // royal-lace
                              }
                              stroke={
                                style === 'vinyl' ? '#D4AF37' :
                                style === 'gold-wreath' ? '#FDA4AF' :
                                style === 'traditional-gong' ? '#92400E' :
                                style === 'neon-heart' ? '#F43F5E' :
                                '#D4AF37' // royal-lace
                              }
                              strokeWidth={style === 'neon-heart' ? 2 : 1.5}
                              shadowColor="#000"
                              shadowBlur={4}
                              shadowOffset={{ x: 0, y: 2 }}
                              shadowOpacity={0.15}
                            />

                            {/* 2. Concentric details / grooves / center */}
                            {style === 'vinyl' && (
                              <Group>
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.8} stroke="#333" strokeWidth={0.5} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.65} stroke="#333" strokeWidth={0.5} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.5} stroke="#333" strokeWidth={0.5} />
                                {/* Gold Center Label */}
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.35} fill="#D4AF37" />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.1} fill="#FAF9F6" />
                              </Group>
                            )}

                            {style === 'gold-wreath' && (
                              <Group>
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.8} stroke="#F472B6" strokeWidth={0.75} dash={[2, 2]} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.4} fill="#FFE4E6" />
                                <Text text="🌸" x={cx - 5} y={cy - 5} fontSize={9} />
                              </Group>
                            )}

                            {style === 'traditional-gong' && (
                              <Group>
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.75} stroke="#92400E" strokeWidth={0.75} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.5} stroke="#92400E" strokeWidth={0.5} />
                                {/* Gong center knob */}
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.25} fill="#92400E" shadowBlur={2} shadowColor="#000" shadowOpacity={0.3} />
                              </Group>
                            )}

                            {style === 'neon-heart' && (
                              <Group>
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.8} stroke="#FDA4AF" strokeWidth={0.5} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.4} fill="#FFE4E6" />
                                <Text text="❤️" x={cx - 6} y={cy - 5} fontSize={10} />
                              </Group>
                            )}

                            {style === 'royal-lace' && (
                              <Group>
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.85} stroke="#D4AF37" strokeWidth={0.75} dash={[3, 2]} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.7} stroke="#D4AF37" strokeWidth={0.5} />
                                <Circle x={cx} y={cy} radius={(r - 4) * 0.35} fill="#D4AF37" />
                                <Text text="👑" x={cx - 5} y={cy - 5} fontSize={8} fill="#fff" />
                              </Group>
                            )}
                          </Group>
                        );
                      })()}

                      {el.widgetType === 'gallery' && (() => {
                        const title = (el.widgetConfig?.title || 'Galeri Foto').toUpperCase();
                        const images = el.widgetConfig?.images || [];
                        const layoutStyle = el.widgetConfig?.galleryStyle || 'slide';
                        
                        return (
                          <Group>
                            <Text
                              text={title}
                              x={10}
                              y={12}
                              width={el.width - 20}
                              align="center"
                              fontSize={9}
                              fontFamily="Montserrat"
                              fill="#8C7A5B"
                              letterSpacing={1.5}
                              fontStyle="bold"
                            />
                            
                            {/* Real-time Layout renders */}
                            {images.length === 0 ? (
                              <Group>
                                <Rect
                                  x={15}
                                  y={30}
                                  width={el.width - 30}
                                  height={el.height - 70}
                                  fill="#F8FAFC"
                                  stroke="#CBD5E1"
                                  strokeWidth={1}
                                  cornerRadius={6}
                                />
                                <Text
                                  text="📸 Galeri Foto Kosong"
                                  x={20}
                                  y={el.height / 2 - 10}
                                  width={el.width - 40}
                                  align="center"
                                  fontSize={10}
                                  fontFamily="Inter"
                                  fill="#64748B"
                                  fontStyle="bold"
                                />
                                <Text
                                  text="Silakan upload foto di panel properti"
                                  x={20}
                                  y={el.height / 2 + 10}
                                  width={el.width - 40}
                                  align="center"
                                  fontSize={8}
                                  fontFamily="Inter"
                                  fill="#94A3B8"
                                />
                              </Group>
                            ) : layoutStyle === 'slide' ? (
                              <Group>
                                <URLImage
                                  src={images[0]}
                                  x={15}
                                  y={30}
                                  width={el.width - 30}
                                  height={el.height - 70}
                                  borderRadius={6}
                                />
                                {/* Carousel indicators overlay */}
                                <Circle x={30} y={el.height / 2} radius={10} fill="rgba(255,255,255,0.7)" />
                                <Text text="&lt;" x={27} y={el.height / 2 - 5} fontSize={10} fill="#475569" fontStyle="bold" />
                                <Circle x={el.width - 30} y={el.height / 2} radius={10} fill="rgba(255,255,255,0.7)" />
                                <Text text="&gt;" x={el.width - 33} y={el.height / 2 - 5} fontSize={10} fill="#475569" fontStyle="bold" />
                                
                                <Circle x={el.width / 2 - 10} y={el.height - 25} radius={3} fill="#D4AF37" />
                                <Circle x={el.width / 2} y={el.height - 25} radius={3} fill="#CBD5E1" />
                                <Circle x={el.width / 2 + 10} y={el.height - 25} radius={3} fill="#CBD5E1" />
                              </Group>
                            ) : layoutStyle === 'grid' ? (() => {
                              const colW = (el.width - 30 - 8) / 3;
                              const rowH = (el.height - 60 - 4) / 2;
                              return (
                                <Group>
                                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                                    const col = idx % 3;
                                    const row = Math.floor(idx / 3);
                                    const imgX = 15 + col * (colW + 4);
                                    const imgY = 30 + row * (rowH + 4);
                                    const imgUrl = images[idx];
                                    
                                    return imgUrl ? (
                                      <URLImage
                                        key={idx}
                                        src={imgUrl}
                                        x={imgX}
                                        y={imgY}
                                        width={colW}
                                        height={rowH}
                                        borderRadius={4}
                                      />
                                    ) : (
                                      <Rect
                                        key={idx}
                                        x={imgX}
                                        y={imgY}
                                        width={colW}
                                        height={rowH}
                                        fill="#F1F5F9"
                                        stroke="#E2E8F0"
                                        strokeWidth={1}
                                        cornerRadius={4}
                                      />
                                    );
                                  })}
                                </Group>
                              );
                            })() : (() => {
                              const mainW = (el.width - 30) * 0.65;
                              const sideW = (el.width - 30) * 0.32;
                              const sideH = (el.height - 60 - 4) / 2;
                              
                              return (
                                <Group>
                                  {images[0] ? (
                                    <URLImage
                                      src={images[0]}
                                      x={15}
                                      y={30}
                                      width={mainW}
                                      height={el.height - 60}
                                      borderRadius={6}
                                    />
                                  ) : (
                                    <Rect x={15} y={30} width={mainW} height={el.height - 60} fill="#F1F5F9" stroke="#E2E8F0" strokeWidth={1} cornerRadius={6} />
                                  )}
                                  
                                  {images[1] ? (
                                    <URLImage
                                      src={images[1]}
                                      x={15 + mainW + 4}
                                      y={30}
                                      width={sideW}
                                      height={sideH}
                                      borderRadius={4}
                                    />
                                  ) : (
                                    <Rect x={15 + mainW + 4} y={30} width={sideW} height={sideH} fill="#F1F5F9" stroke="#E2E8F0" strokeWidth={1} cornerRadius={4} />
                                  )}

                                  {images[2] ? (
                                    <URLImage
                                      src={images[2]}
                                      x={15 + mainW + 4}
                                      y={30 + sideH + 4}
                                      width={sideW}
                                      height={sideH}
                                      borderRadius={4}
                                    />
                                  ) : (
                                    <Rect x={15 + mainW + 4} y={30 + sideH + 4} width={sideW} height={sideH} fill="#F1F5F9" stroke="#E2E8F0" strokeWidth={1} cornerRadius={4} />
                                  )}
                                </Group>
                              );
                            })()}
                          </Group>
                        );
                      })()}

                      {el.widgetType === 'video' && (() => {
                        const title = (el.widgetConfig?.title || 'Video Undangan').toUpperCase();
                        const videoLink = el.widgetConfig?.videoUrl || '';
                        
                        let embedId = '';
                        try {
                          const url = new URL(videoLink);
                          if (url.hostname === 'youtu.be') {
                            embedId = url.pathname.substring(1);
                          } else if (url.hostname.includes('youtube.com')) {
                            embedId = url.searchParams.get('v') || '';
                            if (!embedId && url.pathname.startsWith('/embed/')) {
                              embedId = url.pathname.split('/')[2] || '';
                            }
                          }
                        } catch (e) {
                          const match = videoLink.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|\?v=))([\w-]{11})/);
                          if (match && match[1]) {
                            embedId = match[1];
                          }
                        }

                        const thumbUrl = embedId ? `https://img.youtube.com/vi/${embedId}/0.jpg` : '';

                        return (
                          <Group>
                            <Text
                              text={title}
                              x={10}
                              y={12}
                              width={el.width - 20}
                              align="center"
                              fontSize={9}
                              fontFamily="Montserrat"
                              fill="#8C7A5B"
                              letterSpacing={1.5}
                              fontStyle="bold"
                            />
                            
                            {thumbUrl ? (
                              <Group>
                                <URLImage
                                  src={thumbUrl}
                                  x={15}
                                  y={30}
                                  width={el.width - 30}
                                  height={el.height - 65}
                                  borderRadius={8}
                                />
                                <Rect
                                  x={15}
                                  y={30}
                                  width={el.width - 30}
                                  height={el.height - 65}
                                  fill="rgba(0,0,0,0.3)"
                                  cornerRadius={8}
                                />
                              </Group>
                            ) : (
                              <Rect
                                x={15}
                                y={30}
                                width={el.width - 30}
                                height={el.height - 65}
                                fill="#0F172A"
                                stroke="#475569"
                                strokeWidth={1}
                                cornerRadius={8}
                              />
                            )}

                            {/* YouTube Red Play Button representation */}
                            <Circle cx={el.width / 2} cy={el.height / 2 - 5} radius={18} fill="#EF4444" />
                            <Text text="▶" x={el.width / 2 - 5} y={el.height / 2 - 12} fontSize={14} fill="#FFFFFF" />
                            
                            {/* Display Video Link */}
                            <Text
                              text={videoLink.length > 35 ? videoLink.substring(0, 32) + '...' : (videoLink || 'Belum ada link Youtube')}
                              x={20}
                              y={el.height - 25}
                              width={el.width - 40}
                              align="center"
                              fontSize={7.5}
                              fontFamily="Courier"
                              fill="#8C7A5B"
                              fontStyle="bold"
                            />
                          </Group>
                        );
                      })()}
                    </Group>
                  );
                }

                return null;
              })}

              {/* Bounding box handle Transformer */}
              <Transformer
                ref={transformerRef}
                borderStroke="#3b82f6"
                borderStrokeWidth={1}
                anchorStroke="#3b82f6"
                anchorStrokeWidth={1.5}
                anchorFill="#FFFFFF"
                anchorSize={6}
                keepRatio={false}
                rotateAnchorOffset={15}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
              />

              {/* Proximity Snapping Guides */}
              {guidelines.x !== null && (
                <Line
                  points={[guidelines.x, 0, guidelines.x, canvasHeight]}
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dash={[4, 4]}
                  listening={false}
                />
              )}
              {guidelines.y !== null && (
                <Line
                  points={[0, guidelines.y, canvasWidth, guidelines.y]}
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dash={[4, 4]}
                  listening={false}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
      {/* Context Menu Overlay */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-2xl p-1.5 w-52 z-50 text-slate-700 font-sans text-xs flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            transform: 'translate(2px, 2px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const selectedEl = contextMenu.elementId 
              ? elements.find((el) => el.id === contextMenu.elementId) 
              : null;

            if (selectedEl) {
              return (
                <>
                  {/* Element name label */}
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none border-b border-slate-100">
                    {selectedEl.name}
                  </div>

                  {/* Lock/Unlock */}
                  <button
                    onClick={() => {
                      onUpdateElement(selectedEl.id, { locked: !selectedEl.locked });
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold flex items-center justify-between transition-colors cursor-pointer border-0 bg-transparent text-slate-700"
                  >
                    <span>{selectedEl.locked ? '🔓 Unlock Element' : '🔒 Lock Element'}</span>
                  </button>

                  {/* Hide */}
                  <button
                    onClick={() => {
                      onUpdateElement(selectedEl.id, { hidden: true });
                      onSelectElement(null);
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold transition-colors cursor-pointer border-0 bg-transparent text-slate-700"
                  >
                    👁️ Sembunyikan (Hide)
                  </button>

                  {/* Duplicate */}
                  {onDuplicateElement && (
                    <button
                      onClick={() => {
                        onDuplicateElement(selectedEl.id);
                        setContextMenu((prev) => ({ ...prev, visible: false }));
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold flex items-center justify-between transition-colors cursor-pointer border-0 bg-transparent text-slate-700"
                    >
                      <span>👥 Duplikat</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
                    </button>
                  )}

                  {/* Copy */}
                  {onCopyElement && (
                    <button
                      onClick={() => {
                        onCopyElement(selectedEl.id);
                        setContextMenu((prev) => ({ ...prev, visible: false }));
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold flex items-center justify-between transition-colors cursor-pointer border-0 bg-transparent text-slate-700"
                    >
                      <span>📋 Salin (Copy)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
                    </button>
                  )}

                  {/* Ungroup (only if grouped) */}
                  {selectedEl.groupId && (
                    <button
                      onClick={() => {
                        const targetGroupId = selectedEl.groupId;
                        elements.forEach((el) => {
                          if (el.groupId === targetGroupId) {
                            onUpdateElement(el.id, { groupId: undefined });
                          }
                        });
                        setContextMenu((prev) => ({ ...prev, visible: false }));
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 text-amber-600 font-bold transition-colors cursor-pointer border-t border-dashed border-amber-100 bg-transparent"
                    >
                      🧩 Lepas Grup (Ungroup)
                    </button>
                  )}

                  {/* Layer arrangements */}
                  {onReorderElements && (
                    <div className="border-t border-slate-100 pt-1 mt-1 flex flex-col gap-0.5">
                      <button
                        onClick={() => {
                          const idx = elements.findIndex(el => el.id === selectedEl.id);
                          if (idx !== -1) {
                            let newElements = [...elements];
                            newElements.splice(idx, 1);
                            newElements.push(selectedEl);
                            onReorderElements(newElements);
                          }
                          setContextMenu((prev) => ({ ...prev, visible: false }));
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        ⬆️ Bawa ke Paling Depan
                      </button>
                      <button
                        onClick={() => {
                          const idx = elements.findIndex(el => el.id === selectedEl.id);
                          if (idx !== -1) {
                            let newElements = [...elements];
                            newElements.splice(idx, 1);
                            newElements.unshift(selectedEl);
                            onReorderElements(newElements);
                          }
                          setContextMenu((prev) => ({ ...prev, visible: false }));
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        ⬇️ Bawa ke Paling Belakang
                      </button>
                    </div>
                  )}

                  {/* Delete */}
                  {onDeleteElement && (
                    <button
                      onClick={() => {
                        onDeleteElement(selectedEl.id);
                        setContextMenu((prev) => ({ ...prev, visible: false }));
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-rose-500 font-bold border-t border-slate-150 transition-colors cursor-pointer mt-1 border-0 bg-transparent"
                    >
                      🗑️ Hapus Elemen
                    </button>
                  )}
                </>
              );
            }

            return (
              <>
                {/* Canvas workspace menu */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none border-b border-slate-100">
                  Workspace Canvas
                </div>

                {/* Paste */}
                {onPasteElement && copiedElement ? (
                  <button
                    onClick={() => {
                      onPasteElement();
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold flex flex-col transition-colors cursor-pointer border-0 bg-transparent text-slate-700"
                  >
                    <span>📋 Tempel (Paste)</span>
                    <span className="text-[9px] text-slate-400 font-sans italic truncate max-w-[180px]">"{copiedElement.name}"</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-[10px] text-slate-450 italic select-none">
                    Klik kanan elemen untuk memunculkan menu opsi.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

    </div>
    </div>
  );
}
