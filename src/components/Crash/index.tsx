/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import './crash.scss';
import Context from '../../context';
import sounds from '../../utils/sounds';

export default function CrashGame() {
  const { GameState, currentNum, time, setCurrentTarget } = React.useContext(Context);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickSecond = useRef<number>(0);

  const [target, setTarget] = useState(1.0);
  const [waiting, setWaiting] = useState(5000);
  const [planeX, setPlaneX] = useState(0);
  const [planeY, setPlaneY] = useState(0);
  const [planeAngle, setPlaneAngle] = useState(0);
  const [showCrash, setShowCrash] = useState(false);
  const [phase, setPhase] = useState<'BET' | 'PLAYING' | 'GAMEEND'>('BET');

  // Canvas curve drawing
  const drawCurve = useCallback((mult: number, crashed = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (H / 6) * i);
      ctx.lineTo(W, (H / 6) * i);
      ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((W / 8) * i, 0);
      ctx.lineTo((W / 8) * i, H);
      ctx.stroke();
    }

    if (mult <= 1.0) return;

    const t = Math.min((mult - 1.0) / 8, 1);
    const curveW = W * 0.85;
    const curveH = H * 0.78;

    const points: [number, number][] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const px = 40 + curveW * Math.pow(p, 0.8) * t;
      const py = H - 40 - curveH * Math.pow(p, 1.6) * t;
      points.push([px, py]);
    }

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, crashed ? 'rgba(150,0,0,0.25)' : 'rgba(229,5,57,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.moveTo(40, H - 40);
    points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(points[points.length - 1][0], H - 40);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Glow line
    ctx.shadowBlur = crashed ? 0 : 14;
    ctx.shadowColor = crashed ? '#ff4444' : '#ff0044';
    ctx.strokeStyle = crashed ? '#cc0000' : '#ff0044';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(40, H - 40);
    points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    ctx.shadowBlur = 0;

    const tip = points[points.length - 1];
    const prev = points[Math.max(0, points.length - 6)];
    const angle = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
    return { x: tip[0], y: tip[1], angle };
  }, []);

  // BET phase countdown with tick sounds
  useEffect(() => {
    if (phase !== 'BET') return;
    const start = Date.now();
    const duration = 5000;
    lastTickSecond.current = 5;

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, duration - elapsed);
      setWaiting(remaining);

      // Play tick sound each second
      const secondsLeft = Math.ceil(remaining / 1000);
      if (secondsLeft !== lastTickSecond.current && secondsLeft > 0) {
        lastTickSecond.current = secondsLeft;
        if (secondsLeft <= 2) {
          sounds.finalTick(); // louder tick for last 2 seconds
        } else {
          sounds.tick();
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase]);

  // PLAYING phase with ambient rise sound
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    startTimeRef.current = Date.now();
    sounds.tick(); // start sound when game begins

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const mult = Math.max(1.0, Math.pow(Math.E, 0.06 * elapsed));
      setTarget(mult);
      setCurrentTarget(mult);

      const tip = drawCurve(mult);
      if (tip) {
        setPlaneX(tip.x);
        setPlaneY(tip.y);
        setPlaneAngle(tip.angle * (180 / Math.PI));
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    // Ambient rise tone every 2 seconds
    const riseInterval = setInterval(() => {
      sounds.riseTone(target);
    }, 2000);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(riseInterval);
    };
  }, [phase]);

  // GAMEEND — play crash sound
  useEffect(() => {
    if (phase !== 'GAMEEND') return;
    cancelAnimationFrame(animRef.current);
    const finalMult = Number(currentNum);
    setTarget(finalMult);
    drawCurve(finalMult, true);
    setShowCrash(true);
    sounds.crash(); // 🔊 crash sound
  }, [phase]);

  // Sync with backend GameState
  useEffect(() => {
    if (GameState === 'BET') {
      setPhase('BET');
      setShowCrash(false);
      setTarget(1.0);
      setPlaneX(0);
      setPlaneY(0);
      cancelAnimationFrame(animRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else if (GameState === 'PLAYING') {
      setPhase('PLAYING');
      setShowCrash(false);
    } else if (GameState === 'GAMEEND') {
      setPhase('GAMEEND');
    }
  }, [GameState]);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const multiplierColor = phase === 'GAMEEND'
    ? '#ff3333'
    : phase === 'PLAYING'
      ? (target >= 10 ? '#fbbf24' : target >= 2 ? '#4ade80' : '#ffffff')
      : '#888888';

  return (
    <div className="crash-wrap">
      {/* Stars */}
      <div className="stars">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }} />
        ))}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="crash-canvas" />

      {/* Plane */}
      {phase === 'PLAYING' && planeX > 0 && (
        <div className="plane-wrap" style={{
          left: planeX,
          top: planeY,
          transform: `translate(-50%, -50%) rotate(${planeAngle}deg)`,
        }}>
          <div className="plane-glow" />
          <svg className="plane-svg" viewBox="0 0 80 40" fill="none">
            <path d="M70 20 L10 8 L16 20 L10 32 Z" fill="#e50539" />
            <path d="M30 8 L20 0 L18 8 Z" fill="#c0022e" />
            <path d="M30 32 L20 40 L18 32 Z" fill="#c0022e" />
            <path d="M16 20 L8 18 L6 20 L8 22 Z" fill="#ff6b6b" />
            <circle cx="58" cy="20" r="4" fill="#ff8888" opacity="0.6" />
          </svg>
          <div className="plane-trail" />
        </div>
      )}

      {/* Multiplier display */}
      <div className={`mult-display ${phase}`}>
        {phase === 'BET' ? (
          <div className="bet-phase">
            <div className="bet-label">NEXT ROUND IN</div>
            <div className="bet-timer">{(waiting / 1000).toFixed(1)}s</div>
            <div className="bet-bar">
              <div className="bet-bar-fill" style={{ width: `${(waiting / 5000) * 100}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="mult-number" style={{ color: multiplierColor }}>
              {(target - 0.01 >= 1 ? (target - 0.01) : 1).toFixed(2)}x
            </div>
            {phase === 'GAMEEND' && <div className="flew-text">FLEW AWAY!</div>}
          </>
        )}
      </div>

      {/* Axis label */}
      {phase === 'PLAYING' && (
        <div className="axis-label">1.00x</div>
      )}
    </div>
  );
}