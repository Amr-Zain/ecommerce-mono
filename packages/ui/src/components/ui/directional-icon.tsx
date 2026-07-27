import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "../../lib/utils";

type DirectionalIconProps = React.ComponentProps<typeof HugeiconsIcon> & {
  mirrorInRtl?: boolean;
};

function DirectionalIcon({
  mirrorInRtl = true,
  className,
  ...props
}: DirectionalIconProps) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      focusable="false"
      className={cn(mirrorInRtl && "rtl:rotate-180", className)}
      {...props}
    />
  );
}

export { DirectionalIcon };
