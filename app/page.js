'use client';

import React, { useEffect, useState } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingComponent from '@/components/LoadingComponent';
import { LogIn, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LoginPage = () => {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [savedLogins, setSavedLogins] = useState([]);
  const t = useTranslations('login');

  useEffect(() => {
    setMounted(true);
    const stored = JSON.parse(localStorage.getItem('logins') || '[]');
    setSavedLogins(stored);
  }, []);

  const saveLogin = (uname, pwd) => {
    let updated = [...savedLogins];
    const idx = updated.findIndex((u) => u.username === uname);
    if (idx > -1) updated[idx].password = pwd;
    else updated.push({ username: uname, password: pwd });
    setSavedLogins(updated);
    localStorage.setItem('logins', JSON.stringify(updated));
  };

  const removeLogin = (uname) => {
    const updated = savedLogins.filter((u) => u.username !== uname);
    setSavedLogins(updated);
    localStorage.setItem('logins', JSON.stringify(updated));
  };

  const handleSelectLogin = (login) => {
    setUsername(login.username);
    setPassword(login.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', { username, password, redirect: false });
    setIsLoading(false);

    if (result?.error) {
      toast.error(t('errorCredentials'));
    } else if (result?.ok) {
      toast.success(t('successLogin'));
      saveLogin(username, password);
      router.push('/dashboard');
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: 'easeOut', delay },
  });

  return (
    <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-[#0c1626]">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:w-[50%] bg-[#3525CD] dark:bg-[#0A1628] h-full lg:flex flex-col justify-center text-white p-16 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute -top-25 -right-25 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <motion.h1 {...fadeUp(0.1)} className="flex items-center gap-4 mb-10">
            <img
              src="/icons/IES_logosi.png"
              alt="icon"
              className="w-20 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            />
            <span className="text-[40px] font-bold">ХИЧО</span>
          </motion.h1>

          <motion.h2 {...fadeUp(0.2)} className="text-[32px] font-bold mb-5 leading-tight">
            {t('leftTitle')}
          </motion.h2>

          <motion.p {...fadeUp(0.3)} className="text-white/75 pb-12 text-[15px] leading-relaxed">
            {t('leftDesc')}
          </motion.p>

          <ul className="flex flex-col gap-5">
            {[t('feature1'), t('feature2'), t('feature3')].map((text, i) => (
              <motion.li key={i} {...fadeUp(0.4 + i * 0.1)} className="flex items-center gap-3">
                <img src="/icons/checked.svg" className="w-5 shrink-0" alt="icon" />
                <span className="text-[14px] text-white/90">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full lg:w-[50%] bg-white dark:bg-[#0c1626] h-full flex flex-col mx-auto relative"
      >
        {/* Top-right controls */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col justify-center p-12 md:p-28 lg:p-16">
          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.div key="loading" {...fadeUp(0)}>
                <LoadingComponent />
              </motion.div>
            ) : status === 'authenticated' ? (
              <motion.div
                key="authenticated"
                className="flex flex-col items-center text-center gap-7"
              >
                {/* Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-[#dcfce7] dark:bg-emerald-950/50"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Text */}
                <motion.div {...fadeUp(0.3)}>
                  <h2 className="text-[22px] font-bold text-[#031634] dark:text-slate-100 mb-1.5">
                    {t('alreadyIn')}
                  </h2>
                  <p className="text-[15px] text-[#3b82f6] dark:text-blue-400">
                    {t('chooseAction')}
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div {...fadeUp(0.4)} className="flex gap-3 w-full">
                  <motion.div
                    whileHover={{ y: '-4px' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl h-12 text-[15px] font-medium gap-2"
                    >
                      <LogIn size={18} />
                      {t('goToDashboard')}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: '-4px' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full rounded-xl h-12 text-[15px] text-[#464555] dark:text-slate-300 border-[#E0E0E0] dark:border-slate-700 bg-[#F5F5F5] dark:bg-slate-800 hover:bg-[#EBEBEB] dark:hover:bg-slate-700 gap-2"
                    >
                      <LogOut size={18} />
                      {t('signOut')}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="login">
                <motion.h2
                  {...fadeUp(0.1)}
                  className="text-[#1B1B24] dark:text-slate-100 text-[36px] font-bold mb-2"
                >
                  {t('welcome')}
                </motion.h2>
                <motion.p
                  {...fadeUp(0.2)}
                  className="text-[#464555] dark:text-slate-400 text-[16px] mb-5"
                >
                  {t('subtitle')}
                </motion.p>

                {mounted && savedLogins.length > 0 && (
                  <motion.div {...fadeUp(0.25)} className="mb-4">
                    <p className="text-[#7B8499] dark:text-slate-500 text-xs sm:text-sm mb-2">
                      {t('savedLogins')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedLogins.map((login, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.06 }}
                          onClick={() => handleSelectLogin(login)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E2E8F0] dark:border-slate-700 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-sm"
                        >
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs">
                            {login.username.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-xs sm:text-sm truncate max-w-25 sm:max-w-none">
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="w-full text-[16px]">
                  <FieldGroup className="w-full">
                    <motion.div {...fadeUp(0.3)}>
                      <Field>
                        <FieldLabel
                          htmlFor="fieldgroup-name"
                          className="text-[16px] dark:text-slate-200"
                        >
                          {t('username')}
                        </FieldLabel>
                        <Input
                          id="fieldgroup-name"
                          placeholder={t('usernamePlaceholder')}
                          className="text-[16px]! py-5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                          required
                          name="username"
                          onChange={(e) => setUsername(e.target.value)}
                          value={username}
                        />
                      </Field>
                    </motion.div>

                    <motion.div {...fadeUp(0.38)}>
                      <Field>
                        <FieldLabel
                          htmlFor="fieldgroup-email"
                          className="text-[16px] dark:text-slate-200"
                        >
                          {t('password')}
                        </FieldLabel>
                        <PasswordInput
                          id="fieldgroup-email"
                          placeholder={t('passwordPlaceholder')}
                          className="text-[16px]! py-5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          required
                          name="password"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                        <FieldDescription />
                      </Field>
                    </motion.div>

                    <motion.div
                      {...fadeUp(0.46)}
                      whileHover={{ y: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full pt-2"
                    >
                      <Button
                        type="submit"
                        className="bg-[#3525CD] hover:bg-[#2a1eb8] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] w-full text-[16px] text-white py-5"
                        disabled={isLoading}
                      >
                        {isLoading ? t('submitting') : t('submit')}
                      </Button>
                    </motion.div>
                  </FieldGroup>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
