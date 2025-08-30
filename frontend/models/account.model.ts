import { Schema, model, models, Document, Types } from "mongoose";

export interface IAccount extends Document {
  user: Types.ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

const accountSchema = new Schema<IAccount>(
  {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", required: true
    },
    type: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    providerAccountId: {
        type: String,
        required: true
    },
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
  }, { timestamps: true });

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const Account = models.Account<IAccount> || model<IAccount>("Account", accountSchema);