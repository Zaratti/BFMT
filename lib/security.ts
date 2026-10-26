// Security utilities for file validation and input sanitization

export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileInfo?: {
    name: string
    size: number
    type: string
    lastModified: number
  }
}

export const ALLOWED_FILE_TYPES = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // PDF magic bytes
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/jpg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function validateFile(file: File): Promise<FileValidationResult> {
  try {
    // Basic file type validation
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      }
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
      }
    }

    // Magic byte validation
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const expectedMagicBytes = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]

    if (expectedMagicBytes) {
      const fileMagicBytes = bytes.slice(0, expectedMagicBytes.length)
      const isValidMagicBytes = expectedMagicBytes.every((byte, index) => fileMagicBytes[index] === byte)

      if (!isValidMagicBytes) {
        return {
          isValid: false,
          error: "File content doesn't match the declared file type.",
        }
      }
    }

    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      },
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Failed to validate file. Please try again.",
    }
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .substring(0, 255) // Limit length
}

export function validateAccountNumber(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/\D/g, "")
  return /^\d{10}$/.test(cleaned)
}

export function validateAccountName(name: string): boolean {
  const cleaned = name.trim()
  return cleaned.length >= 2 && cleaned.length <= 100 && /^[a-zA-Z\s]+$/.test(cleaned)
}

export function logSecurityEvent(event: string, details: Record<string, any>) {
  // In production, this would send to a secure logging service
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  })
}
