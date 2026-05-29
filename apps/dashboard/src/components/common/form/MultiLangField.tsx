'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormState, useWatch } from 'react-hook-form'
import { Check } from 'lucide-react'
import EditorField from './Editor/EditorField'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '@ecommerce/ui/components/input'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { Button } from '@ecommerce/ui/components/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ecommerce/ui/components/form'

export interface MultiLangFieldProps<T extends FieldValues> {
  control: Control<T>
  name: string // Base name (e.g., "title")
  type?: 'input' | 'editor' | 'textarea'
  label?: string
  placeholder?: string
  languages?: Array<{ key: string; label: string }>
  defaultLanguage?: string
  disabled?: boolean
  className?: string
}

const defaultLanguages = [
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'العربية' },
]

function MultiLangField<T extends FieldValues>({
  control,
  name,
  type = 'input',
  label,
  placeholder,
  languages = defaultLanguages,
  defaultLanguage,
  disabled = false,
  className = '',
}: MultiLangFieldProps<T>) {
  const [currentLang, setCurrentLang] = useState<number>(0)

  // Watch all language fields to show completion status
  const watchedFields = languages.map((lang) =>
    useWatch({
      control,
      name: `${name}_${lang.key}` as FieldPath<T>,
    }),
  )

  // Access form errors / submit count
  const { errors, submitCount } = useFormState({ control })

  // Keep stable list of field names
  const fieldNames = useMemo(
    () => languages.map((l) => `${name}_${l.key}` as FieldPath<T>),
    [languages, name],
  )

  // Refs for focusing each field (Input or Editor)
  const focusRefs = useRef<Record<string, HTMLElement | null>>({})

  // Default language selection
  useEffect(() => {
    if (defaultLanguage) {
      const langIndex = languages.findIndex(
        (lang) => lang.key === defaultLanguage,
      )
      if (langIndex !== -1) setCurrentLang(langIndex)
    }
  }, [defaultLanguage, languages])

  const fieldHasError = (fieldName: string) => {
    const err = (errors as any)?.[fieldName]
    return Boolean(err)
  }

  const getFieldStatus = (index: number) => {
    const val = watchedFields[index]
    return val && String(val).trim().length > 0
  }

  const focusField = (fieldName: string) => {
    const el = focusRefs.current[fieldName]
    // Try focusing the actual control
    if (el && typeof el.focus === 'function') {
      el.focus()
      return
    }
  }

  // When submitCount changes (a submit happened), if there are errors,
  // jump to the first invalid language tab and focus its field.
  useEffect(() => {
    if (!submitCount) return
    const firstInvalidIdx = fieldNames.findIndex((fn) =>
      fieldHasError(fn as string),
    )
    if (firstInvalidIdx !== -1) {
      setCurrentLang(firstInvalidIdx)
      // Slight delay to ensure the tab content is mounted/visible
      setTimeout(() => focusField(fieldNames[firstInvalidIdx] as string), 0)
    }
  }, [submitCount, fieldNames.join('|')])

  const onTabClick = (idx: number) => {
    setCurrentLang(idx)
    // Focus the field in that tab
    const fieldName = fieldNames[idx] as string
    setTimeout(() => focusField(fieldName), 0)
  }

  const renderField = (langKey: string, langIndex: number) => {
    const fieldName = `${name}_${langKey}` as FieldPath<T>
    const isActive = currentLang === langIndex

    return (
      <FormField
        key={langKey}
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className={isActive ? '' : 'hidden'}>
            <FormControl>
              {type === 'editor' ? (
                // If EditorField forwards ref, this will focus correctly.
                // Otherwise we provide a hidden focus anchor as a fallback.
                <div className="contents">
                  <span
                    id={`mlf_${fieldName as string}_anchor`}
                    tabIndex={-1}
                    ref={(el) => {
                      // Fallback anchor to move screen reader / keyboard focus
                      focusRefs.current[fieldName as string] = el
                    }}
                  />
                  <EditorField
                    field={field}
                    id={`mlf_${fieldName as string}`}
                    ariaInvalid={fieldHasError(fieldName as string)}
                    placeholder={'...'}
                    disabled={disabled}
                    focusApiRef={(api) => {
                      //@ts-ignore
                      focusRefs.current[fieldName] = api
                    }}
                   
                  />
                </div>
              ) : type === 'textarea' ? (
                <Textarea
                  id={`mlf_${fieldName as string}`}
                  {...field}
                  placeholder={
                    placeholder ||
                    `${label ?? name} (${languages[langIndex].label})`
                  }
                  disabled={disabled}
                  value={field.value ?? ''}
                  aria-invalid={fieldHasError(fieldName) || undefined}
                  ref={(el) => {
                    focusRefs.current[fieldName] = el
                  }}
                />
              ) : (
                <Input
                  id={`mlf_${fieldName as string}`}
                  {...field}
                  placeholder={
                    placeholder ||
                    `${label ?? name} (${languages[langIndex].label})`
                  }
                  disabled={disabled}
                  value={field.value ?? ''}
                  aria-invalid={fieldHasError(fieldName) || undefined}
                  ref={(el) => {
                    focusRefs.current[fieldName] = el
                  }}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className={`multi-lang-field-wrapper ${className}`}>
      {label && <FormLabel className="text-sm font-medium">{label}</FormLabel>}

      <div className="flex flex-wrap gap-2 mb-2 p-0 rounded-lg">
        {languages.map((lang, idx) => {
          const fieldName = `${name}_${lang.key}`
          const isActive = currentLang === idx
          const hasError = fieldHasError(fieldName)
          const completed = getFieldStatus(idx)

          // Variant priority: active => default, else if error => destructive, else outline
          const variant = isActive
            ? 'default'
            : hasError
              ? 'destructive'
              : 'outline'

          return (
            <Button
              key={`lang_btn_${lang.key}`}
              type="button"
              variant={variant}
              size="sm"
              onClick={() => onTabClick(idx)}
              disabled={disabled}
              aria-controls={`mlf_${fieldName}`}
              aria-selected={isActive}
              aria-invalid={hasError || undefined}
              className={`flex items-center gap-2 h-6 text-sm rounded-0`}
            >
              {completed && !hasError && (
                <Check className="w-3 h-3 text-green-600" />
              )}
              <span>{lang.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="relative">
        {languages.map((lang, idx) => renderField(lang.key, idx))}
      </div>
    </div>
  )
}

export default MultiLangField
