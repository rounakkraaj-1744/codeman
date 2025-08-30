import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  // Raw tags string "a.b.c" like original; will be split server-side
  @IsString()
  @IsNotEmpty()
  tags: string

  // Optional string code when not uploading a file
  @IsOptional()
  @IsString()
  code?: string
}
