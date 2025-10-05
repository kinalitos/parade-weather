import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import backgroundImage from "../../public/serene-pastel-landscape-with-mountains-and-lake-at.jpg";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage.src}
          alt="Earth from space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl tracking-tight text-balance leading-[1.1] text-black">
            NASA-powered
            <br />
            climate intelligence
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Transform satellite data into actionable insights for climate
            justice, food security, and community resilience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/search"
              className="liquid-glass rounded-full backdrop-blur-sm hover:shadow-xl hover:shadow-foreground/10 transition-all duration-400 cursor-pointer"
            >
              <Button
                size="lg"
                variant="outline"
                className="liquid-glass rounded-full px-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-400 cursor-pointer"
              >
                View demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
