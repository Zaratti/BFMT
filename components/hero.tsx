"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function Hero() {
  const { t } = useI18n()

  return (
    <section className="relative py-16 sm:py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            {t("heroTitle")} <span className="text-primary">{t("heroTitleBrand")}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            {t("heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <a href="/sign-up">
                {t("getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-border bg-transparent" asChild>
              <a href="#features">
                <Play className="mr-2 h-5 w-5" />
                {t("learnMore")}
              </a>
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-4xl mx-auto px-4 sm:px-0">
            <div className="aspect-video bg-card rounded-lg border border-border shadow-lg overflow-hidden">
              <img
                src="/modern-analytics-dashboard.png"
                alt="Bifimoto exchange trading interface"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
