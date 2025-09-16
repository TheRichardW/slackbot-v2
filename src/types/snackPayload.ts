export interface SnackPayload {
  type: string;
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  },
  api_app_id: string,
  token: string,
  trigger_id: string
  view: {
    id: string,
    team_id: string,
    type: "modal",
    blocks: [],
    state: {
        values: Record<string, Record<string, { type: "number_input", value: string }>>
    }
    title: { type: string, text: string, "emoji": boolean },
  };
}
