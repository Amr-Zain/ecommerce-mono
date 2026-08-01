"use client";

import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@ecommerce/ui/components/form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@ecommerce/ui/components/combobox";
import { Button } from "@ecommerce/ui/components/button";
import { ScrollArea } from "@ecommerce/ui/components/scroll-area";
import { cn } from "@ecommerce/ui/lib/utils";
import { Input } from "@ecommerce/ui/components/input";
import { Label } from "@ecommerce/ui/components/label";
import { useFetch } from "@ecommerce/http";
import { isPhoneIdentifier } from "../field-types";
import type { PhoneCountryData } from "./phone-field";

export interface IdentifierFieldProps<T extends FieldValues> {
  form: UseFormReturn<T, unknown, T>;
  name: FieldPath<T>;
  phoneCodeName: FieldPath<T>;
  label?: React.ReactNode;
  phoneCodeLabel?: string;
  countrySearchPlaceholder?: string;
  noCountryText?: string;
  phoneMustStartWithText?: string;
  required?: boolean;
  disabled?: boolean;
  detectedPhoneText?: React.ReactNode;
  detectedEmailText?: React.ReactNode;
  phoneCodeClassName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  phoneCodeInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  countriesEndpoint?: string;
  countriesSelect?: (data: any) => PhoneCountryData[];
  countries?: PhoneCountryData[];
}

