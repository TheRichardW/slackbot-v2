import sqlite from 'better-sqlite3';
import { Token } from "../types/token";
import tokenTable from "../tables/tokenTable";

export class TokenRepository {
  private db: sqlite.Database;

  constructor(dbInstance: sqlite.Database) {
    this.db = dbInstance;
  }

  public initialize(): void {
    this.db.exec(tokenTable);
    console.log("Token table checked/created successfully.");
  }

  addToken(
    service: string,
    access_token: string,
    refresh_token: string,
    expires_in: number
  ): Token {
    const query = `INSERT INTO token (service, access_token, refresh_token, expires_in, updated_at) VALUES (?, ?, ?, ?, ?)`;

    const result = this.db.prepare(query).run(
      service,
      access_token,
      refresh_token,
      expires_in,
      Date.now()
    );

    const lastInsertRowid = result.lastInsertRowid;

    if (typeof lastInsertRowid === 'number' || typeof lastInsertRowid === 'bigint') {
      const newToken = this.getTokenById(Number(lastInsertRowid));
      if (newToken != undefined) return newToken;
    }

    throw new Error("Failed to insert token");
  }

  getTokenById(id: number): Token | undefined {
    const query = `SELECT * FROM token WHERE id = ?`;
    const record = this.db.prepare(query).get(id);

    if (!record) {
      return undefined; // Explicitly return undefined if no record is found
    }

    return record as Token; // Type-casting to Token
  }

  getToken(service: string): Token | undefined {
    const sql = "SELECT * FROM token WHERE service = ?";
    const result = this.db.prepare(sql).get(service);

    if (!result) {
      return undefined;
    }

    return result as Token;
  }

  updateToken(
    service: string,
    access_token: string,
    refresh_token: string,
    expires_in: number
  ): string {
    const sql = `
      UPDATE token 
      SET service = ?, access_token = ?, refresh_token = ?, expires_in = ?, updated_at = ? 
      WHERE service = ?
    `;

    this.db.prepare(sql).run(
      service,
      access_token,
      refresh_token,
      expires_in,
      Date.now(),
      service
    );

    console.log("Token updated successfully.");
    return "token";
  }
}
