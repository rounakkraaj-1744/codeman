import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdateTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  tags: string

  @IsOptional()
  @IsString()
  code?: string
}
