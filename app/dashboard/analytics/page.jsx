'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const AnalyticsPage = () => {
  const t = useTranslations('nav');
  return <div>{t('analytics')}</div>;
};

export default AnalyticsPage;
