import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Acceptance of Terms</h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">User Responsibilities</h2>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
              rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
              explicabo.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Age Requirement</h2>
            <p>
              <strong>You must be at least eighteen (18) years old to use this service.</strong> Nemo enim ipsam
              voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
              ratione voluptatem sequi nesciunt.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Prohibited Activities</h2>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
              atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Limitation of Liability</h2>
            <p>
              Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est
              eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
            </p>

            <h2 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Changes to Terms</h2>
            <p>
              Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates
              repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
