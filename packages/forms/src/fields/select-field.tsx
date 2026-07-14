"use client";

import { useMemo, useState } from "react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  Cancel01Icon,
  Loading03Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@ecommerce/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ecommerce/ui/components/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@ecommerce/ui/components/command";
import { cn } from "@ecommerce/ui/lib/utils";
import { useFetch } from "@ecommerce/http";
import type { QueryKey } from "@tanstack/react-query";
import { useDebounce } from "../hooks/use-debounce";

export interface SelectFieldOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export type SelectFieldProps<
  T extends FieldValues = FieldValues,
  TData = unknown,
> = {
  placeholder?: string;
  field: ControllerRenderProps<T, Path<T>>;
  disabled?: boolean;
  options?: SelectFieldOption[];
  endpoint?: string;
  general?: boolean;
  queryKey?: QueryKey;
  select?: (data: any) => SelectFieldOption[];
  debounceMs?: number;
  multiple?: boolean;
  clearable?: boolean;
  isRemoteSearch?: boolean;
  searchParam?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  className?: string;
};

function SelectField<T extends FieldValues, TData = unknown>({
  placeholder = "",
  field,
  disabled,
  options,
  endpoint,
  queryKey,
  general,
  multiple = false,
  select,
  debounceMs = 300,
  clearable = false,
  isRemoteSearch = false,
  searchParam = "search",
  params,
  className,
}: SelectFieldProps<T, TData>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, debounceMs);
  const requestParams = useMemo(
    () => ({
      ...(params ?? {}),
      ...(isRemoteSearch ? { [searchParam]: debouncedQuery } : {}),
    }),
    [debouncedQuery, isRemoteSearch, params, searchParam],
  );

  const { data, isPending } = useFetch<any, SelectFieldOption[]>({
    endpoint,
    queryKey: queryKey || [
      endpoint,
      params ?? {},
      isRemoteSearch ? debouncedQuery : "",
    ],
    staleTime: isRemoteSearch ? 60_000 : 1200_000,
    select,
    enabled: !!endpoint,
    params: Object.keys(requestParams).length ? requestParams : undefined,
    adapterOptions: general ? { general: true } : undefined,
  });

  const dataOptions = useMemo<SelectFieldOption[]>(() => {
    if (endpoint) return data ?? [];
    return options ?? [];
  }, [endpoint, data, options]);

  const filteredOptions = useMemo(() => {
    if (isRemoteSearch || !debouncedQuery) return dataOptions;
    const lower = debouncedQuery.toLowerCase();
    return dataOptions.filter(
      (o) =>
        String(o.label ?? "")
          .toLowerCase()
          .includes(lower) || String(o.value).toLowerCase().includes(lower),
    );
  }, [debouncedQuery, dataOptions, isRemoteSearch]);

  const singleValue = !multiple
    ? field.value !== undefined && field.value !== null
      ? String(field.value)
      : ""
    : "";
  const multiValue = multiple
    ? Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : []
    : [];

  const selectedLabel = useMemo(() => {
    if (!multiple) {
      const selected = dataOptions?.find(
        (o) => String(o.value) === String(singleValue),
      );
      return selected?.label ?? "";
    }

    if (!multiValue.length) return "";
    const selected = dataOptions.filter((o) =>
      multiValue.map(String).includes(String(o.value)),
    );
    return selected.map((o) => o.label).join(", ");
  }, [multiple, dataOptions, singleValue, multiValue]);

  const hasValue = multiple
    ? multiValue.length > 0
    : !!singleValue && singleValue !== "";

  const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    field.onChange(multiple ? [] : null);
    if (field.onBlur) field.onBlur();
    setOpen(false);
  };

  const handleSelectSingle = (valueStr: string) => {
    if (valueStr === singleValue) {
      field.onChange(null);
      if (field.onBlur) field.onBlur();
    } else {
      field.onChange(valueStr);
    }
    setOpen(false);
  };

  const handleSelectMultiple = (valueStr: string) => {
    const current = Array.isArray(field.value)
      ? field.value.map(String)
      : field.value
        ? [String(field.value)]
        : [];

    const exists = current.includes(valueStr);
    const next = exists
      ? current.filter((v: string) => v !== valueStr)
      : [...current, valueStr];

    field.onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-10 w-full justify-between bg-background!",
              className,
            )}
            disabled={disabled}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-clear-button]")) {
                e.preventDefault();
              }
            }}
          />
        }
      >
          <span className="truncate flex-1 text-start">
            {selectedLabel || (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <div className="flex items-center gap-1 ms-2 shrink-0">
            {clearable && hasValue && !disabled && (
              <div
                data-clear-button
                role="button"
                onClick={handleClear}
                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
                />
              </div>
            )}
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              strokeWidth={2}
              className="h-4 w-4 opacity-50"
            />
          </div>
      </PopoverTrigger>

      <PopoverContent className="p-0 overflow-hidden w-[--radix-popover-trigger-width] min-w-56">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} />

          {isPending && !!endpoint && (
            <div className="p-3 flex items-center justify-center">
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="h-5 w-5 animate-spin text-muted-foreground"
              />
            </div>
          )}

          {filteredOptions.length === 0 && !isPending ? (
            <CommandEmpty>
              <span className="text-muted-foreground text-sm">—</span>
            </CommandEmpty>
          ) : (
            <CommandList
              style={{
                maxHeight: 300,
                overflowY: "auto",
                padding: 0,
                margin: "4px",
              }}
            >
              <CommandGroup className="p-0">
                {filteredOptions.map((option) => {
                  const valueStr = String(option.value);
                  const isSelected = multiple
                    ? multiValue.map(String).includes(valueStr)
                    : valueStr === singleValue;

                  return (
                    <CommandItem
                      key={valueStr}
                      value={valueStr}
                      onSelect={() => {
                        if (option.disabled) return;
                        if (multiple) {
                          handleSelectMultiple(valueStr);
                        } else {
                          handleSelectSingle(valueStr);
                        }
                      }}
                      aria-disabled={option.disabled}
                      className={cn(
                        "cursor-pointer flex items-center gap-2 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=false]:bg-transparent hover:bg-accent hover:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-50",
                      )}
                    >
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { SelectField };
