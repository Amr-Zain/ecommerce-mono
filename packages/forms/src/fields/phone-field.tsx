"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  useFormContext,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

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
import { useFetch } from "@ecommerce/http"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhoneCountryData {
  id: number
  name: string
  phone_code: string
  flag?: string | { url: string } | null
  phone_limit: number
  phone_starting_number?: number
}

export interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>
  phoneCodeName: FieldPath<T>
  phoneNumberName: FieldPath<T>
  /** Pre-loaded countries (skips fetching if provided) */
  countries?: PhoneCountryData[]
  /** Endpoint to fetch countries from. Uses the HttpAdapter, so it routes correctly per platform. */
  countriesEndpoint?: string
  /** Transform the API response into PhoneCountryData[]. Default expects { data: [...] } */
  countriesSelect?: (data: any) => PhoneCountryData[]
  currentPhoneLimit?: number | null
  disabled?: boolean
  disableCode?: boolean
  countryId?: string | number
  codeClass?: string
  phoneClass?: string
  phonePlaceholder?: string
  codePlaceholder?: string
  setCurrentPhoneLimit?: (value: number | null) => void
  setPhoneStartingNumber?: (value: number | null) => void
}

// ---------------------------------------------------------------------------
// Default transform for country API response
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PhoneField<T extends FieldValues>({
  control,
  phoneCodeName,
  phoneNumberName,
  currentPhoneLimit,
  disabled = false,
  codeClass = "",
  phoneClass = "",
  disableCode = false,
  countryId,
  countries: countriesProp,
  countriesEndpoint = "countries?paginate=0",
  countriesSelect = defaultCountriesSelect,
  phonePlaceholder,
  codePlaceholder = "+",
  setCurrentPhoneLimit,
  setPhoneStartingNumber,
}: PhoneFieldProps<T>) {
  const { setValue, clearErrors, getValues } = useFormContext<T>()

  // Fetch countries if not provided
  const { data: fetchedCountries } = useFetch<any, PhoneCountryData[]>({
    queryKey: ["phone-countries", countriesEndpoint],
    endpoint: countriesEndpoint,
    select: countriesSelect,
    staleTime: 180_000,
    enabled: !countriesProp,
  })

  const countries: PhoneCountryData[] = useMemo(
    () => countriesProp ?? fetchedCountries ?? [],
    [countriesProp, fetchedCountries],
  )

  // Watch the selected phone code
  const phoneCodeWatcher = useWatch({ control, name: phoneCodeName })

  useEffect(() => {
    if (countryId && countries.length) {
      const selected = countries.find((c) => String(c.id) === String(countryId))
      if (selected) {
        setValue(phoneCodeName, String(selected.phone_code) as any)
      }
    }
  }, [countryId, countries, phoneCodeName, setValue])

  const isInitialPhoneCheckDone = useRef(false)

  useEffect(() => {
    if (!countries.length) return

    if (phoneCodeWatcher) {
      const selected = countries.find(
        (c) => String(c.phone_code) === String(phoneCodeWatcher),
      )

      if (selected) {
        setCurrentPhoneLimit?.(selected.phone_limit)
        setPhoneStartingNumber?.(selected.phone_starting_number ?? null)

        const currentPhone = (getValues(phoneNumberName) as string) || ""
        const nextPhone =
          selected.phone_starting_number != null
            ? selected.phone_starting_number.toString()
            : ""

        if (!isInitialPhoneCheckDone.current) {
          isInitialPhoneCheckDone.current = true
          if (currentPhone && currentPhone !== "") return
        }

        if (nextPhone && !currentPhone.startsWith(nextPhone)) {
          if (currentPhone !== nextPhone) {
            setValue(phoneNumberName, nextPhone as any, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
            clearErrors(phoneNumberName)
          }
        }
        return
      }
    }

    setCurrentPhoneLimit?.(null)
    isInitialPhoneCheckDone.current = true
  }, [
    phoneCodeWatcher,
    countries,
    setCurrentPhoneLimit,
    setPhoneStartingNumber,
    setValue,
    phoneNumberName,
    clearErrors,
    getValues,
  ])

  const getFlagUrl = (flag: PhoneCountryData["flag"]): string | null => {
    if (!flag) return null
    if (typeof flag === "string") return flag
    return flag.url
  }

  return (
    <div className="flex gap-2" dir="ltr">
      <FormField<T>
        control={control}
        name={phoneCodeName}
        render={({ field }) => (
          <FormItem className="w-32">
            <Select
              onValueChange={field.onChange}
              value={field.value as unknown as string}
              disabled={disabled || disableCode}
            >
              <FormControl>
                <SelectTrigger className={`p-1 sm:p-4 ${codeClass} bg-background! h-10!`}>
                  <SelectValue placeholder={codePlaceholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-80">
                {countries.map((country) => (
                  <SelectItem key={country.id} value={`${country.phone_code}`}>
                    <div className="flex items-center gap-2">
                      {country.flag && (
                        <img
                          src={getFlagUrl(country.flag) ?? ""}
                          alt=""
                          width={20}
                          height={20}
                          className="size-5 object-cover"
                        />
                      )}
                      <span className="ms-2">{`+${country.phone_code}`}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField<T>
        control={control}
        name={phoneNumberName}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                dir="ltr"
                type="number"
                {...field}
                className={phoneClass}
                onChange={(e) => field.onChange(e)}
                value={(field.value as string) || ""}
                disabled={disabled}
                placeholder={
                  phonePlaceholder ??
                  (currentPhoneLimit ? `${currentPhoneLimit} digits` : "Phone number")
                }
                inputMode="tel"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export { PhoneField }
