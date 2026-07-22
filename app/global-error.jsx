'use client';

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center mt-10 font-sans">
          <h1 className="mt-4 mb-5 text-3xl font-semibold text-slate-950">
            Server bilan bog&apos;liq muammo bo&apos;lishi mumkin
          </h1>
          <p>Iltimos, birozdan so&apos;ng qayta urinib ko&apos;ring</p>
          <button
            onClick={() => reset()}
            className="mt-5 px-5 py-2 rounded-md bg-blue-500 text-white"
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
