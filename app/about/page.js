import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>About Allianvalor Decides '26</h1>
          <p>The official election system for the FUOYE 400-Level FYB Committee, 2026/27 session.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow">
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--navy)", marginBottom: 10 }}>
                What is the FYB Committee?
              </h2>
              <p style={{ color: "var(--slate)", fontSize: 15, lineHeight: 1.7 }}>
                The FYB Committee represents the 400-Level Mass Communication
                class through the final year of study — coordinating events,
                welfare, finances, and communication on behalf of the class.
                Nine positions make up the committee, each elected directly by
                the class.
              </p>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--navy)", marginBottom: 10 }}>
                Why Allianvalor Decides?
              </h2>
              <p style={{ color: "var(--slate)", fontSize: 15, lineHeight: 1.7 }}>
                Allianvalor Decides '26 was built to make the election process
                transparent and accessible to every member of the class —
                a clear way to apply, a fair way to review candidates, and an
                open way to vote and see results as they happen.
              </p>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--navy)", marginBottom: 10 }}>
                How the process works
              </h2>
              <p style={{ color: "var(--slate)", fontSize: 15, lineHeight: 1.7 }}>
                Aspiring candidates apply online with their manifesto. The
                electoral desk reviews and approves candidates for the ballot.
                Once voting opens, every 400-Level student can vote once per
                position. Results are visible live throughout the voting
                window.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
