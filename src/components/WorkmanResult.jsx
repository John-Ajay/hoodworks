import CornerMarks from "./CornerMarks";

export default function WorkmanResult({ workman, onEnterWorkshop }) {
  return (
    <div className="screen result">
      <div className="grid-bg" />
      <CornerMarks tl="HW / 03" tr="WORKMAN FILE" bl={`ID #${workman.workmanId}`} br="STATUS: ACTIVE" />

      <div className="result-content">
        <span className="label sub-label">REGISTRATION COMPLETE</span>
        <h1 className="headline result-headline">WELCOME,<br />WORKMAN.</h1>

        <div className="workman-card">
          <div className="workman-card-row">
            <span className="handle-display mono">@{workman.handle}</span>
          </div>

          <hr className="hairline" />

          <div className="workman-card-grid">
            <div className="workman-field">
              <span className="label">WORKMAN ID</span>
              <span className="field-value mono">#{workman.workmanId}</span>
            </div>
            <div className="workman-field">
              <span className="label">STATUS</span>
              <span className="field-value mono status-active">
                <span className="status-dot" /> {workman.status}
              </span>
            </div>
          </div>
        </div>

        <p className="support-text small">The workshop is open.</p>

        <button className="primary-button" onClick={onEnterWorkshop}>
          ENTER THE WORKSHOP
        </button>
      </div>
    </div>
  );
}
