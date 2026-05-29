"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ecommerce/ui/components/input-otp";
import React from "react";

export interface OTPFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  className?: string;
  disabled?: boolean;
  type?: "numeric" | "alphanumeric";
}

function OTPField({
  onChange,
  value = "",
  length = 4,
  className,
  disabled = false,
  type = "numeric",
  ...rest
}: OTPFieldProps) {
  const handleOTPChange = (newValue: string) => {
    // Validate input based on type
    if (type === "numeric" && !/^\d*$/.test(newValue)) {
      return;
    }
    
    onChange?.(newValue);
  };

  const renderOTPSlots = () =>
    [...Array(length)].map((_, index) => (
      <InputOTPGroup key={index} className="justify-center">
        <InputOTPSlot
          index={index}
          className="!text-primary size-12 rounded-md text-center !text-2xl font-bold md:size-16"
        />
      </InputOTPGroup>
    ));

  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={handleOTPChange}
      disabled={disabled}
      className={`flex justify-center gap-5 ${className || ""}`}
      {...rest}
    >
      {renderOTPSlots()}
    </InputOTP>
  );
}

export default OTPField;