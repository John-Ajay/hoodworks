export default function CornerMarks({ tl, tr, bl, br }) {
  return (
    <div className="corner-marks">
      {tl && <span className="tl">{tl}</span>}
      {tr && <span className="tr">{tr}</span>}
      {bl && <span className="bl">{bl}</span>}
      {br && <span className="br">{br}</span>}
    </div>
  );
}
