"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { POSITIONS, slugifyPosition } from "../../lib/constants";

export default function VoteHome() {
  const [votingOpen, setVotingOpen] = useState(null);

  useEffect(() => {
    fetch("/api/results")
      .then((r) => r.json())
      .then((d) => setVotingOpen(!!d.votingOpen))
      .catch(() => setVotingOpen(false));
  }, []);

  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>Cast Your Vote</h1>
          <p>Select a position below. You'll see approved candidates with their photo and manifesto.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          {votingOpen !== null && (
            <div className={`status-banner-block ${votingOpen ? "open" : "closed"}`}>
              <span className={`status-dot ${votingOpen ? "pulse" : ""}`} />
              {votingOpen ? "Voting is open — pick a position to vote" : "Voting is currently closed"}
            </div>
          )}

          <div className="position-list">
            {POSITIONS.map((p, i) => (
              <Link key={p} href={`/vote/${slugifyPosition(p)}`} className="position-row" style={{ display: "flex" }}>
                <div className="position-row-left">
                  <span className="position-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="position-row-name">{p}</span>
                </div>
                <span style={{ color: "var(--slate)" }}>→</span>
              </Link>
            ))}
          </div>

          <Link href="/results" className="btn-block-outline" style={{ display: "block", textAlign: "center", marginTop: 24 }}>
            View live results →
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
