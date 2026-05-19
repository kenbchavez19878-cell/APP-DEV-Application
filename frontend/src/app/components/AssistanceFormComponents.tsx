import { ReactNode, useState } from "react";
import { Info, AlertCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from "date-fns";

// Form Section Component
export function FormSection({
  title,
  subtitle,
  stepNumber,
  rightElement,
  children,
}: {
  title: string;
  subtitle?: string;
  stepNumber?: number;
  rightElement?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        {stepNumber && (
          <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex-shrink-0 shadow-sm">
            <span className="text-lg">{stepNumber}</span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl text-gray-900 mb-1">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
      </div>
      {children}
    </div>
  );
}

// Form Field with Label and Helper Text
export function FormField({
  label,
  required,
  helperText,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700 flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {helperText && (
          <div className="group relative">
            <Info className="size-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
              {helperText}
            </div>
          </div>
        )}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="size-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Text Input with styling
export function TextInput({
  placeholder,
  value,
  onChange,
  required,
  disabled,
  type = "text",
  min,
  max,
  className: extraClass,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  min?: number | string;
  max?: number | string;
  className?: string;
}) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        transition-all
        ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
        ${required ? "border-l-4 border-l-blue-500" : ""}
        ${extraClass ?? ""}`}
    />
  );
}

// Select Dropdown — uses Radix Select so it always opens downward
export function SelectInput({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required,
  disabled,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <RadixSelect
      value={value || ""}
      onValueChange={(val) => {
        onChange?.({
          target: { value: val },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          transition-all h-auto
          ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
          ${required ? "border-l-4 border-l-blue-500" : ""}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent side="bottom" avoidCollisions={false} sideOffset={4}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </RadixSelect>
  );
}

// Textarea
export function TextArea({
  placeholder,
  value,
  onChange,
  rows = 4,
  required,
  disabled,
  maxLength,
  className: extraClass,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          resize-none transition-all
          ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
          ${required ? "border-l-4 border-l-blue-500" : ""}
          ${extraClass ?? ""}`}
      />
      {maxLength && (
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
  );
}

// Checkbox with Label
export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="size-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
        />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
}

// Radio Group
export function RadioGroup({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: string; label: string; description?: string }[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
            ${
              value === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            className="mt-0.5 size-4 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1">
            <div className={`text-sm ${value === option.value ? "text-gray-900" : "text-gray-700"}`}>
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

// Amount Input with Currency
export function AmountInput({
  value,
  onChange,
  required,
  disabled,
  max,
  helperText,
}: {
  value?: number;
  onChange?: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
  max?: number;
  helperText?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">₱</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          required={required}
          disabled={disabled}
          max={max}
          min={0}
          step={100}
          className={`w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            transition-all
            ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
            ${required ? "border-l-4 border-l-blue-500" : ""}`}
        />
      </div>
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      {max && value && value > max && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="size-3" />
          <span>Amount exceeds maximum limit of ₱{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// Custom Date Picker — always opens downward via Radix Popover
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateStr(str: string) {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

export function DateInput({
  value,
  onChange,
  required,
  disabled,
  min,
  max,
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDateStr(value || "");
  const [viewMonth, setViewMonth] = useState<Date>(() => selected || new Date());

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDayOfWeek = getDay(startOfMonth(viewMonth));
  const todayISO = new Date().toISOString().split("T")[0];

  const isDayDisabled = (d: number) => {
    const iso = toISO(year, month, d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const handleDayClick = (d: number) => {
    if (isDayDisabled(d) || disabled) return;
    const iso = toISO(year, month, d);
    onChange?.({ target: { value: iso } } as React.ChangeEvent<HTMLInputElement>);
    setOpen(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const iso = todayISO;
    if (!min || iso >= min) {
      onChange?.({ target: { value: iso } } as React.ChangeEvent<HTMLInputElement>);
      setViewMonth(today);
      setOpen(false);
    }
  };

  const displayValue = selected ? format(selected, "MMM dd, yyyy") : "";

  // Year options: 100 years back, 10 years forward
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next);
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-left
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all
            ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}
            ${required ? "border-l-4 border-l-blue-500" : ""}
            ${!displayValue ? "text-gray-400" : "text-gray-900"}`}
        >
          <span>{displayValue || "Select date"}</span>
          <CalendarDays className="size-4 text-gray-400 flex-shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="z-[300] bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {/* Month / Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((prev) => subMonths(prev, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="size-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="size-4 text-gray-600" />
            </button>
          </div>

          {/* Month picker row */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={month}
              onChange={(e) => setViewMonth(new Date(year, Number(e.target.value), 1))}
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setViewMonth(new Date(Number(e.target.value), month, 1))}
              className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="h-7 flex items-center justify-center text-xs text-gray-400 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const iso = toISO(year, month, d);
              const isSelected = value === iso;
              const isToday = iso === todayISO;
              const isOff = isDayDisabled(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={isOff}
                  onClick={() => handleDayClick(d)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-colors
                    ${isSelected ? "bg-blue-600 text-white font-semibold shadow-sm" : ""}
                    ${!isSelected && isToday ? "border-2 border-blue-400 text-blue-600 font-medium" : ""}
                    ${!isSelected && !isToday && !isOff ? "hover:bg-blue-50 text-gray-700 cursor-pointer" : ""}
                    ${isOff ? "text-gray-300 cursor-not-allowed" : ""}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleTodayClick}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Today
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// File Upload
export function FileUpload({
  label,
  accept,
  required,
  helperText,
  multiple,
}: {
  label?: string;
  accept?: string;
  required?: boolean;
  helperText?: string;
  multiple?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center
          hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer
          ${required ? "border-blue-300 bg-blue-50" : "border-gray-300"}`}
      >
        <input
          type="file"
          accept={accept}
          required={required}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="flex justify-center">
            <svg className="size-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-sm">
            <span className="text-blue-600 hover:text-blue-700">Upload a file</span>
            <span className="text-gray-600"> or drag and drop</span>
          </div>
          {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
      </div>
    </div>
  );
}

// Info Alert
export function InfoAlert({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-900">{children}</div>
    </div>
  );
}

// Warning Alert
export function WarningAlert({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">{children}</div>
    </div>
  );
}
