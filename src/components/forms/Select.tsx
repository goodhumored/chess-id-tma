"use client";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  label?: string;
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 1rem center',
  backgroundSize: '12px'
};

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  required,
  label,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-white text-base font-medium">
          {label}{required && " *"}
        </label>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
        style={selectStyle}
        required={required}
      >
        {placeholder && (
          <option value="" className="bg-slate-900">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
