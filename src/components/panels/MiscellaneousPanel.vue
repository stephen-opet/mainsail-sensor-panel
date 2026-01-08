<style scoped></style>

<template>
    <panel
        v-if="showMiscellaneousPanel"
        :icon="mdiDipSwitch"
        :title="$t('Panels.MiscellaneousPanel.Headline')"
        :collapsible="true"
        card-class="miscellaneous-panel">
        <div v-for="(object, index) of miscellaneous" :key="index">
            <v-divider v-if="index" />
            <miscellaneous-slider
                :name="object.name"
                :type="object.type"
                :target="object.power"
                :rpm="object.rpm"
                :controllable="object.controllable"
                :pwm="object.pwm"
                :off_below="object.off_below"
                :max="object.max_power"
                :multi="parseInt(object.scale)" />
        </div>
        <div v-for="(light, index) of lights" :key="'light_' + light.name">
            <v-divider v-if="index || miscellaneous.length" />
            <miscellaneous-light :type="light.type" :name="light.name" />
        </div>
        <div v-for="(sensor, index) of filamentSensors" :key="'sensor_' + index">
            <v-divider v-if="index || miscellaneous.length || lights.length" />
            <filament-sensor
                :type="sensor.type"
                :name="sensor.name"
                :enabled="sensor.enabled"
                :filament_detected="sensor.filament_detected"
                :filament_diameter="sensor.filament_diameter" />
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MiscellaneousSlider from '@/components/inputs/MiscellaneousSlider.vue'
import FilamentSensor from '@/components/inputs/FilamentSensor.vue'
import MiscellaneousLight from '@/components/panels/Miscellaneous/MiscellaneousLight.vue'
import MiscellaneousSensor from '@/components/panels/Miscellaneous/MiscellaneousSensor.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiDipSwitch } from '@mdi/js'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'
@Component({
    components: { Panel, FilamentSensor, MiscellaneousSlider, MiscellaneousLight },
})
export default class MiscellaneousPanel extends Mixins(BaseMixin, MiscellaneousMixin) {
    mdiDipSwitch = mdiDipSwitch

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }
    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }
    get showMiscellaneousPanel() {
        return (
            this.klipperReadyForGui && (this.miscellaneous.length || this.filamentSensors.length || this.lights.length)
        )
    }
}
</script>
