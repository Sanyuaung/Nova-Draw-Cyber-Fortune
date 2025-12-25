
import React, { useState, useEffect } from 'react';

interface SparkleInstance {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: React.CSSProperties;
}

interface SparkleProps {
  color: string;
  size: number;
  style: React.CSSProperties;
}

const Sparkle: React.FC<SparkleProps> = ({ color, size, style }) => (
  <span className="absolute block pointer-events-none" style={style}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      className="animate-[pulse_1.2s_ease-in-out_infinite]"
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.571 58.5786C118.857 75.8647 160 80 160 80C160 80 118.857 84.1353 101.571 101.421C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.4289 101.421C41.1424 84.1353 0 80 0 80C0 80 41.1424 75.8647 58.4289 58.5786C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </svg>
  </span>
);

const generateSparkle = (color: string, fullPage: boolean): SparkleInstance => {
  return {
    id: String(Math.random()),
    createdAt: Date.now(),
    color,
    size: (fullPage ? 10 : 6) + Math.random() * (fullPage ? 20 : 12),
    style: {
      position: fullPage ? 'fixed' : 'absolute',
      top: Math.random() * 100 + (fullPage ? 'vh' : '%'),
      left: Math.random() * 100 + (fullPage ? 'vw' : '%'),
      zIndex: fullPage ? 100 : 2,
    },
  };
};

export const Sparkles: React.FC<{ children?: React.ReactNode; fullPage?: boolean }> = ({ children, fullPage = false }) => {
  const [sparkles, setSparkles] = useState<SparkleInstance[]>([]);
  const colors = ['#00f3ff', '#9d00ff', '#ffffff', '#ff00ea'];

  useEffect(() => {
    // Slower interval for a more controlled appearance
    const interval = setInterval(() => {
      // Generate fewer sparkles per tick
      const count = fullPage ? 3 : 2;
      const newSparkles: SparkleInstance[] = [];
      
      // Chance to not spawn a sparkle at all to keep it light
      if (Math.random() > (fullPage ? 0.3 : 0.6)) {
        for(let i = 0; i < count; i++) {
          newSparkles.push(generateSparkle(colors[Math.floor(Math.random() * colors.length)], fullPage));
        }
      }

      const now = Date.now();
      setSparkles((prevSparkles) => {
        return [...prevSparkles, ...newSparkles].filter((sp) => {
          const delta = now - sp.createdAt;
          // Shorter lifespan to prevent screen clutter
          return delta < (fullPage ? 1000 : 700);
        });
      });
    }, fullPage ? 150 : 250);
    
    return () => clearInterval(interval);
  }, [fullPage]);

  return (
    <div className={fullPage ? "fixed inset-0 pointer-events-none z-[999]" : "relative inline-flex flex-col items-center"}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
      {children && (
        <div className="relative z-10 w-full flex flex-col items-center">
          {children}
        </div>
      )}
    </div>
  );
};
