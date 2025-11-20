"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MEASUREMENT_FIELDS,
  FIELD_CATEGORIES,
  getFieldsByCategory,
  getAllFieldKeys,
  type MeasurementFieldConfig,
} from "./measurement-field-config";

// Map field keys to CSS variable classes
function getChartColorClass(fieldKey: string): string {
  const colorMap: Record<string, string> = {
    pm01: "bg-chart-1",
    pm02: "bg-chart-2",
    pm10: "bg-chart-3",
    pm03PCount: "bg-chart-4",
    pm01_corrected: "bg-chart-1",
    pm02_corrected: "bg-chart-2",
    pm10_corrected: "bg-chart-3",
    atmp: "bg-chart-1",
    rhum: "bg-chart-2",
    rco2: "bg-chart-3",
    atmp_corrected: "bg-chart-1",
    rhum_corrected: "bg-chart-2",
    rco2_corrected: "bg-chart-3",
    tvoc: "bg-chart-4",
    tvocIndex: "bg-chart-5",
    noxIndex: "bg-chart-1",
  };
  return colorMap[fieldKey] || "bg-chart-1";
}

interface MeasurementFieldSelectorProps {
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
  availableFields?: string[];
  className?: string;
}

export function MeasurementFieldSelector({
  selectedFields,
  onFieldsChange,
  availableFields,
  className,
}: MeasurementFieldSelectorProps) {
  const fieldsToShow = availableFields || getAllFieldKeys();

  const handleFieldToggle = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      onFieldsChange(selectedFields.filter((f) => f !== fieldKey));
    } else {
      onFieldsChange([...selectedFields, fieldKey]);
    }
  };

  const handleCategoryToggle = (category: keyof typeof FIELD_CATEGORIES) => {
    const categoryFields = getFieldsByCategory(category).filter((f) =>
      fieldsToShow.includes(f)
    );
    const allSelected = categoryFields.every((f) =>
      selectedFields.includes(f)
    );

    if (allSelected) {
      onFieldsChange(
        selectedFields.filter((f) => !categoryFields.includes(f))
      );
    } else {
      const newFields = [
        ...selectedFields,
        ...categoryFields.filter((f) => !selectedFields.includes(f)),
      ];
      onFieldsChange(newFields);
    }
  };

  const renderField = (fieldKey: string, config: MeasurementFieldConfig) => {
    if (!fieldsToShow.includes(fieldKey)) return null;

    const isSelected = selectedFields.includes(fieldKey);
    const colorClass = getChartColorClass(fieldKey);

    return (
      <div
        key={fieldKey}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
        onClick={() => handleFieldToggle(fieldKey)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleFieldToggle(fieldKey)}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className={cn("w-3 h-3 rounded-full", colorClass)}
        />
        <label
          htmlFor={`field-${fieldKey}`}
          className="text-sm font-medium cursor-pointer flex-1"
          onClick={(e) => {
            e.stopPropagation();
            handleFieldToggle(fieldKey);
          }}
        >
          {config.label}
        </label>
        <span className="text-xs text-muted-foreground">{config.unit}</span>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(FIELD_CATEGORIES).map(([category, label]) => {
        const categoryFields = getFieldsByCategory(
          category as keyof typeof FIELD_CATEGORIES
        ).filter((f) => fieldsToShow.includes(f));

        if (categoryFields.length === 0) return null;

        const allSelected = categoryFields.every((f) =>
          selectedFields.includes(f)
        );

        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{label}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCategoryToggle(category as keyof typeof FIELD_CATEGORIES)
                }
                className="text-xs h-7"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="space-y-1 pl-4">
              {categoryFields.map((fieldKey) =>
                renderField(fieldKey, MEASUREMENT_FIELDS[fieldKey])
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

