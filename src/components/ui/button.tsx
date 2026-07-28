import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-none text-sm font-normal transition-[background-color,color,box-shadow,transform,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-4 disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-faint disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-x-0 active:translate-y-0 active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground hover:bg-primary-dark hover:shadow-[4px_4px_0_hsl(var(--rule))] hover:-translate-x-0.5 hover:-translate-y-0.5",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground hover:shadow-[4px_4px_0_hsl(var(--rule))] hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:border-foreground/80",
        ghost: "text-foreground hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-4 py-3",
        sm: "h-11 px-3",
        lg: "h-14 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
