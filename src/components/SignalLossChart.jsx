import { useState } from "react";
import { lossTable } from "../utils/constants";

export default function SignalLossChart() {
  const [isOpen, setIsOpen] = useState(false);

  const frequencies = Object.keys(lossTable)
    .map(Number)
    .sort((a, b) => a - b);

  function handleToggle() {
    setIsOpen((currentValue) => !currentValue);
  }

  return (
    <aside className="chart-panel">
      <button className="chart-toggle new-problem-button" onClick={handleToggle}>
        {isOpen ? "Hide Signal Loss Chart" : "Show Signal Loss Chart"}
      </button>

      {isOpen && (
        <div className="chart-content">
          <h3>Signal Loss per 100 ft</h3>

          <table className="loss-table">
            <thead>
              <tr>
                <th>Frequency (MHz)</th>
                <th>RG-6</th>
                <th>RG-11</th>
              </tr>
            </thead>

            <tbody>
              {frequencies.map((frequency) => (
                <tr key={frequency}>
                  <td>{frequency}</td>
                  <td>{lossTable[frequency]["RG-6"]} dB</td>
                  <td>{lossTable[frequency]["RG-11"]} dB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </aside>
  );
}