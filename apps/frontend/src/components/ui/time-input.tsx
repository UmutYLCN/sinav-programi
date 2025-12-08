import { useEffect, useRef, useState } from 'react';

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  step?: string;
  disabled?: boolean;
}

export function TimeInput({
  value = '',
  onChange,
  className = '',
  required = false,
  step = '60',
  disabled = false,
}: TimeInputProps) {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '00');
      setMinutes(m || '00');
    } else {
      setHours('00');
      setMinutes('00');
    }
  }, [value]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = e.target.value;
    setHours(h);
    const newValue = `${h}:${minutes}`;
    onChange?.(newValue);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setMinutes(m);
    const newValue = `${hours}:${m}`;
    onChange?.(newValue);
  };

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return (
      <option key={hour} value={hour}>
        {hour}
      </option>
    );
  });

  // Generate minute options (00, 15, 30, 45) or every minute
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, '0');
    return (
      <option key={minute} value={minute}>
        {minute}
      </option>
    );
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={hours}
        onChange={handleHoursChange}
        disabled={disabled}
        required={required}
        className="rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Saat"
      >
        {hourOptions}
      </select>
      <span className="text-lg font-semibold">:</span>
      <select
        value={minutes}
        onChange={handleMinutesChange}
        disabled={disabled}
        required={required}
        className="rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Dakika"
      >
        {minuteOptions}
      </select>
      {/* Hidden input for form validation */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={() => {}}
        required={required}
        step={step}
        className="hidden"
        tabIndex={-1}
      />
    </div>
  );
}

