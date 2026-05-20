import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const DevicesPage = () => {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="">
          <h2 className="title text-[#031634]  text-[24px] font-bold leading-10 tracking-[-0.64px]">
            Qurilmalar reestri
          </h2>
          <p className="text-[#44474E] text-[16px] font-normal leading-6 mb-6 ">
            Barcha texnik vositalar va sanoat qurilmalari ro'yxati
          </p>
        </div>

        <Link href={'/dashboard/devices/add'}>
          <Button className="flex items-center gap-2 px-5 py-5 text-[16px] cursor-pointer ">
            <img src="/icons/plus.svg" alt="icon" />
            <span>Qurilma qo'shish</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DevicesPage;
