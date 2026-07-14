"use client";

import { Button } from "@ecommerce/ui/components/button";
import { Calendar } from "@ecommerce/ui/components/calendar";
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
  FormField,
} from "@ecommerce/ui/components/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ecommerce/ui/components/popover";
import { cn } from "@/lib/utils";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  DateRange,
} from "react-day-picker";
import { formatDMY } from "@/util/date";
import { useTranslation } from "react-i18next";
import { dashboardFormControlClassName } from "./controlStyles";

export interface DateFieldsProps<T extends FieldValues> {
  control?: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  name?: FieldPath<T>;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | DateRange | Date[] | undefined) => void;
  disabledDates?: {
    from?: Date;
    to?: Date;
  };
}

function DateFields<T extends FieldValues>({
  control,
  label,
  placeholder,
  name,
  className,
  mode = "single",
  selected,
  onSelect,
  disabledDates,
}: DateFieldsProps<T>) {
  const renderCalendar = (field?: any) => {
    let displayText;
    const value = field?.value || selected;
    const { t } = useTranslation();
    if (mode === "single" && value instanceof Date) {
      displayText = formatDMY(value);
    } else if (mode === "range" && value && (value as DateRange).from) {
      const fromDate = (value as DateRange).from;
      const toDate = (value as DateRange).to;
      const formattedFrom = formatDMY(fromDate!);
      const formattedTo = toDate ? ` - ${formatDMY(toDate)}` : "";
      displayText = `${formattedFrom}${formattedTo}`;
    } else {
      displayText = placeholder || t('Form.placeholders.date')
    }

    return (
      <Popover>
        <FormControl>
          <PopoverTrigger
            render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                dashboardFormControlClassName,
                "justify-start font-normal",
                className
              )}
            />
            }
          >
            <span className="truncate">{displayText}</span>
            <HugeiconsIcon
              icon={Calendar01Icon}
              strokeWidth={2}
              className="ms-auto h-4 w-4"
            />
          </PopoverTrigger>
        </FormControl>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode={mode}
            selected={value}
            onSelect={field?.onChange || onSelect}
            disabled={
              disabledDates && disabledDates.from && disabledDates.to
                ? { from: disabledDates.from, to: disabledDates.to }
                : undefined
            }
            required
          />
        </PopoverContent>
      </Popover>
    );
  };

  if (control && name) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            {renderCalendar(field)}
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {label && (
        <FormLabel className="font-medium text-foreground">{label}</FormLabel>
      )}
      {renderCalendar()}
    </div>
  );
}

export default DateFields;
