import { Schema, model, models, Document, Types } from "mongoose";

export interface ITemplate extends Document {
    title: string;
    user: Types.ObjectId;
    description: string;
    language: string;
    tags: string[];
    codeurl: string;
    createdAt: Date;
}

const templateSchema = new Schema<ITemplate>(
    {
        title: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // required: true
        },
        description: {
            type: String,
            required: true
        },
        language: {
            //required: true
            type: String,
        },
        tags: [
            {
                type: String
            }
        ],
        codeurl: {
            type: String,
            required: true
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

export const Template = models.Template<ITemplate> || model<ITemplate>("Template", templateSchema);