'use client';

import { useEffect } from 'react';
import useDisplaySettingsStore from '@/store/useDisplaySettingsStore';
import { FONT_STACKS } from '@/constants/fontOptions';

const DisplaySettingsEffect = () => {
  const highContrast = useDisplaySettingsStore((s) => s.highContrast);
  const fontScale = useDisplaySettingsStore((s) => s.fontScale);
  const fontFamily = useDisplaySettingsStore((s) => s.fontFamily);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale / 100));
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-font-family',
      FONT_STACKS[fontFamily] ?? FONT_STACKS.inter
    );
  }, [fontFamily]);

  return null;
};

export default DisplaySettingsEffect;
