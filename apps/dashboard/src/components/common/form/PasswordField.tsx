"use client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@ecommerce/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@ecommerce/ui/components/form";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

function PasswordField<T extends FieldValues>({
  isLoading,
  placeholder,
  ...rest
}: {
  isLoading?: boolean;
  placeholder: string;
  field?: ControllerRenderProps<T, Path<T>>
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="pe-10"
        disabled={isLoading}
        {...rest}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 end-0 h-full cursor-pointer px-3 py-1 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={isLoading}
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <EyeIcon className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
}

export default PasswordField;
