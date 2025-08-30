import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema({ timestamps: true })
export class Template extends Document {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ required: true })
  codeurl: string
}

export const TemplateSchema = SchemaFactory.createForClass(Template)
