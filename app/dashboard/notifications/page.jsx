'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const NotificationPage = () => {
  const t = useTranslations('nav');
  return <div>{t('notifications')}</div>;
};

export default NotificationPage;
