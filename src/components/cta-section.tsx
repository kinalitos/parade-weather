import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-[hsl(54,100%,94%)]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-balance">
            Ready to harness NASA data for climate action?
          </h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Join government agencies, NGOs, and research institutions using our platform to build climate resilience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="https://github.com/kinalitos/parade-weather/blob/main/README.md"
              className="liquid-glass rounded-full backdrop-blur-sm hover:shadow-xl hover:shadow-foreground/10 transition-all duration-400 cursor-pointer"
              target="_blank"
            >
            <Button
              size="lg"
              variant="outline"
              className="liquid-glass rounded-full px-8 hover:bg-background/80 hover:shadow-lg backdrop-blur-sm transition-all duration-400 cursor-pointer"
            >
              View documentation
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
