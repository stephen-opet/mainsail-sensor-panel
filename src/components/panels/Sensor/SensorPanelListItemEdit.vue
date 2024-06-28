<template>
  <v-dialog v-model="boolShow" persistent :width="400">
    <panel :title="name" :icon="icon" card-class="sensor-edit-dialog" :margin-bottom="false">
      <template #buttons>
        <v-btn icon tile @click="closeDialog">
          <v-icon>{{ mdiCloseThick }}</v-icon>
        </v-btn>
      </template>
      <v-card-text class="pt-6">
        <sensor-panel-list-item-edit-chart-serie
          v-for="dataset in chartSeries"
          :key="dataset"
          :object-name="objectName"
          :serie-name="dataset" />
        <v-row>
          <v-col class="col-12 text-center pb-0">
            <v-color-picker
              hide-mode-switch
              mode="hexa"
              :value=color
              class="mx-auto"
              @update:color="setChartColor" />
          </v-col>
        </v-row>
      </v-card-text>
    </panel>
  </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick } from '@mdi/js'
import SensorPanelListItemEditChartSerie from '@/components/panels/Sensor/SensorPanelListItemEditChartSerie.vue'
import { Debounce } from 'vue-debounce-decorator'

@Component({
  components: { SensorPanelListItemEditChartSerie },
})
export default class SensorPanelListItemEdit extends Mixins(BaseMixin) {
  mdiCloseThick = mdiCloseThick

  @Prop({ type: Boolean, required: true }) readonly boolShow!: boolean
  @Prop({ type: String, required: true }) readonly objectName!: string
  @Prop({ type: String, required: true }) readonly name!: string
  @Prop({ type: String, required: true }) readonly key!: string

  get chartSeries() {
    return this.$store.getters['server/sensorHistory/getSerieNames'](this.objectName) ?? []
  }

  @Debounce(500)
  setChartColor(value: string | any): void {
    if (typeof value === 'object' && 'hex' in value) value = value.hex

    this.$store.dispatch('gui/setChartColor', {
      objectName: this.objectName,
      value,
    })

    this.$store.dispatch('server/sensorHistory/setColor', { name: this.objectName, value })
  }

  closeDialog() {
    this.$emit('close-dialog')
  }

  get color() {
    return this.$store.getters['server/sensorHistory/getDatasetColor'](this.objectName) ?? '#FFFFFF'
  }
}
</script>

<style scoped>
.sensor-edit-dialog {
  width: 400px;
}
</style>
