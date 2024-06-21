<template>
  <panel
    :icon="mdiDipSwitch"
    :title="$t('Panels.SensorPanel.Headline')"
    :collapsible="true"
    card-class="sensor-panel">
      <v-card class="py-2">
        <div v-for="(group, index) in groupedSensors" :key="index" class="table-container">
          <table class="sensor-table">
            <thead>
              <tr>
                <th>Sensor</th>
                <th v-for="key in group.keys" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sensor in group.sensors" :key="sensor.name">
                <td>{{ sensor.friendly_name }}</td>
                <td v-for="key in group.keys" :key="key">{{ sensor.values[key] ?? 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <template >
          <v-divider class="my-0" />
          <sensor-chart />
        </template>
      </v-card>
  </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'
import ControlMixin from '@/components/mixins/control'
import { mdiDipSwitch } from '@mdi/js'
import SensorChart from '@/components/charts/SensorChart.vue'

@Component({
  components: { Panel, SensorChart, Responsive,},
 
})
export default class SensorPanel extends Mixins(BaseMixin) {
  mdiDipSwitch = mdiDipSwitch
  historicalData: { [key: string]: { timestamp: number, value: number }[] } = {}

  get moonrakerSensors() {
    return this.$store.state.server.sensor.sensors
  }

  get groupedSensors() {
    const sensorGroups: { [key: string]: { keys: string[], sensors: any[] } } = {}

    Object.keys(this.moonrakerSensors).forEach((sensorName) => {
      const sensor = this.moonrakerSensors[sensorName]
      const values = sensor.values ?? {}
      const valueKeys = Object.keys(values).sort().join(',')
      if (!sensorGroups[valueKeys]) {
        sensorGroups[valueKeys] = { keys: Object.keys(values), sensors: [] }
      }
      sensorGroups[valueKeys].sensors.push({ name: sensorName, ...sensor })
    })
    return Object.values(sensorGroups)
  }
}
</script>

<style scoped>
.sensor-title {
  margin: 10px;
  text-align: center;
  font-size: 24px;
}
.table-container {
  overflow-x: auto;
}
.sensor-table {
  width: 100%;
  border-collapse: collapse;
}
td {
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  padding: 10px;
  text-align: center;
  color: #ccc;
}
th {
  border-top: none;
  border-bottom: 1px solid #444;
  padding: 10px;
  text-align: center;
  color: #ccc;
}
.sensor-footer {
  text-align: center;
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
}
.chart {
  width: 100%;
  height: 400px;
}
@media (max-width: 768px) {
  .sensor-table th,
  .sensor-table td {
    font-size: 12px;
    padding: 5px;
  }
  .status-row {
    font-size: 20px;
  }
  .chart {
    height: 300px;
  }
  td {
    font-size: 0.875rem;
  }
  th{
    font-size: 0.75rem;
  }
}
@media (max-width: 480px) {
  .sensor-table th,
  .sensor-table td {
    font-size: 10px;
  }
  .status-row {
    font-size: 18px;
  }
  .chart {
    height: 200px;
  }
  td {
    font-size: 1.0rem!important;
  }
  th {
    font-size: 0.875rem!important;
  }
}
</style>