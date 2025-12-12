'use client'

import Link from 'next/link';
import Draggable from 'react-draggable';
import { useState, useRef, useMemo, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';

function generateClipPath(seed: number) {
  let s = seed;
  const random = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const map = (val: number, min: number, max: number) => min + val * (max - min);

  const style = Math.floor(random() * 3);
  const points: string[] = [];

  let steps = 4;
  let roughness = 2;
  let cornerRoundness = 5;

  if (style === 0) { steps = 8; roughness = 1.5; cornerRoundness = 2; }
  if (style === 1) { steps = 5; roughness = 4; cornerRoundness = 6; }
  if (style === 2) { steps = 3; roughness = 7; cornerRoundness = 8; }

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xBase = map(t, 0 + (i === 0 ? 0 : cornerRoundness), 100 - (i === steps ? 0 : cornerRoundness));
    const yBase = map(random(), 0, roughness);
    points.push(`${xBase}% ${yBase}%`);
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xBase = map(random(), 100 - roughness, 100);
    const yBase = map(t, 0 + (i === 0 ? 0 : cornerRoundness), 100 - (i === steps ? 0 : cornerRoundness));
    points.push(`${xBase}% ${yBase}%`);
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xBase = map(t, 100 - (i === 0 ? 0 : cornerRoundness), 0 + (i === steps ? 0 : cornerRoundness));
    const yBase = map(random(), 100 - roughness, 100);
    points.push(`${xBase}% ${yBase}%`);
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xBase = map(random(), 0, roughness);
    const yBase = map(t, 100 - (i === 0 ? 0 : cornerRoundness), 0 + (i === steps ? 0 : cornerRoundness));
    points.push(`${xBase}% ${yBase}%`);
  }

  return `polygon(${points.join(', ')})`;
}

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
  };
  onDelete: () => void;
}

