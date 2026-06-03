'use client';

import React, { useEffect, useState } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  const [savedLogins, setSavedLogins] = useState([]);

  useEffect(() => {
    setMounted(true);
    const stored = JSON.parse(localStorage.getItem('logins') || '[]');
    setSavedLogins(stored);
  }, []);

  const saveLogin = (username, password) => {
    let updated = [...savedLogins];
    const existingIndex = updated.findIndex((u) => u.username === username);
    if (existingIndex > -1) {
      updated[existingIndex].password = password;
    } else {
      updated.push({ username, password });
    }
    setSavedLogins(updated);
    localStorage.setItem('logins', JSON.stringify(updated));
  };

  const removeLogin = (username) => {
    const updated = savedLogins.filter((u) => u.username !== username);
    setSavedLogins(updated);
    localStorage.setItem('logins', JSON.stringify(updated));
  };

  // Helper functions that respect SSR hydration
  const safeBg = (light, dark) => mounted && light;
  const safeText = (light, dark) => mounted && light;
  const safeBorder = (light, dark) => mounted && light;

  const handleSelectLogin = (login) => {
    setUsername(login.username);
    setPassword(login.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username: username,
      password: password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Username yoki parol noto'g'ri");
      toast.error("Username yoki parol noto'g'ri");
    } else if (result?.ok) {
      toast.success('Muvaffaqiyatli kirish');
      router.push('/dashboard');

      saveLogin(username, password);

      console.log(result);
    }
  };

  return (
    <div className="w-full h-screen flex ">
      <div className="hidden lg:w-[50%] bg-[#3525CD] h-full lg:flex flex-col justify-center text-white p-16">
        <h1 className=" flex items-center gap-4 mb-10">
          <img src="/icons/NexusDash.svg" alt="icon" />
          <span className="text-[40px] font-bold">ХИЧО </span>
        </h1>
        <h2 className="text-[36px] font-bold mb-6">Hujjatlarni boshqarishning yangi darajasi</h2>
        <p className="text-[rgba(255, 255, 255, 0.80)] pb-16">
          “IES” AJ tizim korxonalari xavfli ishlab chiqarish ob’ektlarida o‘rnatilgan texnik
          qurilmalarni texnik ko‘rik va sinovlardan o‘tkazish holatini monitoring qilish elektron
          platformasi
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

      <div className="w-full lg:w-[50%] bg-white h-full flex flex-col justify-center  mx-auto p-12 md:p-28 lg:p-16 ">
        <h2 className="text-[#1B1B24] text-[36px] font-bold mb-2 ">Xush kelibsiz!</h2>
        <p className="text-[#464555] text-[16px] mb-5">
          Hisobingizga kirish uchun ma'lumotlarni kiriting
        </p>

        {savedLogins.length > 0 && (
          <div className="mb-4">
            <p className={safeText('text-gray-600', 'text-gray-300') + ' text-xs sm:text-sm mb-2'}>
              Saqlangan loginlar:
            </p>

            <div className="flex flex-wrap gap-2">
              {savedLogins.map((login, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectLogin(login)}
                  className={
                    safeBg('bg-blue-50', 'bg-blue-900/30') +
                    ' flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all text-sm'
                  }
                >
                  <span
                    className={
                      safeBg('bg-blue-500', 'bg-blue-700') +
                      ' w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-white text-xs'
                    }
                  >
                    {login.username.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className={
                      safeText('text-blue-600', 'text-blue-300') +
                      ' text-xs sm:text-sm truncate max-w-25 sm:max-w-none'
                    }
                  >
                    {login.username}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogin(login.username);
                    }}
                    className="ml-1 text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full text-[16px] ">
          <FieldGroup className={'w-full'}>
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
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email" className={'text-[16px]'}>
                Parol
              </FieldLabel>
              <Input
                label="Пароль"
                id="fieldgroup-email"
                type="password"
                className={'text-[16px]! py-5'}
                required
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <FieldDescription></FieldDescription>
            </Field>
            <Field orientation="horizontal">
              {/* Submit button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full pt-2"
              >
                <Button
                  type="submit"
                  className={'bg-[#3525CD] hover:bg-[#3625cdd7] w-full text-[16px] py-5 '}
                  disabled={isLoading}
                >
                  Kirish
                </Button>
              </motion.div>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
