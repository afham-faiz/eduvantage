import type { CSSProperties, PropsWithChildren } from "react";
import { spacing } from "@eduvantage/design-tokens";

type SpacingKey = keyof typeof spacing;

export type StackProps = PropsWithChildren<{
  direction?: "row" | "column";
  gap?: SpacingKey;
  className?: string;
  style?: CSSProperties;
}>;

/**
 * Purely structural flex layout primitive — no colour, typography, or
 * brand styling. Exists to prove `@eduvantage/ui-web` imports work across
 * apps, not to define the design system.
 */
export function Stack({ direction = "column", gap = 4, className, style, children }: StackProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction,
        gap: spacing[gap],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
