export interface ServerSensorState {
    sensors: {
        [key: string]: ServerSensorStateSensor
    }
}

export interface ServerSensorStateSensor {
    friendly_name: string
    id: string
    type: string
    values: {
        [key: string]: number
    }
    parameter_info: {
        [key: string]: string
    }
}
