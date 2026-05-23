import request from "supertest";
import express from "express";
import { UserController } from "../src/controllers/UserController";
import { createUserRouter } from "../src/routes/userRoutes";
import { IUserService } from "../src/services/IUserService";
import { IUser } from "../src/models/User";

jest.mock("../src/grpc/AuthClient", () => ({
  AuthClient: jest.fn().mockImplementation(() => ({
    validateToken: jest.fn().mockResolvedValue({ valid: true }),
  })),
}));

const mockUser: IUser = {
  _id: "507f1f77bcf86cd799439011",
  userName: "Test User",
  accountNumber: "ACC-001",
  emailAddress: "test@example.com",
  identityNumber: "ID-001",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockService: jest.Mocked<IUserService> = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByAccountNumber: jest.fn(),
  getUserByIdentityNumber: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

const app = express();
app.use(express.json());
app.use(
  "/users",
  createUserRouter(new UserController(mockService), "fake:50051"),
);

const AUTH = { Authorization: "Bearer fake-token" };

beforeEach(() => jest.clearAllMocks());

describe("Auth middleware", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
  });
});

describe("POST /users", () => {
  it("creates a user and returns 201", async () => {
    mockService.createUser.mockResolvedValue(mockUser);
    const res = await request(app).post("/users").set(AUTH).send({
      userName: "Test User",
      accountNumber: "ACC-001",
      emailAddress: "test@example.com",
      identityNumber: "ID-001",
    });
    expect(res.status).toBe(201);
    expect(res.body.userName).toBe("Test User");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/users")
      .set(AUTH)
      .send({ userName: "Only Name" });
    expect(res.status).toBe(400);
  });
});

describe("GET /users", () => {
  it("returns all users", async () => {
    mockService.getAllUsers.mockResolvedValue([mockUser]);
    const res = await request(app).get("/users").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /users/:id", () => {
  it("returns a user by id", async () => {
    mockService.getUserById.mockResolvedValue(mockUser);
    const res = await request(app)
      .get("/users/507f1f77bcf86cd799439011")
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.accountNumber).toBe("ACC-001");
  });

  it("returns 404 when user not found", async () => {
    mockService.getUserById.mockResolvedValue(null);
    const res = await request(app).get("/users/nonexistent").set(AUTH);
    expect(res.status).toBe(404);
  });
});

describe("GET /users/account/:accountNumber", () => {
  it("returns a user by account number", async () => {
    mockService.getUserByAccountNumber.mockResolvedValue(mockUser);
    const res = await request(app).get("/users/account/ACC-001").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.accountNumber).toBe("ACC-001");
  });

  it("returns 404 when not found", async () => {
    mockService.getUserByAccountNumber.mockResolvedValue(null);
    const res = await request(app).get("/users/account/MISSING").set(AUTH);
    expect(res.status).toBe(404);
  });
});

describe("GET /users/identity/:identityNumber", () => {
  it("returns a user by identity number", async () => {
    mockService.getUserByIdentityNumber.mockResolvedValue(mockUser);
    const res = await request(app).get("/users/identity/ID-001").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.identityNumber).toBe("ID-001");
  });

  it("returns 404 when not found", async () => {
    mockService.getUserByIdentityNumber.mockResolvedValue(null);
    const res = await request(app).get("/users/identity/MISSING").set(AUTH);
    expect(res.status).toBe(404);
  });
});

describe("PUT /users/:id", () => {
  it("updates a user and returns updated data", async () => {
    const updated: IUser = { ...mockUser, userName: "Updated" };
    mockService.updateUser.mockResolvedValue(updated);
    const res = await request(app)
      .put("/users/507f1f77bcf86cd799439011")
      .set(AUTH)
      .send({ userName: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.userName).toBe("Updated");
  });

  it("returns 404 when user not found", async () => {
    mockService.updateUser.mockResolvedValue(null);
    const res = await request(app)
      .put("/users/nonexistent")
      .set(AUTH)
      .send({ userName: "Updated" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /users/:id", () => {
  it("deletes a user and returns 204", async () => {
    mockService.deleteUser.mockResolvedValue(true);
    const res = await request(app)
      .delete("/users/507f1f77bcf86cd799439011")
      .set(AUTH);
    expect(res.status).toBe(204);
  });

  it("returns 404 when user not found", async () => {
    mockService.deleteUser.mockResolvedValue(false);
    const res = await request(app).delete("/users/nonexistent").set(AUTH);
    expect(res.status).toBe(404);
  });
});
