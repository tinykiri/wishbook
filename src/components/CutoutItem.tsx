'use client'

import Link from 'next/link';
import Draggable from 'react-draggable';
import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/src/lib/supabase/client';

function generateClipPath(seed: number) {
  let s = seed;
  const random = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const jitter = 6;
  const t1 = random() * jitter; const t2 = random() * jitter;
  const r1 = 100 - random() * jitter; const r2 = 100 - random() * jitter;
  const b1 = 100 - random() * jitter; const b2 = 100 - random() * jitter;
  const l1 = random() * jitter; const l2 = random() * jitter;

  return `polygon(
    ${t1}% ${t2}%, 50% 0%, ${r1}% ${t1}%,
    100% 50%, ${r2}% ${r1}%, ${r1}% ${b2}%,
    50% 100%, ${b1}% ${r2}%, ${l2}% ${b1}%,
    0% 50%, ${l1}% ${l2}%
  )`;
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
  const nodeRef = useRef(null);
  const clipPath = generateClipPath(item.seed);

  // --- STATE ---
  const [rotation, setRotation] = useState(item.rotation || 0);
  const [scale, setScale] = useState(item.scale || 1);
  const [color, setColor] = useState(
    item.color && item.color.startsWith('#') ? item.color : '#fef08a'
  );

  const isDraggingRef = useRef(false);
  const scaleStartRef = useRef(1);
  const cardCenterRef = useRef({ x: 0, y: 0 });


  // --- POSITION DRAG HANDLERS ---
  const handleStart = () => {
    isDraggingRef.current = true;
    // Calculate center for rotation/scale handlers when drag starts
    const rect = nodeRef.current.getBoundingClientRect();
    cardCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handleStop = async (e: any, data: any) => {
    isDraggingRef.current = false;
    await supabase.from('items').update({ x: data.x, y: data.y }).eq('id', item.id);
  };


  // --- ROTATION HANDLERS (Manual Drag on Handle) ---
  const handleRotateStart = (e) => {
    e.stopPropagation();
    document.addEventListener('mousemove', handleRotateDrag);
    document.addEventListener('mouseup', handleRotateStop);
  };

  const handleRotateDrag = useCallback((e) => {
    // We use the last calculated center position
    const { x: centerX, y: centerY } = cardCenterRef.current;

    // Calculate angle from center to mouse position
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angleRad = Math.atan2(dy, dx);
    let newRotation = angleRad * (180 / Math.PI) + 90; // Adjust for 0 being up

    if (newRotation > 180) newRotation -= 360;
    if (newRotation < -180) newRotation += 360;

    setRotation(newRotation);
  }, []);

  const handleRotateStop = async () => {
    document.removeEventListener('mousemove', handleRotateDrag);
    document.removeEventListener('mouseup', handleRotateStop);
    await supabase.from('items').update({ rotation: rotation }).eq('id', item.id);
  };

  // --- SCALE HANDLERS (Manual Drag on Handle) ---
  const handleScaleStart = (e) => {
    e.stopPropagation();
    scaleStartRef.current = scale;
    document.addEventListener('mousemove', handleScaleDrag);
    document.addEventListener('mouseup', handleScaleStop);
  };

  const handleScaleDrag = useCallback((e) => {
    const deltaY = (e.movementY / 200);
    let newScale = scale + deltaY;

    newScale = Math.min(2.0, Math.max(0.5, newScale));
    setScale(newScale);
  }, [scale]);

  const handleScaleStop = async () => {
    document.removeEventListener('mousemove', handleScaleDrag);
    document.removeEventListener('mouseup', handleScaleStop);
    await supabase.from('items').update({ scale: scale }).eq('id', item.id);
  };

  // --- INTERACTION HANDLERS ---
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };
  const handleColorSave = async () => {
    await supabase.from('items').update({ color: color }).eq('id', item.id);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: item.x || 0, y: item.y || 0 }}
      onStart={handleStart}
      onStop={handleStop}
      onDrag={() => isDraggingRef.current = true}
      bounds="parent"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className="absolute z-10 font-body hover:z-50 w-72 group"
        style={{ position: 'absolute' }}
      >

        {/* === TOOLBOX (Floating Above Title - Color/Trash) === */}
        <div
          className="no-drag absolute -top-16 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-800 rounded-lg shadow-xl p-2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] pointer-events-auto w-40 cursor-default"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Color Picker */}
          <div className="flex items-center flex-1">
            <div className="h-8 relative rounded overflow-hidden border border-slate-300 cursor-pointer w-full">
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                onBlur={handleColorSave}
                className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
              />
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Rip this page out?')) onDelete(); }}
            className="text-red-500 font-bold hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded cursor-pointer"
          >
            TRASH
          </button>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-800 transform rotate-45"></div>
        </div>


        {/* === ROTATABLE/SCALABLE CONTENT === */}
        <div
          className="relative group cursor-grab active:cursor-grabbing"
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* --- VISUAL HANDLES (Only visible on hover) --- */}

          {/* 1. ROTATION HANDLE (Top Left Corner) */}
          <div
            className="no-drag absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 border-slate-800 bg-white/80 shadow-lg cursor-grab opacity-0 group-hover:opacity-100 z-[999] flex items-center justify-center text-lg text-slate-800 hover:bg-slate-200 transition-opacity"
            onMouseDown={handleRotateStart}
            onTouchStart={handleRotateStart}
            style={{ transform: `rotate(-${rotation}deg)` }} // Counter-rotate icon
          >
            ↻
          </div>

          {/* 2. SCALE HANDLE (Bottom Right Corner) */}
          <div
            className="no-drag absolute -bottom-4 -right-4 w-8 h-8 rounded-full border-2 border-slate-800 bg-white/80 shadow-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 z-[999] flex items-center justify-center text-xl text-slate-800 hover:bg-slate-200 transition-opacity"
            onMouseDown={handleScaleStart}
            onTouchStart={handleScaleStart}
            style={{ transform: `rotate(-${rotation}deg)` }} // Counter-rotate icon
          >
            ⇱
          </div>


          {/* TAPE HANDLE (Draggable tape) */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-10 z-[60] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(45deg, rgba(254, 240, 138, 0.9), rgba(253, 224, 71, 0.9))',
              clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(2px)'
            }}
          >
            <span className="text-xs font-bold text-yellow-900/40 uppercase tracking-widest pointer-events-none select-none">
              DRAG TAPE
            </span>
          </div>

          {/* THE CARD */}
          <div className="relative">
            {/* Glue Shadow */}
            <div
              className="absolute inset-0 bg-black/20 blur-[4px]"
              style={{ clipPath: clipPath, transform: 'scale(1.02) translateY(2px)' }}
            ></div>

            <Link
              href={item.product_url}
              target="_blank"
              className="block relative select-none"
              draggable="false"
              onClick={handleLinkClick}
            >
              <div
                className="bg-crumpled-paper p-3 shadow-inner relative transition-colors duration-300"
                style={{
                  clipPath: clipPath,
                  backgroundColor: color
                }}
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-white shadow-sm border-[0.5px] border-slate-200/50">
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

                {/* Text */}
                <div className="p-4 pt-4 pb-8 text-center">
                  <h3 className="text-xl font-title font-bold leading-tight text-stone-800 line-clamp-3 select-none">
                    {item.title}
                  </h3>
                </div>

                {/* Price */}
                <div className="absolute bottom-2 right-4 z-30 transform rotate-[-6deg]">
                  <span
                    className="font-title text-4xl text-crayon-red leading-none block select-none"
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