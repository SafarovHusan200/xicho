'use client';

import React from 'react';
import { Pencil } from 'lucide-react';

import { MdDeleteOutline } from 'react-icons/md';

const formatValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-[12px] font-semibold whitespace-nowrap ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {value ? 'Ha' : "Yo'q"}
      </span>
    );
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  return value;
};

const TableComponent = ({ column = [], data = [], onEdit, handleDelete }) => {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-[#F5F7FA]">
          <tr className="border-b border-[#E5E7EB]">
            {column.map((col) => (
              <th
                key={col.key}
                className={`h-18 px-5 text-[15px] font-semibold text-[#031634] whitespace-nowrap ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id ?? index}
              className="h-20 border-b border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors"
            >
              {column.map((col) => {
                if (col.key === 'action') {
                  return (
                    <td key="action" className="px-5">
                      <div className="flex items-center justify-end gap-4 text-[#031634]">
                        <button
                          className="cursor-pointer hover:text-[#2563EB] transition-colors"
                          onClick={() => onEdit?.(row)}
                        >
                          <Pencil size={18} className="text-orange-500" />
                        </button>
                        <button
                          className="cursor-pointer hover:text-[#2563EB] transition-colors"
                          onClick={() => handleDelete?.(row)}
                        >
                          <MdDeleteOutline className="text-red-500" size={20} />
                        </button>
                      </div>
                    </td>
                  );
                }

                return (
                  <td
                    key={col.key}
                    className={`px-5 text-[15px] font-medium text-[#3C4043] whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatValue(row[col.key])}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
