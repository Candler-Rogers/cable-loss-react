export default function NetworkDiagram({ problem, splitter, outlets }) {
  const splitterCount = Number(splitter) || 0;

  const svgWidth = 760;
  const svgHeight = Math.max(320, 220 + splitterCount * 70);

  const poleX = 60;
  const poleY = svgHeight / 2;

  const houseX = 260;
  const houseY = svgHeight / 2 - 90;
  const houseWidth = 220;
  const houseHeight = 180;

  const splitterX = houseX + 130;
  const splitterY = svgHeight / 2;

  const entryX = houseX;
  const entryY = svgHeight / 2;

  const outletStartX = splitterX + 25;
  const outletEndX = 650;

  let outletPositions = [];

  if (splitterCount > 0) {
    const totalHeight = (splitterCount - 1) * 70;
    const startY = splitterY - totalHeight / 2;

    outletPositions = Array.from({ length: splitterCount }, (_, index) => ({
      x: outletEndX,
      y: startY + index * 70,
    }));
  }

  return (
    <section className="card">
      <h2>Network Diagram</h2>

      <div className="diagram-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="network-diagram"
          role="img"
          aria-label="Cable network topology diagram"
        >
          {/* Drop line from pole to house */}
          <line
            x1={poleX + 35}
            y1={poleY}
            x2={entryX}
            y2={entryY}
            className="diagram-line"
          />

          {/* Pole */}
          <rect
            x={poleX - 15}
            y={poleY - 60}
            width="30"
            height="120"
            className="diagram-pole"
          />
          <circle cx={poleX + 20} cy={poleY} r="10" className="diagram-node" />
          <text x={poleX - 20} y={poleY - 75} className="diagram-label">
            Pole / Tap
          </text>

          {/* Drop label */}
          <text
            x={(poleX + entryX) / 2 - 45}
            y={entryY - 12}
            className="diagram-label"
          >
            Drop: {problem.length} ft ({problem.cableType})
          </text>

          {/* House */}
          <rect
            x={houseX}
            y={houseY}
            width={houseWidth}
            height={houseHeight}
            rx="12"
            className="diagram-house"
          />
          <text x={houseX + 20} y={houseY + 28} className="diagram-title">
            House
          </text>

          {/* Entry point */}
          <circle cx={entryX} cy={entryY} r="8" className="diagram-node" />
          <text x={houseX + 10} y={entryY - 12} className="diagram-label">
            Entry
          </text>

          {/* Line from entry to splitter */}
          <line
            x1={entryX}
            y1={entryY}
            x2={splitterX - 20}
            y2={splitterY}
            className="diagram-line"
          />

          {/* Splitter if selected */}
          {splitterCount > 0 && (
            <>
              <rect
                x={splitterX - 20}
                y={splitterY - 20}
                width="40"
                height="40"
                rx="6"
                className="diagram-splitter"
              />
              <text
                x={splitterX - 30}
                y={splitterY - 30}
                className="diagram-label"
              >
                {splitterCount}-way splitter
              </text>

              {outletPositions.map((position, index) => (
                <g key={index}>
                  {/* Horizontal line out of splitter */}
                  <line
                    x1={splitterX + 20}
                    y1={splitterY}
                    x2={splitterX + 50}
                    y2={splitterY}
                    className="diagram-line"
                  />

                  {/* Vertical branch */}
                  <line
                    x1={splitterX + 50}
                    y1={splitterY}
                    x2={splitterX + 50}
                    y2={position.y}
                    className="diagram-line"
                  />

                  {/* Horizontal run to outlet */}
                  <line
                    x1={splitterX + 50}
                    y1={position.y}
                    x2={position.x - 20}
                    y2={position.y}
                    className="diagram-line"
                  />

                  {/* Outlet node */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="10"
                    className="diagram-outlet"
                  />

                  <text
                    x={position.x + 16}
                    y={position.y - 6}
                    className="diagram-label"
                  >
                    Outlet {index + 1}
                  </text>

                  <text
                    x={position.x + 16}
                    y={position.y + 14}
                    className="diagram-label"
                  >
                    {outlets[index]?.length ?? "--"} ft RG-6
                  </text>
                </g>
              ))}
            </>
          )}

          {/* No splitter selected */}
          {splitterCount === 0 && (
            <text x={houseX + 35} y={houseY + 90} className="diagram-label">
              Select a splitter to show branch layout
            </text>
          )}
        </svg>
      </div>
    </section>
  );
}
