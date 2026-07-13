'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const ReportsPage = () => {
  const t = useTranslations('nav');
  return <div>{t('reports')}</div>;
};

export default ReportsPage;
