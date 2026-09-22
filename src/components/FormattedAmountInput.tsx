import React, { useState, useEffect } from 'react';
import { parseNum, fmtNumber, fmt } from '../utils/formatters';

export interface FormattedAmountInputProps {
  value: number | string | undefined | null;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  decimals?: number;
  showCurrencySymbol?: boolean;
  id?: string;
  autoFocus?: boolean;
}

export const FormattedAmountInput: React.FC<FormattedAmountInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0,00',
  required = false,
  disabled = false,
  readOnly = false,
  decimals = 2,
  showCurrencySymbol = false,
  id,
  autoFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');

  const numVal = parseNum(value);
  const numberOnlyDisplay = fmtNumber(numVal, decimals);
  const formattedDisplay = showCurrencySymbol
    ? fmt(numVal)
    : numberOnlyDisplay;

  useEffect(() => {
    if (!isFocused) {
      setText(formattedDisplay);
    }
  }, [value, isFocused, formattedDisplay]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (readOnly) return;
    setIsFocused(true);
    setText(numVal === 0 ? '' : numberOnlyDisplay);
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const parsed = parseNum(raw);
    onChange(parsed);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseNum(text);
    onChange(parsed);
    setText(showCurrencySymbol ? fmt(parsed) : fmtNumber(parsed, decimals));
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={isFocused ? text : formattedDisplay}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
};
