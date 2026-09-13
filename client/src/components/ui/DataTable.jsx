'use client';

import React from 'react';

export default function DataTable({
  headers = [],
  children,
  empty = false,
  emptyMessage = 'No records found'
}) {
  return (
    <div className="marky-card overflow-hidden border border-[#ECE8E3]">
      <div className="overflow-x-auto">
        <table className="marky-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`${h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {h.label || h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-[#6C6782]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
