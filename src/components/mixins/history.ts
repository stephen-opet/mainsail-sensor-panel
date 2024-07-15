import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class HistoryMixin extends Vue {
    get moonrakerHistoryFields() {
        const config = this.$store.state.server.config?.config ?? {}
        const sensors = Object.keys(config).filter((key) => key.startsWith('sensor '))
        const historyFields: { unit: string; provider: string; name: string; parameter: string; header: string }[] = []

        sensors.forEach((configName) => {
            const sensor = config[configName] ?? {}

            Object.keys(sensor)
                .filter((key) => key.startsWith('history_field_'))
                .forEach((key) => {
                    const historyField = sensor[key]

                    historyFields.push({
                        unit: historyField.units ?? "",
                        provider: configName,
                        parameter: historyField.parameter,
                        name: key,
                        header: this.formatKey(key),
                    })
                })
        })

        return historyFields
    }

    formatKey(key: string): string {

        let formattedKey = key.replace(/^history_field_/, '')
        formattedKey = formattedKey.replace(/_/g, ' ')
        formattedKey = formattedKey.replace(/\b\w/g, (char) => char.toUpperCase())

        return formattedKey
    }
}
