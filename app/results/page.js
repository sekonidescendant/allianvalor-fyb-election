"use client";

import { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [votingOpen, setVotingOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setResults(data.results);
        setVotingOpen(data.votingOpen);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>Live Results</h1>
          <p>Updates automatically as votes are cast.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          {votingOpen !== null && (
            <div className={`status-banner-block ${votingOpen ? "open" : "closed"}`}>
              <span className={`status-dot ${votingOpen ? "pulse" : ""}`} />
              {votingOpen ? "Voting is open — live count" : "Voting closed — final tally"}
            </div>
          )}

          {loading ? (
            <p style={{ color: "var(--slate)", fontSize: 14 }}>Loading results…</p>
          ) : (
            results.map((r) => (
              <div className="results-position" key={r.position}>
                <div className="results-position-title">{r.position}</div>
                <div className="results-total">{r.totalVotes} vote{r.totalVotes === 1 ? "" : "s"} cast</div>
                {r.candidates.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--slate)" }}>No approved candidates yet.</p>
                ) : (
                  r.candidates.map((c) => {
                    const pct = r.totalVotes > 0 ? Math.round((c.votes / r.totalVotes) * 100) : 0;
                    return (
                      <div className="results-row" key={c.id}>
                        <div className="results-row-top">
                          <span className="results-name">{c.fullName}</span>
                          <span className="results-count">{c.votes} · {pct}%</span>
                        </div>
                        <div className="results-bar-track">
                          <div className="results-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
