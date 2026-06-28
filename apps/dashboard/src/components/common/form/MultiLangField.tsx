'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFormState, useWatch } from 'react-hook-form'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import EditorField from './Editor/EditorField'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
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

  // Stable map for Editor focus APIs
  const editorFocusApis = useRef<Record<string, { focus: () => void }>>({})

  // Refs for Input / Textarea fields (passed through FormControl → Slot)
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([])

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

  const focusField = (langIndex: number) => {
    const fieldName = fieldNames[langIndex] as string
    // Editor case — use the stored focus API (handles visibility polling + cursor position)
    const editorApi = editorFocusApis.current[fieldName]
    if (editorApi) {
      editorApi.focus()
      return
    }

    // Input / Textarea — direct ref passed through FormControl → Slot
    inputRefs.current[langIndex]?.focus()
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
    }
  }, [submitCount, fieldNames.join('|')])

  // Focus the active field when the tab changes.
  // useLayoutEffect  fires synchronously after DOM commit, before paint.
  // requestAnimationFrame defers the actual focus call so EditorField's
  // useEffect (which populates editorFocusApis) has finished first.
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => focusField(currentLang))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang])

  const onTabClick = (idx: number) => {
    setCurrentLang(idx)
  }

  const renderField = (langKey: string, langIndex: number) => {
    const fieldName = `${name}_${langKey}` as FieldPath<T>
    const fieldId = `mlf_${fieldName as string}`
    const isActive = currentLang === langIndex

    return (
      <FormField
        key={langKey}
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className={isActive ? '' : 'hidden'}>
            {type === 'editor' ? (
              <FormControl>
                <div className="contents">
                  <EditorField
                    field={field}
                    id={fieldId}
                    ariaInvalid={fieldHasError(fieldName as string)}
                    placeholder={'...'}
                    disabled={disabled}
                    focusApiRef={(api) => {
                      if (api) {
                        editorFocusApis.current[fieldName as string] = api
                      } else {
                        delete editorFocusApis.current[fieldName as string]
                      }
                    }}
                  />
                </div>
              </FormControl>
            ) : type === 'textarea' ? (
              <FormControl
                ref={(el) => {
                  inputRefs.current[langIndex] =
                    el as HTMLTextAreaElement | null
                }}
              >
                <Textarea
                  id={fieldId}
                  {...field}
                  placeholder={
                    placeholder ||
                    `${label ?? name} (${languages[langIndex].label})`
                  }
                  disabled={disabled}
                  value={field.value ?? ''}
                  aria-invalid={fieldHasError(fieldName) || undefined}
                />
              </FormControl>
            ) : (
              <FormControl
                ref={(el) => {
                  inputRefs.current[langIndex] =
                    el as HTMLInputElement | null
                }}
              >
                <Input
                  id={fieldId}
                  {...field}
                  placeholder={
                    placeholder ||
                    `${label ?? name} (${languages[langIndex].label})`
                  }
                  disabled={disabled}
                  value={field.value ?? ''}
                  aria-invalid={fieldHasError(fieldName) || undefined}
                />
              </FormControl>
            )}
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
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="h-3 w-3 text-green-600"
                />
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
