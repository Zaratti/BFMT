import { Button } from "@/components/ui/button"
import type { SocialProvider } from "@/src/modules/identity/domain/authentication"

interface SocialAuthButtonsProps {
  onSelect: (provider: SocialProvider) => void
  disabled?: boolean
}

export function SocialAuthButtons({ onSelect, disabled = false }: SocialAuthButtonsProps) {
  return (
    <div className="mb-6 space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-transparent hover:bg-accent/10"
        onClick={() => onSelect("x")}
        disabled={disabled}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Continue with X
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-transparent hover:bg-accent/10"
        onClick={() => onSelect("google")}
        disabled={disabled}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.98 46.98 31.87 46.98 24.55Z" />
          <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.94 23.94 0 0 0 0 21.56l7.98-6.19Z" />
          <path fill="#34A853" d="M24 48c6.47 0 11.91-2.13 15.88-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>
        Continue with Google
      </Button>
    </div>
  )
}
