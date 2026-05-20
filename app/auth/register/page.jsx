'use client';

import React, { useState } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const RegisterPage = () => {
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    setData(data);
  };
  return (
    <div className="w-full h-screen flex">
      <div className="w-[50%] bg-[#3525CD] h-full flex flex-col justify-center text-white p-16">
        <h1 className=" flex items-center gap-4 mb-10">
          <img src="/icons/NexusDash.svg" alt="icon" />
          <span className="text-[40px] font-bold">NexusDash</span>
        </h1>
        <h2 className="text-[36px] font-bold mb-6">Hujjatlarni boshqarishning yangi darajasi</h2>
        <p className="text-[rgba(255, 255, 255, 0.80)] pb-16">
          Markazlashtirilgan boshqaruv paneli orqali barcha jarayonlarni osonlik bilan nazorat
          qiling va samaradorlikni oshiring.
        </p>

        <ul className="w-full flex flex-wrap gap-6">
          <li className="flex gap-4 w-[calc(50%-10px)] ">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>Xavfsiz tizim</span>
          </li>
          <li className="flex gap-4 w-[calc(50%-16px)] ">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>Tezkor tahlil</span>
          </li>
          <li className="flex gap-4 w-[calc(50%-16px)] ">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>24/7 qo'llab-quvvatlash xizmati</span>
          </li>
          <li className="flex gap-4 w-[calc(50%-16px)] ">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>Moslashuvchan interfeys</span>
          </li>
        </ul>
      </div>
      <div className="w-[50%] bg-white h-full flex flex-col justify-center  p-16">
        <h2 className="text-[#1B1B24] text-[36px] font-bold mb-2 ">Ro'yxatdan o'tish</h2>
        <p className="text-[#464555] text-[16px] mb-5">
          Boshqaruv paneliga kirish uchun ma'lumotlaringizni kiriting
        </p>

        <form onSubmit={handleSubmit} className="text-[16px] max-w-120">
          <FieldGroup>
            <Field className={'flex gap-2'}>
              <FieldLabel htmlFor="fieldgroup-name" className={'text-[16px]'}>
                To'liq ismingiz
              </FieldLabel>
              <Input
                id="fieldgroup-name"
                placeholder="Ism Sharif"
                className="text-[16px]! py-5"
                required
                name="username"
              />
            </Field>
            <Field className={'flex gap-2'}>
              <FieldLabel htmlFor="fieldgroup-name" className={'text-[16px]'}>
                Email manzilingiz
              </FieldLabel>
              <Input
                id="fieldgroup-name"
                placeholder="example@nexus.com"
                className="text-[16px]! py-5"
                required
                name="email"
                type={'email'}
              />
            </Field>
            <Field className={'flex gap-2'}>
              <FieldLabel htmlFor="fieldgroup-email" className={'text-[16px]'}>
                Parol
              </FieldLabel>
              <Input
                id="fieldgroup-email"
                type="password"
                className={'text-[16px]! py-5'}
                required
                name="password"
              />
              {/* <FieldDescription></FieldDescription> */}
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="terms-checkbox"
                name="terms-checkbox"
                className="
                data-[state=checked]:bg-[#3625cdd7]
                data-[state=checked]:border-blue-600
  "
              />
              <Label htmlFor="terms-checkbox">
                Men Foydalanish shartlari va Maxfiylik siyosati bilan tanishdim.
              </Label>
            </Field>

            <Field orientation="horizontal">
              <Button
                type="submit"
                className={'bg-[#3525CD] hover:bg-[#3625cdd7] w-full text-[16px] py-5 '}
              >
                Ro'yxatdan o'tish
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <div className="mt-10 flex justify-center gap-3">
          <p className="text-[#464555]  ">Allaqachon hisobingiz bormi? </p>
          <Link href={'/auth/login'} className="text-[#3525CD] font-bold ">
            Kirish
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
