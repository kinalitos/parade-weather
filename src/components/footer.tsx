import Link from "next/link"
import { Satellite } from "lucide-react"
import logo from "../../public/logo.png"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-[#ccd5ae]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img src={logo.src} alt="WeatherWay" className="w-[5vh] h-[5vh]" />
              <span className="font-semibold text-lg">WeatherWay</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NASA-powered climate analysis for community resilience and climate justice.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#nasa-data" className="hover:text-foreground transition-colors">
                  NASA Data
                </Link>
              </li>
              <li>
                <Link href="#reports" className="hover:text-foreground transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="#impact" className="hover:text-foreground transition-colors">
                  Impact Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Use Cases</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Climate Justice
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Food Security
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Emergency Planning
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Policy Development
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  NASA Data Sources
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Climate Forecast Pro - NASA Space Apps Challenge. Built with NASA Earth Science data.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Open Source
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
