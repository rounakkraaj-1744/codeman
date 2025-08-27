import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  username?: string;
  provider?: string;
  providerId?: string;
  accounts: Types.ObjectId[];
  sessions: Types.ObjectId[];
  templates: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    emailVerified: Date,
    image: String,
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    provider: String,
    providerId: String,
    accounts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Account"
        }
    ],
    sessions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Session"
        }
    ],
    templates: [
        {
            type: Schema.Types.ObjectId,
            ref: "Template"
        }
    ],
  }, { timestamps: true });

export const User = models.User<IUser> || model<IUser>("User", userSchema);