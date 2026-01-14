'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { themes, Theme, getThemeById, DEFAULT_THEME_ID, CUSTOM_THEME_ID, createCustomTheme } from '@/src/lib/themes';
import { createClient } from '@/src/lib/supabase/client';

const THEME_STORAGE_KEY = 'wishlist-theme';
const CUSTOM_BG_STORAGE_KEY = 'wishlist-custom-bg';

interface ThemeContextType {
  currentTheme: Theme;
  customBackgroundUrl: string | null;
  setTheme: (themeId: string) => void;
  setThemeFromId: (themeId: string, customBgUrl?: string | null) => void;
  setCustomBackground: (imageUrl: string) => Promise<void>;
  uploadCustomBackground: (file: File) => Promise<string | null>;
  removeCustomBackground: () => Promise<void>;
  themes: Theme[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
  initialCustomBgUrl?: string | null;
}

export function ThemeProvider({ children, initialThemeId, initialCustomBgUrl }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    getThemeById(initialThemeId || DEFAULT_THEME_ID)
  );
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(initialCustomBgUrl || null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load theme from Supabase profile on mount
  useEffect(() => {
    setMounted(true);

    const loadThemeFromProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Try to get theme and custom_background from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme, custom_background')
            .eq('id', user.id)
            .single();

          if (profile) {
            // Handle custom background
            if (profile.custom_background) {
              setCustomBackgroundUrl(profile.custom_background);
              localStorage.setItem(CUSTOM_BG_STORAGE_KEY, profile.custom_background);
            }

            // Handle theme
            if (profile.theme) {
              if (profile.theme === CUSTOM_THEME_ID && profile.custom_background) {
                setCurrentTheme(createCustomTheme(profile.custom_background));
              } else {
                const theme = getThemeById(profile.theme);
                setCurrentTheme(theme);
              }
              localStorage.setItem(THEME_STORAGE_KEY, profile.theme);
            } else {
              // Fallback to localStorage if no profile theme
              const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
              if (savedThemeId) {
                if (savedThemeId === CUSTOM_THEME_ID) {
                  const savedCustomBg = localStorage.getItem(CUSTOM_BG_STORAGE_KEY);
                  if (savedCustomBg) {
                    setCurrentTheme(createCustomTheme(savedCustomBg));
                    setCustomBackgroundUrl(savedCustomBg);
                  }
                } else {
                  const theme = getThemeById(savedThemeId);
                  setCurrentTheme(theme);
                }
              }
            }
          }
        } else {
          // Not logged in - use localStorage or initialThemeId
          if (initialThemeId) {
            if (initialThemeId === CUSTOM_THEME_ID && initialCustomBgUrl) {
              setCurrentTheme(createCustomTheme(initialCustomBgUrl));
              setCustomBackgroundUrl(initialCustomBgUrl);
            } else {
              setCurrentTheme(getThemeById(initialThemeId));
            }
          } else {
            const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedThemeId) {
              if (savedThemeId === CUSTOM_THEME_ID) {
                const savedCustomBg = localStorage.getItem(CUSTOM_BG_STORAGE_KEY);
                if (savedCustomBg) {
                  setCurrentTheme(createCustomTheme(savedCustomBg));
                  setCustomBackgroundUrl(savedCustomBg);
                }
              } else {
                const theme = getThemeById(savedThemeId);
                setCurrentTheme(theme);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to localStorage
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId) {
          const theme = getThemeById(savedThemeId);
          setCurrentTheme(theme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeFromProfile();
  }, [supabase, initialThemeId, initialCustomBgUrl]);

  // Update CSS variable when theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty('--doodle-background', currentTheme.doodleSvg);
    }
  }, [currentTheme, mounted]);

  const setTheme = useCallback(async (themeId: string) => {
    let theme: Theme;

    if (themeId === CUSTOM_THEME_ID && customBackgroundUrl) {
      theme = createCustomTheme(customBackgroundUrl);
    } else {
      theme = getThemeById(themeId);
    }

    setCurrentTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);

    // Save to Supabase profile
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ theme: themeId })
          .eq('id', user.id);

        if (updateError) {
          await supabase
            .from('profiles')
            .insert({ id: user.id, theme: themeId });
        }
      }
    } catch (error) {
      console.error('Error saving theme to profile:', error);
    }
  }, [supabase, customBackgroundUrl]);

  // Set theme without saving to DB (for share page)
  const setThemeFromId = useCallback((themeId: string, customBgUrl?: string | null) => {
    if (themeId === CUSTOM_THEME_ID && customBgUrl) {
      setCurrentTheme(createCustomTheme(customBgUrl));
      setCustomBackgroundUrl(customBgUrl);
    } else {
      const theme = getThemeById(themeId);
      setCurrentTheme(theme);
    }
  }, []);

  // Upload custom background to Supabase Storage
  const uploadCustomBackground = useCallback(async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Create unique filename with user ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/background-${Date.now()}.${fileExt}`;

      // Upload to backgrounds bucket
      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading background:', error);
      return null;
    }
  }, [supabase]);

  // Set custom background and save to profile
  const setCustomBackground = useCallback(async (imageUrl: string) => {
    setCustomBackgroundUrl(imageUrl);
    localStorage.setItem(CUSTOM_BG_STORAGE_KEY, imageUrl);

    // Set theme to custom
    const customTheme = createCustomTheme(imageUrl);
    setCurrentTheme(customTheme);
    localStorage.setItem(THEME_STORAGE_KEY, CUSTOM_THEME_ID);

    // Save to Supabase profile
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            theme: CUSTOM_THEME_ID,
            custom_background: imageUrl
          })
          .eq('id', user.id);

        if (updateError) {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              theme: CUSTOM_THEME_ID,
              custom_background: imageUrl
            });
        }
      }
    } catch (error) {
      console.error('Error saving custom background:', error);
    }
  }, [supabase]);

  // Remove custom background
  const removeCustomBackground = useCallback(async () => {
    setCustomBackgroundUrl(null);
    localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);

    // Switch to default theme
    const defaultTheme = getThemeById(DEFAULT_THEME_ID);
    setCurrentTheme(defaultTheme);
    localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME_ID);

    // Update Supabase profile
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            theme: DEFAULT_THEME_ID,
            custom_background: null
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error removing custom background:', error);
    }
  }, [supabase]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{
        currentTheme,
        customBackgroundUrl,
        setTheme,
        setThemeFromId,
        setCustomBackground,
        uploadCustomBackground,
        removeCustomBackground,
        themes,
        isLoading: true
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      customBackgroundUrl,
      setTheme,
      setThemeFromId,
      setCustomBackground,
      uploadCustomBackground,
      removeCustomBackground,
      themes,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