const defaultCountriesSelect = (res: any): PhoneCountryData[] => {
  const items =
    res?.data?.countries ??
    res?.data?.data ??
    res?.countries ??
    res?.data ??
    res ??
    [];
  if (!Array.isArray(items)) return [];
  return items.map((item: any) => ({
    id: item.id,
    name: item.short_name ?? item.en?.name ?? item.ar?.name ?? item.name,
    flag: item.flag?.path ?? item.flag?.url ?? item.flag ?? item.country_flag,
    phone_code: item.phone_code ?? item.phoneCode,
    phone_limit: item.phone_length ?? item.phone_limit ?? 15,
    phone_starting_number: item.phone_start_with ?? item.phone_starting_number,
  }));
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

function IdentifierField<T extends FieldValues>(
  props: IdentifierFieldProps<T>,
) {
  const {
    form,
    name,
    phoneCodeName,
    label,
    phoneCodeLabel,
    countrySearchPlaceholder = "Search country...",
    noCountryText = "No country found.",
    phoneMustStartWithText = "Must start with",
    required,
    disabled,
    detectedPhoneText,
    detectedEmailText,
    phoneCodeClassName,
    inputProps,
    countriesEndpoint = "countries?paginate=0",
    countriesSelect = defaultCountriesSelect,
    countries: countriesProp,
  } = props;

  const identifier = String(form.watch(name) ?? "");
  const phoneCode = String(form.watch(phoneCodeName) ?? "");
  const isPhone = isPhoneIdentifier(identifier);
  const hasPhoneError = Boolean(
    form.formState.errors[name] || form.formState.errors[phoneCodeName],
  );
  const [search, setSearch] = React.useState("");

  const { data: fetchedCountries } = useFetch<any, PhoneCountryData[]>({
    queryKey: ["identifier-countries", countriesEndpoint],
    endpoint: countriesEndpoint,
    select: countriesSelect,
    staleTime: 180_000,
    enabled: isPhone && !countriesProp,
  });

  const countries = countriesProp ?? fetchedCountries ?? [];
  const filteredCountries = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? countries.filter(
          (country) =>
            country.name.toLocaleLowerCase().includes(query) ||
            String(country.phone_code).includes(query),
        )
      : countries;
  }, [countries, search]);

  const selectedCountry = React.useMemo(
    () => countries.find((c) => String(c.phone_code) === phoneCode),
    [countries, phoneCode],
  );

  const phoneLimit = selectedCountry?.phone_limit ?? null;
  const phoneStartWith = selectedCountry?.phone_starting_number ?? null;

  const validatePhone = React.useCallback(
    (value: string) => {
      const digits = digitsOnly(value);
      if (phoneLimit && digits.length > phoneLimit) {
        return digits.slice(0, phoneLimit);
      }
      return digits;
    },
    [phoneLimit],
  );

  const phoneValidate = React.useCallback(
    (value: string) => {
      if (!isPhone) return true;
      if (!selectedCountry) return true;
      const digits = digitsOnly(String(value));
      if (digits.length === 0) return true;
      if (
        phoneStartWith != null &&
        !digits.startsWith(String(phoneStartWith))
      ) {
        return `${phoneMustStartWithText} ${phoneStartWith}`;
      }
      if (phoneLimit && digits.length !== phoneLimit) {
        return phoneLimit + " digits required";
      }
      return true;
    },
    [
      isPhone,
      selectedCountry,
      phoneLimit,
      phoneStartWith,
      phoneMustStartWithText,
    ],
  );

  React.useEffect(() => {
    if (isPhone && identifier) {
      form.trigger(name);
    }
  }, [selectedCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  const getFlagUrl = (flag: PhoneCountryData["flag"]): string | null => {
    if (!flag) return null;
    if (typeof flag === "string") return flag;
    return flag.url;
  };

  const handleCodeChange = (
    value: string,
    onChange: (...event: any[]) => void,
  ) => {
    onChange(value);
    const country = countries.find((c) => String(c.phone_code) === value);
    if (country?.phone_starting_number != null) {
      form.setValue(name, String(country.phone_starting_number) as any, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      form.setValue(name, "" as any, { shouldValidate: true });
    }
  };

  return (
    <div className="grid gap-2">
      {label ? <Label>{label}</Label> : null}
      <div
        className={
          isPhone
            ? cn(
                "relative flex h-10 overflow-visible rounded-md border bg-background shadow-xs transition-colors focus-within:border-ring",
                hasPhoneError && "mb-5",
                hasPhoneError &&
                  "border-destructive focus-within:border-destructive",
              )
            : undefined
        }
        dir={isPhone ? "ltr" : undefined}
      >
        {isPhone ? (
          <FormField
            control={form.control}
            name={phoneCodeName}
            render={({ field: ctrl }) => (
              <FormItem className="relative shrink-0">
                <FormControl>
                  <Combobox
                    value={(ctrl.value as string) ?? ""}
                    onValueChange={(value) => {
                      if (value) {
                        handleCodeChange(value, ctrl.onChange);
                        setSearch("");
                      }
                    }}
                    items={filteredCountries.map((country) => ({
                      value: String(country.phone_code),
                      label: `${country.name} +${country.phone_code}`,
                    }))}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      disabled={disabled}
                      render={<ComboboxTrigger />}
                      className={cn(
                        "h-full min-w-24 gap-2 rounded-none border-0 border-e bg-transparent px-3 shadow-none hover:bg-muted/40 focus-visible:ring-0",
                        phoneCodeClassName,
                      )}
                    >
                      {selectedCountry?.flag ? (
                        <img
                          src={getFlagUrl(selectedCountry.flag) ?? ""}
                          alt=""
                          className="size-4 rounded-sm object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">◉</span>
                      )}
                      <span className="text-sm tabular-nums">
                        {selectedCountry
                          ? `+${selectedCountry.phone_code}`
                          : (phoneCodeLabel ?? "+")}
                      </span>
                    </Button>
                    <ComboboxContent
                      align="start"
                      dir="auto"
                      className="w-72 p-0"
                    >
                      <ComboboxInput
                        placeholder={countrySearchPlaceholder}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        showTrigger={false}
                        className="rounded-none border-0 border-b px-3 py-2.5 shadow-none"
                      />
                      <ComboboxSeparator />
                      <ComboboxEmpty className="px-4 py-3 text-sm">
                        {noCountryText}
                      </ComboboxEmpty>
                      <ComboboxList>
                        <ScrollArea className="max-h-64">
                          {filteredCountries.map((country) => (
                            <ComboboxItem
                              key={country.id}
                              value={String(country.phone_code)}
                              className="flex items-center gap-2.5 px-3 py-2"
                            >
                              <span className="flex size-4 shrink-0 overflow-hidden rounded-sm">
                                {country.flag ? (
                                  <img
                                    src={getFlagUrl(country.flag) ?? ""}
                                    alt=""
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  "◉"
                                )}
                              </span>
                              <span className="flex-1 text-sm">
                                {country.name}
                              </span>
                              <span className="text-sm tabular-nums text-muted-foreground">
                                +{country.phone_code}
                              </span>
                            </ComboboxItem>
                          ))}
                        </ScrollArea>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </FormControl>
                <FormMessage className="absolute top-full start-0 mt-1 whitespace-nowrap" />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name={name}
          rules={{ validate: phoneValidate }}
          render={({ field: ctrl }) => (
            <FormItem className="relative flex-1">
              <FormControl>
                <Input
                  type={isPhone ? "tel" : "email"}
                  required={required}
                  disabled={disabled}
                  autoComplete={isPhone ? "tel-national" : "email"}
                  inputMode={isPhone ? "numeric" : "email"}
                  dir={isPhone ? "ltr" : undefined}
                  maxLength={isPhone && phoneLimit ? phoneLimit : undefined}
                  placeholder={
                    isPhone && phoneStartWith != null
                      ? String(phoneStartWith) +
                        "X".repeat(
                          Math.max(
                            0,
                            (phoneLimit ?? 9) - String(phoneStartWith).length,
                          ),
                        )
                      : undefined
                  }
                  {...ctrl}
                  value={ctrl.value ?? ""}
                  onChange={(e) => {
                    if (isPhone) {
                      ctrl.onChange(validatePhone(e.target.value));
                    } else {
                      ctrl.onChange(e.target.value);
                    }
                  }}
                  {...inputProps}
                  className={cn(
                    isPhone &&
                      "h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0",
                    inputProps?.className,
                  )}
                />
              </FormControl>
              <FormMessage className="absolute top-full start-0 mt-1 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </div>
      {isPhone && detectedPhoneText ? (
        <p className="text-xs text-muted-foreground">{detectedPhoneText}</p>
      ) : !isPhone && detectedEmailText ? (
        <p className="text-xs text-muted-foreground">{detectedEmailText}</p>
      ) : null}
    </div>
  );
}

export { IdentifierField };
