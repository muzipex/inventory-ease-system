
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QuantityInput = ({ value, onChange, min = 1, max, className }: QuantityInputProps) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value.toString());
    }
  }, [value, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    setIsEditing(true);
    
    // Allow empty string for better UX while typing
    if (inputValue === '') {
      return;
    }
    
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue >= min && (!max || numValue <= max)) {
      onChange(numValue);
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    // Clear the input when focused to allow easy editing
    setLocalValue('');
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // If input is empty or invalid, reset to current value or minimum
    if (localValue === '' || isNaN(parseInt(localValue)) || parseInt(localValue) < min) {
      const resetValue = value >= min ? value : min;
      setLocalValue(resetValue.toString());
      onChange(resetValue);
    } else {
      const numValue = parseInt(localValue);
      if (numValue !== value) {
        onChange(numValue);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const increment = () => {
    const newValue = value + 1;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = value - 1;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={decrement}
        disabled={value <= min}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={localValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        className="w-16 text-center h-8"
        min={min}
        max={max}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={increment}
        disabled={max ? value >= max : false}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantityInput;
