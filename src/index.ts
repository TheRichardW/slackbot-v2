import express, { Application, Request, Response } from "express";
import "dotenv/config";
import { Airfryer } from "./helpers/airfryer";

const app: Application = express();
const PORT = process.env.port;

const airfryer = new Airfryer;

app.get("/", (req: Request, res: Response) => {
  res.send("Hoi Hoi");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/slack/airfryer", async (req: Request, res: Response) => {
  res.status(200).end();
  airfryer.postAirfryerModal(req, res);
});

//Add new events to the switch
app.post("/slack/events", async (req: Request, res: Response) => {
  const event = req.body.event;

  if ("challenge" in req.body) {
    const challenge = req.body.challenge;
    res.status(200).send({ challenge: challenge }).end();
  }

  if (!event.hasOwnProperty("bot_id") || event.username == "Jumbo Mand") {
    switch (event.type) {
      case "message":
        whatMessage(event);
        res.status(200).end();
        return;
      case "workflow_step_execute":
        jumbo.getMand("", "");
        res.status(200).end();
    }
  }
});

//Add new interactions to the switch
app.post("/slack/interactivity", async (req: Request, res: Response) => {
  let payload = JSON.parse(req.body.payload);

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
      sendWorkflow(payload, res);
      return;
    case "view_submission":
      res.status(200).end();
      if (payload.view.title.text == "Snacks voorraad") {
        const messages = airfryer.getVoorraad(payload);
        for(const message of messages) {
          await airfryer.sendMessage(message.snack, message.amount); // TODO: change this to general slack message with channelId
        }
        return;
      }
      res = await axios.post(
        "https://slack.com/api/workflows.updateStep",
        { workflow_step_edit_id: payload.workflow_step.workflow_step_edit_id },
        {
          headers: {
            authorization: `Bearer ${slackToken}`,
            "content-type": "application/json",
          },
        }
      );
      break;
  }
});

function whatMessage(event) {
  switch (event.text) {
    case "{{/jumbomand}}":
      jumbo.getMand("", "");
    default:
      jumbo.addToMand(event);
  }
}

async function sendWorkflow(payload, res: Response) {
  workflowModalJson = {
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

  res = await axios.post(urlView, workflowModalJson, {
    headers: {
      authorization: `Bearer ${slackToken}`,
      "content-type": "application/json",
    },
  });
}
