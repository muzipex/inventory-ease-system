
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

const DateRangePicker = ({ onDateRangeChange, className }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!startDate || isSelectingEnd) {
      if (!startDate) {
        setStartDate(date);
        setIsSelectingEnd(true);
      } else {
        if (date >= startDate) {
          setEndDate(date);
          setIsSelectingEnd(false);
          onDateRangeChange(startDate, date);
        } else {
          setStartDate(date);
          setEndDate(null);
          setIsSelectingEnd(true);
          onDateRangeChange(date, null);
        }
      }
    } else {
      if (date >= startDate) {
        setEndDate(date);
        onDateRangeChange(startDate, date);
      } else {
        setStartDate(date);
        setEndDate(null);
        setIsSelectingEnd(true);
        onDateRangeChange(date, null);
      }
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelectingEnd(false);
    onDateRangeChange(null, null);
  };

  const formatDateRange = () => {
    if (!startDate) return "Select date range";
    if (!endDate) return `${format(startDate, "MMM dd, yyyy")} - Select end date`;
    return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
  };

  return (
    <div className={cn("flex space-x-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-80 justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isSelectingEnd ? endDate || undefined : startDate || undefined}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
          />
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearDates}
              className="w-full"
            >
              Clear Dates
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
