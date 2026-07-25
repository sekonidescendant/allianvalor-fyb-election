import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>Contact the Electoral Desk</h1>
          <p>
            For Chairman/Vice Chairman eligibility inquiries, or anything else
            not covered on this site.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="wrap-narrow">
          <div className="cand-card" style={{ maxWidth: 480 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16.5, color: "var(--navy)", marginBottom: 14 }}>
              Reach us directly
            </div>
            <div style={{ fontSize: 14.5, color: "var(--slate)", lineHeight: 1.8 }}>
              Phone / WhatsApp: <strong style={{ color: "var(--navy)" }}>[Insert phone number]</strong>
              <br />
              Email: <strong style={{ color: "var(--navy)" }}>Talkwithsekoni@gmail.com</strong>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
