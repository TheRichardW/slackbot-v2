
import { Request } from "express";
import { Snack } from "../types/snack";
import { SnackJson } from "../types/snackJson";
import { SnackPayload } from "../types/snackPayload";


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

  getVoorraad(payload: SnackPayload) {
    const values = payload.view.state.values;
    const formAnswers = Object.values(values);
    const messages: { snack: Snack; amount: number }[] = [];

    for (const snack of this.snacksArr) {
      if (snack.key === undefined) throw "Snack key is undefined";
      const formAnswer = formAnswers.find(
        (fA) => Object.keys(fA)[0] === snack.key
      );
      if (formAnswer === undefined) throw "No value in form for key:" + snack.key;
      const amount = parseInt(formAnswer[snack.key].value);
      if (amount > 0) {
        messages.push({ snack, amount });
      }
    }

    const formAnswerTtlExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ttlext1"
    );
    const formAnswerExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === "ext1"
    );

    if (
      formAnswerTtlExt1 !== undefined &&
      formAnswerExt1 !== undefined &&
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
      formAnswerTtlExt2 !== undefined &&
      formAnswerExt2 !== undefined &&
      formAnswerTtlExt2["ttlext2"]?.value !== undefined &&
      formAnswerExt2["ext2"]?.value !== undefined &&
      parseInt(formAnswerExt2["ext2"]?.value) > 0
    ) {
      messages.push({
        snack: { name: formAnswerTtlExt2["ttlext2"].value, icon: null },
        amount: parseInt(formAnswerExt2["ext2"].value),
      });
    }

    return messages;
  }

  getAirfryerModal(req: Request) {
    const modalJson = {
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
    return modalJson;
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
