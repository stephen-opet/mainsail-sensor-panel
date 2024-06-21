import { Module } from 'vuex'
import { ServerSensorHistoryState } from '@/store/server/sensorHistory/types'
import { actions } from '@/store/server/sensorHistory/actions'
import { mutations } from '@/store/server/sensorHistory/mutations'
import { getters } from '@/store/server/sensorHistory/getters'

export const getDefaultState = (): ServerSensorHistoryState => {
    return {
        source: [],
        series: [],
        timeLastUpdate: null,
        updateSourceInterval: null,
        selectedLegends: {} 
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const sensorHistory: Module<ServerSensorHistoryState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
