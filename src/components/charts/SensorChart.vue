<template>
    <e-chart
        ref="sensorchart"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        :autoresize="true"
        :style="sensorchartStyle"
        class="sensorchart"
        @mouseenter.native="hoverChart = true"
        @mouseleave.native="hoverChart = false" />
</template>

<script lang="ts">
import { mapActions } from 'vuex'
import { convertName } from '@/plugins/helpers'
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { ServerSensorHistoryStateSourceEntry } from '@/store/server/sensorHistory/types'

import type { ECharts } from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared.d'
import { mdiClock } from '@mdi/js'
import { datasetTypesInPercents } from '@/store/variables'
import ThemeMixin from '../mixins/theme'

interface echartsTooltipObj {
    [key: string]: any
}

@Component({
    components: {},
    methods: {
        ...mapActions('server/sensorHistory', ['setSelectedLegends'])
    }
})
export default class SensorChart extends Mixins(BaseMixin, ThemeMixin) {
    declare $refs: {
        sensorchart: any
    }

    hoverChart = false
    private isVisible = true

    get chartOptions(): ECBasicOption {
        return {
            renderer: 'svg',
            animation: false,
            tooltip: this.tooltip,
            legend: {
                animation: false,
                show: false,
                selected: this.selectedLegends,
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#fff',
                        opacity: '0.1'
                    },
                },
                axisLabel: {
                    interval: 'auto',
                    color: '#ccc',
                    margin: 10,
                    formatter: this.timeFormat,
                },
            },
            yAxis: this.yAxis,
            media: this.media,
            dataset: {
                source: [],
            },
            series: this.series,
        }
    }

    get tooltip() {
        return {
            animation: false,
            trigger: 'axis',
            backgroundColor: this.bgColor(1),
            borderWidth: 0,
            textStyle: {
                color: this.fgColorHi,
                fontSize: '14px',
            },
            padding: 15,
            confine: true,
            className: 'echarts-tooltip',
            position: function (pos: any, params: any, dom: any, rect: any, size: any) {
                // tooltip will be fixed on the right if mouse hovering on the left,
                // and on the left if hovering on the right.
                const obj: echartsTooltipObj = { top: 60 }
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5
                return obj
            },
        }
    }

    get yAxis() {
        return [
            {
                type: 'value',
                boundaryGap: ['10%', '10%'],
                scale: true,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#fff',
                        opacity: '0.1'
                    }
                },
                axisLabel: {
                  color: '#ccc'
                },
                axisLine: {
                  lineStyle: {
                    color: '#ccc'
                  }
                },
            },
        ]
    }

    get media() {
        return [
            {
                query: { //desktop
                    minWidth: 480,
                },
                option: {
                    grid: {
                        top: 35,
                        right: 15,
                        left: 60,
                        bottom: 50,
                    },
                    xAxis: {
                        minInterval: 60 * 1000,
                        splitNumber: 10,
                        splitLine: {
                            interval: function (index, value) {
                                return value.getMinutes() % 1 === 0; // Adjust as needed
                            },
                        },
                    },
                },
            },
            {
                query: { //mobile
                    maxWidth: 480,
                },
                option: {
                    grid: {
                        top: 35,
                        right: 20,
                        bottom: 50,
                        left: 50
                    },
                    xAxis: {
                        minInterval: 240 * 1000,
                        splitNumber: 5,
                        splitLine: {
                            interval: function (index, value) {
                                return value.getMinutes() % 4 === 0
                            },
                        },
                    },
                }
            }
        ]
    }

    get chart(): ECharts | null {
        return this.$refs.sensorchart?.chart ?? null
    }

    get maxHistory() {
        return this.$store.getters['server/sensorHistory/getSensorStoreSize']
    }

    get series() {
        return this.$store.state.server.sensorHistory.series ?? []
    }

    get source() {
        return this.$store.state.server.sensorHistory.source ?? []
    }

    get selectedLegends() {
        return this.$store.getters['server/sensorHistory/getSelectedLegends']
    }

    get timeFormat() {
        return this.hours12Format ? '{hh}:{mm}' : '{HH}:{mm}'
    }

    get sensorchartHeight() {
        return this.$store.state.gui.uiSettings.sensorchartHeight ?? 250
    }

    get sensorchartStyle() {
        return {
            height: this.sensorchartHeight + 'px',
        }
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    @Watch('source')
    sourceChanged(newVal: ServerSensorHistoryStateSourceEntry[]) {
        // break if the chart isn't initialized or not visible or is hovered
        if (!this.chart || !this.isVisible || this.hoverChart) return

        this.chart?.setOption({
            dataset: {
                source: newVal,
            },
        })

        const limitDate = new Date(Date.now() - this.maxHistory * 1000)
        let newSource = newVal.filter((entry: ServerSensorHistoryStateSourceEntry) => {
            return entry.date >= limitDate
        })

        // reset tempHistory if working sources are smaller than 80%
        if (newVal.length > 0 && newSource.length < this.maxHistory * 0.8) {
            this.$socket.emit(
                'server.sensors.measurements',
                { },
                { action: 'server/sensorHistory/init' }
            )
        }
    }

    @Watch('selectedLegends')
    selectedLegendsChanged(newVal: any, oldVal: any) {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return
        }
        this.setSelectedLegends(newVal)
        if (this.chart?.isDisposed() !== true) {
            Object.keys(newVal).forEach((key) => {
                if (newVal[key] !== oldVal[key]) {
                    const actionType = newVal[key] ? 'legendSelect' : 'legendUnSelect'
                    this.chart?.dispatchAction({ type: actionType, name: key })
                }
            })
        }
    }
}
</script>

<style scoped>
.sensorchart {
    width: 100%;
}
</style>

