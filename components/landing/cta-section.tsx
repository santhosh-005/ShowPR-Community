import Link from "next/link";
import { GitPullRequest, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section
      className="relative landing-section bg-background overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Subtle separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl text-center py-20 sm:py-24">
        <h2
          id="cta-heading"
          className="text-3xl font-bold sm:text-4xl tracking-tight mb-4"
        >
          Ready to{" "}
          <span className="text-gradient">showcase your contributions</span>?
        </h2>
        <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed mb-10">
          Start using ShowPR today to visualize, manage, and share your GitHub
          pull requests with the world.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/dashboard"
            className="btn-glow inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <GitPullRequest className="mr-2 h-5 w-5" />
            Get Started
          </Link>
          <a
            href="https://github.com/santhosh-005/ShowPR-Community"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-2 py-1"
          >
            View on GitHub
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Footer credit */}
      <div className="relative border-t border-border/50 py-6">
        <p className="text-muted-foreground text-xs text-center">
          Built with care by the{" "}
          <a
            href="https://github.com/santhosh-005/ShowPR-Community"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            ShowPR Community
          </a>
          . Licensed under MIT.
        </p>
      </div>
    </section>
  );
}