"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { POSITIONS } from "../../lib/constants";

export default function CandidatesPage() {
  const [loading, setLoading] = useState(true);
  const [byPosition, setByPosition] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setByPosition(d.positions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allCandidates = useMemo(() => {
    const flat = [];
    for (const group of byPosition) {
      for (const c of group.candidates) flat.push({ ...c, position: group.position });
    }
    return flat;
  }, [byPosition]);

  const filtered = filter === "All" ? allCandidates : allCandidates.filter((c) => c.position === filter);

  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap">
          <h1>Candidates</h1>
          <p>Approved candidates for the 2026/27 FYB Committee, by position.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="filter-row">
            <button className={`filter-pill ${filter === "All" ? "active" : ""}`} onClick={() => setFilter("All")}>All</button>
            {POSITIONS.map((p) => (
              <button key={p} className={`filter-pill ${filter === p ? "active" : ""}`} onClick={() => setFilter(p)}>{p}</button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "var(--slate)", fontSize: 14 }}>Loading candidates…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--slate)", fontSize: 14 }}>
              No approved candidates yet{filter !== "All" ? ` for ${filter}` : ""}. Check back soon.
            </p>
          ) : (
            <div className="cand-grid">
              {filtered.map((c) => (
                <div className="cand-card" key={c.id}>
                  {c.photo ? (
                    <img src={c.photo} alt={c.fullName} className="cand-photo" />
                  ) : (
                    <div className="cand-photo-placeholder">{c.fullName.charAt(0)}</div>
                  )}
                  <div className="cand-name">{c.fullName}</div>
                  <div className="cand-pos">{c.position}</div>
                  <div className="cand-manifesto">{c.manifesto}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
