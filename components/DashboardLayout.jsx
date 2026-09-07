'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { MdDashboard } from 'react-icons/md';

import { FaChartBar, FaTimes, FaBars, FaUserShield } from 'react-icons/fa';
import { MdOutlineHomeWork } from 'react-icons/md';
import { usePathname, useRouter } from 'next/navigation';
import { AiOutlineSafety } from 'react-icons/ai';
import { HiMenu } from 'react-icons/hi';
import { IoSettingsOutline, IoLocationOutline, IoDocumentOutline } from 'react-icons/io5';

import { TbDeviceDesktopAnalytics } from 'react-icons/tb';
import { MdKeyboardArrowDown } from 'react-icons/md';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut as LogOutIcon,
  Settings,
  ArrowLeft,
  Loader2,
  Cpu,
  MonitorSpeaker,
  FlaskConical,
} from 'lucide-react';

import '@/styles/dashboard/style.css';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useTranslations } from 'next-intl';
import LoadingComponent from '@/components/LoadingComponent';
import { resetAllStores } from '@/store/resetAllStores';
import CustomModal from './modals/CustomModal';
import { Button } from './ui/button';

const menuKeys = [
  { labelKey: 'monitoring', href: '/dashboard', icon: MdDashboard, key: '' },
  { labelKey: 'facilities', href: '/dashboard/facility', icon: AiOutlineSafety, key: 'facility' },
  {
    labelKey: 'locations',
    href: '/dashboard/locations',
    icon: IoLocationOutline,
    key: 'locations',
  },
  { labelKey: 'users', href: '/dashboard/users', icon: FaUserShield, key: 'users' },
  {
    labelKey: 'devices',
    icon: TbDeviceDesktopAnalytics,
    key: 'devices',
    children: [
      { labelKey: 'deviceTypes', href: '/dashboard/devices/types', icon: Cpu },
      { labelKey: 'devicesList', href: '/dashboard/devices/all', icon: MonitorSpeaker },
      { labelKey: 'testLogs', href: '/dashboard/devices/test-logs', icon: FlaskConical },
    ],
  },
  {
    labelKey: 'documents',
    href: '/dashboard/documents',
    icon: IoDocumentOutline,
    key: 'documents',
  },
  { labelKey: 'reports', href: '/dashboard/reports', icon: FaChartBar, key: 'reports' },
  { labelKey: 'settings', href: '/dashboard/settings', icon: IoSettingsOutline, key: 'settings' },
];

/* ── active for the exact route AND any of its nested/detail sub-routes
   (e.g. /dashboard/facility/89c4b902-... should keep "Facilities" active);
   the /dashboard root is excluded from the prefix check since every route
   starts with it ── */
const isNavActive = (pathname, href) =>
  pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));

/* ── defined outside DashboardLayout so its identity is stable across
   parent re-renders (e.g. toggling a submenu) — otherwise React would
   remount this whole subtree every time and framer-motion's exit/enter
   transitions would never get a chance to play ── */
