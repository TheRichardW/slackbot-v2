import axios from "axios";
import express, { Application, Request, Response } from "express";
import "dotenv/config";
import { Airfryer } from "./helpers/airfryer";
import { SnackPayload} from "./types/snackPayload";

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded());

const PORT = process.env.port;
const SLACKTOKEN = process.env.slackToken;

const airfryer = new Airfryer();

const urlMessage = "https://slack.com/api/chat.postMessage";
const urlView = "https://slack.com/api/views.open";

app.get("/", (req: Request, res: Response) => {
  res.send("Hoi Hoi");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/slack/airfryer", async (req: Request, res: Response) => {
  res.status(200).end();
  const airfryerModal = airfryer.getAirfryerModal(req);
  await axios
    .post(urlView, airfryerModal, {
      headers: {
        authorization: `Bearer ${SLACKTOKEN}`,
        "content-type": "application/json",
      },
    })
    .then((response) => console.log(response.data))
    .catch((reason) => {
      console.log(reason);
    });
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
      sendWorkflow(payload, res);
      return;
    case "view_submission":
      res.status(200).end();
      if (payload.view.title.text == "Snacks voorraad") {
        const messages = airfryer.getVoorraad(payload);
        for (const message of messages) {
          const icon = message.snack?.icon ? `:${message.snack.icon}: ` : "";
          const text = `${icon}${message.snack.name} _(voorraad: ${message.amount})_`;
          await sendMessage("U0314MUDEM8", text); // TODO: get channel id from env or miniSQL
        }
        return;
      }
      break;
  }
});

// function whatMessage(event) {
//   switch (event.text) {
//     case "{{/jumbomand}}":
//       jumbo.getMand("", "");
//     default:
//       jumbo.addToMand(event);
//   }
// }

async function sendMessage(channel: string, text: string) {
  await axios.post(
    urlMessage,
    {
      channel: channel,
      text: text,
    },
    { headers: { authorization: `Bearer ${SLACKTOKEN}` } }
  );
}

async function sendWorkflow(payload, res: Response) {
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

  res = await axios.post(urlView, workflowModalJson, {
    headers: {
      authorization: `Bearer ${SLACKTOKEN}`,
      "content-type": "application/json",
    },
  });
  return res;
}
