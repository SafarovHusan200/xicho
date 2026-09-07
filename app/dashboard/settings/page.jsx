'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useDisplaySettingsStore from '@/store/useDisplaySettingsStore';
import { FONT_OPTIONS, FONT_STACKS } from '@/constants/fontOptions';
import useMounted from '@/hooks/useMounted';

const CARD_CLASS =
  'rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm';

const SettingRow = ({ title, description, control }) => (
  <Card className={CARD_CLASS}>
    <CardContent className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#031634] dark:text-slate-100">{title}</p>
        <p className="text-[13px] text-[#7B8499] dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      {control}
    </CardContent>
  </Card>
);

const SettingsPage = () => {
  const t = useTranslations('settingsPage');
  const { theme, setTheme } = useTheme();
  const { highContrast, fontScale, fontFamily, setHighContrast, setFontScale, setFontFamily } =
    useDisplaySettingsStore();
  const mounted = useMounted();

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-[#031634] dark:text-slate-100">{t('title')}</h1>
        <p className="text-sm text-[#7B8499] dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      <SettingRow
        title={t('darkTheme')}
        description={t('darkThemeDesc')}
        control={
          <Switch checked={isDark} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
        }
      />

      <SettingRow
        title={t('highContrast')}
        description={t('highContrastDesc')}
        control={<Switch checked={highContrast} onCheckedChange={setHighContrast} />}
      />

      <Card className={CARD_CLASS}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#031634] dark:text-slate-100">
                {t('fontScale')}
              </p>
              <p className="text-[13px] text-[#7B8499] dark:text-slate-400 mt-0.5">
                {t('fontScaleDesc')}
              </p>
            </div>
            <span className="text-sm font-semibold text-[#031634] dark:text-slate-100 tabular-nums shrink-0">
              {fontScale}%
            </span>
          </div>
          <Slider
            min={90}
            max={130}
            step={5}
            value={[fontScale]}
            onValueChange={([v]) => setFontScale(v)}
          />
        </CardContent>
      </Card>

      <Card className={CARD_CLASS}>
        <CardContent className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-[#031634] dark:text-slate-100">
              {t('fontFamily')}
            </p>
            <p className="text-[13px] text-[#7B8499] dark:text-slate-400 mt-0.5">
              {t('fontFamilyDesc')}
            </p>
          </div>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem
                  key={font.id}
                  value={font.id}
                  style={{ fontFamily: FONT_STACKS[font.id] }}
                >
                  {font.isDefault ? t('fontDefault', { font: font.label }) : font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
