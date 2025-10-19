export interface Token {
    id: number,
    service: string,
    access_token: string,
    refresh_token: string,
    expires_in: number,
    updated_at: number
}