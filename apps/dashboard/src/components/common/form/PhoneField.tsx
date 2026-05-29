'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  useFormContext,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@ecommerce/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ecommerce/ui/components/select'
import { Input } from '@ecommerce/ui/components/input'
import { useTranslation } from 'react-i18next'

import { CountryDetails } from '@/types/api/country'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { Image } from '@/types/api/general'

interface CountryCodeData {
  id: number
  name: string
  phone_code: string
  flag: Image
  phone_limit: number
  phone_starting_number: number
}

export interface PhoneNumberProps<T extends FieldValues> {
  control: Control<T>
  phoneCodeName: FieldPath<T>
  phoneNumberName: FieldPath<T>
  countries?: CountryCodeData[]
  currentPhoneLimit?: number | null
  isLoading?: boolean
  disabled?: boolean
  disableCode?: boolean
  countryId?: string | number
  codeClass?: string
  phoneClass?: string
  setCurrentPhoneLimit?: (value: number | null) => void
  setPhoneStartingNumber?: (value: number | null) => void
}

function PhoneField<T extends FieldValues>({
  control,
  phoneCodeName,
  phoneNumberName,
  currentPhoneLimit,
  isLoading = false,
  codeClass = '',
  phoneClass = '',
  disabled = false,
  disableCode = false,
  countryId,
  countries: countriesProp,
  setCurrentPhoneLimit,
  setPhoneStartingNumber
}: PhoneNumberProps<T>) {
  const { t } = useTranslation()
  const { setValue, trigger, formState, clearErrors, getValues } = useFormContext<T>()


  // Fetch countries (optional; we'll fallback to the prop if fetch isn't ready)
  const { data: fetchedCountries } = useFetch<
    ApiResponseBase<CountryDetails[]>,
    CountryCodeData[]
  >({
    queryKey: ['countries?paginate=0'],
    endpoint: 'countries?paginate=0',
    select: (res) =>
      res.data.map(
        (item) =>
          ({
            id: item.id,
            name: item.short_name,
            flag: item?.flag?.path,
            phone_code: item.phone_code,
            phone_limit: item.phone_length,
            phone_starting_number: item.phone_start_with,
          }) as any,
      ),
    staleTime: 180_000,
  })

  // Prefer fetched data, fallback to provided prop, else empty
  const countries: CountryCodeData[] = useMemo(
    () => fetchedCountries ?? countriesProp ?? [],
    [fetchedCountries, countriesProp],
  )

  // Watch the selected phone code
  const phoneCodeWatcher = useWatch({
    control,
    name: phoneCodeName,
  })

  useEffect(() => {
    if (countryId && countries.length) {
      const selected = countries.find(
        (c) => String(c.id) === String(countryId),
      )
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
        setPhoneStartingNumber?.(selected.phone_starting_number)

        const currentPhone = (getValues(phoneNumberName) as string) || ''
        const nextPhone =
          selected.phone_starting_number != null
            ? selected.phone_starting_number.toString()
            : ''

        // On the first match of a country (mount or data load),
        // we only reset if the field is empty to preserve initial values in updates.
        if (!isInitialPhoneCheckDone.current) {
          isInitialPhoneCheckDone.current = true
          if (currentPhone && currentPhone !== '') {
            return
          }
        }

        // Apply starting number if it's missing (creation or user-initiated change)
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

    // no phone code selected
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
              disabled={isLoading || disabled || disableCode}
            >
              <FormControl>
                <SelectTrigger
                  className={`text-text p-1 sm:p-4 ${codeClass}`}
                  dir={t('lang')}
                >
                  <SelectValue placeholder={t('Form.labels.phoneCode')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent dir={t('lang')} className="max-h-80">
                {countries.map((country) => (
                  <SelectItem key={country.id} value={`${country.phone_code}`}>
                    <div className="flex items-center gap-2">
                      {country.flag && (
                        <span role="img" aria-label="flag">
                          <img
                            src={typeof country.flag === 'string' ? country.flag : country.flag.url}
                            alt={`${country.name} flag`}
                            width={20}
                            height={20}
                            className="size-5 object-cover"
                          />
                        </span>
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
                dir={t('lang')}
                type="number"
                {...field}
                className={phoneClass}
                onChange={(e) => field.onChange(e)}
                value={(field.value as string) || ''}
                disabled={isLoading || disabled}
                placeholder={
                  currentPhoneLimit
                    ? t('Form.labels.phoneNumberWithLimit', {
                        limit: currentPhoneLimit,
                      })
                    : t('Form.placeholders.phoneNumber')
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

export default PhoneField
