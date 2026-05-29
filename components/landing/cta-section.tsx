import Link from "next/link";
import { GitPullRequest } from "lucide-react";

export function CTASection() {
  return (
    <section className="px-4 sm:px-6 md:px-8 bg-background">
      <div className="mx-auto max-w-4xl text-center py-14">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">Ready to showcase your contributions?</h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
          Start using ShowPR today to visualize, manage, and share your GitHub pull requests with the world.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/dashboard" 
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <GitPullRequest className="mr-2 h-5 w-5" />
            Get Started
          </Link>
        </div>
      </div>
        <p className="text-muted-foreground text-xs text-center pb-4">Built with care by the <a href="https://github.com/santhosh-005/ShowPR-Community" target="_blank" className="underline text-primary">ShowPR Community</a>. Licensed under MIT.</p>
    </section>
  );
}