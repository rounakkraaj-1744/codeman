import { Controller, Post, BadRequestException } from "@nestjs/common"

class CodeProxyDto {
  codeUrl: string
  templateId?: string
}

@Controller("code-proxy")
export class CodeProxyController {
  @Post()
  async fetchCode(body: CodeProxyDto) {
    const { codeUrl } = body || {}
    if (!codeUrl) {
      throw new BadRequestException({ success: false, message: "Code URL is required" })
    }

    const headers: Record<string, string> = {
      Accept: "text/plain, text/*, application/octet-stream, */*",
      "User-Agent": "CodeMan-App/1.0",
      "Cache-Control": "no-cache",
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const res = await fetch(codeUrl, {
        method: "GET",
        headers,
        signal: controller.signal,
      })

      if (!res.ok) {
        let errorText = ""
        try {
          errorText = await res.text()
          // eslint-disable-next-line no-console
          console.error("S3 error response:", errorText.substring(0, 500))
        } catch {
          // ignore
        }
        return {
          success: false,
          message: `Failed to fetch code from storage: ${res.status} ${res.statusText}`,
        }
      }

      const code = await res.text()

      if (!code || code.trim().length === 0) {
        return { success: false, message: "Code file is empty or unreadable" }
      }

      if (
        code.trim().startsWith("<!DOCTYPE") ||
        code.trim().startsWith("<html") ||
        code.includes("<title>Error</title>")
      ) {
        // eslint-disable-next-line no-console
        console.error("Received HTML instead of code:", code.substring(0, 200))
        return {
          success: false,
          message: "Unable to access the code file. The file may not exist or there may be permission issues.",
        }
      }

      return { success: true, code, message: "Code fetched successfully" }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return { success: false, message: "Request timeout - the file took too long to load" }
      }
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to fetch code content",
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}
