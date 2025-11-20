"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MeasurementDateRangePicker,
  type DateRange,
} from "./measurement-date-range-picker";
import { MeasurementFieldSelector } from "./measurement-field-selector";

interface MeasurementActionBarProps {
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
  dateRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  className?: string;
}

const PRESET_RANGES = [
  { label: "Last 24 hours", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "Last 30 days", hours: 24 * 30 },
  { label: "Last 90 days", hours: 24 * 90 },
] as const;

export function MeasurementActionBar({
  selectedFields,
  onFieldsChange,
  dateRange,
  onRangeChange,
  className,
}: MeasurementActionBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  const handlePresetClick = (hours: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    const newRange = { startDate, endDate };
    onRangeChange(newRange);
  };

  const getCurrentRangeLabel = () => {
    const hours = Math.round(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60)
    );

    if (hours <= 25) return "Last 24 hours";
    if (hours <= 24 * 8) return "Last 7 days";
    if (hours <= 24 * 35) return "Last 30 days";
    if (hours <= 24 * 95) return "Last 90 days";
    return "Custom range";
  };

  return (
    <div className={cn("flex items-center gap-2 p-3 bg-card border border-border rounded-lg", className)}>
      {/* Date Range Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <Calendar className="h-4 w-4" />
            {getCurrentRangeLabel()}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {PRESET_RANGES.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => handlePresetClick(preset.hours)}
              className="cursor-pointer"
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => setShowDatePicker(true)}
            className="cursor-pointer"
          >
            Custom range...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Field Selector Combo Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <BarChart3 className="h-4 w-4" />
            Fields ({selectedFields.length})
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 p-4">
          <MeasurementFieldSelector
            selectedFields={selectedFields}
            onFieldsChange={onFieldsChange}
            className="max-h-80 overflow-y-auto"
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Picker Modal (if needed) */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
            <MeasurementDateRangePicker
              onRangeChange={(range) => {
                onRangeChange(range);
                setShowDatePicker(false);
              }}
              defaultRange={dateRange}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
