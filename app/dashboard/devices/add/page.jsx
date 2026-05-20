'use client';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import DeviceFormComponent from '@/components/deviceFormComponent';

const AddDevices = () => {
  const handleSubmit = (data) => {
    console.log(data);
  };
  return (
    <div className="p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Asosiy</Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <Link href="/dashboard/devices">Qurilmalar</Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Yangi qo'shish</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 w-full">
        <DeviceFormComponent
          onSubmit={(data) => console.log(data)}
          onCancel={() => console.log('bekor qilindi')}
        />
      </div>
    </div>
  );
};

export default AddDevices;
