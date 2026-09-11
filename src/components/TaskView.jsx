import { useState } from "react";
import CornerMarks from "./CornerMarks";

// Reused for both "THE WORK" (Experiment 01) and "THE SIGNAL"
// (Experiment 02). Only copy, field type, and the submit handler
// differ between the two — everything else (layout, classes,
// transitions) is the same existing visual language as the rest of
// the app (.screen, .grid-bg, CornerMarks, .headline, .support-text,
// .primary-button, .workman-card, .error-text).

const STAGES = {
  FORM: "form",
  RECEIVING: "receiving",
  COMPLETE: "complete",
};

export default function TaskView({
  cornerTl,
  cornerTr,
  taskLabel,
  title,
  prompt,
  supportText,
  placeholder,
  fieldType = "input", // "input" | "textarea"
  submitLabel,
  receivingText,
  completeHeadline,
  completeSupportText,
  workman,
  onSubmit,
  onReturn,
}) {
  const [value, setValue] = useState("");
  const [stage, setStage] = useState(STAGES.FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(value);
      setStage(STAGES.RECEIVING);
      setIsSubmitting(false);
      setTimeout(() => setStage(STAGES.COMPLETE), 900);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || "SOMETHING WENT WRONG.");
    }
  }

  if (stage === STAGES.RECEIVING) {
    return (
      <div className="screen processing">
        <div className="grid-bg" />
        <CornerMarks tl={cornerTl} tr="PROCESSING" bl="STAND BY" />
        <div className="processing-content">
          <div className="processing-bar">
            <div className="processing-bar-fill" />
          </div>
          <p className="processing-text mono">{receivingText}</p>
        </div>
      </div>
    );
  }

  if (stage === STAGES.COMPLETE) {
    return (
      <div className="screen result">
        <div className="grid-bg" />
        <CornerMarks tl={cornerTl} tr={taskLabel} bl={`ID #${workman.workmanId}`} br="STATUS: ACTIVE" />

        <div className="result-content">
          <span className="label sub-label">{taskLabel} — COMPLETE ✓</span>
          <h1 className="headline result-headline">{completeHeadline}</h1>

          <div className="workman-card">
            <div className="workman-card-row">
              <span className="handle-display mono">WORKMAN #{workman.workmanId}</span>
            </div>
            <hr className="hairline" />
            <div className="workman-card-grid">
              <div className="workman-field">
                <span className="label">WORKMAN</span>
                <span className="field-value mono">@{workman.handle}</span>
              </div>
              <div className="workman-field">
                <span className="label">{taskLabel}</span>
                <span className="field-value mono status-active">
                  <span className="status-dot" /> COMPLETE
                </span>
              </div>
            </div>
          </div>

          <p className="support-text small">{completeSupportText}</p>

          <button className="primary-button" onClick={onReturn}>
            RETURN TO WORKSHOP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen task">
      <div className="grid-bg" />
      <CornerMarks tl={cornerTl} tr={cornerTr} bl={`ID #${workman.workmanId}`} br="STATUS: ACTIVE" />

      <div className="task-content">
        <span className="label sub-label">{taskLabel}</span>
        <h1 className="headline task-headline">{title}</h1>
        <p className="support-text">{supportText}</p>

        <form className="handle-form task-form" onSubmit={handleSubmit} noValidate>
          {fieldType === "textarea" ? (
            <div className={`input-row task-textarea-row ${error ? "input-row--error" : ""}`}>
              <textarea
                className="handle-input task-textarea mono"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSubmitting}
                rows={6}
              />
            </div>
          ) : (
            <div className={`input-row ${error ? "input-row--error" : ""}`}>
              <input
                type="text"
                className="handle-input mono"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && <p className="error-text mono">{error}</p>}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "SENDING…" : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
