import { Schema, model, Document, Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId | string;
  userName: string;
  accountNumber: string;
  emailAddress: string;
  identityNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    userName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, unique: true, trim: true },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    identityNumber: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = model<UserDocument>("User", userSchema);
