import { useState } from "react";
import CornerMarks from "./CornerMarks";

export default function Landing({ onSubmit, error, isLoading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <div className="screen landing">
      <div className="grid-bg" />
      <CornerMarks tl="HW / 01" tr="THE WORKMEN" bl="EST. WORKSHOP" br="N 51.5 · W 0.1" />

      <div className="landing-content">
        <div className="brand-row">
          <span className="brand">HOODS WORKS</span>
        </div>

        <span className="label sub-label">THE WORKMEN</span>

        <h1 className="headline">ARE YOU A<br />WORKMAN?</h1>

        <p className="support-text">
          Enter your X handle and step into the workshop.
        </p>

        <form className="handle-form" onSubmit={handleSubmit} noValidate>
          <div className={`input-row ${error ? "input-row--error" : ""}`}>
            <span className="input-at mono">@</span>
            <input
              type="text"
              className="handle-input mono"
              placeholder="ENTER YOUR X HANDLE"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-text mono">{error}</p>}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "WORKING…" : "ENTER THE WORKSHOP"}
          </button>
        </form>
      </div>
    </div>
  );
}
