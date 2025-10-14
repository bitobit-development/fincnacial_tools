import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Retirement & Tax Planner</h1>
          <p className="text-lg text-muted-foreground">Powered by GPT-5 | South African Regulations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Link
            href="/planner"
            className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
              Retirement Planner →
            </h2>
            <p className="text-muted-foreground">
              Manual retirement projection calculator with year-by-year breakdowns and tax optimization
            </p>
          </Link>

          <Link
            href="/advisor"
            className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
              NEW
            </div>
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
              AI Financial Advisor →
            </h2>
            <p className="text-muted-foreground">
              Chat with Thando, your AI CFP® advisor. Get personalized recommendations based on 45 comprehensive questions
            </p>
          </Link>

          <Link
            href="/showcase"
            className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
              Component Showcase →
            </h2>
            <p className="text-muted-foreground">
              View all UI components and charts used in the application
            </p>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
