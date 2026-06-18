"use client"
import Link from "next/link";
import { GitPullRequest, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";

// Define proper types for session
interface GitHubEmail {
  email?: string;
}

interface SessionData {
  github?: GitHubEmail;
  user?: {
    email?: string;
  };
}

export function HeroSection() {
  const { data: session, status } = useSession();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || 'dark';

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const typedSession = session as SessionData | null;

      const userEmail: string = typedSession?.github?.email || 
                        typedSession?.user?.email || 
                        "Anonymous";
      

    const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_WEBHOOK_URL;
    if (feedbackUrl) {
      await fetch(feedbackUrl, {
        method: "POST",
        headers: {
           "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          message: feedback,
          email: userEmail, 
        }),
        mode: "no-cors",
      });
    }


      setSubmitted(true);
      setFeedback("");

      setTimeout(() => {
        setShowFeedbackForm(false);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setError("Failed to submit feedback. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden landing-section py-20 sm:py-28 md:py-32"
      aria-labelledby="hero-heading"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {/* Badges Row */}
          <div className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3 mb-8">
            {/* GSSoC 2026 Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              GSSoC 2026 Extended
            </span>

            {/* Open Source Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Open Source
            </span>

            {/* Product Hunt Badge */}
            <a 
              href="https://www.producthunt.com/posts/showpr?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-showpr" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShowPR on Product Hunt"
              className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
              <Image 
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=961587&theme=${theme === 'dark' ? 'dark' : 'light'}`} 
                alt="ShowPR - Github PR dashboard | Product Hunt" 
                width={180}
                height={44}
                className="h-[30px] w-auto"
              />
            </a>
          </div>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="animate-fade-in-up-delay-1 mb-6 text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]"
          >
            Showcase your{" "}
            <span className="text-gradient">GitHub</span>{" "}
            contributions
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in-up-delay-2 mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed font-light">
            View, manage, and visually showcase your Pull Requests with an intuitive dashboard
            designed for developers who want their work to be seen.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up-delay-3 flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/dashboard"
              className="btn-glow inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <GitPullRequest className="mr-2 h-5 w-5" />
              View Dashboard
            </Link>
            {status === "unauthenticated" && (
              <Link
                href="/auth/signin"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card/50 px-8 text-sm font-medium transition-all hover:bg-accent hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Sign in with GitHub
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="animate-fade-in-up-delay-4 mt-14 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 card-glow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="flex-shrink-0 mt-0.5 md:mt-0 h-8 w-1 rounded-full bg-primary" />
              <div>
                <p className="text-sm leading-relaxed">
                  <span className="text-primary font-semibold">Coming Soon:</span>{" "}
                  <span className="font-medium">ShowPR — Extended Edition</span>{" "}
                  <span className="text-muted-foreground">with enhanced features and more.</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-expanded={showFeedbackForm}
              aria-controls="feedback-form"
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Share your thoughts
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div id="feedback-form" className="mt-4 pt-4 border-t border-border/50">
              {submitted ? (
                <p className="text-sm text-emerald-500 font-medium">Thank you for your feedback!</p>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What would you like to see in the Extended Edition?"
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    rows={3}
                    disabled={submitting}
                    aria-label="Feedback message"
                  />
                  {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !feedback.trim()}
                      className="px-5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}