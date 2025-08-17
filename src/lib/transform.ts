import type { PopulationResponse } from "../types/api"

export type YearValue = { year: number; value: number }

export function toYearlySeries(
  res: PopulationResponse,
  label: PopulationResponse["data"][number]["label"]
): YearValue[] {
  const series = res.data.find((s) => s.label === label)
  if (!series) return []
  return (series.data ?? [])
    .filter((d) => typeof d.year === "number" && typeof d.value === "number")
    .map((d) => ({ year: d.year, value: d.value }))
}
