
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScratchCardProps {
  onReveal: () => void;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ 
  onReveal, 
  width = 340, 
  height = 200, 
  children 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Digital Hologram Foil
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#050505');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid Pattern
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Binary Data Texture
    ctx.fillStyle = '#00f3ff';
    ctx.font = '8px monospace';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 15) {
        ctx.fillText(Math.random() > 0.5 ? '101' : '010', i, j);
      }
    }
    ctx.globalAlpha = 1.0;

    // Center Label
    ctx.fillStyle = '#fff'; 
    ctx.font = '700 18px "Syncopate"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f3ff';
    ctx.fillText('ACCESS GRANTED', width / 2, height / 2 - 10);
    ctx.font = '400 10px "Syncopate"';
    ctx.fillText('SCRATCH TO DECRYPT', width / 2, height / 2 + 15);
    ctx.shadowBlur = 0;
    
    // Aesthetic Border
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);
  }, [width, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const checkRevealPercentage = useCallback(() => {
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
    if (percentage > 45 && !revealed) {
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

    // Add "Digital Sparks" (temporary glitch particles)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#00f3ff' : '#9d00ff';
      ctx.globalAlpha = 0.5;
      const size = Math.random() * 15;
      ctx.fillRect(
        currentX + (Math.random() - 0.5) * 60,
        currentY + (Math.random() - 0.5) * 60,
        size,
        2
      );
    }
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
      className={`relative inline-block select-none rounded-2xl overflow-hidden border-2 transition-all duration-500 bg-black ${!revealed ? 'ready-glow border-cyan-500/50' : 'border-white/10'}`} 
      style={{ width, height }}
    >
      {/* Background Content (Hidden until scratch) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80">
        {children}
        {/* Subtle holographic shimmer over revealed content */}
        {revealed && <div className="absolute inset-0 holographic-overlay opacity-30"></div>}
      </div>
      
      {/* Scratch Foil Layer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 coin-cursor transition-opacity duration-1000 ${revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => isDrawing && scratch(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => isDrawing && scratch(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      />

      {/* Dynamic Glitch Overlays while scratching */}
      {!revealed && isDrawing && (
        <>
          <div className="absolute inset-0 holographic-overlay opacity-60"></div>
          <div className="glitch-noise"></div>
        </>
      )}
    </div>
  );
};

export default ScratchCard;
