
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScratchCardProps {
  onReveal: () => void;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ 
  onReveal, 
  width = 440, 
  height = 260, 
  children 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [glitchFactor, setGlitchFactor] = useState(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastCheckTime = useRef<number>(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Foil
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#161616');
    gradient.addColorStop(1, '#050505');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for (let i = 0; i < height; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

    // Label
    ctx.fillStyle = '#fff'; 
    ctx.font = '700 18px "Syncopate"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f3ff';
    ctx.fillText('IDENTITY SEALED', width / 2, height / 2 - 10);
    ctx.font = '400 10px "Syncopate"';
    ctx.fillText('DECRYPT TO REVEAL', width / 2, height / 2 + 15);
    ctx.shadowBlur = 0;
    
    // Border
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);
  }, [width, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Handle glitch updates for visuals
  useEffect(() => {
    if (!isDrawing) {
      setGlitchFactor(0);
      return;
    }
    const interval = setInterval(() => {
      setGlitchFactor(Math.random());
    }, 60);
    return () => clearInterval(interval);
  }, [isDrawing]);

  const checkRevealPercentage = useCallback(() => {
    const now = Date.now();
    if (now - lastCheckTime.current < 200) return; // Throttled check for smoothness
    lastCheckTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const percentage = (transparentPixels / (width * height)) * 100;
    if (percentage > 40 && !revealed) {
      setRevealed(true);
      onReveal();
    }
  }, [width, height, revealed, onReveal]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (x - rect.left) * (canvas.width / rect.width);
    const currentY = (y - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 55;

    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    } else {
      ctx.moveTo(currentX, currentY);
    }
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Particle Sparks
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = Math.random() > 0.5 ? '#00f3ff' : '#9d00ff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(currentX + (Math.random() - 0.5) * 40, currentY + (Math.random() - 0.5) * 40, 10, 1);
    ctx.globalAlpha = 1.0;

    lastPos.current = { x: currentX, y: currentY };
    checkRevealPercentage();
  };

  const handleStart = (x: number, y: number) => {
    setIsDrawing(true);
    scratch(x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  return (
    <div 
      className={`relative select-none rounded-2xl overflow-hidden border-2 transition-all duration-500 bg-black mx-auto flex items-center justify-center ${!revealed ? 'ready-glow border-cyan-500/50' : 'border-white/10'}`} 
      style={{ width, height, maxWidth: '100%' }}
    >
      {/* Background Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/80">
        {children}
        {revealed && <div className="absolute inset-0 holographic-overlay opacity-20"></div>}
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 transition-opacity duration-1000 block ${revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => isDrawing && scratch(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => isDrawing && scratch(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      />

      {/* Dynamic Digital Glitch triggered on scratch */}
      {!revealed && isDrawing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glitch-noise opacity-40"></div>
          {/* Randomized Glitch Bars */}
          <div 
            className="absolute w-full h-[2px] bg-cyan-400 opacity-50 transition-all duration-75" 
            style={{ top: `${glitchFactor * 100}%`, left: `${(glitchFactor - 0.5) * 10}px` }}
          />
          <div 
            className="absolute w-[1px] h-full bg-purple-500 opacity-30 transition-all duration-75" 
            style={{ left: `${(1 - glitchFactor) * 100}%`, top: `${(glitchFactor - 0.5) * 5}px` }}
          />
          {/* Tint flash */}
          <div 
            className="absolute inset-0 transition-colors duration-100" 
            style={{ backgroundColor: glitchFactor > 0.8 ? 'rgba(0, 243, 255, 0.05)' : 'transparent' }} 
          />
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
