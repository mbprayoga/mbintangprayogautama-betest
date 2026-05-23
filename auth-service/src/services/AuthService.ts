import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import "dotenv/config";

export interface VerifyResult {
  valid: boolean;
  subject: string;
  error: string;
}

export class AuthService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    this.secret = secret;
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
  }

  generateToken(subject: string): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
      subject,
    };
    return jwt.sign({}, this.secret, options);
  }

  verifyToken(token: string): VerifyResult {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return {
        valid: true,
        subject: decoded.sub ?? "",
        error: "",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { valid: false, subject: "", error: message };
    }
  }
}
