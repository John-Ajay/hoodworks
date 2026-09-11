import { useEffect, useState } from "react";
import CornerMarks from "./CornerMarks";

const STEPS = ["IDENTIFYING WORKMAN…", "OPENING WORKSHOP…"];

export default function Processing({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStepIndex(1), 480);
    const t2 = setTimeout(() => onDone(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className="screen processing">
      <div className="grid-bg" />
      <CornerMarks tl="HW / 02" tr="PROCESSING" bl="STAND BY" />

      <div className="processing-content">
        <div className="processing-bar">
          <div className="processing-bar-fill" />
        </div>
        <p className="processing-text mono">{STEPS[stepIndex]}</p>
      </div>
    </div>
  );
}
