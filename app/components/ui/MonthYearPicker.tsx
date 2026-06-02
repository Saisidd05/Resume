'use client';

/**
 * MonthYearPicker — selects month + year. Also supports "Present" toggle.
 */

import { useState } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

interface MonthYearPickerProps {
  value: string; // e.g. "Jan 2023" or "Present"
  onChange: (v: string) => void;
  allowPresent?: boolean;
  id?: string;
}

export default function MonthYearPicker({
  value,
  onChange,
  allowPresent = true,
  id,
}: MonthYearPickerProps) {
  const isPresent = value === 'Present';

  const parts = value && value !== 'Present' ? value.split(' ') : ['', ''];
  const [month, setMonth] = useState(parts[0] || '');
  const [year, setYear] = useState(parts[1] || '');

  const handleMonth = (m: string) => {
    setMonth(m);
    if (year) onChange(`${m} ${year}`);
  };

  const handleYear = (y: string) => {
    setYear(y);
    if (month) onChange(`${month} ${y}`);
  };

  const handlePresent = (checked: boolean) => {
    if (checked) {
      onChange('Present');
    } else {
      onChange(month && year ? `${month} ${year}` : '');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      {!isPresent && (
        <>
          <select
            id={id}
            value={month}
            onChange={(e) => handleMonth(e.target.value)}
            className="input-field"
            style={{ flex: 1, padding: '10px 12px', minWidth: '100px' }}
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => handleYear(e.target.value)}
            className="input-field"
            style={{ flex: 1, padding: '10px 12px', minWidth: '90px' }}
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </>
      )}
      {allowPresent && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: isPresent ? '#FFC107' : 'rgba(255,255,255,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(e) => handlePresent(e.target.checked)}
            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#FFC107' }}
          />
          Present
        </label>
      )}
    </div>
  );
}
