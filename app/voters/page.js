import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { KEY_DATES } from "../../lib/constants";

export default function VotersPage() {
  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>For Voters</h1>
          <p>Everything you need to know before you vote.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          <Step n="1" title="Confirm you're eligible" body="Every registered 400-Level Mass Communication student is eligible to vote — once per position." />
          <Step n="2" title="Review the candidates" body="Visit the Candidates page to see who's running, their photos, and their manifestos before you decide." />
          <Step
            n="3"
            title="Cast your vote"
            body="Go to the voting page, pick a position, select your candidate, confirm with your email, and submit. Repeat for each of the 9 positions you want to vote in."
          />
          <Step n="4" title="One vote per position" body="Each email address can vote only once per position — a second attempt with the same email will be rejected." />
          <Step n="5" title="Watch results live" body="Results update automatically on the Results page as votes come in — during and after the voting window." />

          <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/vote" className="btn-primary">Go to voting page →</Link>
            <Link href="/apply" className="btn-secondary">Application page</Link>
          </div>

          <div className="signup-band" style={{ marginTop: 44 }}>
            <div className="signup-band-left">
              <div>
                <div className="signup-title">Voting window</div>
                <div className="signup-desc">Opens {KEY_DATES.votingOpens} · Closes {KEY_DATES.votingCloses}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Step({ n, title, body }) {
  return (
    <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", color: "var(--paper-alt)",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16.5, color: "var(--navy)", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14.5, color: "var(--slate)", lineHeight: 1.65 }}>{body}</div>
      </div>
    </div>
  );
}
