export type Prefecture = {
  prefCode: number
  prefName: string
}

export type PopulationItem = {
  year: number
  value: number
}

export type PopulationSeries = {
  label: "総人口" | "年少人口" | "生産年齢人口" | "老年人口"
  data: PopulationItem[]
}

export type PopulationResponse = {
  boundaryYear: number
  data: PopulationSeries[]
}
