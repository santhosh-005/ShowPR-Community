import { GitPullRequest, GitMerge, Share2, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <GitPullRequest className="h-6 w-6" />,
    title: "Visualize Your PRs",
    description: "Get a clear view of all your pull requests across repositories with intuitive filtering and search.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "PR Analytics",
    description: "See trends and patterns in your contribution activity with beautiful charts and real-time stats.",
  },
  {
    icon: <GitMerge className="h-6 w-6" />,
    title: "Track Contributions",
    description: "Monitor your open, merged, and closed PRs with real-time updates and detailed summaries.",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Shareable Profiles",
    description: "Create a public profile to showcase your GitHub contributions on your resume or portfolio.",
  },
];

export function FeatureSection() {
  return (
    <section
      className="py-24 sm:py-28 landing-section bg-background relative"
      aria-labelledby="features-heading"
    >
      {/* Subtle separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl font-bold sm:text-4xl tracking-tight mb-4"
          >
            Everything you need to{" "}
            <span className="text-gradient">showcase your work</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed">
            ShowPR provides powerful tools for developers to manage and
            highlight their contributions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.04] hover:-translate-y-0.5 card-glow"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}