import axios from "axios";

import { TokenRepository } from "../repositories/tokenRepository";
import { Token } from "../types/token";
import { SlackFunctions } from "./slackFunctions";

export class AH {
  basketUrl =
    "https://api.ah.nl/mobile-services/shoppinglist/v2/items?orderBy=userInput&orderByParam=0";

  private tokenRepository: TokenRepository;
  private slack: SlackFunctions;

  constructor(tokenRepository: TokenRepository, slack: SlackFunctions) {
    this.tokenRepository = tokenRepository;
    this.slack = slack;
  }

  public initialize(): void {
    console.log("AH initialized");
  }

  getMand() {
    return "mand";
  }

  async addToBasket(
    url: string,
    quantity: number,
    channel: string,
    user: string
  ) {
    const matches = url.match(/\d+/g);
    if (!matches) {
      this.slack.sendEphemeralMessage(
        channel,
        user,
        "Geen product gevonden, check de link die je hebt ingediend"
      );
      return;
    }

    const body = {
      items: [
        {
          originCode: "PRD",
          productId: matches[0],
          quantity,
          type: "SHOPPABLE",
        },
      ],
    };

    let token = await this.tokenRepository.getToken("ah");
    if (!token) throw new Error("No token for service: ah");
    token = await this.checkExpires(token);

    try {
      axios.patch(this.basketUrl, body, {
        headers: { authorization: `Bearer ${token.access_token}` },
      });
    } catch (error) {
      console.log(error);
    }

    this.slack.sendEphemeralMessage(
      channel,
      user,
      "Jouw item(s) is/zijn toegevoegd aan het mandje"
    );
  }

  async checkExpires(token: Token): Promise<Token> {
    if (((token.expires_in * 1000) + token.updated_at) < Date.now()) {
      const response = await axios.post(
        "https://api.ah.nl/mobile-auth/v1/auth/token/refresh",
        {
          clientId: "appie",
          refreshToken: token.refresh_token,
        }
      );

      this.tokenRepository.updateToken(
        "ah",
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );
    }
    return token;
  }
}
