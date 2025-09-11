export interface SnackJson {
    type: string,
    element: {
        type: string,
        is_decimal_allowed: boolean,
        action_id: string
    },
    label: {
        type: string,
        text: string,
        emoji: boolean
    }
}