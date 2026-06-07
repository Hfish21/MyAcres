import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Paper Desktop badges (ADR-0007 §5.6): squared (4px), uppercase, sans. Soft
// pastel-tint variants are the default status style; solid for high emphasis.
// Status is always carried by the LABEL, never colour alone.
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-line bg-inset text-ink-2",
        // soft tints
        growing: "border-olive/30 bg-olive/12 text-olive-ink",
        ready: "border-amber/30 bg-amber/15 text-amber-ink",
        today: "border-inkblue/30 bg-inkblue/12 text-inkblue",
        warning: "border-ochre/40 bg-ochre/20 text-ochre-ink",
        // solid / outline
        overdue: "border-transparent bg-barn text-canvas",
        done: "border-line bg-transparent text-ink-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