export default function CutoutItem({ item, onDelete }: ItemProps) {
  const supabase = createClient();
  const nodeRef = useRef<HTMLDivElement>(null);

  const clipPath = useMemo(() => generateClipPath(item.seed), [item.seed]);

  // --- STATE ---
  const [rotation, setRotation] = useState(item.rotation || 0);
  const [scale, setScale] = useState(item.scale || 1);
  const [color, setColor] = useState(
    item.color && item.color.startsWith('#') ? item.color : '#fef08a'
  );

  // --- CRITICAL FIX: SYNC STATE WITH DATABASE ---
  // These listeners ensure that when the DB loads, the card actually updates.
  useEffect(() => {
    if (item.rotation !== undefined && item.rotation !== null) {
      setRotation(item.rotation);
    }
  }, [item.rotation]);

  useEffect(() => {
    if (item.scale !== undefined && item.scale !== null) {
      setScale(item.scale);
    }
  }, [item.scale]);

  useEffect(() => {
    if (item.color) setColor(item.color);
  }, [item.color]);
  // ---------------------------------------------

  const [isInteracting, setIsInteracting] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartData = useRef({ scale: 1, mouseY: 0, centerX: 0, centerY: 0 });

  // --- DRAG HANDLERS ---
  const handleStart = () => {
    isDraggingRef.current = true;
    setIsInteracting(true);
  };

  const handleStop = (e: any, data: any) => {
    isDraggingRef.current = false;
    setIsInteracting(false);

    // Round to 1 decimal to keep the DB clean
    const cleanX = Math.round(data.x * 10) / 10;
    const cleanY = Math.round(data.y * 10) / 10;

    supabase.from('items').update({ x: cleanX, y: cleanY }).eq('id', item.id)
      .then(({ error }) => {
        if (error) console.error("Position Save Failed:", error.message);
      });
  };

  // --- ROTATION HANDLERS ---
  const handleRotateStart = (e: any) => {
    e.preventDefault(); e.stopPropagation();
    setIsInteracting(true);

    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      dragStartData.current.centerX = rect.left + rect.width / 2;
      dragStartData.current.centerY = rect.top + rect.height / 2;
    }

    window.addEventListener('mousemove', handleRotateDrag);
    window.addEventListener('mouseup', handleRotateStop);
    window.addEventListener('touchmove', handleRotateDrag);
    window.addEventListener('touchend', handleRotateStop);
  };

  const handleRotateDrag = (e: any) => {
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (!clientX || !clientY) return;

    const { centerX, centerY } = dragStartData.current;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angleRad = Math.atan2(dy, dx);

    let newRotation = angleRad * (180 / Math.PI) + 90;
    setRotation(newRotation);
  };

  const handleRotateStop = () => {
    setIsInteracting(false);
    window.removeEventListener('mousemove', handleRotateDrag);
    window.removeEventListener('mouseup', handleRotateStop);
    window.removeEventListener('touchmove', handleRotateDrag);
    window.removeEventListener('touchend', handleRotateStop);

    // Save to DB
    const cleanRotation = parseFloat(rotation.toFixed(2));
    supabase.from('items').update({ rotation: cleanRotation }).eq('id', item.id).then();
  };

  // --- SCALE HANDLERS ---
  const handleScaleStart = (e: any) => {
    e.preventDefault(); e.stopPropagation();
    setIsInteracting(true);

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
    newScale = Math.min(2.0, Math.max(0.5, newScale));
    setScale(newScale);
  };

  const handleScaleStop = () => {
    setIsInteracting(false);
    window.removeEventListener('mousemove', handleScaleDrag);
    window.removeEventListener('mouseup', handleScaleStop);
    window.removeEventListener('touchmove', handleScaleDrag);
    window.removeEventListener('touchend', handleScaleStop);

    // Save to DB
    const cleanScale = parseFloat(scale.toFixed(3));
    supabase.from('items').update({ scale: cleanScale }).eq('id', item.id).then();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };
  const handleColorSave = () => {
    supabase.from('items').update({ color: color }).eq('id', item.id).then();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) e.preventDefault();
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x || 0, y: item.y || 0 }}
      onStart={handleStart}
      onStop={handleStop}
      bounds="parent"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className={`absolute font-body w-[85vw] max-w-[16rem] md:w-72 md:max-w-none group select-none ${isInteracting ? 'z-[9999]' : 'z-10 hover:z-50'}`}
        style={{ position: 'absolute' }}
      >
        <div
          className="relative group"
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isInteracting ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* DRAG TAPE */}
          <div
            className="drag-handle absolute -top-10 left-1/2 -translate-x-1/2 w-28 md:w-32 h-10 z-[100] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(45deg, rgba(254, 240, 138, 0.95), rgba(253, 224, 71, 0.95))',
              clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              touchAction: 'none'
            }}
          >
            <span className="text-[10px] font-bold text-yellow-900/30 uppercase tracking-widest pointer-events-none">
              DRAG ME
            </span>
          </div>

          {/* TOOLBOX */}
          <div
            className="no-drag absolute bottom-[80px] md:bottom-[85px] left-1/2 -translate-x-1/2 bg-white border-2 border-slate-800 rounded-lg shadow-xl p-1.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] pointer-events-auto w-32 cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center flex-1">
              <div
                className="h-6 relative rounded overflow-hidden border border-slate-300 cursor-pointer w-full"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                  onBlur={handleColorSave}
                  className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer opacity-0"
                />
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Rip this page out?')) onDelete(); }}
              className="text-red-500 font-bold hover:text-red-700 text-[10px] bg-red-50 px-2 py-1 rounded cursor-pointer leading-none border border-red-100"
            >
              TRASH
            </button>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-800 transform rotate-45"></div>
          </div>

          {/* ROTATE HANDLE */}
          <div
            className="no-drag absolute -top-5 -left-5 w-10 h-10 md:w-9 md:h-9 rounded-full border-2 border-slate-800 bg-white shadow-md cursor-grab opacity-0 group-hover:opacity-100 z-[999] flex items-center justify-center text-lg text-slate-800 hover:bg-slate-100 transition-opacity"
            onMouseDown={handleRotateStart}
            onTouchStart={handleRotateStart}
            style={{ transform: `rotate(-${rotation}deg)` }}
          >
            ↻
          </div>

          {/* SCALE HANDLE */}
          <div
            className="no-drag absolute -bottom-5 -right-5 w-10 h-10 md:w-9 md:h-9 rounded-full border-2 border-slate-800 bg-white shadow-md cursor-nwse-resize opacity-0 group-hover:opacity-100 z-[999] flex items-center justify-center text-xl text-slate-800 hover:bg-slate-100 transition-opacity"
            onMouseDown={handleScaleStart}
            onTouchStart={handleScaleStart}
            style={{ transform: `rotate(-${rotation}deg)` }}
          >
            ⇱
          </div>

          {/* CARD VISUAL */}
          <div className="relative">
            <div
              className="absolute inset-0 bg-black/20 blur-[2px]"
              style={{ clipPath: clipPath, transform: 'scale(1.02) translateY(2px)' }}
            ></div>

            <Link
              href={item.product_url}
              target="_blank"
              className="block relative select-none cursor-pointer"
              draggable="false"
              onClick={handleLinkClick}
            >
              <div
                className="bg-crumpled-paper p-3 shadow-inner relative transition-colors duration-300"
                style={{ clipPath: clipPath, backgroundColor: color }}
              >
                <div className="relative h-48 md:h-56 w-full overflow-hidden bg-white shadow-sm border-[0.5px] border-slate-200/50">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable="false"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300 font-bold rotate-[-5deg] font-title text-xl">
                      No Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-stone-500/5 mix-blend-multiply pointer-events-none"></div>
                </div>

                <div className="p-3 md:p-4 pt-4 pb-6 text-center mt-2 min-h-[4rem] md:min-h-[5rem] flex flex-col justify-center">
                  <h3 className="text-lg md:text-xl font-title font-bold leading-tight text-stone-800 line-clamp-3 select-none">
                    {item.title}
                  </h3>
                </div>

                <div className="absolute bottom-2 md:bottom-3 right-4 z-30 transform rotate-[-6deg]">
                  <span
                    className="font-title text-3xl md:text-4xl text-crayon-red leading-none block select-none"
                    style={{
                      opacity: 0.95,
                      mixBlendMode: 'multiply',
                      textShadow: '0px 0px 1px rgba(230, 90, 90, 1), 1px 1px 0px rgba(230, 90, 90, 0.8)'
                    }}
                  >
                    {item.price}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Draggable>
  );
}