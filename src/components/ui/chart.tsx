"use client"

import * as React from "react"

// NOTE: The 'recharts' dependency was removed due to a build conflict.
// These components are stubbed out to prevent errors.

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

export const ChartContainer = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
  config: ChartConfig
}) => <div className={className}>{children}</div>
export const ChartTooltipContent = (props: any) => null
