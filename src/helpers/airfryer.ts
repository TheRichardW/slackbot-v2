import axios from "axios";
// import fetch
// const env = require("../util/enviroment");
import { Snack } from "../types/snack";
import { SnackJson } from "../types/snackJson";
// import {voorraadPayload} from "../types/voorraadPayload"

// const slackToken = env.slack.slack_key;
const slackToken = "kaas";
const urlView = "https://slack.com/api/views.open";
const urlMessage = "https://slack.com/api/chat.postMessage";

// const channel = env.slack.lunch_id;
const channel = "kaas";

//Airfryer class with all function for /airfryer in slack
export class Airfryer {
  constructor() {
    console.log("Airfryer is loaded");
  }

  snacksArr: Snack[] = [
    { key: "mex", name: "Mexicaantje", icon: "mexicano" },
    { key: "fri", name: "Frikandel", icon: "frikandel" },
    { key: "kro", name: "Kroket", icon: "kroket" },
    { key: "kipc", name: "Kipcorn", icon: "kipcorn" },
    { key: "kips", name: "Crispy chicken spicy", icon: "crispy_chick_spicy" },
    { key: "kaa", name: "Kaassouflé", icon: "kaassoufle" },
    { key: "cbi", name: "Chicken bites", icon: "chicken_bites" },
    { key: "bam", name: "Bamischijf", icon: "bami_schijf" },
  ];

  getVoorraad(payload) {
    const values = payload.view.state.values;
    const formAnswers = Object.values(values);
    const messages: { snack: Snack; amount: number }[] = [];

    console.log(this.snacksArr);
    for (const snack of this.snacksArr) {
      const formAnswer = formAnswers.find(
        (fA) => Object.keys(fA)[0] === snack.key
      );
      const amount = formAnswer[snack.key].value;
      if (amount > 0) {
        messages.push({ snack, amount });
        // await this.sendMessage(snack, amount);
      }
    }

    const formAnswerTtlExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ttlext1"
    );
    const formAnswerExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ext1"
    );

    if (
      formAnswerTtlExt1["ttlext1"].value !== undefined &&
      formAnswerExt1["ext1"].value !== undefined &&
      parseInt(formAnswerExt1["ext1"].value) > 0
    ) {
      messages.push({
        snack: { name: formAnswerTtlExt1["ttlext1"].value, icon: null },
        amount: parseInt(formAnswerExt1["ext1"].value),
      });
    }

    const formAnswerTtlExt2 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ttlext2"
    );
    const formAnswerExt2 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ext2"
    );

    if (
      formAnswerTtlExt2["ttlext2"]?.value !== undefined &&
      formAnswerExt2["ext2"]?.value !== undefined &&
      parseInt(formAnswerExt2["ext2"]?.value) > 0
    ) {
      messages.push({
        snack: { name: formAnswerTtlExt2["ttlext1"].value, icon: null },
        amount: parseInt(formAnswerExt2["ext1"].value),
      });
    }

    return messages;
  }

  async sendMessage(snack, amount) {
    const icon = snack?.icon ? `:${snack.icon}: ` : "";
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: `${icon}${snack.name} _(voorraad: ${amount})_`,
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
  }

  async postAirfryerModal(req) {
    const dialogJson = {
      trigger_id: req.body.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Snacks voorraad",
        },
        submit: {
          type: "plain_text",
          text: "Plaats lijst",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Close",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Vul de voorraad per snack in.",
              emoji: true,
            },
          },
          ...this.createSnacksJson(),
          {
            type: "divider",
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "plain_text_input",
              action_id: "ttlext1",
            },
            label: {
              type: "plain_text",
              text: "Titel Extra 1",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "ext1",
            },
            label: {
              type: "plain_text",
              text: "Extra 1",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "plain_text_input",
              action_id: "ttlext2",
            },
            label: {
              type: "plain_text",
              text: "Titel Extra 2",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "ext2",
            },
            label: {
              type: "plain_text",
              text: "Extra 2",
              emoji: true,
            },
          },
        ],
      },
    };

    await axios.post(urlView, dialogJson, {
      headers: {
        authorization: `Bearer ${slackToken}`,
        "content-type": "application/json",
      },
    });
  }

  createSnacksJson() {
    const snackJson: SnackJson[] = [];
    this.snacksArr.forEach((snack) => {
      snackJson.push({
        type: "input",
        element: {
          type: "number_input",
          is_decimal_allowed: false,
          action_id: snack.key ?? "", // TODO This can not happen
        },
        label: {
          type: "plain_text",
          text: snack.name,
          emoji: true,
        },
      });
    });

    return snackJson;
  }
}
