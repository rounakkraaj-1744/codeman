import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { TemplatesService } from "./templates.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import type { Express } from "express";

@Controller("templates")
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}

  @Get()
  async list() {
    return this.svc.listAll();
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.svc.getOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Body() rawBody: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ 
            fileType: /\.(js|ts|tsx|jsx|py|java|rs|cpp|c|go|txt|md|json|xml|html|css|sql|sh|bat|yml|yaml)$/i 
          }),
        ],
        fileIsRequired: false,
      })
    ) file?: Express.Multer.File
  ) {
    console.log("Create request received:", {
      hasFile: !!file,
      fileSize: file?.size,
      fileName: file?.originalname,
      bodyKeys: Object.keys(rawBody || {}),
      title: rawBody?.title,
      hasCode: !!rawBody?.code
    });

    // Manual validation since ValidationPipe doesn't work well with multipart/form-data
    if (!rawBody?.title?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Title is required and cannot be empty"
      });
    }

    if (!rawBody?.description?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Description is required and cannot be empty"
      });
    }

    if (!rawBody?.tags?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Tags are required and cannot be empty"
      });
    }

    // Validate that either file or code is provided
    const hasFile = file && file.buffer && file.size > 0;
    const hasCode = rawBody?.code && rawBody.code.trim();
    
    if (!hasFile && !hasCode) {
      throw new BadRequestException({
        success: false,
        error: "Either a file upload or code content must be provided",
      });
    }

    // Create and validate DTO
    const dto: CreateTemplateDto = {
      title: rawBody.title.trim(),
      description: rawBody.description.trim(),
      tags: rawBody.tags.trim(),
      code: hasCode ? rawBody.code.trim() : undefined,
    };

    // Optional: Use class-validator for additional validation
    const dtoInstance = plainToClass(CreateTemplateDto, dto);
    const validationErrors = await validate(dtoInstance);
    
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map(error => Object.values(error.constraints || {}).join(", "))
        .join("; ");
      
      throw new BadRequestException({
        success: false,
        error: `Validation failed: ${errorMessages}`,
      });
    }

    try {
      return await this.svc.create(dto, file);
    } catch (error) {
      console.error("Controller error during create:", error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        success: false,
        error: "An unexpected error occurred while creating the template",
      });
    }
  }

  @Put(":id")
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Body() rawBody: any, 
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ 
            fileType: /\.(js|ts|tsx|jsx|py|java|rs|cpp|c|go|txt|md|json|xml|html|css|sql|sh|bat|yml|yaml)$/i 
          }),
        ],
        fileIsRequired: false,
      })
    ) file?: Express.Multer.File
  ) {
    console.log("Update request received:", {
      id,
      hasFile: !!file,
      fileSize: file?.size,
      fileName: file?.originalname,
      bodyKeys: Object.keys(rawBody || {}),
      title: rawBody?.title,
      hasCode: !!rawBody?.code
    });

    // Manual validation
    if (!rawBody?.title?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Title is required and cannot be empty"
      });
    }

    if (!rawBody?.description?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Description is required and cannot be empty"
      });
    }

    if (!rawBody?.tags?.trim()) {
      throw new BadRequestException({
        success: false,
        error: "Tags are required and cannot be empty"
      });
    }

    // Create DTO
    const dto: UpdateTemplateDto = {
      title: rawBody.title.trim(),
      description: rawBody.description.trim(),
      tags: rawBody.tags.trim(),
      code: rawBody?.code ? rawBody.code.trim() : undefined,
    };

    // Optional: Use class-validator for additional validation
    const dtoInstance = plainToClass(UpdateTemplateDto, dto);
    const validationErrors = await validate(dtoInstance);
    
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map(error => Object.values(error.constraints || {}).join(", "))
        .join("; ");
      
      throw new BadRequestException({
        success: false,
        error: `Validation failed: ${errorMessages}`,
      });
    }

    try {
      return await this.svc.update(id, dto, file);
    } catch (error) {
      console.error("Controller error during update:", error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        success: false,
        error: "An unexpected error occurred while updating the template",
      });
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      return await this.svc.delete(id);
    } catch (error) {
      console.error("Controller error during delete:", error);
      
      if (error instanceof BadRequestException || error.name === 'NotFoundException') {
        throw error;
      }
      
      throw new BadRequestException({
        success: false,
        error: "An unexpected error occurred while deleting the template",
      });
    }
  }
}