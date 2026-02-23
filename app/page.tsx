import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Accelerate Your Research
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover academic papers, generate AI summaries, and build comprehensive literature reviews in minutes.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link href="/search">
            <Button size="lg">Start Searching</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">View Dashboard</Button>
          </Link>
        </div>

        <div className="pt-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Multi-Source Search</h3>
              <p className="text-sm text-muted-foreground">
                Search across Semantic Scholar, OpenAlex, and CrossRef simultaneously
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">AI Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Get instant paper summaries and literature reviews powered by GPT-4o-mini
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Research Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Discover trends, gaps, and compare papers with visual analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
