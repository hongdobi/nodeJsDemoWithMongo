import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Node.js Demo With Mongo
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
          Next.js frontend is ready for the authentication API.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
          This app will connect to the Express backend for registration, login,
          token refresh, logout, and protected user profile requests.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/"
          >
            Frontend Home
          </Link>
          <a
            className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-500"
            href="http://localhost:5000"
          >
            Backend API
          </a>
        </div>
      </main>
    </div>
  );
}
