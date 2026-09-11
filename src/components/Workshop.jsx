import { useState } from "react";
import CornerMarks from "./CornerMarks";

const EXPERIMENTS = [
  {
    code: "EXPERIMENT 01",
    title: "THE WORK",
    status: "ACTIVE",
    note: "Live build in progress.",
  },
  {
    code: "EXPERIMENT 02",
    title: "CLASSIFIED",
    status: "LOCKED",
    note: "Access restricted.",
  },
  {
    code: "EXPERIMENT 03",
    title: "COMING SOON",
    status: "STANDBY",
    note: "Awaiting activation.",
  },
];

const NAV_ITEMS = ["WORKSHOP", "WORKMEN", "EXPERIMENTS"];

export default function Workshop({ workman, onExit }) {
  const [activeNav, setActiveNav] = useState("WORKSHOP");

  return (
    <div className="screen workshop">
      <div className="grid-bg" />
      <CornerMarks bl="THE WORK CONTINUES." br={`#${workman.workmanId}`} />

      <header className="workshop-header">
        <span className="brand small">HOODS WORKS</span>
        <nav className="workshop-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={`nav-item mono ${activeNav === item ? "nav-item--active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <button className="logout-link mono" onClick={onExit}>
          EXIT
        </button>
      </header>

      <main className="workshop-main">
        <span className="label sub-label">HW / WORKSHOP</span>
        <h1 className="headline workshop-headline">THE WORKSHOP</h1>
        <p className="support-text">Where the work gets done.</p>

        <div className="identity-strip">
          <div className="identity-field">
            <span className="label">WORKMAN</span>
            <span className="field-value mono">@{workman.handle}</span>
          </div>
          <div className="identity-field">
            <span className="label">ID</span>
            <span className="field-value mono">#{workman.workmanId}</span>
          </div>
          <div className="identity-field">
            <span className="label">STATUS</span>
            <span className="field-value mono status-active">
              <span className="status-dot" /> {workman.status}
            </span>
          </div>
        </div>

        <div className="experiment-grid">
          {EXPERIMENTS.map((exp) => (
            <div className={`experiment-card experiment-card--${exp.status.toLowerCase()}`} key={exp.code}>
              <div className="experiment-card-top">
                <span className="label">{exp.code}</span>
                <span className={`status-tag mono status-tag--${exp.status.toLowerCase()}`}>
                  {exp.status}
                </span>
              </div>
              <h2 className="experiment-title">{exp.title}</h2>
              <p className="experiment-note mono">{exp.note}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
