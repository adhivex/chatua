"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f7f0e4", color: "#2a1a10", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0, textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Something went wrong</h1>
          <p style={{ color: "#76624f" }}>Please try again in a moment. Your cart is safe.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "12px 20px", borderRadius: 14, border: 0, background: "#b4421a", color: "#fff", fontWeight: 600 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
