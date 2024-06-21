export interface ServerSensorHistoryState {
    source: ServerSensorHistoryStateSourceEntry[]
    series: ServerSensorHistoryStateSerie[]
    timeLastUpdate: number | null
    updateSourceInterval: number | null
    selectedLegends: { [key: string]: boolean }
}

export interface ServerSensorHistoryStateSerie {
    id: number
    color: string
    type: string
    name: string
    yAxisIndex: number
    encode: {
        x: string
        y: string
    }
    animation: boolean
    lineStyle: {
        color: string
        width: number
        opacity: number
        type?: string
    }
    areaStyle?: {
        color: string
        opacity: number
    }
    showSymbol: boolean
    emphasis: {
        lineStyle: {
            color: string
            width: number
            opacity: number
            type?: string
        }
        areaStyle?: {
            color: string
            opacity: number
        }
    }
}

export interface ServerSensorHistoryStateSourceEntry {
    // eslint-disable-next-line
    [key: string]: any
}
