import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { ServerSensorHistoryState, ServerSensorHistoryStateSerie } from '@/store/server/sensorHistory/types'

export const mutations: MutationTree<ServerSensorHistoryState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setSelectedLegends(state, legends) {
        state.selectedLegends = legends
    },

    setInitSource(state, payload) {
        Vue.set(state, 'source', payload)
    },

    setInitSeries(state, payload) {
        Vue.set(state, 'series', payload)
    },

    addToSource(state, payload) {
        const newSource = [...state.source]
        newSource.push(payload.data)
        while (newSource.length > payload.maxHistory) newSource.splice(0, 1)

        Vue.set(state, 'source', newSource)
    },

    // function for debugging tempchart update interval (browser sleep)
    saveLastDate(state, payload) {
        Vue.set(state, 'timeLastUpdate', payload)
    },

    setUpdateSourceInterval(state, payload) {
        Vue.set(state, 'updateSourceInterval', payload)
    },

    setColor(state, payload) {
        state.series
            .filter((serie: ServerSensorHistoryStateSerie) => {
                return payload.name === serie.name || serie.name.startsWith(payload.name + '-')
            })
            .forEach((serie: ServerSensorHistoryStateSerie) => {
                serie.color = payload.value
                serie.lineStyle.color = payload.value
                serie.emphasis.lineStyle.color = payload.value

                if (serie.name.endsWith('-target')) {
                    const areaStyle = serie.areaStyle
                    if (areaStyle) areaStyle.color = payload.value

                    const areaStyle2 = serie.emphasis?.areaStyle
                    if (areaStyle2) areaStyle2.color = payload.value
                }
            })
    },
}
