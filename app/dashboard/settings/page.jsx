'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const SettingsPage = () => {
  const t = useTranslations('nav');
  return <div>{t('settings')}</div>;
};

export default SettingsPage;
