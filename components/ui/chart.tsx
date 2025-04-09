"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

type ChartConfig = {
  [key: string]: {
    label: string
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextProps | undefined>(undefined)

export function ChartContainer({
  config,
  children,
  className,
}: {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}) {
  // Set CSS variables for chart colors
  React.useEffect(() => {
    const root = document.documentElement
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        root.style.setProperty(`--color-${key}`, value.color)
      }
    })

    return () => {
      Object.keys(config).forEach((key) => {
        root.style.removeProperty(`--color-${key}`)
      })
    }
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className}>{children}</div>
    </ChartContext.Provider>
  )
}

export function useChartConfig() {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer")
  }
  return context
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

export function ChartTooltipContent({ active, payload, label }: any) {
  const { config } = useChartConfig()

  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">{label}</div>
        <div className="text-right font-medium"></div>
        {payload.map((item: any, index: number) => {
          const dataKey = item.dataKey
          const configItem = config[dataKey]
          return (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{configItem?.label || dataKey}</span>
              </div>
              <div className="text-right text-sm font-medium">{item.value}</div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export const ChartTooltip = ({ content, ...props }: any) => {
  return <div {...props}>{content}</div>
}

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChartConfig()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = config[key as keyof typeof config]

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { ChartLegend, ChartLegendContent, ChartStyle }

