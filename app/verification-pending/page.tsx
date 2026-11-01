import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerificationPendingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <section className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl font-serif font-bold text-card-foreground">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please click the verification link in your email to activate your account. The link expires according
                to the authentication settings for this Bifimoto project.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or contact support if you need assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  )
}
