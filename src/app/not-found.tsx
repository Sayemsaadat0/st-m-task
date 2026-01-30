import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">
          Page Not Found
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button size="lg">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
