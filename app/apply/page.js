"use client";

import { useState } from "react";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { POSITIONS } from "../../lib/constants";

const LEVELS = ["400 Level"];
const MANIFESTO_MAX = 900;

export default function ApplyPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    level: "400 Level",
    email: "",
    position: "",
    manifesto: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [refCode, setRefCode] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^[\d+\s-]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.position) e.position = "Select the position you're contesting for.";
    if (!form.manifesto.trim()) e.manifesto = "A manifesto is required.";
    else if (form.manifesto.trim().length < 40) e.manifesto = "Tell us a bit more — at least 40 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setRefCode(data.refCode || "");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
    }
  }

  if (status === "done") {
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
            <h2>Application received</h2>
            <p>
              Your candidacy application for <strong>{form.position}</strong> has
              been logged with the Allianvalor Decides '26 electoral desk.
            </p>
            <p>A confirmation has been sent to {form.email}.</p>
            {refCode && <div className="confirm-ref">REF — {refCode}</div>}
            <div className="confirm-links">
              <a
                href="#"
                className="confirm-link"
                onClick={(e) => {
                  e.preventDefault();
                  setForm({ fullName: "", phone: "", level: "400 Level", email: "", position: "", manifesto: "" });
                  setStatus("idle");
                }}
              >
                Submit another application
              </a>
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
          <h1>Apply to Contest</h1>
          <p>
            Complete every field accurately. Your manifesto will be reviewed
            by the electoral desk before your candidacy is confirmed.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-narrow form-shell">
          <div className="cand-card-admin" style={{ display: "block", marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)", marginBottom: 8 }}>
              Notice to aspirants
            </div>
            <div style={{ fontSize: 13.5, color: "var(--slate)", lineHeight: 1.6 }}>
              This form is open to all 400-Level (2026/27) FYB aspirants only.{" "}
              <strong style={{ color: "var(--navy)" }}>Chairman</strong> and{" "}
              <strong style={{ color: "var(--navy)" }}>Vice Chairman</strong> carry
              additional, undisclosed eligibility criteria — if contesting for
              either, submit this form and separately contact the organizing
              desk directly.
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Ashefon Victoria Ope"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
              {errors.fullName && <div className="error-text">{errors.fullName}</div>}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. 0816 237 5856"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
              {errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>

            <div className="field">
              <label htmlFor="level">Level</label>
              <select id="level" value={form.level} onChange={(e) => update("level", e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="email">Your email</label>
              <input
                id="email"
                type="email"
                placeholder="e.g. victoria@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="field">
              <label htmlFor="position">Position contesting for</label>
              <select id="position" value={form.position} onChange={(e) => update("position", e.target.value)}>
                <option value="">Select a position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.position && <div className="error-text">{errors.position}</div>}
            </div>

            <div className="field">
              <label htmlFor="manifesto">Manifesto</label>
              <textarea
                id="manifesto"
                placeholder="Tell your level why you should be elected. What will you change, build, or fix?"
                maxLength={MANIFESTO_MAX}
                value={form.manifesto}
                onChange={(e) => update("manifesto", e.target.value)}
              />
              <div className={`field-count ${form.manifesto.length > MANIFESTO_MAX - 60 ? "warn" : ""}`}>
                {form.manifesto.length} / {MANIFESTO_MAX}
              </div>
              {errors.manifesto && <div className="error-text">{errors.manifesto}</div>}
            </div>

            {status === "error" && (
              <div className="error-text" style={{ marginBottom: 16 }}>
                Something went wrong sending your application. Please try again.
              </div>
            )}

            <button className="btn-block" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Submit application →"}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
