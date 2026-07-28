import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  compact?: boolean;
  className?: string;
}

export function SkeletonCard({ compact, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "border rounded-xl bg-white dark:bg-zinc-900 shadow-sm",
        compact && "rounded-lg",
        "sm:rounded-xl rounded-lg",
        className
      )}
      aria-hidden="true"
    >
      <div className={cn("p-6", compact && "p-3", "sm:p-6 p-3")}>
        <div className="flex justify-between items-start gap-4 animate-pulse">
          <div className="flex-1">
            <div
              className={cn(
                "h-4 w-24 rounded-md bg-gray-300 dark:bg-zinc-700 mb-2",
                compact && "h-3 w-20 mb-1.5",
                "sm:h-4 sm:w-24 sm:mb-2 h-3 w-20 mb-1.5"
              )}
            />
            <div
              className={cn(
                "h-9 w-16 rounded-md bg-gray-300 dark:bg-zinc-700",
                compact && "h-6 w-12",
                "sm:h-9 sm:w-16 h-6 w-12"
              )}
            />
            <div
              className={cn(
                "h-3 w-28 rounded-md bg-gray-200 dark:bg-zinc-800 mt-2",
                compact && "h-2.5 w-24 mt-1.5",
                "sm:h-3 sm:w-28 sm:mt-2 h-2.5 w-24 mt-1.5"
              )}
            />
          </div>

          <div
            className={cn(
              "p-2 rounded-full bg-gray-200 dark:bg-zinc-800",
              compact && "p-1",
              "sm:p-2 p-1"
            )}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-full bg-gray-300 dark:bg-zinc-700",
                compact && "h-6 w-6",
                "sm:h-7 sm:w-7 h-6 w-6"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
