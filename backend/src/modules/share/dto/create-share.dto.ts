import { IsMongoId, IsString } from "class-validator"

export class CreateShareDto {
  @IsString()
  @IsMongoId()
  templateId: string
}
