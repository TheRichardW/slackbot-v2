import { Express, Request, Response } from "express";
import { TokenRepository } from "../repositories/tokenRepository";

export function tokenRoutes(app: Express, tokenRepository: TokenRepository) {
  app.post("/token", async (req: Request<unknown, unknown, {service: string,access_token: string,refresh_token: string,expires_in: number}>,  
      res: Response) => {
    const body = req.body;

    tokenRepository.addToken(body.service, body.access_token, body.refresh_token, body.expires_in);
    return res.status(200);
  });
  
  app.delete("/token", async (req: Request<unknown, unknown, {service: string}>,  
      res: Response) => {
    const body = req.body;

    tokenRepository.deleteToken(body.service);
    return res.status(200);
  });
}
