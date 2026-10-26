import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle, Activity, Server, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatusPage() {
  const systemStatus = [
    {
      icon: CheckCircle,
      title: "API Services",
      status: "Operational",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      statusColor: "text-green-500",
    },
    {
      icon: CheckCircle,
      title: "Trading Platform",
      status: "Operational",
      description:
        "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      statusColor: "text-green-500",
    },
    {
      icon: CheckCircle,
      title: "Database",
      status: "Operational",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      statusColor: "text-green-500",
    },
    {
      icon: Activity,
      title: "Network Performance",
      status: "Monitoring",
      description:
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
      statusColor: "text-blue-500",
    },
    {
      icon: Server,
      title: "Server Infrastructure",
      status: "Operational",
      description: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
      statusColor: "text-green-500",
    },
    {
      icon: Wifi,
      title: "Connectivity",
      status: "Operational",
      description:
        "Et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
      statusColor: "text-green-500",
    },
  ]

  return (
    <main className="min-h-screen">
      <Header />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
              System <span className="text-accent">Status</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systemStatus.map((system, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <system.icon className={`h-6 w-6 ${system.statusColor}`} />
                    </div>
                    <span className={`text-sm font-semibold ${system.statusColor}`}>{system.status}</span>
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-card-foreground">{system.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {system.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
