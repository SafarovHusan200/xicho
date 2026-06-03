'use client';

import Link from 'next/link';
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { MdDashboard } from 'react-icons/md';

import { FaChartBar, FaTimes, FaBars } from 'react-icons/fa';
import { MdOutlineHomeWork } from 'react-icons/md';
import { usePathname, useRouter } from 'next/navigation';
import { AiOutlineSafety } from 'react-icons/ai';

import { FaArrowLeft } from 'react-icons/fa';
import { IoSettingsOutline } from 'react-icons/io5';
import { TbDeviceDesktopAnalytics } from 'react-icons/tb';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import '../../styles/dashboard/style.css';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import NotificationComponent from '@/components/NotificationComponent';

const menuItems = [
  { label: 'Monitoring', href: '/dashboard', icon: MdDashboard, key: '' },
  { label: 'Hisobotlar', href: '/dashboard/reports', icon: FaChartBar, key: 'reports' },
  {
    label: 'Qurilmalar',
    href: '/dashboard/devices',
    icon: TbDeviceDesktopAnalytics,
    key: 'devices',
  },
  {
    label: 'Xavfsizlik',
    href: '/dashboard/safety-approvals',
    icon: AiOutlineSafety,
    key: 'safety-approvals',
  },
  { label: 'Sozlamalar', href: '/dashboard/permits', icon: IoSettingsOutline, key: 'permits' },
];

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSmall, setSidebarSmall] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [isNotification, setIsNotification] = useState(false);

  const route = useMemo(() => pathname.split('/')[2] || '', [pathname]);

  // Ruxsat tekshirish va login bo'lmasa redirect qilish
  useEffect(() => {
    console.log(status);

    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'unauthenticated') {
      router.push('/');
    } else {
      setIsLoading(false);
      console.log('session=', session);
    }
  }, [status, session, router]);

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

  // Loading screen ko'rsatish
  if (status === 'loading' || isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Agar login qilmagan bo'lsa null qaytarish (redirect allaqachon qilindi)
  if (status === 'unauthenticated') {
    return null;
  }

  const SidebarContent = () => (
    <div className="h-full  flex  flex-col justify-between ">
      <div>
        <div className="mt-4 mb-10 px-4  flex items-center justify-between">
          <div className="flex items-center gap-3 relative ">
            <div className="logo">
              <MdOutlineHomeWork className="text-2xl" />
            </div>
            {sidebarSmall && (
              <div>
                <h3 className=" font-extrabold text-md ">XICHO</h3>
                <p className="text-[#b6bacf] text-sm  w-33.25">SANOAT NAZORATI</p>
              </div>
            )}
          </div>

          <button
            className="lg:hidden absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={16} />
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.map(({ label, href, icon: Icon, key }) => {
            const active = route === key;
            return (
              <Link
                key={href}
                href={href}
                className={`
                flex items-center gap-3 px-4 py-3 rounded
                transition duration-300 sidebar__link
              
                ${active ? 'active' : ''}
              `}
              >
                <Icon className="text-[#475569] text-xl" />
                {sidebarSmall && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-lg border border-[rgba(197,198,207,0.10)] bg-[rgba(26,43,74,0.40)] p-4 flex flex-col gap-2">
        {sidebarSmall && <p>Tizim holati</p>}
        <div className={`flex items-center ${!sidebarSmall && 'justify-center'} gap-2`}>
          <span className="inline-block w-2 h-2 rounded-2xl bg-[#10B981]"></span>

          {sidebarSmall && <b>Barchasi joyida</b>}
        </div>
      </div>
    </div>
  );

  const LogOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Siz muvaffaqiyatli tizimdan chiqdingiz');
    } catch (error) {
      toast.error('Chiqishda xato yuz berdi');
    }
  };

  return (
    <div className="w-full flex h-screen ">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden transition-all duration-400 lg:block ${sidebarSmall ? 'w-63.75' : 'w-18'}  shrink-0 p-2 border-r border-[#E2E8F0] bg-[#041627] text-[#CBD5E1]`}
      >
        <SidebarContent />
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
          fixed top-0 left-0 z-50 h-full w-63.75 p-2
          bg-[#F8FAFC] border-r border-[#E2E8F0]
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col flex-1 min-h-screen w-0 lg:w-[calc(100%-255px)]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/80 shadow-sm backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-600"
              onClick={() => {
                setSidebarOpen(true);
                setSidebarSmall(true);
              }}
              aria-label="Открыть меню"
            >
              <FaBars size={16} />
            </button>

            <button
              className="hidden lg:flex w-9 h-9  items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-600"
              onClick={() => setSidebarSmall((prev) => !prev)}
            >
              <FaArrowLeft
                className={`text-gray-500 transition ${sidebarSmall ? 'transform: rotate-0' : 'transform: rotate-180'}`}
                size={16}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <p className="text-[#031634] ">Boshqaruv paneli</p>
            <button
              className="notification btn__icon"
              onClick={() => setIsNotification((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="currentColor"
              >
                <path
                  d="M0 17V15H2V8C2 6.61667 2.41667 5.3875 3.25 4.3125C4.08333 3.2375 5.16667 2.53333 6.5 2.2V1.5C6.5 1.08333 6.64583 0.729167 6.9375 0.4375C7.22917 0.145833 7.58333 0 8 0C8.41667 0 8.77083 0.145833 9.0625 0.4375C9.35417 0.729167 9.5 1.08333 9.5 1.5V2.2C10.8333 2.53333 11.9167 3.2375 12.75 4.3125C13.5833 5.3875 14 6.61667 14 8V15H16V17H0ZM8 20C7.45 20 6.97917 19.8042 6.5875 19.4125C6.19583 19.0208 6 18.55 6 18H10C10 18.55 9.80417 19.0208 9.4125 19.4125C9.02083 19.8042 8.55 20 8 20ZM4 15H12V8C12 6.9 11.6083 5.95833 10.825 5.175C10.0417 4.39167 9.1 4 8 4C6.9 4 5.95833 4.39167 5.175 5.175C4.39167 5.95833 4 6.9 4 8V15Z"
                  fill="#434655"
                />
              </svg>
            </button>

            <AnimatePresence>
              {isNotification && <NotificationComponent onClose={() => setIsNotification(false)} />}
            </AnimatePresence>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M3.85 15.1C4.7 14.45 5.65 13.9375 6.7 13.5625C7.75 13.1875 8.85 13 10 13C11.15 13 12.25 13.1875 13.3 13.5625C14.35 13.9375 15.3 14.45 16.15 15.1C16.7333 14.4167 17.1875 13.6417 17.5125 12.775C17.8375 11.9083 18 10.9833 18 10C18 7.78333 17.2208 5.89583 15.6625 4.3375C14.1042 2.77917 12.2167 2 10 2C7.78333 2 5.89583 2.77917 4.3375 4.3375C2.77917 5.89583 2 7.78333 2 10C2 10.9833 2.1625 11.9083 2.4875 12.775C2.8125 13.6417 3.26667 14.4167 3.85 15.1ZM10 11C9.01667 11 8.1875 10.6625 7.5125 9.9875C6.8375 9.3125 6.5 8.48333 6.5 7.5C6.5 6.51667 6.8375 5.6875 7.5125 5.0125C8.1875 4.3375 9.01667 4 10 4C10.9833 4 11.8125 4.3375 12.4875 5.0125C13.1625 5.6875 13.5 6.51667 13.5 7.5C13.5 8.48333 13.1625 9.3125 12.4875 9.9875C11.8125 10.6625 10.9833 11 10 11ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C10.8833 18 11.7167 17.8708 12.5 17.6125C13.2833 17.3542 14 16.9833 14.65 16.5C14 16.0167 13.2833 15.6458 12.5 15.3875C11.7167 15.1292 10.8833 15 10 15C9.11667 15 8.28333 15.1292 7.5 15.3875C6.71667 15.6458 6 16.0167 5.35 16.5C6 16.9833 6.71667 17.3542 7.5 17.6125C8.28333 17.8708 9.11667 18 10 18ZM10 9C10.4333 9 10.7917 8.85833 11.075 8.575C11.3583 8.29167 11.5 7.93333 11.5 7.5C11.5 7.06667 11.3583 6.70833 11.075 6.425C10.7917 6.14167 10.4333 6 10 6C9.56667 6 9.20833 6.14167 8.925 6.425C8.64167 6.70833 8.5 7.06667 8.5 7.5C8.5 7.93333 8.64167 8.29167 8.925 8.575C9.20833 8.85833 9.56667 9 10 9Z"
                      fill="#434655"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-45 "
                align="left"
                style={{ transform: 'translateX(-24px)' }}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuItem>
                    Профиль
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Платежи
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Настройки
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Команда</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Пригласить пользователей</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Эл. почта</DropdownMenuItem>
                        <DropdownMenuItem>Сообщение</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Еще...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    Новая команда
                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>GitHub</DropdownMenuItem>
                  <DropdownMenuItem>Поддержка</DropdownMenuItem>
                  <DropdownMenuItem disabled>API</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className={'w-full border-none'}>
                        Chiqish
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rostdan ham tizimdan chiqasizmi?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={'flex justify-between '}>
                        <AlertDialogCancel className={'w-[49%]'}>Yo'q</AlertDialogCancel>
                        <AlertDialogAction className={'w-[49%]'} onClick={LogOut}>
                          Ha
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
