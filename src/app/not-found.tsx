import Link from "next/link";
export default function NotFound() {
  return (
    <main className="state-page">
      <p className="eyebrow">404 / Route not found</p>
      <h1>This path isn’t in the system.</h1>
      <p>The resource may have moved, or the URL may be incomplete.</p>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </main>
  );
}
