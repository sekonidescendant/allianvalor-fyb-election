"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { POSITIONS, KEY_DATES } from "../lib/constants";

export default function Home() {
  const [votingOpen, setVotingOpen] = useState(null);

  useEffect(() => {
    fetch("/api/results")
      .then((r) => r.json())
      .then((d) => setVotingOpen(!!d.votingOpen))
      .catch(() => setVotingOpen(null));
  }, []);

  return (
    <>
      <Nav />

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              Your Vote.
              <span className="accent">Your Committee.</span>
            </h1>
            <p className="hero-sub">
              The official home for the FUOYE 400L FYB Committee elections,
              2026/27 session. Apply to contest, meet your candidates, and
              vote — all in one place.
            </p>
            <div className="hero-actions">
              <Link href="/apply" className="btn-primary">
                Apply to Contest →
              </Link>
              <Link href="/vote" className="btn-secondary">
                Cast Your Vote
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <BallotArt />
          </div>
        </div>
      </header>

      <section className="journey">
        <div className="wrap">
          <div className="journey-track">
            <div className="journey-step done">
              <div className="journey-num">1</div>
              <div className="journey-label">Apply</div>
              <div className="journey-desc">Submit your candidacy and manifesto</div>
            </div>
            <div className="journey-step done">
              <div className="journey-num">2</div>
              <div className="journey-label">Approved</div>
              <div className="journey-desc">Electoral desk reviews and approves candidates</div>
            </div>
            <div className={`journey-step ${votingOpen ? "active" : ""}`}>
              <div className="journey-num">3</div>
              <div className="journey-label">Vote</div>
              <div className="journey-desc">
                {votingOpen === null ? "One vote per position" : votingOpen ? "Voting is open now" : "Voting not yet open"}
              </div>
            </div>
            <div className="journey-step">
              <div className="journey-num">4</div>
              <div className="journey-label">Results</div>
              <div className="journey-desc">Live count, visible to everyone</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head center">
            <div className="section-eyebrow">Timeline</div>
            <h2 className="section-title">Important Dates</h2>
          </div>
          <div className="card-grid">
            <InfoCard icon={<CalendarIcon />} label="Application Deadline" value={KEY_DATES.applicationDeadline} />
            <InfoCard icon={<PersonIcon />} label="Voting Opens" value={KEY_DATES.votingOpens} />
            <InfoCard icon={<BoxIcon />} label="Voting Closes" value={KEY_DATES.votingCloses} />
            <InfoCard icon={<MegaphoneIcon />} label="Results Announced" value={KEY_DATES.resultsAnnounced} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">On The Ballot</div>
            <h2 className="section-title">Positions up for election</h2>
            <p className="section-sub">
              Nine positions, one vote each. Chairman and Vice Chairman carry
              additional eligibility criteria — see the Voters page for details.
            </p>
          </div>
          <div className="position-list">
            {POSITIONS.map((p, i) => (
              <div className="position-row" key={p}>
                <div className="position-row-left">
                  <span className="position-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="position-row-name">{p}</span>
                </div>
                {(p === "Chairman" || p === "Vice Chairman") && (
                  <span className="position-row-tag">By interview</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="signup-band">
            <div className="signup-band-left">
              <div className="signup-icon">
                <MailIcon />
              </div>
              <div>
                <div className="signup-title">Questions about the election?</div>
                <div className="signup-desc">Reach the electoral desk directly for anything not covered on this site.</div>
              </div>
            </div>
            <Link href="/contact" className="btn-primary">
              Contact the desk →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="info-card">
      <div className="info-card-icon">{icon}</div>
      <div>
        <div className="info-card-label">{label}</div>
        <div className="info-card-value">{value}</div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
function MegaphoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function BallotArt() {
  return (
    <svg viewBox="0 0 320 280" fill="none">
      <circle cx="160" cy="140" r="120" fill="#E4E9F2" />
      <rect x="90" y="150" width="140" height="100" rx="6" fill="#0B1E3D" />
      <rect x="90" y="150" width="140" height="14" rx="6" fill="#16305A" />
      <text x="160" y="215" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="24" fill="#F7F8FA">VOTE</text>
      <g transform="rotate(-18 190 90)">
        <rect x="150" y="50" width="70" height="90" rx="4" fill="#FFFFFF" stroke="#0B1E3D" strokeWidth="3" />
        <path d="M168 90l12 12 22-26" stroke="#C41E3A" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
