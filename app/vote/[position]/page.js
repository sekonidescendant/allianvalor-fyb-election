"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export default function VotePage() {
  const params = useParams();
  const slug = params.position;

  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [email, setEmail] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/candidates/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setPosition(d.position);
          setCandidates(d.candidates);
          setVotingOpen(d.votingOpen);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, candidateId: selectedId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="wrap-narrow" style={{ padding: "48px 0" }}>
          <p style={{ color: "var(--slate)", fontSize: 14 }}>Loading ballot…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (status === "done") {
    const votedFor = candidates.find((c) => c.id === selectedId);
    return (
      <>
        <Nav />
        <div className="wrap-narrow">
          <div className="confirm">
            <div className="confirm-stamp">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Vote recorded</h2>
            <p>
              Your vote for <strong>{votedFor?.fullName}</strong> — {position} — has been counted.
            </p>
            <p>You cannot vote again for this position from this email.</p>
            <div className="confirm-links">
              <Link href="/vote" className="confirm-link">Vote another position</Link>
              <Link href="/results" className="confirm-link">View live results</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <Link href="/vote" className="back-link">← All positions</Link>
          <h1>{position}</h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          {!votingOpen && (
            <div className="status-banner-block closed">
              <span className="status-dot" />
              Voting is currently closed for this election.
            </div>
          )}

          <p style={{ fontSize: 14, color: "var(--slate)", marginBottom: 24 }}>
            {candidates.length === 0
              ? "No approved candidates yet for this position."
              : "Select one candidate, then confirm with your email."}
          </p>

          {!showEmailStep ? (
            <>
              <div className="ballot-list">
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className={`ballot-card ${selectedId === c.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    {c.photo ? (
                      <img src={c.photo} alt={c.fullName} className="ballot-photo" />
                    ) : (
                      <div className="ballot-photo-placeholder">{c.fullName.charAt(0)}</div>
                    )}
                    <div className="ballot-info">
                      <div className="ballot-name">{c.fullName}</div>
                      <div className={`ballot-manifesto ${expandedId === c.id ? "expanded" : ""}`}>
                        {c.manifesto}
                      </div>
                      {c.manifesto && c.manifesto.length > 160 && (
                        <button
                          type="button"
                          className="ballot-readmore"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === c.id ? null : c.id);
                          }}
                        >
                          {expandedId === c.id ? "Show less" : "Read full manifesto"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {candidates.length > 0 && (
                <button
                  className="btn-block"
                  disabled={!selectedId || !votingOpen}
                  onClick={() => setShowEmailStep(true)}
                >
                  Continue →
                </button>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="ballot-card selected" style={{ marginBottom: 24, cursor: "default" }}>
                {(() => {
                  const c = candidates.find((c) => c.id === selectedId);
                  return (
                    <>
                      {c.photo ? (
                        <img src={c.photo} alt={c.fullName} className="ballot-photo" />
                      ) : (
                        <div className="ballot-photo-placeholder">{c.fullName.charAt(0)}</div>
                      )}
                      <div className="ballot-info">
                        <div className="ballot-name">{c.fullName}</div>
                        <div style={{ fontSize: 11.5, color: "var(--slate)", fontWeight: 600 }}>
                          Your selection for {position}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="field">
                <label htmlFor="email">Confirm with your email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {errorMsg && <div className="error-text">{errorMsg}</div>}
              </div>

              <button className="btn-block" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting…" : "Cast vote"}
              </button>
              <button
                type="button"
                className="btn-block-outline"
                style={{ marginTop: 12 }}
                onClick={() => setShowEmailStep(false)}
              >
                ← Change selection
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
