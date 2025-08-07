import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3"
import {randomUUID} from "crypto"

const s3 = new S3Client ({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
})

export async function uploadToS3({ file, content, fileName, contentType = "text/plain"}: {
  file?: Buffer
  content?: string
  fileName: string
  contentType?: string
}): Promise<string> {
    
    const key = `templates/${randomUUID()}-${fileName}`
    const body = file ?? Buffer.from (content || "", "utf-8")

    await s3.send (
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType
        })
    )
    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
}