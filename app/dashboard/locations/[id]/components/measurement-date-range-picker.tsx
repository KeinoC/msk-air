"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface MeasurementDateRangePickerProps {
  onRangeChange: (range: DateRange) => void;
  defaultRange?: DateRange;
  className?: string;
}

const PRESET_RANGES = [
  { label: "Last 24 hours", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "Last 30 days", hours: 24 * 30 },
  { label: "Last 90 days", hours: 24 * 90 },
] as const;

export function MeasurementDateRangePicker({
  onRangeChange,
  defaultRange,
  className,
}: MeasurementDateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    defaultRange || {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }
  );
  const [activePreset, setActivePreset] = useState<number>(24); // Track active preset

  useEffect(() => {
    if (defaultRange) {
      setSelectedRange(defaultRange);
    }
  }, [defaultRange]);

  const handlePresetClick = (hours: number) => {
    const endDate = new Date(); // Always use current time
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    const newRange = { startDate, endDate };
    console.log(`Setting range to ${hours} hours: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`End date is ${(new Date().getTime() - endDate.getTime())} ms from now`);
    setActivePreset(hours);
    setSelectedRange(newRange);
    onRangeChange(newRange);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    if (newStartDate <= selectedRange.endDate) {
      const newRange = { ...selectedRange, startDate: newStartDate };
      setActivePreset(-1); // Clear active preset when custom date is used
      setSelectedRange(newRange);
      onRangeChange(newRange);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    if (newEndDate >= selectedRange.startDate) {
      const newRange = { ...selectedRange, endDate: newEndDate };
      setActivePreset(-1); // Clear active preset when custom date is used
      setSelectedRange(newRange);
      onRangeChange(newRange);
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {PRESET_RANGES.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset === preset.hours ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset.hours)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="datetime-local"
            value={formatDateForInput(selectedRange.startDate)}
            onChange={handleStartDateChange}
            max={formatDateForInput(selectedRange.endDate)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <input
            type="datetime-local"
            value={formatDateForInput(selectedRange.endDate)}
            onChange={handleEndDateChange}
            min={formatDateForInput(selectedRange.startDate)}
            max={formatDateForInput(new Date())}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Selected range: {selectedRange.startDate.toLocaleString()} -{" "}
        {selectedRange.endDate.toLocaleString()}
      </div>
    </div>
  );
}

