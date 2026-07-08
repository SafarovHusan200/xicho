import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';

const DashboardPage = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardPage;
