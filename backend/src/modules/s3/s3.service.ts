// S3 upload service mirroring uploadToS3 used in Next.js routes
import { Injectable, InternalServerErrorException } from "@nestjs/common"
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
    this.client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
    })
    this.bucket = process.env.AWS_S3_BUCKET || ""
  }

  async uploadToS3(args: UploadArgs): Promise<string> {
    try {
      const key = this.buildKey(args.fileName)
      const body = "file" in args ? args.file : Buffer.from(args.content, "utf-8")

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: args.contentType,
        }),
      )

      const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL
      // If using a public CDN or bucket website, set AWS_S3_PUBLIC_BASE_URL like https://my-bucket.s3.amazonaws.com
      return baseUrl ? `${baseUrl}/${key}` : `https://${this.bucket}.s3.amazonaws.com/${key}`
    } catch (e) {
      throw new InternalServerErrorException("Failed to upload to storage")
    }
  }

  async deleteFromS3(keyOrUrl: string): Promise<void> {
    try {
      const key = keyOrUrl.startsWith("http") ? new URL(keyOrUrl).pathname.replace(/^\//, "") : keyOrUrl

      if (!key) return

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
    } catch (e) {
      // Non-fatal: deletion should not block DB deletion per original behavior
      // eslint-disable-next-line no-console
      console.error("Error deleting S3 object:", e)
    }
  }

  private buildKey(fileName: string) {
    const cleanName = fileName.replace(/\s+/g, "-").toLowerCase()
    const ext = extname(cleanName) || ""
    return `code/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext || ""}`
  }
}
