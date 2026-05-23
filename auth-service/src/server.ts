import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import "dotenv/config";
import { AuthService } from "./services/AuthService";
import { createHttpApp } from "./http/HttpServer";

const PROTO_PATH = path.resolve(__dirname, "../../proto/auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const authProto = protoDescriptor.auth;

interface GenerateTokenRequest {
  subject: string;
}

interface ValidateTokenRequest {
  token: string;
}

type UnaryCallback<T> = (error: grpc.ServiceError | null, response: T) => void;

const authService = new AuthService();

function generateToken(
  _call: grpc.ServerUnaryCall<GenerateTokenRequest, { token: string }>,
  callback: UnaryCallback<{ token: string }>,
): void {
  const token = authService.generateToken("demo-user");
  callback(null, { token });
}

function validateToken(
  call: grpc.ServerUnaryCall<ValidateTokenRequest, object>,
  callback: UnaryCallback<object>,
): void {
  const result = authService.verifyToken(call.request.token);
  callback(null, result);
}

function main(): void {
  const grpcPort = process.env.GRPC_PORT ?? "50051";
  const httpPort = process.env.HTTP_PORT ?? "3001";
  const server = new grpc.Server();

  server.addService(authProto.AuthService.service, {
    GenerateToken: generateToken,
    ValidateToken: validateToken,
  });

  server.bindAsync(
    `0.0.0.0:${grpcPort}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("Failed to bind gRPC server:", err);
        process.exit(1);
      }
      console.log(`Auth gRPC server listening on port ${boundPort}`);
    },
  );

  const httpApp = createHttpApp(authService);
  httpApp.listen(Number(httpPort), () => {
    console.log(`Auth HTTP server listening on port ${httpPort}`);
  });
}

main();
