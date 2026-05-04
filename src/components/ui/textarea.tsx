import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] outline-none",
      "scrollbar-hide",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
