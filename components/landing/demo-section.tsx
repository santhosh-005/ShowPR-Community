"use client";

const statCards = [
  { label: "Total PRs", value: "142", color: "text-primary" },
  { label: "Merged", value: "98", color: "text-emerald-500" },
  { label: "Open", value: "12", color: "text-amber-500" },
];

const barData = [
  { label: "Mon", height: 40 },
  { label: "Tue", height: 65 },
  { label: "Wed", height: 35 },
  { label: "Thu", height: 80 },
  { label: "Fri", height: 55 },
  { label: "Sat", height: 25 },
  { label: "Sun", height: 70 },
];

const contributors = [
  { initials: "SK", bg: "bg-primary" },
  { initials: "AR", bg: "bg-emerald-500" },
  { initials: "JP", bg: "bg-amber-500" },
  { initials: "ML", bg: "bg-rose-500" },
  { initials: "+5", bg: "bg-muted" },
];

function MockDashboardPreview() {
  return (
    <div
      className="animate-float rounded-2xl border border-border bg-card shadow-2xl shadow-primary/[0.04] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Mock Titlebar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="ml-3 text-[11px] font-medium text-muted-foreground tracking-wide">
            show-pr.vercel.app
          </span>
        </div>
        <div className="flex items-center gap-3">
          {["Overview", "PRs", "Analytics"].map((tab, i) => (
            <span
              key={tab}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Mock Content */}
      <div className="p-5 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-background/50 p-3.5 text-center"
            >
              <p className={`text-xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Mini Bar Chart */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-[11px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">
            Weekly Activity
          </p>
          <div className="flex items-end justify-between gap-2 h-20">
            {barData.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="w-full rounded-md bg-primary/20 relative overflow-hidden"
                  style={{ height: `${bar.height}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-primary/20 rounded-md" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors Row */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {contributors.map((c) => (
              <div
                key={c.initials}
                className={`h-8 w-8 rounded-full ${c.bg} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-card`}
              >
                {c.initials}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            9 contributors this week
          </span>
        </div>
      </div>
    </div>
  );
}

function DemoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5 card-glow">
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export function DemoSection() {
  return (
    <section
      className="py-24 sm:py-28 landing-section bg-secondary/5 relative"
      aria-labelledby="demo-heading"
    >
      {/* Subtle separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2
            id="demo-heading"
            className="text-3xl font-bold sm:text-4xl tracking-tight mb-4"
          >
            Beautiful, <span className="text-gradient">intuitive</span>{" "}
            interface
          </h2>
          <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed">
            Interact with your GitHub data through a thoughtfully designed
            dashboard
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Mock Dashboard */}
          <div className="relative">
            {/* Background glow */}
            <div className="absolute -inset-4 bg-primary/[0.03] rounded-3xl blur-2xl pointer-events-none" />
            <MockDashboardPreview />
          </div>

          {/* Description */}
          <div className="space-y-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Powerful dashboard at your fingertips
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Gain insights into your GitHub activity with our interactive
              dashboard. Filter by repository, PR status, or search for
              specific contributions. View trends over time and see how your
              work impacts projects.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <DemoCard
                title="PR Summary"
                description="Quick stats on open, merged, and closed PRs"
              />
              <DemoCard
                title="Activity Graph"
                description="Visual timeline of your contributions"
              />
              <DemoCard
                title="PR Listing"
                description="Detailed view of all your pull requests"
              />
              <DemoCard
                title="Profile Export"
                description="Shareable view of your work"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}