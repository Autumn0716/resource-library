import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react"

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
  ...props
}: AnimatedShinyTextProps) {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={`animated-shiny-text ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  )
}
