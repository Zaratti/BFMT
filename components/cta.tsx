"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function CTA() {
  const { t } = useI18n()

  return (
    <section className="py-16 sm:py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary-foreground mb-4 sm:mb-6 px-4 sm:px-0">
            Ready to explore Bifimoto?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Create an account to explore the asset and transaction experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0">
            <div className="flex items-center text-primary-foreground/90 text-sm sm:text-base">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
              Email and social sign-in
            </div>
            <div className="flex items-center text-primary-foreground/90 text-sm sm:text-base">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
              Clear order details
            </div>
            <div className="flex items-center text-primary-foreground/90 text-sm sm:text-base">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
              Searchable activity
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" className="w-full sm:w-auto bg-background hover:bg-background/90 text-foreground" asChild>
              <a href="/sign-up">
                {t("getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <a href="/contact">Contact support</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
