'use client'

import Link from 'next/link';
import Draggable from 'react-draggable';
import { useState, useRef, useMemo, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';

// CLIP PATH GENERATION 
function generateClipPoints(seed: number) {
  let s = seed;
  const random = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const map = (val: number, min: number, max: number) => min + val * (max - min);
  const style = Math.floor(random() * 3);

  const points: { x: number, y: number }[] = [];

  let steps = 4;
  let roughness = 2;
  let cornerRoundness = 5;
  if (style === 0) { steps = 8; roughness = 1.5; cornerRoundness = 2; }
  if (style === 1) { steps = 5; roughness = 4; cornerRoundness = 6; }
  if (style === 2) { steps = 3; roughness = 7; cornerRoundness = 8; }

  // Top edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = map(t, 0 + (i === 0 ? 0 : cornerRoundness), 100 - (i === steps ? 0 : cornerRoundness));
    const y = map(random(), 0, roughness);
    points.push({ x, y });
  }
  // Right edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = map(random(), 100 - roughness, 100);
    const y = map(t, 0 + (i === 0 ? 0 : cornerRoundness), 100 - (i === steps ? 0 : cornerRoundness));
    points.push({ x, y });
  }
  // Bottom edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = map(t, 100 - (i === 0 ? 0 : cornerRoundness), 0 + (i === steps ? 0 : cornerRoundness));
    const y = map(random(), 100 - roughness, 100);
    points.push({ x, y });
  }
  // Left edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = map(random(), 0, roughness);
    const y = map(t, 100 - (i === 0 ? 0 : cornerRoundness), 0 + (i === steps ? 0 : cornerRoundness));
    points.push({ x, y });
  }

  return points;
}

const CRAYON_COLORS = ['#e63946', '#1d3557', '#2a9d8f', '#e9c46a', '#264653'];

interface Point { x: number; y: number }
interface DrawingPath { points: Point[]; color: string; width?: number }

interface ItemProps {
  item: {
    id: string;
    title: string;
    price: string;
    image_url: string;
    product_url: string;
    rotation: number;
    scale: number;
    seed: number;
    x: number;
    y: number;
    color?: string;
    drawings?: DrawingPath[];
  };
  onDelete?: () => void;
  onUpdate?: (id: string, updates: Partial<ItemProps['item']>) => void;
  canvasScale?: number;
  readOnly?: boolean;
  boardWidth?: number;
  boardHeight?: number;
}

