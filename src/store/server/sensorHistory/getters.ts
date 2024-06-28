import { GetterTree } from 'vuex'
import {
    ServerSensorHistoryState,
    ServerSensorHistoryStateSerie,
    ServerSensorHistoryStateSourceEntry,
} from '@/store/server/sensorHistory/types'
import { RootState } from '@/store/types'
import { capitalize } from '@/plugins/helpers'

export const getters: GetterTree<ServerSensorHistoryState, RootState> = {
    getDatasetColor: (_, getters) => (name: string) => {
        const dataset = getters.getSeries(`${name}`)

        return dataset?.lineStyle?.color ?? null
    },

    getSeries: (state) => (name: string) => {
        return state.series.find((element) => element.name === name)
    },

    getSerieNames: (state) => (name: string) => {
        return [name]
    },

    getSelectedLegends: (state, getters, rootState) => {

        //container for updated selections
        interface legends {
            [key: string]: boolean
        }
        const selected: legends = {}

        //new GUI values - {"":{"":X}}
        const viewSettings = rootState.gui?.view?.sensorchart?.datasetSettings ?? {}

        // transform selected{} into new GUI values
        Object.keys(state.selectedLegends).forEach((key) => {

            Object.keys(viewSettings[key]).forEach((attrKey) => {

                const serieName = `${key}`

                // break if serie in sensorchart doesn't exist
                if (state.series.findIndex((serie) => serie.name === serieName) === -1) return

                // add to selected
                selected[serieName] = viewSettings[key][attrKey]
            })
         })
        state.series.forEach((serie) => {
            // break if object is already in the selected list
            if (Object.keys(selected).includes(serie.name)) return
        })

        return selected
    },

    getSensorStoreSize: (state, getters, rootState, rootGetters) => {
        const dataStoreSize = rootGetters['server/getConfig']('data_store', 'sensor_store_size')

        return dataStoreSize ?? 1200
    },
}
