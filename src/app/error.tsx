"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="state-page">
      <p className="eyebrow">Runtime exception</p>
      <h1>Something slipped the happy path.</h1>
      <p>The failure is isolated. Try rendering this route again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
