
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, WinnerData } from './types';
import ScratchCard from './components/ScratchCard';
import { Sparkles } from './components/Sparkles';
import { getWinnerHype } from './services/geminiService';

const Logo = () => (
  <div className="relative flex items-center justify-center mb-4 group">
    <svg width="100" height="100" viewBox="0 0 100 100" className="relative z-10">
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
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" strokeDasharray="10 5" className="animate-[spin_10s_linear_infinite]" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(157, 0, 255, 0.3)" strokeWidth="0.5" strokeDasharray="5 15" className="animate-[spin_6s_linear_infinite_reverse]" />
      <circle cx="50" cy="50" r="18" fill="url(#sunGrad)" filter="url(#glow)" className="animate-pulse" />
      <g className="animate-[spin_4s_linear_infinite]">
        <circle cx="85" cy="50" r="2" fill="#fff" />
      </g>
      <g className="animate-[spin_3s_linear_infinite_reverse]">
        <circle cx="15" cy="50" r="1.5" fill="#00f3ff" />
      </g>
    </svg>
    <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
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
    }, 4000);
  };

  const shuffleElements = useMemo(() => {
    if (names.length === 0) return [];
    return Array.from({ length: 16 }).map((_, i) => ({
      name: names[i % names.length],
      delay: i * 0.15,
      size: 14 + Math.random() * 18,
      color: i % 2 === 0 ? 'text-cyan-400' : 'text-purple-400'
    }));
  }, [names]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Global Sparkles during reveal */}
      {gameState === GameState.REVEALED && <Sparkles fullPage={true} />}

      <header className="mb-6 text-center flex flex-col items-center scale-90 md:scale-100">
        <Logo />
        <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-1 uppercase tracking-[0.2em]">
          NOVA DRAW
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-gradient-to-r from-transparent to-cyan-500"></div>
          <p className="text-[8px] uppercase tracking-[0.6em] text-cyan-400/80 font-bold">
            Protocol F21
          </p>
          <div className="h-px w-4 bg-gradient-to-l from-transparent to-cyan-500"></div>
        </div>
      </header>

      <main className="w-full max-w-xl glass-panel rounded-[2rem] p-6 md:p-10 border-t border-l border-white/10 relative overflow-hidden transition-all duration-500">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full"></div>
        
        {gameState === GameState.IDLE && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Registry
                </label>
                <div className="text-[9px] font-bold text-white/30 border border-white/10 px-3 py-1 rounded-full bg-white/5 uppercase">
                  {names.length} subjects
                </div>
              </div>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="INPUT NAMES (LINE BY LINE)..."
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-white font-semibold text-lg focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/5 backdrop-blur-xl shadow-inner scrollbar-hide"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={names.length < 2}
              className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-[0.5em] transition-all cyber-btn border ${
                names.length >= 2 ? 'border-cyan-500 text-cyan-400' : 'opacity-20 grayscale border-white/10 text-white/40'
              }`}
            >
              START DRAW
            </button>
          </div>
        )}

        {gameState === GameState.SHUFFLING && (
          <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-in fade-in duration-500">
            <div className="vortex-container !h-[280px]">
              <div className="absolute w-20 h-20 bg-white rounded-full blur-[40px] opacity-20 animate-pulse"></div>
              {shuffleElements.map((el, i) => (
                <div 
                  key={i} 
                  className={`vortex-item ${el.color}`}
                  style={{ 
                    animationDelay: `${el.delay}s`,
                    fontSize: `${el.size}px`,
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                >
                  {el.name}
                </div>
              ))}
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-cyan-400 text-sm font-black uppercase tracking-[0.8em] animate-pulse">Scanning Realities</h4>
              <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.4em]">Singularity Locked</p>
            </div>
          </div>
        )}

        {(gameState === GameState.SCRATCHING || gameState === GameState.REVEALED) && winner && (
          <div className="flex flex-col items-center py-2 animate-in zoom-in-95 duration-1000">
            <header className="text-center mb-8">
              <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.6em] mb-2">Outcome Isolated</p>
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">
                {gameState === GameState.REVEALED ? "PROTOCOL SUCCESS" : "HOLOGRAPHIC SEAL"}
              </h3>
            </header>
            
            <div className="flex justify-center w-full">
              <ScratchCard 
                width={440} 
                height={260} 
                onReveal={() => setGameState(GameState.REVEALED)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center bg-transparent relative">
                  {gameState === GameState.REVEALED ? (
                    <Sparkles>
                      <div className="text-5xl mb-4 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">✨</div>
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl px-4 text-center leading-tight break-all">
                        {winner.name}
                      </h2>
                    </Sparkles>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-5xl mb-4 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce">✨</div>
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl px-4 text-center leading-tight break-all">
                        {winner.name}
                      </h2>
                    </div>
                  )}
                  <div className="mt-6 px-4 py-1.5 border border-cyan-500/50 rounded-full bg-cyan-500/5 backdrop-blur-md">
                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em]">Selected Subject</p>
                  </div>
                </div>
              </ScratchCard>
            </div>

            <div className="w-full mt-10 space-y-8">
              {gameState === GameState.REVEALED && (
                <div className="animate-in slide-in-from-top-4 duration-1000 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-50"></div>
                  <p className="text-white text-lg md:text-xl font-semibold italic leading-relaxed relative z-10 tracking-tight">
                    "{winner.fortune}"
                  </p>
                </div>
              )}
              
              <button
                onClick={() => { setGameState(GameState.IDLE); setWinner(null); }}
                className="w-full py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.8em] transition-all cyber-btn border-2 border-purple-500/50 text-purple-400"
              >
                RESET SYSTEM
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-all duration-500">
        <p className="text-white text-[9px] font-bold uppercase tracking-[1.2em]">
          Quantum Logic v7
        </p>
        <div className="flex gap-5 text-sm">
          <i className="fa-solid fa-satellite-dish"></i>
          <i className="fa-solid fa-fingerprint"></i>
          <i className="fa-solid fa-dna"></i>
        </div>
      </footer>
    </div>
  );
};

export default App;
