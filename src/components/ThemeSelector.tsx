'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/src/contexts/ThemeContext';
import { CUSTOM_THEME_ID } from '@/src/lib/themes';

export default function ThemeSelector() {
  const {
    currentTheme,
    customBackgroundUrl,
    setTheme,
    setCustomBackground,
    uploadCustomBackground,
    removeCustomBackground,
    themes
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadCustomBackground(file);
      if (imageUrl) {
        await setCustomBackground(imageUrl);
        setIsOpen(false);
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustom = async () => {
    await removeCustomBackground();
    setIsOpen(false);
  };

  const isCustomThemeActive = currentTheme.id === CUSTOM_THEME_ID;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border-2 border-slate-800 text-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-title font-bold hover:bg-purple-100 hover:text-purple-800 transition-colors shadow-md flex items-center gap-2 text-xs md:text-sm transform hover:-rotate-1 hover:cursor-pointer"
      >
        <span>{currentTheme.emoji}</span>
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 bg-white border-2 border-slate-800 rounded-lg shadow-xl overflow-hidden z-[9999] min-w-[180px]"
          style={{
            clipPath: 'polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)',
          }}
        >
          <div className="py-1">
            {/* Preset themes */}
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left font-title text-sm flex items-center gap-3 transition-colors hover:cursor-pointer ${currentTheme.id === theme.id && !isCustomThemeActive
                    ? 'bg-yellow-100 text-yellow-900'
                    : 'hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <span className="text-lg">{theme.emoji}</span>
                <span>{theme.name}</span>
                {currentTheme.id === theme.id && !isCustomThemeActive && (
                  <svg
                    className="w-4 h-4 ml-auto text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-slate-200 my-1"></div>

            {/* Custom background option */}
            {customBackgroundUrl && isCustomThemeActive ? (
              // Show current custom background with remove option
              <div className="px-4 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">🖼️</span>
                  <span className="font-title text-sm text-slate-700">My Photo</span>
                  <svg
                    className="w-4 h-4 ml-auto text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-2 rounded font-title transition-colors"
                  >
                    {isUploading ? '...' : 'Change'}
                  </button>
                  <button
                    onClick={handleRemoveCustom}
                    className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 py-1 px-2 rounded font-title transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              // Show upload option
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full px-4 py-2 text-left font-title text-sm flex items-center gap-3 transition-colors hover:cursor-pointer hover:bg-purple-50 text-purple-700"
              >
                <span className="text-lg">{isUploading ? '⏳' : '📷'}</span>
                <span>{isUploading ? 'Uploading...' : 'Upload My Photo'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
