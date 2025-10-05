import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Satellite } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import logo from "../../public/logo.png"

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={logo.src} alt="WeatherWay" className="w-[5vh] h-[5vh]" />
            <span className="font-semibold text-lg tracking-tight">WeatherWay</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#nasa-data" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              NASA Data
            </Link>
            <Link href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </Link>
            <Link href="#reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Reports
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/search"
              className="liquid-glass rounded-full backdrop-blur-sm hover:shadow-xl hover:shadow-foreground/10 transition-all duration-400 cursor-pointer"
            >
            <Button className="liquid-glass bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 rounded-full px-6 backdrop-blur-sm transition-all duration-400 cursor-pointer">
              Try Demo
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