export default function CutoutItem({ item, onDelete, onUpdate, canvasScale = 1, readOnly = false, boardWidth, boardHeight }: ItemProps) {
  const supabase = createClient();
  const nodeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [localSeed, setLocalSeed] = useState(item.seed);

  const clipPoints = useMemo(() => generateClipPoints(localSeed), [localSeed]);
  const clipPathString = useMemo(() => `polygon(${clipPoints.map(p => `${p.x}% ${p.y}%`).join(', ')})`, [clipPoints]);

  const [rotation, setRotation] = useState(item.rotation || 0);
  const [scale, setScale] = useState(item.scale || 1);
  const [color, setColor] = useState(item.color && item.color.startsWith('#') ? item.color : '#fef08a');

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [penColor, setPenColor] = useState(CRAYON_COLORS[0]);
  const [penWidth, setPenWidth] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [lastPenColor, setLastPenColor] = useState(CRAYON_COLORS[0]);
  const [drawings, setDrawings] = useState<DrawingPath[]>(item.drawings || []);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const rotationRef = useRef(item.rotation || 0);
  const scaleRef = useRef(item.scale || 1);
  const [isInteracting, setIsInteracting] = useState(false);
  const isDraggingRef = useRef(false);

  // Base dimensions to drag data to ensure accurate math
  const dragStartData = useRef({ scale: 1, mouseY: 0, centerX: 0, centerY: 0, baseW: 288, baseH: 300 });

  useEffect(() => { if (item.rotation !== undefined) { setRotation(item.rotation); rotationRef.current = item.rotation; } }, [item.rotation]);
  useEffect(() => { if (item.scale !== undefined) { setScale(item.scale); scaleRef.current = item.scale; } }, [item.scale]);
  useEffect(() => { if (item.color) setColor(item.color); }, [item.color]);
  useEffect(() => { if (item.drawings) setDrawings(item.drawings); }, [item.drawings]);

  // DRAWING RENDERER
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPath = (points: Point[], pathColor: string, pathWidth?: number) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x * canvas.width + points[i + 1].x * canvas.width) / 2;
        const yc = (points[i].y * canvas.height + points[i + 1].y * canvas.height) / 2;
        ctx.quadraticCurveTo(points[i].x * canvas.width, points[i].y * canvas.height, xc, yc);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x * canvas.width, last.y * canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pathColor === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = pathWidth || 20;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.shadowBlur = 0;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = pathWidth || 5;
        ctx.strokeStyle = pathColor;
        ctx.shadowBlur = 1;
        ctx.shadowColor = pathColor;
        ctx.globalAlpha = 0.9;
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    };

    drawings.forEach(d => drawPath(d.points, d.color, d.width));
    if (currentPath.length > 0) {
      const activeWidth = penColor === 'erase' ? eraserSize : penWidth;
      drawPath(currentPath, penColor, activeWidth);
    }
  }, [drawings, currentPath, scale, localSeed, penColor, eraserSize, penWidth, clipPoints]);

  // LOGIC
  const getCursorPosition = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const rad = -(rotation * Math.PI) / 180;
    const unrotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const unrotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
    const realWidth = canvas.offsetWidth * scale;
    const realHeight = canvas.offsetHeight * scale;
    const x = (unrotatedX + realWidth / 2) / realWidth;
    const y = (unrotatedY + realHeight / 2) / realHeight;
    return { x, y };
  };

  const startDrawing = (e: any) => { if (!isDrawingMode || readOnly) return; e.preventDefault(); e.stopPropagation(); const pos = getCursorPosition(e); setCurrentPath([pos]); };
  const draw = (e: any) => { if (!isDrawingMode || currentPath.length === 0 || readOnly) return; e.preventDefault(); e.stopPropagation(); const pos = getCursorPosition(e); setCurrentPath(prev => [...prev, pos]); };
  const stopDrawing = async () => { if (!isDrawingMode || currentPath.length === 0 || readOnly) return; const width = penColor === 'erase' ? eraserSize : penWidth; const newPathObj = { points: currentPath, color: penColor, width: width }; const newDrawings = [...drawings, newPathObj]; setDrawings(newDrawings); setCurrentPath([]); await supabase.from('items').update({ drawings: newDrawings }).eq('id', item.id); };

  const toggleEraser = () => { if (penColor === 'erase') { setPenColor(lastPenColor); } else { setLastPenColor(penColor); setPenColor('erase'); } };
  const handleReCut = async (e: any) => { e.stopPropagation(); const newSeed = Math.floor(Math.random() * 10000); setLocalSeed(newSeed); await supabase.from('items').update({ seed: newSeed }).eq('id', item.id); };
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => { setColor(e.target.value); };
  const handleColorSave = async () => { await supabase.from('items').update({ color: color }).eq('id', item.id); onUpdate?.(item.id, { color: color }); };

  const handleStart = () => { if (readOnly) return; isDraggingRef.current = true; setIsInteracting(true); };
  const handleStop = (e: any, data: any) => {
    if (readOnly) return;

    isDraggingRef.current = false;
    setIsInteracting(false);

    const cleanX = Math.round(data.x * 10) / 10;
    const cleanY = Math.round(data.y * 10) / 10;

    // Create a fire-and-forget async wrapper to satisfy TypeScript
    const updatePosition = async () => {
      const { error } = await supabase
        .from('items')
        .update({ x: cleanX, y: cleanY })
        .eq('id', item.id);

      if (!error && onUpdate) {
        onUpdate(item.id, { x: cleanX, y: cleanY });
      }
    };

    updatePosition();
  };

  const handleRotateStart = (e: any) => { if (readOnly) return; e.preventDefault(); e.stopPropagation(); setIsInteracting(true); if (nodeRef.current) { const rect = nodeRef.current.getBoundingClientRect(); dragStartData.current.centerX = rect.left + rect.width / 2; dragStartData.current.centerY = rect.top + rect.height / 2; } window.addEventListener('mousemove', handleRotateDrag); window.addEventListener('mouseup', handleRotateStop); window.addEventListener('touchmove', handleRotateDrag); window.addEventListener('touchend', handleRotateStop); };
  const handleRotateDrag = (e: any) => { const clientX = e.clientX || e.touches?.[0]?.clientX; const clientY = e.clientY || e.touches?.[0]?.clientY; if (!clientX || !clientY) return; const { centerX, centerY } = dragStartData.current; const dx = clientX - centerX; const dy = clientY - centerY; const angleRad = Math.atan2(dy, dx); let newRotation = angleRad * (180 / Math.PI) + 90; setRotation(newRotation); rotationRef.current = newRotation; };
  const handleRotateStop = async () => { setIsInteracting(false); window.removeEventListener('mousemove', handleRotateDrag); window.removeEventListener('mouseup', handleRotateStop); window.removeEventListener('touchmove', handleRotateDrag); window.removeEventListener('touchend', handleRotateStop); const cleanRotation = parseFloat(rotationRef.current.toFixed(2)); supabase.from('items').update({ rotation: cleanRotation }).eq('id', item.id).then(); if (onUpdate) onUpdate(item.id, { rotation: cleanRotation }); };

  const handleScaleStart = (e: any) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);

    // Capture unscaled dimensions from DOM
    if (nodeRef.current) {
      dragStartData.current.baseW = nodeRef.current.offsetWidth;
      dragStartData.current.baseH = nodeRef.current.offsetHeight;
    }

    const clientY = e.clientY || e.touches?.[0]?.clientY;
    dragStartData.current.scale = scale;
    dragStartData.current.mouseY = clientY;

    window.addEventListener('mousemove', handleScaleDrag);
    window.addEventListener('mouseup', handleScaleStop);
    window.addEventListener('touchmove', handleScaleDrag);
    window.addEventListener('touchend', handleScaleStop);
  };

  const handleScaleDrag = (e: any) => {
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (!clientY) return;

    const deltaY = (clientY - dragStartData.current.mouseY) / 200;
    let newScale = dragStartData.current.scale + deltaY;

    // STRICT BORDER COLLISION DETECTION - uses actual element width and height
    if (boardWidth) {
      const W = dragStartData.current.baseW;
      const H = dragStartData.current.baseH;

      const { x, y } = item; // Current Top-Left Position

      // Calculate Center of the item
      const cx = x + W / 2;
      const cy = y + H / 2;

      // Calculate Half-Extents of the Rotating Box at Scale=1
      // When rotated, the visual width/height is larger than W/H.
      const rad = (rotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));

      // Visual radius from center to edge on X and Y axes
      const unitVisualHalfW = (W * absCos + H * absSin) / 2;
      const unitVisualHalfH = (W * absSin + H * absCos) / 2;

      // 1. Right Border
      const distRight = boardWidth - cx;
      const maxScaleRight = distRight / unitVisualHalfW;

      // 2. Left Border
      const distLeft = cx;
      const maxScaleLeft = distLeft / unitVisualHalfW;

      // 3. Top Border
      const distTop = cy;
      const maxScaleTop = distTop / unitVisualHalfH;

      // 4. Bottom Border (if height exists)
      let limit = Math.min(maxScaleRight, maxScaleLeft, maxScaleTop);

      if (boardHeight) {
        const distBottom = boardHeight - cy;
        const maxScaleBottom = distBottom / unitVisualHalfH;
        limit = Math.min(limit, maxScaleBottom);
      }

      // If the calculated new scale exceeds the limit, clamp it to the limit.
      // Subtract a tiny buffer (0.01) to keep it just inside the line.
      if (newScale > limit) {
        newScale = Math.max(0.5, limit - 0.01);
      }
    }

    newScale = Math.min(2.0, Math.max(0.5, newScale));
    setScale(newScale);
    scaleRef.current = newScale;
  };

  const handleScaleStop = async () => { setIsInteracting(false); window.removeEventListener('mousemove', handleScaleDrag); window.removeEventListener('mouseup', handleScaleStop); window.removeEventListener('touchmove', handleScaleDrag); window.removeEventListener('touchend', handleScaleStop); const cleanScale = parseFloat(scaleRef.current.toFixed(3)); supabase.from('items').update({ scale: cleanScale }).eq('id', item.id).then(); if (onUpdate) onUpdate(item.id, { scale: cleanScale }); };
  const handleLinkClick = (e: React.MouseEvent) => { if (!readOnly && (isDraggingRef.current || isDrawingMode)) e.preventDefault(); };

  // BOUNDS LOGIC
  const bounds = boardWidth && boardHeight
    ? {
      left: 0,
      top: 0,
      right: boardWidth - 280,
      bottom: boardHeight - 350
    }
    : 'parent';

  const isMobile = canvasScale < 0.75;
  const toolsClass = isMobile
    ? `opacity-100`
    : `opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-150`;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x || 0, y: item.y || 0 }}
      scale={canvasScale}
      onStart={handleStart}
      onStop={handleStop}
      bounds={bounds}
      cancel=".no-drag"
      disabled={isDrawingMode || readOnly}
    >
      <div
        ref={nodeRef}
        className={`absolute w-72 font-body group select-none ${isInteracting || isDrawingMode ? 'z-9999' : 'z-10 hover:z-50'}`}
        style={{ position: 'absolute' }}
      >
        <div className="relative group" style={{ transform: `rotate(${rotation}deg) scale(${scale})`, transformOrigin: 'center center', transition: isInteracting ? 'none' : 'transform 0.1s ease-out' }}>
          {!isDrawingMode && !readOnly && (
            <div className="drag-handle absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-10 z-100 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200 hover:delay-150" style={{ background: 'linear-gradient(45deg, rgba(254, 240, 138, 0.95), rgba(253, 224, 71, 0.95))', clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', touchAction: 'none' }}>
              <span className="text-[10px] font-bold text-yellow-900/60 uppercase tracking-widest pointer-events-none">DRAG ME</span>
            </div>
          )}
          {!readOnly && (
            <div className={`no-drag absolute bottom-21.25 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-800 rounded-lg shadow-xl p-1.5 flex gap-2 z-9999 pointer-events-auto cursor-default ${toolsClass}`} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              {isDrawingMode ? (
                <div className="flex items-center gap-2">
                  <button onClick={toggleEraser} className={`w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center bg-white ${penColor === 'erase' ? 'ring-2 ring-slate-400' : ''}`}>🧹</button>
                  <input type="range" min={penColor === 'erase' ? "10" : "1"} max={penColor === 'erase' ? "50" : "20"} value={penColor === 'erase' ? eraserSize : penWidth} onChange={(e) => penColor === 'erase' ? setEraserSize(Number(e.target.value)) : setPenWidth(Number(e.target.value))} className="w-16 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  <div className="w-px bg-slate-200 h-4 mx-1"></div>
                  {penColor !== 'erase' && (
                    <>
                      {CRAYON_COLORS.map(c => (<button key={c} onClick={() => setPenColor(c)} className={`w-5 h-5 rounded-full border border-slate-200 transition-transform hover:scale-110 ${penColor === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`} style={{ backgroundColor: c }} />))}
                      <div className="relative w-5 h-5 rounded-full border border-slate-200 overflow-hidden bg-linear-to-br from-red-500 via-green-500 to-blue-500 hover:scale-110 transition-transform"><input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" /></div>
                    </>
                  )}
                  <div className="w-px bg-slate-200 h-4 mx-1"></div>
                  <button onClick={() => setIsDrawingMode(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">DONE</button>
                </div>
              ) : (
                <>
                  <div className="w-6 h-6 relative rounded overflow-hidden border border-slate-300 cursor-pointer" style={{ backgroundColor: color }}><input type="color" value={color} onChange={handleColorChange} onBlur={handleColorSave} className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer opacity-0" /></div>
                  <div className="w-px bg-slate-200 mx-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); setIsDrawingMode(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg></button>
                  <button onClick={handleReCut} className="p-1 rounded hover:bg-slate-100 text-slate-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg></button>
                  <div className="w-px bg-slate-200 mx-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Rip this page out?')) onDelete?.(); }} className="text-red-500 font-bold hover:text-red-700 text-[10px] bg-red-50 px-2 py-1 rounded cursor-pointer leading-none border border-red-100">TRASH</button>
                </>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-800 transform rotate-45"></div>
            </div>
          )}
          {!isDrawingMode && !readOnly && (
            <>
              <div className={`no-drag absolute -top-5 -left-5 w-9 h-9 rounded-full border-2 border-slate-800 bg-white shadow-md cursor-grab z-999 flex items-center justify-center text-lg text-slate-800 hover:bg-slate-100 ${toolsClass}`} onMouseDown={handleRotateStart} onTouchStart={handleRotateStart} style={{ transform: `rotate(-${rotation}deg)`, touchAction: 'none' }}>↻</div>
              <div className={`no-drag absolute -bottom-5 -right-5 w-9 h-9 rounded-full border-2 border-slate-800 bg-white shadow-md cursor-nwse-resize z-999 flex items-center justify-center text-xl text-slate-800 hover:bg-slate-100 ${toolsClass}`} onMouseDown={handleScaleStart} onTouchStart={handleScaleStart} style={{ transform: `rotate(-${rotation}deg)`, touchAction: 'none' }}>⇱</div>
            </>
          )}
          <div className="relative">
            <canvas ref={canvasRef} className={`absolute inset-0 z-40 ${isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`} style={{ clipPath: clipPathString, width: '100%', height: '100%' }} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />

            <div className="absolute inset-0 bg-black/20 blur-[2px]" style={{ clipPath: clipPathString, transform: 'scale(1.02) translateY(2px)' }}></div>
            <Link href={item.product_url} target="_blank" className={`block relative select-none ${isDrawingMode ? 'cursor-crosshair' : 'cursor-pointer'}`} draggable="false" onClick={handleLinkClick}>
              <div className="bg-crumpled-paper p-3 shadow-inner relative transition-colors duration-300" style={{ clipPath: clipPathString, backgroundColor: color }}>

                <div className="absolute inset-3 rounded-sm pointer-events-none z-10" />

                <div className="relative h-56 w-full overflow-hidden bg-white shadow-sm border-[0.5px] border-slate-200/50">
                  {item.image_url ? (<img src={item.image_url} alt={item.title} className="w-full h-full object-cover pointer-events-none select-none" draggable="false" />) : (<div className="flex h-full w-full items-center justify-center text-stone-300 font-bold rotate-[-5deg] font-title text-xl">No Photo</div>)}
                  <div className="absolute inset-0 bg-stone-500/5 mix-blend-multiply pointer-events-none"></div>
                </div>
                <div className="p-4 pt-4 pb-6 text-center mt-2 min-h-20 flex flex-col justify-center">
                  <h3 className="text-xl font-title font-bold leading-tight text-stone-800 line-clamp-3 select-none">{item.title}</h3>
                </div>
                <div className="absolute bottom-3 right-4 z-30 transform -rotate-6">
                  <span className="font-title text-4xl text-crayon-red leading-none block select-none" style={{ opacity: 0.95, mixBlendMode: 'multiply', textShadow: '0px 0px 1px rgba(230, 90, 90, 1), 1px 1px 0px rgba(230, 90, 90, 0.8)' }}>{item.price}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Draggable>
  );
}