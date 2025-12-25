
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, WinnerData } from './types';
import ScratchCard from './components/ScratchCard';
import { getWinnerHype } from './services/geminiService';

const Logo = () => (
  <div className="relative flex items-center justify-center mb-6 group">
    <svg width="140" height="140" viewBox="0 0 100 100" className="relative z-10">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="60%" stopColor="#00f3ff" />
          <stop offset="100%" stopColor="#9d00ff" />
        </radialGradient>
      </defs>
      {/* Outer rotating rings */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" strokeDasharray="10 5" className="animate-[spin_10s_linear_infinite]" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(157, 0, 255, 0.3)" strokeWidth="0.5" strokeDasharray="5 15" className="animate-[spin_6s_linear_infinite_reverse]" />
      
      {/* Central Singularity */}
      <circle cx="50" cy="50" r="18" fill="url(#sunGrad)" filter="url(#glow)" className="animate-pulse" />
      
      {/* Orbiting particles */}
      <g className="animate-[spin_4s_linear_infinite]">
        <circle cx="85" cy="50" r="2" fill="#fff" />
      </g>
      <g className="animate-[spin_3s_linear_infinite_reverse]">
        <circle cx="15" cy="50" r="1.5" fill="#00f3ff" />
      </g>
    </svg>
    <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
  </div>
);

const App: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>('');
  const [names, setNames] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [winner, setWinner] = useState<WinnerData | null>(null);
  const lastWinnerName = useRef<string | null>(null);

  useEffect(() => {
    const list = rawInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNames(list);
  }, [rawInput]);

  const handleStart = async () => {
    if (names.length < 2) return;
    setWinner(null);
    setGameState(GameState.SHUFFLING);
    
    let randomIndex = Math.floor(Math.random() * names.length);
    if (names.length > 1 && names[randomIndex] === lastWinnerName.current) {
      randomIndex = (randomIndex + 1) % names.length;
    }
    
    const winningName = names[randomIndex];
    lastWinnerName.current = winningName;
    const hypeTask = getWinnerHype(winningName);

    setTimeout(async () => {
      const fortune = await hypeTask;
      setWinner({ name: winningName, fortune });
      setGameState(GameState.SCRATCHING);
    }, 5000);
  };

  const shuffleElements = useMemo(() => {
    if (names.length === 0) return [];
    return Array.from({ length: 25 }).map((_, i) => ({
      name: names[i % names.length],
      delay: i * 0.2,
      size: 16 + Math.random() * 28,
      color: i % 2 === 0 ? 'text-cyan-400' : 'text-purple-400'
    }));
  }, [names]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <header className="mb-12 text-center flex flex-col items-center">
        <Logo />
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-4 uppercase tracking-[0.2em]">
          NOVA DRAW
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500"></div>
          <p className="text-[10px] uppercase tracking-[0.6em] text-cyan-400/80 font-bold">
            Celestial Extraction Protocol
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500"></div>
        </div>
      </header>

      <main className="w-full max-w-5xl glass-panel rounded-[3rem] p-10 md:p-20 border-t border-l border-white/10 relative overflow-hidden transition-all duration-500">
        {/* Subtle background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full"></div>
        
        {gameState === GameState.IDLE && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <label className="text-[12px] font-bold text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  Registry Active
                </label>
                <div className="text-[11px] font-bold text-white/30 border border-white/10 px-4 py-1.5 rounded-full bg-white/5">
                  {names.length} ACTIVE ENTRIES
                </div>
              </div>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="0x: ENTER NAMES FOR QUANTUM EXTRACTION..."
                className="w-full h-80 bg-black/40 border border-white/10 rounded-[2.5rem] p-10 text-white font-semibold text-2xl focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/5 backdrop-blur-xl shadow-inner scrollbar-hide"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={names.length < 2}
              className={`w-full py-10 rounded-[2.5rem] font-black text-3xl uppercase tracking-[0.6em] transition-all cyber-btn border ${
                names.length >= 2 ? 'border-cyan-500 text-cyan-400' : 'opacity-20 grayscale border-white/10 text-white/40'
              }`}
            >
              INITIALIZE VORTEX
            </button>
          </div>
        )}

        {gameState === GameState.SHUFFLING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-16 animate-in fade-in duration-500">
            <div className="vortex-container">
              {/* Singularity Core during shuffle */}
              <div className="absolute w-32 h-32 bg-white rounded-full blur-[60px] opacity-30 animate-pulse"></div>
              {shuffleElements.map((el, i) => (
                <div 
                  key={i} 
                  className={`vortex-item ${el.color}`}
                  style={{ 
                    animationDelay: `${el.delay}s`,
                    fontSize: `${el.size}px`,
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                  }}
                >
                  {el.name}
                </div>
              ))}
            </div>
            <div className="text-center space-y-6">
              <h4 className="text-cyan-400 text-lg font-black uppercase tracking-[1.2em] animate-pulse">Collapsing Reality</h4>
              <p className="text-xs text-white/30 font-bold uppercase tracking-[0.6em]">Singularity formation in progress</p>
            </div>
          </div>
        )}

        {(gameState === GameState.SCRATCHING || gameState === GameState.REVEALED) && winner && (
          <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-1000">
            <header className="text-center mb-16">
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-[1em] mb-4">Outcome Decrypted</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-widest italic">
                {gameState === GameState.REVEALED ? "PROTOCOL SUCCESS" : "HOLOGRAPHIC SEAL"}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-6"></div>
            </header>
            
            <ScratchCard 
              width={720} 
              height={400} 
              onReveal={() => setGameState(GameState.REVEALED)}
            >
              <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
                <div className="text-8xl mb-8 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-bounce">✨</div>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl px-10 text-center leading-tight break-all">
                  {winner.name}
                </h2>
                <div className="mt-12 px-8 py-3 border border-cyan-500/50 rounded-full bg-cyan-500/5 backdrop-blur-md">
                   <p className="text-sm text-cyan-400 font-bold uppercase tracking-[0.4em]">Selected Essence</p>
                </div>
              </div>
            </ScratchCard>

            <div className="w-full max-w-3xl mt-16 space-y-12">
              {gameState === GameState.REVEALED && (
                <div className="animate-in slide-in-from-top-4 duration-1000 p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 text-center relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-50"></div>
                  <p className="text-white text-2xl md:text-3xl font-semibold italic leading-relaxed relative z-10 tracking-tight">
                    "{winner.fortune}"
                  </p>
                </div>
              )}
              
              <button
                onClick={() => { setGameState(GameState.IDLE); setWinner(null); }}
                className="w-full py-8 rounded-[2.5rem] font-bold text-lg uppercase tracking-[1em] transition-all cyber-btn border-2 border-purple-500/50 text-purple-400"
              >
                NEW EXTRACTION
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 flex flex-col items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
        <p className="text-white text-[11px] font-bold uppercase tracking-[1.8em] ml-6">
          Quantum Randomness Engine v4.0
        </p>
        <div className="flex gap-8 text-xl">
          <i className="fa-solid fa-satellite-dish hover:text-cyan-400 transition-colors"></i>
          <i className="fa-solid fa-fingerprint hover:text-purple-400 transition-colors"></i>
          <i className="fa-solid fa-dna hover:text-pink-400 transition-colors"></i>
        </div>
      </footer>
    </div>
  );
};

export default App;
