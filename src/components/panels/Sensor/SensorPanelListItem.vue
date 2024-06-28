<template>
        <td class="name">
            <span class="cursor-pointer" @click="showEditDialog = true">{{ formatName }}</span>
        </td>

        <sensor-panel-list-item-edit
            :bool-show="showEditDialog"
            :object-name="objectName"
            :name="name"
            :color="color"
            @close-dialog="showEditDialog = false" />
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'

@Component
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: Boolean, required: true }) readonly isResponsiveMobile!: boolean

    showEditDialog = false

    get name() {
        const splits = this.objectName.split(' ')
        if (splits.length === 1) return this.objectName

        return splits[1]
    }

    get formatName() {
        return convertName(this.name)
    }

    get color() {
        return this.$store.getters['server/sensorHistory/getDatasetColor'](this.objectName) ?? '#FFFFFF'
    }
   
}
</script>

<style scoped>
::v-deep .v-icon._no-focus-style:focus::after {
    opacity: 0 !important;
}

::v-deep .cursor-pointer {
    cursor: pointer;
}
</style>
