import request from "supertest";
import { createHttpApp } from "../src/http/HttpServer";
import { AuthService } from "../src/services/AuthService";

jest.mock("../src/services/AuthService");

const MOCK_TOKEN = "mock.jwt.token";

let app: ReturnType<typeof createHttpApp>;

beforeAll(() => {
  (AuthService as jest.Mock).mockImplementation(() => ({
    generateToken: jest.fn().mockReturnValue(MOCK_TOKEN),
  }));
  app = createHttpApp(new AuthService());
});

describe("POST /auth/token", () => {
  it("returns a JWT token", async () => {
    const res = await request(app).post("/auth/token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token", MOCK_TOKEN);
  });
});

describe("GET /health", () => {
  it("returns service status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: "auth-service", status: "ok" });
  });
});
