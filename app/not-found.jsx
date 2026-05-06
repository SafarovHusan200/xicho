'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const NotFount = () => {
  const router = useRouter();
  return (
    <div className="w-full h-screen  flex flex-col justify-center items-center">
      <h3 className="text-2xl mb-3">Page Not Found</h3>

      <button
        onClick={() => router.back()}
        className="px-5 py-2 rounded-md bg-blue-500 text-white"
        href={'/'}
      >
        Ortga
      </button>
    </div>
  );
};

export default NotFount;
