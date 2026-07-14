'use client'

import { forwardRef, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'
import { useForwardedRef } from '@/hooks/use-forwarded-ref'
import { Button } from '@ecommerce/ui/components/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@ecommerce/ui/components/popover'
import { Input } from '@ecommerce/ui/components/input'
import { dashboardFormControlClassName } from './controlStyles'

type ButtonProps = React.ComponentProps<typeof Button>

interface ColorPickerProps {
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
}

const ColorPicker = forwardRef<
    HTMLInputElement,
    Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> &
    ColorPickerProps &
    ButtonProps
>(
    (
        { disabled, value, onChange, onBlur, name, className, size, ...props },
        forwardedRef,
    ) => {
        const ref = useForwardedRef(forwardedRef)
        const [open, setOpen] = useState(false)

        const parsedValue = useMemo(() => {
            return value || '#FFFFFF'
        }, [value])

        return (
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger
                    disabled={disabled}
                    onBlur={onBlur}
                    render={
                    <Button
                        {...props}
                        type="button"
                        className={cn(
                            dashboardFormControlClassName,
                            'justify-start gap-3 font-normal',
                            className,
                        )}
                        disabled={disabled}
                        name={name}
                        size={size}
                        variant="outline"
                    />
                    }
                >
                    <span
                        aria-hidden="true"
                        className="size-5 shrink-0 rounded-md border border-border shadow-xs"
                        style={{ backgroundColor: parsedValue }}
                    />
                    <span className="truncate font-mono text-sm uppercase">
                        {parsedValue}
                    </span>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                    <HexColorPicker
                        className="w-full!"
                        color={parsedValue}
                        onChange={onChange}
                    />
                    <Input
                        maxLength={7}
                        onChange={(e) => {
                            onChange(e?.currentTarget?.value)
                        }}
                        ref={ref}
                        value={parsedValue}
                        className={cn(
                            dashboardFormControlClassName,
                            'mt-2 font-mono uppercase',
                        )}
                    />
                </PopoverContent>
            </Popover>
        )
    },
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
