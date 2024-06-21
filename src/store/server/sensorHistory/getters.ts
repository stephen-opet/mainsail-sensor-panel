import { GetterTree } from 'vuex'
import {
    ServerSensorHistoryState,
    ServerSensorHistoryStateSerie,
    ServerSensorHistoryStateSourceEntry,
} from '@/store/server/sensorHistory/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerSensorHistoryState, RootState> = {
    getDatasetColor: (_, getters) => (name: string) => {
        const dataset = getters.getSeries(`${name}`)

        return dataset?.lineStyle?.color ?? null
    },

    getSeries: (state) => (name: string) => {
        return state.series.find((element) => element.name === name)
    },

    getSerieNames: (state) => (name: string) => {
        const output: string[] = []
        const seriesKeys = state.series
            .map((serie: ServerSensorHistoryStateSerie) => serie.name)
            .filter((serieName) => serieName.startsWith(`${name}`))

        seriesKeys.forEach((seriesKey) => {
            output.push(seriesKey.slice(name.length + 1))
        })

        return output
    },

    getSensorStoreSize: (state, getters, rootState, rootGetters) => {
        const dataStoreSize = rootGetters['server/getConfig']('data_store', 'sensor_store_size')

        return dataStoreSize ?? 1200
    },
}
