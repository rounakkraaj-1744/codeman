import { Schema, model, models, Document, Types } from "mongoose";

export interface ISession extends Document {
  sessionToken: string;
  user: Types.ObjectId;
  expires: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionToken: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", required: true
    },
    expires: {
        type: Date,
        required: true
    },
  }, { timestamps: true }
);

export const Session = models.Session<ISession> || model<ISession>("Session", sessionSchema);