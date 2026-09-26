import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }) {
  const { error } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Link href="/" className="text-sm text-dark/60 hover:underline dark:text-light/60">
            ← Back to site
          </Link>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-dark/70 dark:text-light/70">Password, then a one-time link sent to your email.</p>
        </div>
        <LoginForm linkError={error} />
      </div>
    </main>
  );
}
