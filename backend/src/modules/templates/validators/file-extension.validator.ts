// Create this as a new file: src/templates/validators/file-extension.validator.ts
import { FileValidator } from '@nestjs/common';

export class FileExtensionValidator extends FileValidator {
  constructor(
    protected readonly validationOptions: {
      allowedExtensions: RegExp;
    },
  ) {
    super(validationOptions);
  }

  isValid(file?: any): boolean {
    if (!file) {
      return true; // Let other validators handle required file validation
    }

    const fileName = file.originalname;
    if (!fileName) {
      return false;
    }

    return this.validationOptions.allowedExtensions.test(fileName);
  }

  buildErrorMessage(): string {
    return `File extension validation failed (expected extensions matching: ${this.validationOptions.allowedExtensions})`;
  }
}