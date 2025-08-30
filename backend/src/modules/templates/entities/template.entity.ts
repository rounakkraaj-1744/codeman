import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ required: true })
  codeurl: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
