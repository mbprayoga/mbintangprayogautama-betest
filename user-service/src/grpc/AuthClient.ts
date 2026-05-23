import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.resolve(__dirname, "../../../proto/auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as Record<
  string,
  any
>;
const authProto = protoDescriptor["auth"];

export interface ValidateTokenResult {
  valid: boolean;
  subject: string;
  error: string;
}

export interface GenerateTokenResult {
  token: string;
}

export class AuthClient {
  private readonly client: any;

  constructor(grpcUrl: string) {
    this.client = new authProto.AuthService(
      grpcUrl,
      grpc.credentials.createInsecure(),
    );
  }

  validateToken(token: string): Promise<ValidateTokenResult> {
    return new Promise((resolve, reject) => {
      this.client.ValidateToken(
        { token },
        (err: Error | null, response: ValidateTokenResult) => {
          if (err) return reject(err);
          resolve(response);
        },
      );
    });
  }

  generateToken(subject: string): Promise<GenerateTokenResult> {
    return new Promise((resolve, reject) => {
      this.client.GenerateToken(
        { subject },
        (err: Error | null, response: GenerateTokenResult) => {
          if (err) return reject(err);
          resolve(response);
        },
      );
    });
  }
}