const SidebarContent = ({ sidebarSmall, t, setSidebarOpen, pathname, openGroups, toggleGroup }) => (
  <div className="h-full   flex  flex-col justify-between ">
    <div>
      <div className="mt-4 mb-6 px-3  flex items-center justify-between">
        <Link href={'/dashboard'} className="flex items-center gap-3 relative overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] shadow-md shadow-blue-900/50">
            <MdOutlineHomeWork className="text-xl text-white" />
          </div>
          {sidebarSmall && (
            <div>
              <h3 className="font-bold text-[15px] text-white tracking-wide">ХИЧО</h3>
              <p className="text-[#64748b] text-[11px] min-w-0  uppercase tracking-widest">
                {t('subtitle')}
              </p>
            </div>
          )}
        </Link>

        <button
          className="lg:hidden absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={16} />
        </button>
      </div>

      <nav className="space-y-1 overflow-hidden">
        {menuKeys.map(({ labelKey, href, icon: Icon, key, children }) => {
          if (children) {
            const isGroupActive = children.some((c) => isNavActive(pathname, c.href));
            const isOpen = openGroups[key] ?? isGroupActive;
            return (
              <div key={key}>
                <button
                  onClick={() => toggleGroup(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition duration-300 sidebar__link ${isGroupActive ? 'active' : ''}`}
                >
                  <Icon className="text-xl shrink-0" />
                  {sidebarSmall && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">{t(labelKey)}</span>
                      <MdKeyboardArrowDown
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="submenu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-0.5 space-y-0.5 ${sidebarSmall ? 'pl-4' : ''}`}>
                        {children.map((child) => {
                          const childActive = isNavActive(pathname, child.href);
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-2.5 px-4 py-2.5 rounded transition duration-300 sidebar__link ${childActive ? 'active' : ''}`}
                            >
                              <ChildIcon size={15} className="shrink-0" />
                              {sidebarSmall && (
                                <span className="text-[13px] font-medium">{t(child.labelKey)}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded transition duration-300 sidebar__link ${active ? 'active' : ''}`}
            >
              <Icon className="text-xl shrink-0" />
              {sidebarSmall && <span className="text-sm font-medium">{t(labelKey)}</span>}
            </Link>
          );
        })}
      </nav>
    </div>

    <div className="rounded-xl border border-[rgba(59,130,246,0.15)] bg-[rgba(59,130,246,0.07)] p-4 flex flex-col gap-2">
      {sidebarSmall && (
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest">
          {t('systemStatus')}
        </p>
      )}
      <div className={`flex items-center ${!sidebarSmall && 'justify-center'} gap-2`}>
        <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
        {sidebarSmall && (
          <span className="text-sm font-semibold text-[#e2e8f0]">{t('allGood')}</span>
        )}
      </div>
    </div>
  </div>
);

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSmall, setSidebarSmall] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [isLogout, setIsLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const t = useTranslations('nav');

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    menuKeys.forEach((item) => {
      if (item.children?.some((c) => isNavActive(pathname, c.href))) {
        initial[item.key] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'unauthenticated') {
      router.push('/');
    } else if (
      session?.error === 'RefreshTokenExpired' ||
      session?.error === 'RefreshAccessTokenError'
    ) {
      resetAllStores();
      signOut({ callbackUrl: '/' });
    } else {
      setIsLoading(false);
    }
  }, [status, session?.error, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (status === 'loading' || isLoading) {
    return <LoadingComponent />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleLogOut = async () => {
    setIsLogout(true);
  };

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      resetAllStores();
      toast.success(t('logoutSuccess'));
    } catch (error) {
      toast.error(t('logoutError'));
    } finally {
      setIsLoggingOut(false);
      setIsLogout(false);
    }
  };

  return (
    <div className="w-full flex h-screen ">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden transition-all duration-400 lg:block ${sidebarSmall ? 'w-55' : 'w-18'} shrink-0 p-2 border-r border-[#0d2d50] bg-[#0A2540] dark:bg-[#1D293D] text-[#CBD5E1]`}
      >
        <SidebarContent
          sidebarSmall={sidebarSmall}
          t={t}
          setSidebarOpen={setSidebarOpen}
          pathname={pathname}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
        />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-55 p-2
          bg-[#0A2540] dark:bg-[#1D293D] border-r border-[#0d2d50]
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent
          sidebarSmall={sidebarSmall}
          t={t}
          setSidebarOpen={setSidebarOpen}
          pathname={pathname}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
        />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col flex-1 min-h-screen w-0 lg:w-[calc(100%-220)] bg-[#F8FAFC] dark:bg-[#0c1626]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/85 dark:bg-[#1D293D] shadow-sm dark:shadow-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm mt-0.5"
            >
              <ArrowLeft size={16} className="text-[#7B8499]" />
            </button>

            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center  cursor-pointer rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-slate-300"
              onClick={() => {
                setSidebarOpen(true);
                setSidebarSmall(true);
              }}
              aria-label={t('openMenu')}
            >
              <FaBars size={16} />
            </button>

            <button
              className="hidden lg:flex w-9 h-9 items-center justify-center  cursor-pointer rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-slate-300"
              onClick={() => setSidebarSmall((prev) => !prev)}
            >
              <HiMenu
                className={`text-gray-500 transition ${sidebarSmall ? 'transform: rotate-0' : 'transform: rotate-180'}`}
                size={16}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <p className="text-[#031634] dark:text-slate-200 hidden sm:block font-medium text-sm">
              {t('controlPanel')}
            </p>
            <LanguageSwitcher />
            <ThemeToggle />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  <User size={15} className="text-slate-500 dark:text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl p-1.5" align="end" sideOffset={8}>
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20 shrink-0">
                    <User size={16} className="text-[#3b82f6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate">
                      {session?.user?.name ?? t('myAccount')}
                    </p>
                    <p className="text-[11px] text-[#7B8499] dark:text-slate-500 truncate">
                      {session?.user?.email ?? ''}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="mb-1" />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="rounded-lg gap-2.5 cursor-pointer h-9">
                    <Link href="/dashboard/settings">
                      <Settings size={15} className="text-[#7B8499] dark:text-slate-400" />
                      <span className="text-[13px]">{t('settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogOut}
                  className="rounded-lg gap-2.5 cursor-pointer h-9 text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/40"
                >
                  <LogOutIcon size={15} />
                  <span className="text-[13px]">{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout modal */}
            <CustomModal
              open={isLogout}
              onClose={() => !isLoggingOut && setIsLogout(false)}
              title={t('logoutConfirm')}
              className="max-w-sm"
            >
              <div className="flex flex-col gap-5 pt-2">
                {/* <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20">
                    <LogOutIcon size={24} className="text-[#3b82f6]" />
                  </div>
                </div> */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md"
                    onClick={() => setIsLogout(false)}
                    disabled={isLoggingOut}
                  >
                    {t('logoutNo')}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-md gap-2 bg-[#ff5454] hover:bg-[#ff3535] text-white font-semibold"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LogOutIcon size={14} />
                    )}
                    {t('logoutYes')}
                  </Button>
                </div>
              </div>
            </CustomModal>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
