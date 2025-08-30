import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CodeFetchDto {
  @IsString()
  @IsNotEmpty()
  codeUrl: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
