'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';

const NotificationComponent = ({ onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Kran KC-07 — sinov muddati 3 kun o'ldi o'tgan!",
      description: 'Hozirginaña',
      type: 'error',
      status: 'SHOSHILINCH',
      icon: AlertTriangle,
    },
    {
      id: 2,
      title: "Kompressor B-2 — bosim me'yordan oshdi (12.4 bar)",
      description: '15 daqiqa oldin',
      type: 'warning',
      status: 'YUQORI',
      icon: AlertCircle,
    },
    {
      id: 3,
      title: 'Gidravlik moy darajasi pasaymod (Rezervuar #4)',
      description: '1 soat oldin',
      type: 'info',
      status: 'OGOHLANTIRISH',
      icon: Info,
    },
    {
      id: 4,
      title: "Rejali texnik ko'rik: Lift L-02 (Ertaga 09:00)",
      description: '3 soat oldin',
      type: 'primary',
      status: 'REJALI',
      icon: Clock,
    },
    {
      id: 5,
      title: 'Haftalik xavfsizlik hisobot shakllantirildi',
      description: 'Bugun 08:30',
      type: 'success',
      status: 'TAYYOR',
      icon: CheckCircle,
    },
  ]);

  const getStyles = (type) => {
    const styles = {
      error: {
        container: ' ',
        badge: 'bg-red-100 text-red-700',
        icon: 'text-red-500',
      },
      warning: {
        container: ' ',
        badge: 'bg-orange-100 text-orange-700',
        icon: 'text-orange-500',
      },
      info: {
        container: ' ',
        badge: 'bg-yellow-100 text-yellow-700',
        icon: 'text-yellow-500',
      },
      primary: {
        container: ' ',
        badge: 'bg-blue-100 text-blue-700',
        icon: 'text-blue-500',
      },
      success: {
        container: ' ',
        badge: 'bg-green-100 text-green-700',
        icon: 'text-green-500',
      },
    };
    return styles[type] || styles.info;
  };

  return (
    <motion.div
      key="notification"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      className="w-full max-w-md bg-white overflow-hidden  shadow-md rounded-[16px] fixed top-3 right-15 border "
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#031634] p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold  text-white">Xabarnomalar (5 ta yangi)</h2>
        <button className="p-1 bg-gray-100 rounded-full transition" onClick={onClose}>
          <IoCloseOutline />
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => {
          const styles = getStyles(notification.type);
          const Icon = notification.icon;

          return (
            <div
              key={notification.id}
              className={`p-4 flex gap-3 hover:bg-gray-50 transition cursor-pointer ${styles.container}`}
            >
              {/* Icon */}
              <div className={`shrink-0 mt-1 ${styles.icon}`}>
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {notification.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles.badge}`}
                >
                  {notification.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Link href="/dashboard/notifications" onClick={onClose}>
          <Button variant="outline" className="w-full text-center text-sm font-medium">
            BARCHA XABARNOMALARNI KO'RISH →
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotificationComponent;
