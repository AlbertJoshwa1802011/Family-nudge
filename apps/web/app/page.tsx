export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.25rem", margin: "0 0 0.5rem" }}>
        Family-nudge
      </h1>
      <p style={{ maxWidth: 520, color: "var(--muted)" }}>
        Reminders that escalate until they land, and an encrypted family
        document vault with an audit trail on every touch.
      </p>
      <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--muted)" }}>
        Week 1 scaffold — auth, family, reminders, vault coming next.
      </p>
    </main>
  );
}
