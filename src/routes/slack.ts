import { Express, Request, Response } from "express";

import { SnackPayload } from "../types/snackPayload";
import { Airfryer } from "../helpers/airfryer";
import { AH } from "../helpers/ah";
import { SlackFunctions } from "../helpers/slackFunctions";

export function slackRoutes(app: Express, slack: SlackFunctions, airfryer: Airfryer, ah: AH) {
  const PORT = process.env.port;
  const BOODSCHAP_CHANNEL = process.env.boodschap ?? '';
  const LUNCH_CHANNEL = process.env.lunch ?? '';

  app.get("/", (req: Request, res: Response) => {
    res.send("Hoi Hoi");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  app.post("/slack/airfryer", async (req: Request, res: Response) => {
    res.status(200).end();
    const airfryerModal = airfryer.getAirfryerModal(req);
    slack.sendModal(airfryerModal);
  });

  //Add new events to the switch
  app.post("/slack/events", async (req: Request, res: Response) => {
    const event = req.body.event;

    if ("challenge" in req.body) {
      const challenge = req.body.challenge;
      res.status(200).send({ challenge: challenge }).end();
    }

    if (!("bot_id" in event) || event.username == "Jumbo Mand") {
      switch (event.type) {
        case "message": {
          if (event.channel == BOODSCHAP_CHANNEL) { // TODO change to env of db
            const messageParts = event.text.split(" ");
            if (messageParts.length >= 2 && !isNaN(messageParts[1])) {
              ah.addToBasket(messageParts[0], messageParts[1], event.channel, event.user);
            }
            slack.sendEphemeralMessage(event.channel, event.user, 'Er is geen aantal ingevuld, het bericht moet er zo uit zien: "link nummer"');
          }
          res.status(200).end();
          return;
        }
        case "workflow_step_execute":
          ah.getMand();
          res.status(200).end();
      }
    }
  });

  //Add new interactions to the switch
  app.post("/slack/interactivity", async (req: Request, res: Response) => {
    const payload: SnackPayload = JSON.parse(req.body.payload);

    let type = payload.type;
    if (type == undefined) {
      type = payload.view.type;
    }

    switch (type) {
      case "modal":
        res.status(200).end();
        airfryer.getVoorraad(payload);
        break;
      case "workflow_step_edit":
        res.status(200).end();
        slack.sendWorkflow(payload, res);
        return;
      case "view_submission":
        res.status(200).end();
        if (payload.view.title.text == "Snacks voorraad") {
          const messages = airfryer.getVoorraad(payload);
          for (const message of messages) {
            const icon = message.snack?.icon ? `:${message.snack.icon}: ` : "";
            const text = `${icon}${message.snack.name} _(voorraad: ${message.amount})_`;
            await slack.sendMessage(LUNCH_CHANNEL, text); // TODO: get channel id from env or miniSQL
          }
          return;
        }
        break;
    }
  });
}
