import { useState } from "react";

export default function NetworkDiagram({ problem, splitter, outlets = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!problem) {
    return (
      <section className="card">
        <div className="diagram-header">
          <h2>Network Diagram</h2>
        </div>
        <p>Diagram unavailable.</p>
      </section>
    );
  }

  const splitterCount = Number(splitter) || 0;

  const svgWidth = 900;
  const svgHeight = Math.max(380, 250 + splitterCount * 78);

  const poleX = 90;
  const poleTopY = 40;
  const poleBottomY = svgHeight - 30;

  const trunkY = svgHeight / 2 - 10;
  const tapX = poleX + 58;
  const tapY = trunkY - 14;
  const tapWidth = 26;
  const tapHeight = 28;

  const dropStartX = tapX + tapWidth / 2;
  const dropStartY = tapY + tapHeight / 2;

  const houseX = 280;
  const houseWidth = 240;
  const houseHeight = 190;

  const houseBottomY = poleBottomY;
  const houseY = houseBottomY - houseHeight;

  const entryX = houseX;
  const entryY = houseY + 80;

  const splitterX = houseX + houseWidth / 2;
  const splitterY = houseY + 122;

  const branchJunctionX = splitterX + 55;
  const outletEndX = 760;

  let outletPositions = [];

  if (splitterCount > 0) {
    const spacing =
      splitterCount === 4 ? 52 :
      splitterCount === 3 ? 62 :
      72;

    const totalHeight = (splitterCount - 1) * spacing;
    const startY = splitterY - totalHeight / 2 - (splitterCount === 4 ? 10 : 0);

    outletPositions = Array.from({ length: splitterCount }, (_, index) => ({
      x: outletEndX,
      y: startY + index * spacing,
    }));
  }

  function renderDiagram() {
    return (
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="network-diagram"
      >
        
        {/* Pole assembly */}
        <g>
          <rect x={poleX - 10} y={poleTopY} width="20" height={poleBottomY - poleTopY} rx="4" className="diagram-pole" />

          <line x1={poleX - 70} y1={poleTopY + 18} x2={poleX + 70} y2={poleTopY + 18} className="diagram-power-arm" />
          <line x1={poleX - 62} y1={poleTopY + 62} x2={poleX + 62} y2={poleTopY + 62} className="diagram-power-arm" />

          <circle cx={poleX - 48} cy={poleTopY + 18} r="4" className="diagram-insulator" />
          <circle cx={poleX - 20} cy={poleTopY + 18} r="4" className="diagram-insulator" />
          <circle cx={poleX + 20} cy={poleTopY + 18} r="4" className="diagram-insulator" />
          <circle cx={poleX + 48} cy={poleTopY + 18} r="4" className="diagram-insulator" />

          <circle cx={poleX - 42} cy={poleTopY + 62} r="4" className="diagram-insulator" />
          <circle cx={poleX - 16} cy={poleTopY + 62} r="4" className="diagram-insulator" />
          <circle cx={poleX + 16} cy={poleTopY + 62} r="4" className="diagram-insulator" />
          <circle cx={poleX + 42} cy={poleTopY + 62} r="4" className="diagram-insulator" />

          <line x1={poleX - 120} y1={poleTopY + 10} x2={poleX + 120} y2={poleTopY + 26} className="diagram-power-line" />
          <line x1={poleX - 120} y1={poleTopY + 54} x2={poleX + 120} y2={poleTopY + 70} className="diagram-power-line" />

          <rect x={tapX} y={tapY} width={tapWidth} height={tapHeight} rx="2" className="diagram-tap-box" />

          <line x1={poleX - 110} y1={trunkY} x2={tapX} y2={trunkY} className="diagram-trunk-line" />

          <text x={tapX - 2} y={tapY - 8} className="diagram-label">Tap</text>
        </g>

        <line x1={dropStartX} y1={dropStartY} x2={entryX} y2={entryY} className="diagram-line diagram-drop-line" />

        <text x={(dropStartX + entryX) / 2 - 110} y={entryY - 28} className="diagram-callout-text">
          Drop: {problem.length} ft ({problem.cableType})
        </text>

        {/* House */}
        <g>
          <rect x={houseX} y={houseY + 42} width={houseWidth} height={houseHeight - 42} rx="10" className="diagram-house" />

          <polygon
            points={`${houseX - 12},${houseY + 48} ${houseX + houseWidth / 2},${houseY - 20} ${houseX + houseWidth + 12},${houseY + 48}`}
            className="diagram-roof"
          />

          <rect x={houseX + houseWidth / 2 - 18} y={houseY + houseHeight - 48} width="36" height="48" rx="4" className="diagram-door" />

          <rect x={houseX + 38} y={houseY + 78} width="34" height="28" rx="4" className="diagram-window" />
          <rect x={houseX + houseWidth - 72} y={houseY + 78} width="34" height="28" rx="4" className="diagram-window" />

          <text x={houseX + houseWidth / 2} y={houseY + 10} textAnchor="middle" className="diagram-title">
            House
          </text>
        </g>

        <circle cx={entryX} cy={entryY} r="9" className="diagram-entry" />

        {splitterCount > 0 ? (
        <g>
          <rect
            x={splitterX - 24}
            y={splitterY - 24}
            width="48"
            height="48"
            rx="10"
            className="diagram-splitter"
          />

          <text
            x={splitterX}
            y={splitterY + 5}
            textAnchor="middle"
            className="diagram-splitter-text"
          >
            {splitterCount}-way
          </text>

          <line
            x1={entryX}
            y1={entryY}
            x2={splitterX - 22}
            y2={splitterY}
            className="diagram-line"
          />

          <line
            x1={splitterX + 24}
            y1={splitterY}
            x2={branchJunctionX}
            y2={splitterY}
            className="diagram-line"
          />

          {outletPositions.map((position, index) => (
            <g key={index}>
              <line
                x1={branchJunctionX}
                y1={splitterY}
                x2={branchJunctionX}
                y2={position.y}
                className="diagram-line"
              />

              <line
                x1={branchJunctionX}
                y1={position.y}
                x2={position.x - 18}
                y2={position.y}
                className="diagram-line diagram-outlet-line"
              />

              <circle
                cx={position.x}
                cy={position.y}
                r="11"
                className="diagram-outlet"
              />

              <text
                x={position.x + 18}
                y={position.y - 6}
                className="diagram-label"
              >
                Outlet {index + 1}
              </text>

              <text
                x={position.x + 18}
                y={position.y + 14}
                className="diagram-label"
              >
                {outlets[index]?.length ?? "--"} ft RG-6
              </text>
            </g>
          ))}
        </g>
      ) : (
        <text
          x={houseX + houseWidth / 2}
          y={houseBottomY - 80}
          textAnchor="middle"
          className="diagram-label"
        >
          Select a splitter
        </text>
      )}
      </svg>
    );
  }

  return (
    <>
      {/* NORMAL VIEW */}
      <section className="card">
        <div className="diagram-header">
          <h2>Network Diagram</h2>
          <button
            className="diagram-expand-button"
            onClick={() => setIsExpanded(true)}
          >
            ⤢
          </button>
        </div>

        <div className="diagram-wrapper">
          {renderDiagram()}
        </div>
      </section>

      {/* EXPANDED OVERLAY */}
      {isExpanded && (
        <div className="diagram-overlay" onClick={() => setIsExpanded(false)}>
          <div
            className="diagram-overlay-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="diagram-header">
              <h2>Network Diagram</h2>
              <button
                className="diagram-expand-button"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </button>
            </div>

            <div className="diagram-overlay-wrapper">
              {renderDiagram()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}