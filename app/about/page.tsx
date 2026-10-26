import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Zap, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description:
        "Bank-grade security with multi-signature wallets, cold storage, and advanced encryption to protect your assets.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Built by traders, for traders. We listen to our community and continuously improve based on your feedback.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "High-performance trading engine capable of processing millions of transactions per second with minimal latency.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Available worldwide with support for multiple languages, currencies, and local payment methods.",
    },
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former Goldman Sachs VP with 15+ years in traditional finance and blockchain technology.",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Google engineer specializing in high-frequency trading systems and cryptocurrency infrastructure.",
    },
    {
      name: "Elena Volkov",
      role: "Head of Security",
      bio: "Cybersecurity expert with experience at major exchanges, ensuring institutional-grade protection.",
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product leader from fintech startups, focused on creating intuitive trading experiences.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Bifiverse
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
            About <span className="text-accent">Bifiverse</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're building the future of cryptocurrency trading with a platform that combines institutional-grade
            security, lightning-fast execution, and an intuitive user experience that welcomes both beginners and
            professionals.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-8">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              To democratize access to cryptocurrency markets by providing a secure, transparent, and user-friendly
              trading platform that empowers individuals and institutions to participate in the digital economy with
              confidence.
            </p>
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Founded in 2021</h3>
              <p className="text-muted-foreground">
                Bifiverse was born from the vision of creating a cryptocurrency exchange that prioritizes user
                experience without compromising on security or performance. Since our launch, we've facilitated over $50
                billion in trading volume and served more than 2 million users worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-border">
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-4">
                    <value.icon className="h-12 w-12 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology & Innovation Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Technology & Innovation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Zap className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-xl font-semibold">Advanced Trading Engine</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Our proprietary matching engine processes over 1 million transactions per second with sub-millisecond
                  latency, ensuring your trades execute at the best possible prices.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Real-time order matching</li>
                  <li>• Advanced order types</li>
                  <li>• Market depth analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-xl font-semibold">Multi-Layer Security</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Bank-grade security infrastructure with cold storage, multi-signature wallets, and advanced threat
                  detection to protect your digital assets.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• 95% cold storage</li>
                  <li>• Multi-signature protection</li>
                  <li>• 24/7 monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-xl font-semibold">Global Infrastructure</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Distributed servers across multiple continents ensure low latency and high availability for users
                  worldwide, with 99.9% uptime guarantee.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Multi-region deployment</li>
                  <li>• Load balancing</li>
                  <li>• Disaster recovery</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-xl font-semibold">User-Centric Design</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Intuitive interface designed for both beginners and professional traders, with comprehensive
                  educational resources and 24/7 customer support.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Beginner-friendly interface</li>
                  <li>• Advanced trading tools</li>
                  <li>• Educational resources</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card border border-border rounded-lg p-12">
          <h2 className="text-3xl font-serif font-bold mb-4">Join the Future of Trading</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to experience the next generation of cryptocurrency trading? Join millions of users who trust
            Bifiverse.
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Start Trading Today
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
