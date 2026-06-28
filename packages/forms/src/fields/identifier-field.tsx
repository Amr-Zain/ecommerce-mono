"use client"

import * as React from "react"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@ecommerce/ui/components/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ecommerce/ui/components/select"
import { Input } from "@ecommerce/ui/components/input"
import { Label } from "@ecommerce/ui/components/label"
import { useFetch } from "@ecommerce/http"
import { isPhoneIdentifier } from "../field-types"
import type { PhoneCountryData } from "./phone-field"

export interface IdentifierFieldProps<T extends FieldValues> {
  form: UseFormReturn<T, unknown, T>
  name: FieldPath<T>
  phoneCodeName: FieldPath<T>
  label?: React.ReactNode
  phoneCodeLabel?: string
  required?: boolean
  disabled?: boolean
  detectedPhoneText?: React.ReactNode
  detectedEmailText?: React.ReactNode
  phoneCodeClassName?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  phoneCodeInputProps?: React.InputHTMLAttributes<HTMLInputElement>
  countriesEndpoint?: string
  countriesSelect?: (data: any) => PhoneCountryData[]
  countries?: PhoneCountryData[]
}

const defaultCountriesSelect = (res: any): PhoneCountryData[] => {
  const items = res?.data ?? res ?? []
  if (!Array.isArray(items)) return []
  return items.map((item: any) => ({
    id: item.id,
    name: item.short_name ?? item.name,
    flag: item.flag?.path ?? item.flag?.url ?? item.flag,
    phone_code: item.phone_code ?? item.phoneCode,
    phone_limit: item.phone_length ?? item.phone_limit ?? 15,
    phone_starting_number: item.phone_start_with ?? item.phone_starting_number,
  }))
}

const digitsOnly = (value: string) => value.replace(/\D/g, "")

function IdentifierField<T extends FieldValues>(props: IdentifierFieldProps<T>) {
  const {
    form, name, phoneCodeName, label, phoneCodeLabel,
    required, disabled, detectedPhoneText, detectedEmailText,
    phoneCodeClassName, inputProps,
    countriesEndpoint = "countries?paginate=0",
    countriesSelect = defaultCountriesSelect,
    countries: countriesProp,
  } = props

  const identifier = String(form.watch(name) ?? "")
  const phoneCode = String(form.watch(phoneCodeName) ?? "")
  const isPhone = isPhoneIdentifier(identifier)

  const { data: fetchedCountries } = useFetch<any, PhoneCountryData[]>({
    queryKey: ["identifier-countries", countriesEndpoint],
    endpoint: countriesEndpoint,
    select: countriesSelect,
    staleTime: 180_000,
    enabled: isPhone && !countriesProp,
  })

  const countries = countriesProp ?? fetchedCountries ?? []

  const selectedCountry = React.useMemo(
    () => countries.find((c) => String(c.phone_code) === phoneCode),
    [countries, phoneCode],
  )

  const phoneLimit = selectedCountry?.phone_limit ?? null
  const phoneStartWith = selectedCountry?.phone_starting_number ?? null

  const validatePhone = React.useCallback(
    (value: string) => {
      const digits = digitsOnly(value)
      if (phoneLimit && digits.length > phoneLimit) {
        return digits.slice(0, phoneLimit)
      }
      return digits
    },
    [phoneLimit],
  )

  const phoneValidate = React.useCallback(
    (value: string) => {
      if (!isPhone) return true
      if (!selectedCountry) return true
      const digits = digitsOnly(String(value))
      if (digits.length === 0) return true
      if (phoneStartWith != null && !digits.startsWith(String(phoneStartWith))) {
        return "Must start with " + phoneStartWith
      }
      if (phoneLimit && digits.length !== phoneLimit) {
        return phoneLimit + " digits required"
      }
      return true
    },
    [isPhone, selectedCountry, phoneLimit, phoneStartWith],
  )

  React.useEffect(() => {
    if (isPhone && identifier) {
      form.trigger(name)
    }
  }, [selectedCountry]) // eslint-disable-line react-hooks/exhaustive-deps

  const getFlagUrl = (flag: PhoneCountryData["flag"]): string | null => {
    if (!flag) return null
    if (typeof flag === "string") return flag
    return flag.url
  }

  const handleCodeChange = (value: string, onChange: (...event: any[]) => void) => {
    onChange(value)
    const country = countries.find((c) => String(c.phone_code) === value)
    if (country?.phone_starting_number != null) {
      form.setValue(name, String(country.phone_starting_number) as any, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } else {
      form.setValue(name, "" as any, { shouldValidate: true })
    }
  }

  return (
    <div className="grid gap-2">
      {label ? <Label>{label}</Label> : null}
      <div className={isPhone ? "flex gap-2" : undefined}>
        {isPhone ? (
          <FormField
            control={form.control}
            name={phoneCodeName}
            render={({ field: ctrl }) => (
              <FormItem className={phoneCodeClassName ?? "w-28"}>
                <FormControl>
                  <Select
                    onValueChange={(v) => { if (v) handleCodeChange(v, ctrl.onChange) }}
                    value={(ctrl.value as string) ?? ""}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder={phoneCodeLabel ?? "+"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={String(country.phone_code)}>
                          <div className="flex items-center gap-2">
                            {country.flag && (
                              <img
                                src={getFlagUrl(country.flag) ?? ""}
                                alt=""
                                width={20}
                                height={20}
                                className="size-5 object-cover rounded-sm"
                              />
                            )}
                            <span>+{country.phone_code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name={name}
          rules={{ validate: phoneValidate }}
          render={({ field: ctrl }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type={isPhone ? "tel" : "email"}
                  required={required}
                  disabled={disabled}
                  autoComplete={isPhone ? "tel-national" : "email"}
                  inputMode={isPhone ? "numeric" : "email"}
                  maxLength={isPhone && phoneLimit ? phoneLimit : undefined}
                  placeholder={
                    isPhone && phoneStartWith != null
                      ? String(phoneStartWith) + "X".repeat(Math.max(0, (phoneLimit ?? 9) - String(phoneStartWith).length))
                      : undefined
                  }
                  {...ctrl}
                  value={ctrl.value ?? ""}
                  onChange={(e) => {
                    if (isPhone) {
                      ctrl.onChange(validatePhone(e.target.value))
                    } else {
                      ctrl.onChange(e.target.value)
                    }
                  }}
                  {...inputProps}
                />
              </FormControl>
              <FormMessage />
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
  )
}

export { IdentifierField }
