'use client';

import { useState, useEffect } from 'react';
import { UpdateContext } from './updateContext';

export default function UpdateTime({ children }) {
  const [updateTime, setUpdateTime] = useState(null);

  useEffect(() => {
    setUpdateTime(new Date());
  }, []);

  return (
    <UpdateContext.Provider value={{ updateTime, setUpdateTime }}>
      {children}
    </UpdateContext.Provider>
  );
}
