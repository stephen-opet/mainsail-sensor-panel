import Vue from 'vue'
import { datasetInterval } from '@/store/variables'
import { ActionTree } from 'vuex'
import {
    ServerSensorHistoryState,
    ServerSensorHistoryStateSerie,
    ServerSensorHistoryStateSourceEntry,
} from '@/store/server/sensorHistory/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerSensorHistoryState, RootState> = {
    reset({ commit, state }) {
        if (state.updateSourceInterval !== null) clearInterval(state.updateSourceInterval)

        commit('reset')
    },

    init({ commit, rootGetters, dispatch }, payload) {
        window.console.debug('init server/sensorHistory')
        dispatch('reset')

        const now = new Date()
        const allSensors = rootGetters['server/sensor/getSensors'] ?? [] 

        if(allSensors.length === 0) return

        const maxHistory = rootGetters['server/sensorHistory/getSensorStoreSize']

        if (payload !== undefined) {
            if ('requestParams' in payload) delete payload.requestParams

            const objectKeys = Object.keys(payload)

            // eslint-disable-next-line
            const importData: any = {}

            objectKeys.forEach((key: string) => {
                let nameOnly = key
                if (nameOnly.indexOf(' ') !== -1) {
                    nameOnly = nameOnly.substring(nameOnly.indexOf(' ') + 1)
                }

                // break if sensor doesn't exist anymore or start with a _
                if (!allSensors.includes(key) || nameOnly.startsWith('_')) {
                    delete payload[key]
                    return
                }

                const datasetValues = payload[key]
                const measurementTypes = Object.keys(datasetValues)

                measurementTypes.forEach((datasetKey: string) => {
                    const length = maxHistory - datasetValues[datasetKey].length
                    datasetValues[datasetKey] = [
                        ...Array.from({ length }, () => null),
                        ...datasetValues[datasetKey],
                    ]
                })

                const prettyName = key.charAt(0).toUpperCase() + key.slice(1)
                importData[prettyName] = { ...datasetValues }
            })

            const tempDataset = []
            for (let i = 0; i < maxHistory; i++) {
                const tmpDataset: ServerSensorHistoryStateSourceEntry = {
                    date: new Date(now.getTime() - 1000 * (maxHistory - i)),
                }

                Object.keys(importData).forEach((objectName) => {
                    Object.keys(importData[objectName]).forEach((attrKey: string) => {
                        const importDatasetName = attrKey

                        if (importDatasetName in importData[objectName])
                            tmpDataset[`${objectName}: ${attrKey}`] = importData[objectName][importDatasetName][i]
                    })
                })

                tempDataset.push(tmpDataset)
            }

            commit('setInitSource', tempDataset)

            const tempDatasetKeys = Object.keys(tempDataset[0]).filter((tmp) => tmp !== 'date')
            const masterDatasetKeys = tempDatasetKeys
            const series: ServerSensorHistoryStateSerie[] = []
            let colorNumber = 0

            masterDatasetKeys.forEach((name: string) => {
                // get color from store (if exists)
                let color = rootGetters['gui/getDatasetValue']({ name: name, type: 'color' })
                color = '#' + Math.floor(0xffffff * Math.random()).toString(16)

                const serie: ServerSensorHistoryStateSerie = {
                    id: series.length + 1,
                    color: color,
                    type: 'line',
                    name: `${name}`,
                    encode: { x: 'date', y: `${name}` },
                    animation: false,
                    yAxisIndex: 0,
                    lineStyle: {
                        color: color,
                        width: 2,
                        opacity: 0.9,
                    },
                    showSymbol: false,
                    emphasis: {
                        lineStyle: {
                            color: color,
                            width: 2,
                            opacity: 0.9,
                        },
                    },
                }

                // add main serie to series
                series.push(serie)
            })

            commit('setInitSeries', series)

            interface Legends {
                [key: string]: boolean
            }
            const legends: Legends = {}
            series.forEach((serie) => {
                legends[serie.name] = true
            })
            commit('setSelectedLegends', legends)

            const updateSourceInterval = setInterval(() => {
                dispatch('updateSource')
            }, datasetInterval)

            commit('setUpdateSourceInterval', updateSourceInterval)
        }

        dispatch('socket/removeInitModule', 'server/initSensorHistory', { root: true })
    },

    setSelectedLegends({ commit }, legends) {
        commit('setSelectedLegends', legends)
    },

    async updateSource({ commit, rootState, rootGetters, state }) {

        const items = rootGetters['server/sensor/getSensors'] ?? []   

        if (items.length) {
            const now = new Date()

            if (state.source.length) {
                const lastEntry = state.source[state.source.length - 1]
                const secondsBefore = lastEntry.date.getSeconds()
                const secondsAfter = now.getSeconds()
                const diff = now.getTime() - lastEntry.date.getTime()

                if (secondsBefore === secondsAfter && diff < 1000) return
            }

            const data: ServerSensorHistoryStateSourceEntry = {
                date: now,
            }

            items.forEach((name: string) => {

                const feeds = rootState.server?.sensor?.sensors?.[name]?.values ?? {}
                Object.keys(feeds).forEach((attrKey: string) => {
                    let value = feeds[attrKey]
                    if (value !== null) value = Math.round(feeds[attrKey] * 10) / 10
                    const prettyName = name.charAt(0).toUpperCase() + name.slice(1)
                    data[`${prettyName}: ${attrKey}`] = value
                })
            })

            commit('addToSource', {
                data: data,
                maxHistory: rootGetters['server/sensorHistory/getSensorStoreSize'],
            })
        }
    },

    setColor({ commit }, payload) {
        commit('setColor', payload)
    },
}
