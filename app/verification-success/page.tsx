import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerificationSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <section className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-serif font-bold text-card-foreground">
                Email Verified Successfully!
              </CardTitle>
              <CardDescription className="text-muted-foreground">Your account is ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Thank you for verifying your email address. Your session is ready and you can continue to your Bifimoto
                dashboard.
              </p>
              <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard">Continue to your account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  )
}
