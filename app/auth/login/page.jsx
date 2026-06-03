'use client';

import React, { useState } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);

    const form = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    const result = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Username yoki parol noto'g'ri");
      toast.error("Username yoki parol noto'g'ri");
    } else if (result?.ok) {
      toast.success('Muvaffaqiyatli kirish');
      router.push('/dashboard');
    }
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
          NexusDash bilan ma'lumotlaringizni xavfsiz saqlang va ishingiz unumdorligini oshiring.
          Barcha tahlillar bir joyda.
        </p>

        <ul className="flex flex-col gap-6">
          <li className="flex gap-4">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>Yuqori darajadagi xavfsizlik protokollari</span>
          </li>
          <li className="flex gap-4">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>Real vaqt rejimida yangilanadigan dashboard</span>
          </li>
          <li className="flex gap-4">
            <img src="/icons/checked.svg" className="w-6" alt="icon" />
            <span>24/7 texnik qo'llab-quvvatlash xizmati</span>
          </li>
        </ul>
      </div>
      <div className="w-[50%] bg-white h-full flex flex-col justify-center  p-16">
        <h2 className="text-[#1B1B24] text-[36px] font-bold mb-2 ">Xush kelibsiz!</h2>
        <p className="text-[#464555] text-[16px] mb-5">
          Hisobingizga kirish uchun ma'lumotlarni kiriting
        </p>

        <form onSubmit={handleSubmit} className="text-[16px] max-w-120">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fieldgroup-name" className={'text-[16px]'}>
                Username
              </FieldLabel>
              <Input
                id="fieldgroup-name"
                placeholder="Admin"
                className="text-[16px]! py-5"
                required
                name="username"
              />
            </Field>
            <Field>
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
              <FieldDescription></FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Button
                type="submit"
                className={'bg-[#3525CD] hover:bg-[#3625cdd7] w-full text-[16px] py-5 '}
              >
                Kirish
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
