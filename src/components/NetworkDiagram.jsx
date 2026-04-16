export default function NetworkDiagram({ problem, splitter, outlets }) {
  const splitterCount = Number(splitter) || 0;

  const svgWidth = 900;
  const svgHeight = Math.max(360, 240 + splitterCount * 75);

  const poleX = 70;
  const poleY = svgHeight / 2;

  const houseX = 280;
  const houseY = svgHeight / 2 - 95;
  const houseWidth = 240;
  const houseHeight = 190;

  const entryX = houseX;
  const entryY = svgHeight / 2;

  const splitterX = houseX + 145;
  const splitterY = svgHeight / 2;

  const branchJunctionX = splitterX + 55;
  const outletEndX = 760;

  let outletPositions = [];

  if (splitterCount > 0) {
    const spacing = 75;
    const totalHeight = (splitterCount - 1) * spacing;
    const startY = splitterY - totalHeight / 2;

    outletPositions = Array.from({ length: splitterCount }, (_, index) => ({
      x: outletEndX,
      y: startY + index * spacing,
    }));
  }

  return (
    <section className="card">
      <h2>Network Diagram</h2>

      <div className="diagram-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="network-diagram"
        >
          {/* Pole */}
          <rect
            x={poleX - 12}
            y={poleY - 70}
            width="24"
            height="140"
            rx="8"
            className="diagram-pole"
          />
          <circle cx={poleX + 18} cy={poleY} r="10" className="diagram-tap" />
          <text x={poleX - 30} y={poleY - 85} className="diagram-title-sm">
            Pole / Tap
          </text>

          {/* Drop line */}
          <line
            x1={poleX + 28}
            y1={poleY}
            x2={entryX}
            y2={entryY}
            className="diagram-line diagram-drop-line"
          />

          {/* Drop label */}
          <text
            x={(poleX + entryX) / 2 - 70}
            y={entryY - 20}
            className="diagram-callout-text"
          >
            Drop: {problem.length} ft ({problem.cableType})
          </text>

          {/* House base */}
          <rect
            x={houseX}
            y={houseY + 30}
            width={houseWidth}
            height={houseHeight - 30}
            rx="14"
            className="diagram-house"
          />

          {/* Roof (safe single-line polygon) */}
          <polygon
            points={`${houseX - 10},${houseY + 38} ${houseX + houseWidth / 2},${houseY - 25} ${houseX + houseWidth + 10},${houseY + 38}`}
            className="diagram-roof"
          />

          <text x={houseX + 18} y={houseY + 24} className="diagram-title">
            House
          </text>

          {/* Entry */}
          <circle cx={entryX} cy={entryY} r="9" className="diagram-entry" />
          <text x={houseX + 10} y={entryY - 16} className="diagram-label">
            Entry
          </text>

          {/* Entry to splitter */}
          <line
            x1={entryX}
            y1={entryY}
            x2={splitterX - 22}
            y2={splitterY}
            className="diagram-line"
          />

          {/* Splitter */}
          {splitterCount > 0 ? (
            <>
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
                {splitterCount}W
              </text>

              <text
                x={splitterX - 46}
                y={splitterY - 36}
                className="diagram-label"
              >
                Splitter
              </text>

              {/* Main trunk */}
              <line
                x1={splitterX + 24}
                y1={splitterY}
                x2={branchJunctionX}
                y2={splitterY}
                className="diagram-line"
              />

              {/* Outlets */}
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
            </>
          ) : (
            <text
              x={houseX + 40}
              y={houseY + 100}
              className="diagram-label"
            >
              Select a splitter to show branches
            </text>
          )}
        </svg>
      </div>
    </section>
  );
}