import { Schema, model, models, Document } from "mongoose";

export interface IVerificationToken extends Document {
    identifier: string;
    token: string;
    expires: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>({
    identifier: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
});

verificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export const VerificationToken = models.VerificationToken<IVerificationToken> || model<IVerificationToken>("VerificationToken", verificationTokenSchema);