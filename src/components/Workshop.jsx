import { useState } from "react";
import CornerMarks from "./CornerMarks";

const NAV_ITEMS = ["WORKSHOP", "WORKMEN", "EXPERIMENTS"];

function getExperiments(progress) {
  const workDone = Boolean(progress?.workCompleted);
  const signalDone = Boolean(progress?.signalCompleted);

  return [
    {
      code: "EXPERIMENT 01",
      title: "THE WORK",
      status: workDone ? "COMPLETED" : "ACTIVE",
      note: workDone ? "Response received." : "Live build in progress.",
      clickable: true,
      onClickKey: "work",
    },
    {
      code: "EXPERIMENT 02",
      title: signalDone || workDone ? "THE SIGNAL" : "CLASSIFIED",
      status: signalDone ? "COMPLETED" : workDone ? "UNLOCKED" : "LOCKED",
      note: signalDone
        ? "Signal transmitted."
        : workDone
        ? "Access granted."
        : "Access restricted.",
      clickable: workDone,
      onClickKey: "signal",
    },
    {
      code: "EXPERIMENT 03",
      title: "COMING SOON",
      status: "STANDBY",
      note: "Awaiting activation.",
      clickable: false,
      onClickKey: null,
    },
  ];
}

export default function Workshop({ workman, progress, onExit, onOpenTask }) {
  const [activeNav, setActiveNav] = useState("WORKSHOP");
  const experiments = getExperiments(progress);

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
          {experiments.map((exp) => {
            const statusClass = exp.status.toLowerCase();
            const classes = [
              "experiment-card",
              `experiment-card--${statusClass}`,
              exp.clickable ? "experiment-card--clickable" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const cardProps = exp.clickable
              ? {
                  role: "button",
                  tabIndex: 0,
                  onClick: () => onOpenTask(exp.onClickKey),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenTask(exp.onClickKey);
                    }
                  },
                }
              : {};

            return (
              <div className={classes} key={exp.code} {...cardProps}>
                <div className="experiment-card-top">
                  <span className="label">{exp.code}</span>
                  <span className={`status-tag mono status-tag--${statusClass}`}>
                    {exp.status === "COMPLETED" ? "COMPLETED ✓" : exp.status}
                  </span>
                </div>
                <h2 className="experiment-title">{exp.title}</h2>
                <p className="experiment-note mono">{exp.note}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
