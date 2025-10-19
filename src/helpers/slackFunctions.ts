import axios from "axios";
import {Response} from "express";
import { SnackPayload } from "../types/snackPayload";

export class SlackFunctions {
  private SLACKTOKEN: string = process.env.slackToken ?? "";
  private urlMessage = "https://slack.com/api/chat.postMessage";
  private urlMessageEphermal = "https://slack.com/api/chat.postEphemeral";
  private urlView = "https://slack.com/api/views.open";

  // constructor() {}

  // public initialize(): void {}

  async sendMessage(channel: string, text: string) {
    await axios.post(
      this.urlMessage,
      {
        channel: channel,
        text: text,
      },
      { headers: { authorization: `Bearer ${this.SLACKTOKEN}` } }
    );
  }

  async sendEphemeralMessage(channel: string, user: string, text: string) {
    await axios.post(
      this.urlMessageEphermal,
      {
        channel,
        user,
        text,
      },
      { headers: { authorization: `Bearer ${this.SLACKTOKEN}` } }
    );
  }

  async sendModal(modal: object) {
    await axios
      .post(this.urlView, modal, {
        headers: {
          authorization: `Bearer ${this.SLACKTOKEN}`,
          "content-type": "application/json",
        },
      })
  }

  async sendWorkflow(payload: SnackPayload, res: Response) {
    const workflowModalJson = {
      trigger_id: payload.trigger_id,
      view: {
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Hallo",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "plain_text_input-action",
            },
            label: {
              type: "plain_text",
              text: "Label",
              emoji: true,
            },
          },
        ],
        type: "workflow_step",
      },
    };

    res = await axios.post(this.urlView, workflowModalJson, {
      headers: {
        authorization: `Bearer ${this.SLACKTOKEN}`,
        "content-type": "application/json",
      },
    });
    return res;
  }
}
