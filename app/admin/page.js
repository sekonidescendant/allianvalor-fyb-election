"use client";

import { useState, useMemo } from "react";
import { POSITIONS } from "../../lib/constants";

const POSITION_FILTERS = ["All", ...POSITIONS];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [savingId, setSavingId] = useState(null);
  const [tab, setTab] = useState("candidates"); // candidates | applications

  async function callAdmin(body) {
    const res = await fetch("/api/admin/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const data = await callAdmin({ action: "list" });
      setApplications(data.applications);
      setVotingOpen(data.votingOpen);
      setAuthed(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const data = await callAdmin({ action: "list" });
      setApplications(data.applications);
      setVotingOpen(data.votingOpen);
    } finally {
      setLoading(false);
    }
  }

  async function toggleVoting(open) {
    await callAdmin({ action: "setVotingOpen", open });
    setVotingOpen(open);
  }

  async function handlePhotoChange(app, file) {
    if (!file) return;
    if (file.size > 900_000) {
      alert("Please choose a smaller image (under ~900KB works best).");
      return;
    }
    setSavingId(app.id);
    try {
      const photo = await fileToBase64(file);
      await callAdmin({
        action: "approve",
        id: app.id,
        fullName: app.fullName,
        position: app.position,
        manifesto: app.manifesto,
        photo,
        approved: app.approved,
      });
      setApplications((apps) => apps.map((a) => (a.id === app.id ? { ...a, photo } : a)));
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function toggleApprove(app) {
    setSavingId(app.id);
    try {
      const nextApproved = !app.approved;
      await callAdmin({
        action: "approve",
        id: app.id,
        fullName: app.fullName,
        position: app.position,
        manifesto: app.manifesto,
        photo: app.photo,
        approved: nextApproved,
      });
      setApplications((apps) => apps.map((a) => (a.id === app.id ? { ...a, approved: nextApproved } : a)));
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  }

  function exportCsv() {
    const rows = [
      ["Reference", "Full Name", "Phone", "Level", "Email", "Position", "Manifesto", "Approved", "Submitted At"],
      ...applications.map((a) => [
        a.id, a.fullName, a.phone, a.level, a.email, a.position,
        (a.manifesto || "").replace(/\n/g, " "), a.approved ? "Yes" : "No", a.submittedAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "allianvalor-decides-26-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => {
    if (filter === "All") return applications;
    return applications.filter((a) => a.position === filter);
  }, [applications, filter]);

  const counts = useMemo(() => {
    const c = {};
    for (const a of applications) c[a.position] = (c[a.position] || 0) + 1;
    return c;
  }, [applications]);

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <h1>Electoral Desk Access</h1>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="pw">Admin password</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </div>
            <button className="btn-block" type="submit" disabled={loading}>
              {loading ? "Checking…" : "Enter dashboard"}
            </button>
            {loginError && <div className="admin-login-error">{loginError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="wrap">
          <div className="admin-title">Allianvalor Decides '26 — Admin</div>
          <button className="export-btn" onClick={refresh} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="wrap admin-body">
        <div className="voting-toggle">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--slate)" }}>
              Voting status
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
              {votingOpen ? "Open — voters can cast ballots" : "Closed — voting disabled"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className={`toggle-btn ${votingOpen ? "on" : ""}`} onClick={() => toggleVoting(true)}>Open voting</button>
            <button className={`toggle-btn ${!votingOpen ? "off" : ""}`} onClick={() => toggleVoting(false)}>Close voting</button>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === "candidates" ? "active" : ""}`} onClick={() => setTab("candidates")}>
            Approve Candidates
          </button>
          <button className={`admin-tab ${tab === "applications" ? "active" : ""}`} onClick={() => setTab("applications")}>
            All Applications
          </button>
        </div>

        {tab === "candidates" ? (
          <>
            <p style={{ fontSize: 13.5, color: "var(--slate)", marginBottom: 20 }}>
              Approve candidates from submitted applications below. Only
              approved candidates appear on the public ballot. Add a photo for
              each — optional, but recommended.
            </p>

            <div className="admin-filter">
              {POSITION_FILTERS.map((p) => (
                <button key={p} className={`filter-pill ${filter === p ? "active" : ""}`} onClick={() => setFilter(p)}>{p}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: "var(--slate)", fontSize: 13 }}>No applications for this filter.</p>
            ) : (
              filtered.map((app) => (
                <div className={`cand-card-admin ${app.approved ? "approved" : ""}`} key={app.id}>
                  <div>
                    {app.photo ? (
                      <img src={app.photo} alt={app.fullName} className="cand-photo" />
                    ) : (
                      <div className="cand-photo-placeholder">{app.fullName.charAt(0)}</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>{app.fullName}</span>
                      <span className="admin-pos-tag">{app.position}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--slate)", lineHeight: 1.5, marginBottom: 10 }}>{app.manifesto}</div>
                    <div className="cand-actions">
                      <button
                        className={`cand-approve-btn ${app.approved ? "is-approved" : ""}`}
                        onClick={() => toggleApprove(app)}
                        disabled={savingId === app.id}
                      >
                        {app.approved ? "✓ Approved — click to remove" : "Approve for ballot"}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="cand-photo-input"
                        onChange={(e) => handlePhotoChange(app, e.target.files?.[0])}
                        disabled={savingId === app.id}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="admin-stats">
              {POSITIONS.map((p) => (
                <div className="admin-stat" key={p}>
                  <div className="admin-stat-num">{counts[p] || 0}</div>
                  <div className="admin-stat-label">{p}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div className="admin-filter" style={{ marginBottom: 0 }}>
                {POSITION_FILTERS.map((p) => (
                  <button key={p} className={`filter-pill ${filter === p ? "active" : ""}`} onClick={() => setFilter(p)}>{p}</button>
                ))}
              </div>
              <button className="export-btn" onClick={exportCsv}>Export CSV</button>
            </div>

            <div className="admin-table-wrap">
              {filtered.length === 0 ? (
                <div className="admin-empty">No applications yet for this filter.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref</th><th>Name</th><th>Phone</th><th>Level</th><th>Email</th><th>Position</th><th>Manifesto</th><th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontSize: 11, fontWeight: 600 }}>{a.id}</td>
                        <td>{a.fullName}</td>
                        <td>{a.phone}</td>
                        <td>{a.level}</td>
                        <td>{a.email}</td>
                        <td><span className="admin-pos-tag">{a.position}</span></td>
                        <td className="admin-manifesto-cell">{a.manifesto}</td>
                        <td style={{ fontSize: 11, color: "var(--slate)", whiteSpace: "nowrap" }}>
                          {new Date(a.submittedAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
