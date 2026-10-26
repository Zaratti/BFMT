"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Shield, Wallet, ArrowLeftRight, Globe, Headphones } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const features = [
  {
    icon: BarChart3,
    title: "Review before you trade",
    description: "See your selected asset, amount, fees, and destination details together before confirming an order.",
  },
  {
    icon: Shield,
    title: "Account security",
    description: "Sign in with your email or a supported identity provider, with protected account pages.",
  },
  {
    icon: Wallet,
    title: "Multiple asset types",
    description: "Explore crypto, stablecoin, and payment options in one straightforward interface.",
  },
  {
    icon: ArrowLeftRight,
    title: "Buy and sell flows",
    description: "Follow guided forms that make each step and required detail clear as you go.",
  },
  {
    icon: Globe,
    title: "Transaction history",
    description: "Search and filter activity by asset, type, and status, then export the visible results as CSV.",
  },
  {
    icon: Headphones,
    title: "Help when you need it",
    description: "Find support resources and contact options from the app navigation.",
  },
]

export function Features() {
  const { t } = useI18n()

  return (
    <section id="features" className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary mb-3 sm:mb-4 px-4 sm:px-0">
            {t("featuresTitle")}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            {t("featuresDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-serif font-bold text-card-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
