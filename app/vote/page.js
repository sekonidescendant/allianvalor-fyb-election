"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { isAllowedVoterEmail } from "../../lib/constants";

export default function VotePage() {
  const [loading, setLoading] = useState(true);
  const [byPosition, setByPosition] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [selections, setSelections] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/candidates").then((r) => r.json()),
      fetch("/api/results").then((r) => r.json()),
    ])
      .then(([candData, resultsData]) => {
        if (candData.ok) setByPosition(candData.positions);
        if (resultsData.ok) setVotingOpen(!!resultsData.votingOpen);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function selectCandidate(position, candidateId) {
    setSelections((s) => ({ ...s, [position]: s[position] === candidateId ? undefined : candidateId }));
  }

  const selectedCount = useMemo(
    () => Object.values(selections).filter(Boolean).length,
    [selections]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!isAllowedVoterEmail(email)) {
      setErrorMsg("Use your school email ending in @fuoye.edu.ng or @liondapt.com.");
      return;
    }
    const selectionList = Object.entries(selections)
      .filter(([, candidateId]) => candidateId)
      .map(([position, candidateId]) => ({ position, candidateId }));

    if (selectionList.length === 0) {
      setErrorMsg("Select at least one candidate before submitting.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/vote/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, selections: selectionList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed.");
      setResults(data.results || []);
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
    const counted = results.filter((r) => r.status === "counted").length;
    const alreadyVoted = results.filter((r) => r.status === "already_voted").length;
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
            <h2>Votes submitted</h2>
            <p>{counted} vote{counted === 1 ? "" : "s"} counted.</p>
            {alreadyVoted > 0 && (
              <p>{alreadyVoted} position{alreadyVoted === 1 ? "" : "s"} skipped — this email had already voted there.</p>
            )}
            <div className="confirm-links">
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
          <h1>Cast Your Vote</h1>
          <p>Select a candidate for each position you want to vote in, then confirm once at the bottom with your school email.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          {!votingOpen && (
            <div className="status-banner-block closed">
              <span className="status-dot" />
              Voting is currently closed.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {byPosition.map((group) => (
              <div key={group.position} style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--navy)", marginBottom: 4 }}>
                  {group.position}
                </h2>
                <p style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 14 }}>
                  {selections[group.position] ? "Selected — tap again to change" : "Tap a candidate to select"}
                </p>
                {group.candidates.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--slate)" }}>No approved candidates yet.</p>
                ) : (
                  <div className="ballot-list">
                    {group.candidates.map((c) => (
                      <div
                        key={c.id}
                        className={`ballot-card ${selections[group.position] === c.id ? "selected" : ""}`}
                        onClick={() => selectCandidate(group.position, c.id)}
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
                )}
              </div>
            ))}

            <div className="cand-card-admin" style={{ display: "block" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
                {selectedCount} position{selectedCount === 1 ? "" : "s"} selected — confirm with your school email to submit
              </div>
                           <div className="field" style={{ marginBottom: 14 }}>
                <label htmlFor="email">School email (@fuoye.edu.ng)</label>
                <input
                  id="email"
                  type="email"
                  placeholder="sekoni.isaiah.231160@fuoye.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errorMsg && <div className="error-text" style={{ marginBottom: 12 }}>{errorMsg}</div>}
              <button className="btn-block" type="submit" disabled={status === "submitting" || !votingOpen}>
                {status === "submitting" ? "Submitting…" : "Submit my votes"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
