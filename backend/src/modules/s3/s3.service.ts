// S3 upload service mirroring uploadToS3 used in Next.js routes
import { Injectable, InternalServerErrorException, BadRequestException } from "@nestjs/common"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"
import { extname } from "path"

type UploadArgs =
  | {
      file: Buffer
      fileName: string
      contentType: string
    }
  | {
      content: string
      fileName: string
      contentType: string
    }

@Injectable()
export class S3Service {
  private client: S3Client
  private bucket: string

  constructor() {
    // Validate environment variables on initialization
    if (!process.env.AWS_REGION) {
      throw new Error("AWS_REGION environment variable is required")
    }
    
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME environment variable is required")
    }
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn("AWS credentials not found in environment variables - using default credential chain")
    }

    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
      // Add timeout and retry configuration
      requestHandler: {
        requestTimeout: 30000, // 30 seconds
      },
      maxAttempts: 3,
    })
    
    this.bucket = process.env.AWS_BUCKET_NAME!

    console.log("S3 Service initialized:", {
      region: process.env.AWS_REGION,
      bucket: this.bucket,
      hasCredentials: !!process.env.AWS_ACCESS_KEY_ID,
    })
  }

  async uploadToS3(args: UploadArgs): Promise<string> {
    // Input validation
    if (!args.fileName || !args.contentType) {
      throw new BadRequestException("fileName and contentType are required")
    }

    if ("file" in args && (!args.file || args.file.length === 0)) {
      throw new BadRequestException("File buffer is empty or invalid")
    }

    if ("content" in args && (!args.content || args.content.trim().length === 0)) {
      throw new BadRequestException("Content string is empty or invalid")
    }

    const key = this.buildKey(args.fileName)
    const body = "file" in args ? args.file : Buffer.from(args.content, "utf-8")

    console.log("Starting S3 upload:", {
      bucket: this.bucket,
      key,
      contentType: args.contentType,
      bodySize: body.length,
      hasFile: "file" in args,
    })

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: args.contentType,
      })

      const result = await this.client.send(command)

      console.log("S3 upload successful:", {
        bucket: this.bucket,
        key,
        etag: result.ETag,
        size: body.length,
      })

      const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

      return fileUrl
      
    } catch (error: any) {
      console.error("S3 upload failed:", {
        error: error.message,
        code: error.code || error.name,
        bucket: this.bucket,
        key,
        region: process.env.AWS_REGION,
      })

      // Handle specific AWS S3 errors with detailed messages
      if (error.code === "NoSuchBucket") {
        throw new BadRequestException(`S3 bucket '${this.bucket}' does not exist or is not accessible`)
      }

      if (error.code === "AccessDenied") {
        throw new BadRequestException(
          "S3 access denied. Please check your AWS credentials and bucket permissions"
        )
      }

      if (error.code === "InvalidBucketName") {
        throw new BadRequestException(`Invalid S3 bucket name: '${this.bucket}'`)
      }

      if (error.code === "SignatureDoesNotMatch") {
        throw new BadRequestException(
          "AWS signature mismatch. Please check your AWS secret access key"
        )
      }

      if (error.code === "InvalidAccessKeyId") {
        throw new BadRequestException(
          "Invalid AWS access key ID. Please check your credentials"
        )
      }

      if (error.code === "TokenRefreshRequired") {
        throw new BadRequestException("AWS token has expired. Please refresh your credentials")
      }

      if (error.code === "RequestTimeout" || error.name === "TimeoutError") {
        throw new InternalServerErrorException(
          "S3 upload timed out. Please try again or check your network connection"
        )
      }

      if (error.name === "NetworkingError") {
        throw new InternalServerErrorException(
          "Network error during S3 upload. Please check your internet connection"
        )
      }

      // For connection errors
      if (error.code === "ENOTFOUND" || error.code === "ECONNRESET") {
        throw new InternalServerErrorException(
          "Unable to connect to AWS S3. Please check your network connection and AWS region"
        )
      }

      // Generic error with more context
      throw new InternalServerErrorException(
        `S3 upload failed: ${error.message || "Unknown error"} (Code: ${error.code || "N/A"})`
      )
    }
  }

  async deleteFromS3(keyOrUrl: string): Promise<void> {
    try {
      const key = keyOrUrl.startsWith("http") 
        ? new URL(keyOrUrl).pathname.replace(/^\//, "") 
        : keyOrUrl

      if (!key) {
        console.warn("Empty key provided for S3 deletion, skipping")
        return
      }

      console.log("Deleting from S3:", {
        bucket: this.bucket,
        key,
      })

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )

      console.log("S3 deletion successful:", { key })

    } catch (error: any) {
      // Non-fatal: deletion should not block DB deletion per original behavior
      console.error("Error deleting S3 object:", {
        error: error.message,
        code: error.code || error.name,
        keyOrUrl,
        bucket: this.bucket,
      })
    }
  }

  private buildKey(fileName: string): string {
    if (!fileName) {
      throw new BadRequestException("fileName cannot be empty")
    }

    const cleanName = fileName.replace(/\s+/g, "-").toLowerCase()
    const ext = extname(cleanName) || ""
    const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
    const uuid = randomUUID()
    
    const key = `code/${date}/${uuid}${ext}`
    
    console.log("Generated S3 key:", {
      originalFileName: fileName,
      cleanName,
      extension: ext,
      key,
    })

    return key
  }

  // Health check method for testing S3 connectivity
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try a simple operation to test connectivity
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3")
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1,
      })
      
      await this.client.send(command)
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: `${error.message} (Code: ${error.code || "N/A"})` 
      }
    }
  }
}