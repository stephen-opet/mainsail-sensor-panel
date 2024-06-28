<template>
  <panel
    v-if="hasSensors"
    :icon="mdiSatelliteVariant"
    :title="$t('Panels.SensorPanel.Headline')"
    :collapsible="true"
    card-class="sensor-panel">
      <template #buttons>
            <sensor-panel-settings />
        </template>
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
                <td v-for="key in group.keys" :key="key">
                  <span class="cursor-pointer" @click="showEditDialog(sensor.name, key)">
                    {{ getSensorValueWithUnit(sensor, key) ?? 'N/A' }}
                  </span>
                  <component
                    :is="sensorPanelListItemEdit"
                    :key="`${capitalize(sensor.name)}: ${key}`"
                    :object-name="`${capitalize(sensor.name)}: ${key}`"
                    :name="`${capitalize(sensor.name)}: ${key}`"
                    :bool-show="isEditDialogVisible(sensor.name, key)"
                    @close-dialog="closeEditDialog(sensor.name, key)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <template v-if="boolSensorchart">
          <v-divider class="my-0" />
          <component :is="sensorChart" />
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
import { mdiSatelliteVariant } from '@mdi/js'
import { capitalize } from '@/plugins/helpers'

@Component({
  components: { 
    Panel, 
    Responsive, 
  },
})
export default class SensorPanel extends Mixins(BaseMixin) {
  mdiSatelliteVariant = mdiSatelliteVariant
  historicalData: { [key: string]: { timestamp: number, value: number }[] } = {}
  editDialogs: { [key: string]: string | null } = {}

  get sensorChart() {
    return () => import('@/components/charts/SensorChart.vue');
  }

  get sensorPanelListItemEdit() {
    return () => import('@/components/panels/Sensor/SensorPanelListItemEdit.vue');
  }

  showEditDialog(sensorName: string, key: string) {
    this.$set(this.editDialogs, `${sensorName}:${key}`, true)
  }

  closeEditDialog(sensorName: string, key: string) {
    this.$set(this.editDialogs, `${sensorName}:${key}`, null)
  }

  isEditDialogVisible(sensorName: string, key: string) {
    return this.editDialogs[`${sensorName}:${key}`] === true
  }

  get moonrakerSensors() {
    return this.$store.state.server.sensor.sensors ?? []
  }

  get hasSensors(): boolean {
    return Object.keys(this.moonrakerSensors).length > 0
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
  
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  get boolSensorchart(): boolean {
    return this.$store.state.gui.view.sensorchart.boolSensorchart ?? false
  }

  getSensorValueWithUnit(sensor, key) {
    const value = sensor.values[key]
    for(const param of sensor.parameter_info){
      if(capitalize(param.name) == capitalize(key)){
        return `${value}${param.units}`
      }
    }
    return value
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
  th {
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
