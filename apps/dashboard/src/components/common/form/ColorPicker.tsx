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
                <PopoverTrigger disabled={disabled} onBlur={onBlur}>
                    <Button
                        {...props}
                        className={cn('block', className)}
                        name={name}
                        onClick={() => {
                            setOpen(true)
                        }}
                        size={size}
                        style={{
                            backgroundColor: parsedValue,
                        }}
                        variant="outline"
                    >
                        <div className="w-full h-full" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                    <HexColorPicker color={parsedValue} onChange={onChange} />
                    <Input
                        maxLength={7}
                        onChange={(e) => {
                            onChange(e?.currentTarget?.value)
                        }}
                        ref={ref}
                        value={parsedValue}
                        className="mt-2"
                    />
                </PopoverContent>
            </Popover>
        )
    },
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
