import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, ArrowLeft, Play, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function WikiPage() {
  const tutorialCategories = [
    {
      name: "Getting Started",
      icon: BookOpen,
      description: "Essential guides for new users",
      tutorials: [
        "How to create your Bifiverse account",
        "Completing KYC verification",
        "Setting up 2FA security",
        "Making your first deposit",
      ],
    },
    {
      name: "Trading Basics",
      icon: Play,
      description: "Learn the fundamentals of crypto trading",
      tutorials: [
        "Understanding market orders vs limit orders",
        "Reading candlestick charts",
        "How to buy your first cryptocurrency",
        "Setting stop-loss and take-profit orders",
      ],
    },
    {
      name: "Advanced Features",
      icon: FileText,
      description: "Master advanced trading tools",
      tutorials: [
        "Using margin trading effectively",
        "API integration guide",
        "Advanced charting techniques",
        "Portfolio management strategies",
      ],
    },
  ]

  const faqs = [
    {
      question: "How do I get started on Bifiverse?",
      answer:
        "Getting started is easy! Simply sign up for an account, complete the KYC verification process, enable 2FA for security, and make your first deposit. Our step-by-step guide will walk you through each process.",
    },
    {
      question: "What cryptocurrencies can I trade on Bifiverse?",
      answer:
        "Bifiverse supports major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Binance Coin (BNB), Toncoin (TON), Sui (SUI), Pi Network (PI), and stablecoins like USDC and USDT. We also support fiat rails through PayPal, Skrill, and Neteller.",
    },
    {
      question: "What are the trading fees?",
      answer:
        "Our trading fees are competitive and transparent. Spot trading fees start at 0.1% for both maker and taker orders. Pro users enjoy reduced fees of 0.05%, while enterprise clients get as low as 0.02%. There are no hidden fees.",
    },
    {
      question: "How secure is my money on Bifiverse?",
      answer:
        "Security is our top priority. We use bank-grade security with 95% of funds stored in cold storage, multi-signature wallets, advanced encryption, and 24/7 monitoring. Our platform has never been hacked since launch.",
    },
    {
      question: "Can I trade on mobile?",
      answer:
        "Yes! Bifiverse offers a fully-featured mobile app available on both iOS and Android. You can trade, monitor your portfolio, and manage your account on the go with the same security and features as our web platform.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including bank transfers, credit/debit cards, PayPal, Skrill, Neteller, and cryptocurrency deposits. For Nigerian users, we support local bank transfers with instant NGN payouts.",
    },
    {
      question: "How long do withdrawals take?",
      answer:
        "Cryptocurrency withdrawals are typically processed within 10-30 minutes. Fiat withdrawals to bank accounts usually take 1-3 business days depending on your bank and location. We process withdrawals 24/7.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes! We provide 24/7 customer support through live chat, email, and our in-app messaging system. Pro and Enterprise users get priority support with dedicated account managers.",
    },
    {
      question: "Can I use the API for automated trading?",
      answer:
        "We offer comprehensive REST and WebSocket APIs for automated trading, portfolio management, and market data access. API access is available for Pro and Enterprise users with detailed documentation and code examples.",
    },
    {
      question: "What is margin trading and how does it work?",
      answer:
        "Margin trading allows you to borrow funds to increase your trading position. We offer up to 5x leverage for Pro users and up to 20x for Enterprise clients. Please note that margin trading involves higher risk and potential for greater losses.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Bifimoto
            </Link>
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
            Bifimoto <span className="text-accent">Guides</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A practical introduction to the app's assets, order flow, and transaction history.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Tutorials & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tutorialCategories.map((category, index) => (
              <Card key={index} className="border-border hover:border-accent transition-colors">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <category.icon className="h-12 w-12 text-accent" />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {category.tutorials.map((tutorial, tutorialIndex) => (
                      <li key={tutorialIndex} className="flex items-start">
                        <Play className="h-4 w-4 text-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tutorial}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">View Tutorials</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <HelpCircle className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about trading, security, fees, and platform features.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:text-accent">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="text-center bg-card border border-border rounded-lg p-12">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Now that you've learned the basics, it's time to put your knowledge into practice. Join Bifiverse today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Create Account
            </Button>
            <Button size="lg" variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
