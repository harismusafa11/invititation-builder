import React, { useEffect, useRef } from 'react';

interface ParticleEffectProps {
  type: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  angle: number;
  spin: number;
  color: string;
  opacity: number;
  pulseSpeed?: number;
  swaySpeed?: number;
  swayRange?: number;
  phase?: number;
  shapeType?: number;
}

export default function ParticleEffect({ type }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!type || type === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 390;
        canvas.height = parent.clientHeight || 844;
      } else {
        canvas.width = 390;
        canvas.height = 844;
      }
    };
    resizeCanvas();

    // Resize observer to track parent layout changes (e.g. zooming in editor)
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle generator config
    const maxParticles = type === 'rain' ? 80 : type === 'gold-dust' ? 50 : 35;

    const colorsMap: Record<string, string[]> = {
      sakura: ['#FFB7C5', '#FFC0CB', '#FFD1DC', '#FFA3B1'],
      'rose-petals': ['#B22222', '#DC143C', '#FF0000', '#8B0000'],
      'autumn-leaves': ['#D2691E', '#CD853F', '#8B4513', '#FF8C00', '#E9967A'],
      'botanical-leaves': ['#556B2F', '#6B8E23', '#8FBC8F', '#2E8B57', '#3CB371'],
      'gold-dust': ['#D4AF37', '#FFDF00', '#F3E5AB', '#FFD700', '#E5A93C'],
      'glittering-stars': ['#FFFFFF', '#FFFDD0', '#FFFFF0', '#FFDF00', '#FFFACD'],
      'love-balloons': ['#FF69B4', '#FF1493', '#FFC0CB', '#DB7093', '#FF4500'],
      snow: ['#FFFFFF', '#F0F8FF', '#E6F2FF'],
      rain: ['#E6F2FF', '#B0C4DE', '#87CEFA'],
      bubbles: ['#FFFFFF', '#E0FFFF', '#F0FFFF']
    };

    const getColors = () => colorsMap[type] || ['#FFFFFF'];

    // Helper to draw a heart shape
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x - size / 2, y);
      ctx.quadraticCurveTo(x - size, y, x - size, y + size / 2);
      ctx.quadraticCurveTo(x - size, y + size * 0.9, x, y + size * 1.3);
      ctx.quadraticCurveTo(x + size, y + size * 0.9, x + size, y + size / 2);
      ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
      ctx.quadraticCurveTo(x, y, x, y + size / 4);
      ctx.closePath();
    };

    // Helper to draw a leaf shape
    const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size / 2, -size / 2, 0, size);
      ctx.quadraticCurveTo(-size / 2, -size / 2, 0, -size);
      ctx.closePath();
      // Drawing leaf line
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.restore();
    };

    // Helper to draw a star shape
    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    // Create a single particle
    const createParticle = (isInit = false): Particle => {
      const colors = getColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const w = canvas.width;
      const h = canvas.height;

      // Starting positions
      let x = Math.random() * w;
      let y = isInit ? Math.random() * h : -20;

      // Float upward for bubbles and hearts
      if (type === 'bubbles' || type === 'love-balloons') {
        y = isInit ? Math.random() * h : h + 20;
      }

      let size = 2 + Math.random() * 6;
      let speedY = 0.5 + Math.random() * 1.5;
      let speedX = (Math.random() - 0.5) * 0.8;

      if (type === 'bubbles') {
        size = 3 + Math.random() * 8;
        speedY = -(0.4 + Math.random() * 0.8); // float up
        speedX = (Math.random() - 0.5) * 0.4;
      } else if (type === 'love-balloons') {
        size = 6 + Math.random() * 10;
        speedY = -(0.5 + Math.random() * 1.0); // float up
        speedX = (Math.random() - 0.5) * 0.5;
      } else if (type === 'rain') {
        size = 1 + Math.random() * 2;
        speedY = 6 + Math.random() * 4;
        speedX = -1.5 - Math.random() * 1.0; // angled rain
      } else if (type === 'snow') {
        size = 1.5 + Math.random() * 4;
        speedY = 0.6 + Math.random() * 0.8;
        speedX = (Math.random() - 0.5) * 0.3;
      } else if (type === 'gold-dust') {
        size = 1.5 + Math.random() * 3.5;
        speedY = 0.3 + Math.random() * 0.6;
        speedX = (Math.random() - 0.5) * 0.5;
      } else if (type === 'glittering-stars') {
        size = 2 + Math.random() * 4;
        speedY = 0.2 + Math.random() * 0.3;
        speedX = (Math.random() - 0.5) * 0.2;
      }

      return {
        x,
        y,
        size,
        speedX,
        speedY,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
        color,
        opacity: 0.3 + Math.random() * 0.6,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        swaySpeed: 0.01 + Math.random() * 0.02,
        swayRange: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        shapeType: Math.floor(Math.random() * 3)
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      particles.forEach((p, idx) => {
        // Update positions
        p.angle += p.spin;
        if (p.phase !== undefined) p.phase += p.swaySpeed || 0.02;
        
        // Sway movement
        const sway = Math.sin(p.phase || 0) * (p.swayRange || 1);
        p.x += p.speedX + sway * 0.2;
        p.y += p.speedY;

        // Draw particle based on type
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (type === 'sakura' || type === 'rose-petals') {
          // Petal shapes (rotated ellipse/curved path)
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Shadow/darker accent line
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } 
        else if (type === 'autumn-leaves' || type === 'botanical-leaves') {
          ctx.fillStyle = p.color;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 0.75;
          drawLeaf(ctx, p.x, p.y, p.size, p.angle);
          ctx.fill();
          ctx.stroke();
        } 
        else if (type === 'gold-dust') {
          // Golden glowing dust
          // Pulsing opacity
          if (p.opacity > 0.95 || p.opacity < 0.15) {
            p.pulseSpeed = -(p.pulseSpeed || 0.02);
          }
          p.opacity = Math.max(0.1, Math.min(1.0, p.opacity + (p.pulseSpeed || 0.02)));

          // Radial glow gradient
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, 'rgba(255, 223, 0, 0)');
          ctx.fillStyle = grad;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (type === 'glittering-stars') {
          // Sparkle stars
          if (p.opacity > 0.9 || p.opacity < 0.2) {
            p.pulseSpeed = -(p.pulseSpeed || 0.02);
          }
          p.opacity = Math.max(0.1, Math.min(0.95, p.opacity + (p.pulseSpeed || 0.02)));
          
          ctx.fillStyle = p.color;
          drawStar(ctx, p.x, p.y, 4, p.size * 1.5, p.size * 0.4);
          ctx.fill();
        } 
        else if (type === 'love-balloons') {
          // Rising hearts
          ctx.fillStyle = p.color;
          // Soft shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
          ctx.shadowBlur = 4;
          drawHeart(ctx, p.x, p.y, p.size);
          ctx.fill();
        } 
        else if (type === 'snow') {
          // Fluffy snow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(255,255,255,1)');
          grad.addColorStop(0.6, 'rgba(255,255,255,0.8)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (type === 'rain') {
          // Rain streaks
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 1.5);
          ctx.stroke();
        } 
        else if (type === 'bubbles') {
          // Translucent rising bubbles
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillStyle = 'rgba(224, 255, 255, 0.08)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Bubble light reflection highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, Math.PI, Math.PI * 1.5);
          ctx.stroke();
        }

        ctx.restore();

        // Boundary checks and resetting
        const isOutOfBounds = 
          (p.speedY > 0 && p.y > h + 20) || // fell off bottom
          (p.speedY < 0 && p.y < -20) ||   // floated off top
          p.x > w + 20 ||                  // went off right
          p.x < -20;                       // went off left

        if (isOutOfBounds) {
          particles[idx] = createParticle(false);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [type]);

  if (!type || type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      style={{ mixBlendMode: type === 'gold-dust' || type === 'glittering-stars' ? 'screen' : 'normal' }}
    />
  );
}
