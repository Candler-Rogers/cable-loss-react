import { useState } from "react";
import { generateRandomDrop } from "./utils/generateProblem";
import { getAttenuation, isWithinTolerance } from "./utils/calculations";
import { lossTable, splitterLossTable } from "./utils/constants";
import SignalLossChart from "./components/SignalLossChart";

function buildEmptyAnswers() {
  return {
    tx: { value: "", isCorrect: false, isExact: false, wasChecked: false },
    lowRx: { value: "", isCorrect: false, isExact: false, wasChecked: false },
    hiRx: { value: "", isCorrect: false, isExact: false, wasChecked: false },
  };
}

function countCorrectAnswers(answerSet) {
  let totalCorrect = 0;

  if (answerSet.tx.isCorrect) totalCorrect += 1;
  if (answerSet.lowRx.isCorrect) totalCorrect += 1;
  if (answerSet.hiRx.isCorrect) totalCorrect += 1;

  return totalCorrect;
}

function evaluateField(value, correctValue) {
  const numericValue = Number(value);

  const isValid = value !== "" && !Number.isNaN(numericValue);
  const isExact = isValid && numericValue === correctValue;
  const isCorrect = isValid && isWithinTolerance(numericValue, correctValue);

  return {
    isCorrect,
    isExact,
    wasChecked: true,
  };
}

function buildPostSplitterValues(problem, splitter) {
  if (!splitter) {
    return null;
  }

  const splitterLoss = splitterLossTable[splitter];

  return {
    splitterLoss,
    postTX: Number((problem.correctTX + splitterLoss).toFixed(1)),
    postLowRX: Number((problem.correctLowRX - splitterLoss).toFixed(1)),
    postHiRX: Number((problem.correctHiRX - splitterLoss).toFixed(1)),
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildOutletData(problem, splitter, postSplitterValues) {
  if (!splitter || !postSplitterValues) {
    return [];
  }

  const outletCount = Number(splitter);
  const cableType = problem.cableType;

  return Array.from({ length: outletCount }, (_, index) => {
    const length = getRandomInt(10, 99);

    const txLoss = getAttenuation(length, lossTable[5][cableType]);
    const lowRxLoss = getAttenuation(
      length,
      lossTable[problem.lowFreq][cableType]
    );
    const hiRxLoss = getAttenuation(
      length,
      lossTable[problem.highFreq][cableType]
    );

    return {
      id: index + 1,
      length,
      correct: {
        tx: Number((postSplitterValues.postTX + txLoss).toFixed(1)),
        lowRx: Number((postSplitterValues.postLowRX - lowRxLoss).toFixed(1)),
        hiRx: Number((postSplitterValues.postHiRX - hiRxLoss).toFixed(1)),
      },
      answers: buildEmptyAnswers(),
    };
  });
}

export default function App() {
  const [problem, setProblem] = useState(() => generateRandomDrop());

  const [attempts, setAttempts] = useState(0);
  const [dropFeedback, setDropFeedback] = useState("");
  const [showDropAnswers, setShowDropAnswers] = useState(false);
  const [answers, setAnswers] = useState(buildEmptyAnswers);

  const [splitter, setSplitter] = useState("");
  const [splitterAttempts, setSplitterAttempts] = useState(0);
  const [splitterFeedback, setSplitterFeedback] = useState("");
  const [showSplitterAnswers, setShowSplitterAnswers] = useState(false);
  const [splitterAnswers, setSplitterAnswers] = useState(buildEmptyAnswers);

  const [outlets, setOutlets] = useState([]);
  const [outletAttempts, setOutletAttempts] = useState(0);
  const [outletFeedback, setOutletFeedback] = useState("");
  const [showOutletAnswers, setShowOutletAnswers] = useState(false);

  const postSplitterValues = buildPostSplitterValues(problem, splitter);

  function resetSplitterSection() {
    setSplitter("");
    setSplitterAttempts(0);
    setSplitterFeedback("");
    setShowSplitterAnswers(false);
    setSplitterAnswers(buildEmptyAnswers());

    setOutlets([]);
    setOutletAttempts(0);
    setOutletFeedback("");
    setShowOutletAnswers(false);
  }

  function handleNewProblem() {
    setProblem(generateRandomDrop());

    setAttempts(0);
    setDropFeedback("");
    setShowDropAnswers(false);
    setAnswers(buildEmptyAnswers());

    resetSplitterSection();
  }

  function handleInputChange(fieldName, newValue) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldName]: {
        ...currentAnswers[fieldName],
        value: newValue,
      },
    }));
  }

  function handleSplitterInputChange(fieldName, newValue) {
    setSplitterAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldName]: {
        ...currentAnswers[fieldName],
        value: newValue,
      },
    }));
  }

  function handleOutletInputChange(outletId, fieldName, newValue) {
    setOutlets((currentOutlets) =>
      currentOutlets.map((outlet) => {
        if (outlet.id !== outletId) {
          return outlet;
        }

        return {
          ...outlet,
          answers: {
            ...outlet.answers,
            [fieldName]: {
              ...outlet.answers[fieldName],
              value: newValue,
            },
          },
        };
      })
    );
  }

  function handleCheckAnswers() {
    const updatedAnswers = {
      ...answers,
    };

    if (!answers.tx.isCorrect) {
      updatedAnswers.tx = {
        ...answers.tx,
        ...evaluateField(answers.tx.value, problem.correctTX),
      };
    }

    if (!answers.lowRx.isCorrect) {
      updatedAnswers.lowRx = {
        ...answers.lowRx,
        ...evaluateField(answers.lowRx.value, problem.correctLowRX),
      };
    }

    if (!answers.hiRx.isCorrect) {
      updatedAnswers.hiRx = {
        ...answers.hiRx,
        ...evaluateField(answers.hiRx.value, problem.correctHiRX),
      };
    }

    const totalCorrect = countCorrectAnswers(updatedAnswers);

    setAnswers(updatedAnswers);
    setAttempts((currentAttempts) => currentAttempts + 1);

    if (totalCorrect === 3) {
      setDropFeedback("All drop values are correct.");
    } else if (totalCorrect === 0) {
      setDropFeedback("No correct drop values yet. Keep working.");
    } else {
      setDropFeedback(`${totalCorrect} of 3 drop values are correct.`);
    }
  }

  function handleCheckSplitterAnswers() {
    if (!postSplitterValues) {
      return;
    }

    const updatedAnswers = {
      ...splitterAnswers,
    };

    if (!splitterAnswers.tx.isCorrect) {
      updatedAnswers.tx = {
        ...splitterAnswers.tx,
        ...evaluateField(splitterAnswers.tx.value, postSplitterValues.postTX),
      };
    }

    if (!splitterAnswers.lowRx.isCorrect) {
      updatedAnswers.lowRx = {
        ...splitterAnswers.lowRx,
        ...evaluateField(
          splitterAnswers.lowRx.value,
          postSplitterValues.postLowRX
        ),
      };
    }

    if (!splitterAnswers.hiRx.isCorrect) {
      updatedAnswers.hiRx = {
        ...splitterAnswers.hiRx,
        ...evaluateField(
          splitterAnswers.hiRx.value,
          postSplitterValues.postHiRX
        ),
      };
    }

    const totalCorrect = countCorrectAnswers(updatedAnswers);

    setSplitterAnswers(updatedAnswers);
    setSplitterAttempts((currentAttempts) => currentAttempts + 1);

    if (totalCorrect === 3) {
      setSplitterFeedback("All post-splitter values are correct.");
    } else if (totalCorrect === 0) {
      setSplitterFeedback("No correct post-splitter values yet. Keep working.");
    } else {
      setSplitterFeedback(
        `${totalCorrect} of 3 post-splitter values are correct.`
      );
    }
  }

  function handleCheckOutletAnswers() {
    let totalCorrectFields = 0;
    const totalFields = outlets.length * 3;

    const updatedOutlets = outlets.map((outlet) => {
      const updatedAnswers = {
        ...outlet.answers,
      };

      if (!outlet.answers.tx.isCorrect) {
        updatedAnswers.tx = {
          ...outlet.answers.tx,
          ...evaluateField(outlet.answers.tx.value, outlet.correct.tx),
        };
      }

      if (!outlet.answers.lowRx.isCorrect) {
        updatedAnswers.lowRx = {
          ...outlet.answers.lowRx,
          ...evaluateField(outlet.answers.lowRx.value, outlet.correct.lowRx),
        };
      }

      if (!outlet.answers.hiRx.isCorrect) {
        updatedAnswers.hiRx = {
          ...outlet.answers.hiRx,
          ...evaluateField(outlet.answers.hiRx.value, outlet.correct.hiRx),
        };
      }

      totalCorrectFields += countCorrectAnswers(updatedAnswers);

      return {
        ...outlet,
        answers: updatedAnswers,
      };
    });

    setOutlets(updatedOutlets);
    setOutletAttempts((currentAttempts) => currentAttempts + 1);

    if (totalCorrectFields === totalFields) {
      setOutletFeedback("All outlet values are correct.");
    } else if (totalCorrectFields === 0) {
      setOutletFeedback("No correct outlet values yet. Keep working.");
    } else {
      setOutletFeedback(
        `${totalCorrectFields} of ${totalFields} outlet values are correct.`
      );
    }
  }

  function handleShowDropAnswers() {
    setShowDropAnswers(true);
    setDropFeedback(
      "Exact drop answers are now shown and will remain visible until a new problem is generated."
    );
  }

  function handleShowSplitterAnswers() {
    setShowSplitterAnswers(true);
    setSplitterFeedback(
      "Exact post-splitter answers are now shown and will remain visible until the splitter changes or a new problem is generated."
    );
  }

  function handleShowOutletAnswers() {
    setShowOutletAnswers(true);
    setOutletFeedback(
      "Exact outlet answers are now shown and will remain visible until the splitter changes or a new problem is generated."
    );
  }

  function handleSplitterChange(newSplitterValue) {
    const nextPostSplitterValues = buildPostSplitterValues(problem, newSplitterValue);

    setSplitter(newSplitterValue);
    setSplitterAttempts(0);
    setSplitterFeedback("");
    setShowSplitterAnswers(false);
    setSplitterAnswers(buildEmptyAnswers());

    const nextOutlets = buildOutletData(
      problem,
      newSplitterValue,
      nextPostSplitterValues
    );

    setOutlets(nextOutlets);
    setOutletAttempts(0);
    setOutletFeedback("");
    setShowOutletAnswers(false);
  }

  function getDropSummaryMessage() {
    const totalCorrect = countCorrectAnswers(answers);

    if (totalCorrect === 3 && showDropAnswers) {
      return "All drop values are correct. Exact answers are visible.";
    }

    if (totalCorrect === 3) {
      return "All drop values are correct.";
    }

    if (showDropAnswers) {
      return "Exact drop answers are visible. Your entered values remain displayed.";
    }

    if (attempts === 0) {
      return "Enter your drop values and check your answers.";
    }

    return `${totalCorrect} of 3 drop values correct.`;
  }

  function getSplitterSummaryMessage() {
    const totalCorrect = countCorrectAnswers(splitterAnswers);

    if (!splitter) {
      return "Select a splitter to begin the next step.";
    }

    if (totalCorrect === 3 && showSplitterAnswers) {
      return "All post-splitter values are correct. Exact answers are visible.";
    }

    if (totalCorrect === 3) {
      return "All post-splitter values are correct.";
    }

    if (showSplitterAnswers) {
      return "Exact post-splitter answers are visible. Your entered values remain displayed.";
    }

    if (splitterAttempts === 0) {
      return "Enter your post-splitter values and check your answers.";
    }

    return `${totalCorrect} of 3 post-splitter values correct.`;
  }

  function getOutletSummaryMessage() {
    const totalCorrectFields = outlets.reduce(
      (sum, outlet) => sum + countCorrectAnswers(outlet.answers),
      0
    );
    const totalFields = outlets.length * 3;

    if (!splitter || outlets.length === 0) {
      return "Select a splitter to generate outlet legs.";
    }

    if (totalCorrectFields === totalFields && showOutletAnswers) {
      return "All outlet values are correct. Exact answers are visible.";
    }

    if (totalCorrectFields === totalFields) {
      return "All outlet values are correct.";
    }

    if (showOutletAnswers) {
      return "Exact outlet answers are visible. Your entered values remain displayed.";
    }

    if (outletAttempts === 0) {
      return "Enter your outlet values and check your answers.";
    }

    return `${totalCorrectFields} of ${totalFields} outlet values correct.`;
  }

  function getStatusClass(field) {
    if (field.isCorrect) {
      return field.isExact ? "status correct" : "status close";
    }

    if (field.wasChecked) {
      return "status incorrect";
    }

    return "status";
  }

  function getStatusText(field) {
    if (field.isCorrect) {
      return field.isExact ? "Exactly right" : "Close enough";
    }

    if (field.wasChecked) {
      return "Incorrect";
    }

    return "Not checked yet";
  }

  function shouldShowExactAnswer(field, showAnswersForSection) {
    return showAnswersForSection || (field.isCorrect && !field.isExact);
  }

  return (
    <main className="app">
      <h1>Drop Loss Calculator</h1>

      <div className="app-layout">
        <div className="main-content">
          <section className="card">
            <h2>Current Problem</h2>
            <p><strong>Drop Length:</strong> {problem.length} ft</p>
            <p><strong>Cable Type:</strong> {problem.cableType}</p>
            <p><strong>Starting TX (5 MHz):</strong> {problem.startingTX} dBmV</p>
            <p>
              <strong>Starting Low RX ({problem.lowFreq} MHz):</strong>{" "}
              {problem.startingLowRX} dBmV
            </p>
            <p>
              <strong>Starting High RX ({problem.highFreq} MHz):</strong>{" "}
              {problem.startingHiRX} dBmV
            </p>
          </section>

          <section className="card">
            <h2>Enter Drop Answers</h2>

            <div className="field-group">
              <label htmlFor="tx">TX after attenuation</label>
              <div className="input-with-unit">
                <input
                  id="tx"
                  type="number"
                  step="0.1"
                  value={answers.tx.value}
                  onChange={(event) => handleInputChange("tx", event.target.value)}
                  disabled={answers.tx.isCorrect}
                />
                <span className="unit">dBmV</span>
              </div>
              <p className={getStatusClass(answers.tx)}>
                {getStatusText(answers.tx)}
              </p>
              {shouldShowExactAnswer(answers.tx, showDropAnswers) && (
                <p className="answer-reveal">Exact answer: {problem.correctTX} dBmV</p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="lowRx">
                Low RX after attenuation ({problem.lowFreq} MHz)
              </label>
              <div className="input-with-unit">
                <input
                  id="lowRx"
                  type="number"
                  step="0.1"
                  value={answers.lowRx.value}
                  onChange={(event) =>
                    handleInputChange("lowRx", event.target.value)
                  }
                  disabled={answers.lowRx.isCorrect}
                />
                <span className="unit">dBmV</span>
              </div>
              <p className={getStatusClass(answers.lowRx)}>
                {getStatusText(answers.lowRx)}
              </p>
              {shouldShowExactAnswer(answers.lowRx, showDropAnswers) && (
                <p className="answer-reveal">
                  Exact answer: {problem.correctLowRX} dBmV
                </p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="hiRx">
                High RX after attenuation ({problem.highFreq} MHz)
              </label>
              <div className="input-with-unit">
                <input
                  id="hiRx"
                  type="number"
                  step="0.1"
                  value={answers.hiRx.value}
                  onChange={(event) =>
                    handleInputChange("hiRx", event.target.value)
                  }
                  disabled={answers.hiRx.isCorrect}
                />
                <span className="unit">dBmV</span>
              </div>
              <p className={getStatusClass(answers.hiRx)}>
                {getStatusText(answers.hiRx)}
              </p>
              {shouldShowExactAnswer(answers.hiRx, showDropAnswers) && (
                <p className="answer-reveal">Exact answer: {problem.correctHiRX} dBmV</p>
              )}
            </div>

            <div className="section-action-row">
              <button onClick={handleCheckAnswers}>Check Drop Answers</button>
              <button onClick={handleShowDropAnswers}>Show Drop Answers</button>
            </div>

            <p><strong>Attempts:</strong> {attempts}</p>
            <p><strong>Status:</strong> {getDropSummaryMessage()}</p>
            {dropFeedback && <p>{dropFeedback}</p>}
          </section>

          <section className="card">
            <h2>Splitter Selection</h2>

            <label htmlFor="splitter">Choose splitter</label>
            <select
              id="splitter"
              value={splitter}
              onChange={(event) => handleSplitterChange(event.target.value)}
            >
              <option value="">Select splitter</option>
              <option value="2">2-way splitter</option>
              <option value="3">3-way splitter</option>
              <option value="4">4-way splitter</option>
            </select>

            {postSplitterValues && (
              <>
                <p>
                  <strong>Splitter loss:</strong> {postSplitterValues.splitterLoss} dB
                </p>

                <div className="field-group">
                  <label htmlFor="splitterTx">TX after splitter</label>
                  <div className="input-with-unit">
                    <input
                      id="splitterTx"
                      type="number"
                      step="0.1"
                      value={splitterAnswers.tx.value}
                      onChange={(event) =>
                        handleSplitterInputChange("tx", event.target.value)
                      }
                      disabled={splitterAnswers.tx.isCorrect}
                    />
                    <span className="unit">dBmV</span>
                  </div>
                  <p className={getStatusClass(splitterAnswers.tx)}>
                    {getStatusText(splitterAnswers.tx)}
                  </p>
                  {shouldShowExactAnswer(
                    splitterAnswers.tx,
                    showSplitterAnswers
                  ) && (
                    <p className="answer-reveal">
                      Exact answer: {postSplitterValues.postTX} dBmV
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="splitterLowRx">
                    Low RX after splitter ({problem.lowFreq} MHz)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="splitterLowRx"
                      type="number"
                      step="0.1"
                      value={splitterAnswers.lowRx.value}
                      onChange={(event) =>
                        handleSplitterInputChange("lowRx", event.target.value)
                      }
                      disabled={splitterAnswers.lowRx.isCorrect}
                    />
                    <span className="unit">dBmV</span>
                  </div>
                  <p className={getStatusClass(splitterAnswers.lowRx)}>
                    {getStatusText(splitterAnswers.lowRx)}
                  </p>
                  {shouldShowExactAnswer(
                    splitterAnswers.lowRx,
                    showSplitterAnswers
                  ) && (
                    <p className="answer-reveal">
                      Exact answer: {postSplitterValues.postLowRX} dBmV
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="splitterHiRx">
                    High RX after splitter ({problem.highFreq} MHz)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="splitterHiRx"
                      type="number"
                      step="0.1"
                      value={splitterAnswers.hiRx.value}
                      onChange={(event) =>
                        handleSplitterInputChange("hiRx", event.target.value)
                      }
                      disabled={splitterAnswers.hiRx.isCorrect}
                    />
                    <span className="unit">dBmV</span>
                  </div>
                  <p className={getStatusClass(splitterAnswers.hiRx)}>
                    {getStatusText(splitterAnswers.hiRx)}
                  </p>
                  {shouldShowExactAnswer(
                    splitterAnswers.hiRx,
                    showSplitterAnswers
                  ) && (
                    <p className="answer-reveal">
                      Exact answer: {postSplitterValues.postHiRX} dBmV
                    </p>
                  )}
                </div>

                <div className="section-action-row">
                  <button onClick={handleCheckSplitterAnswers}>
                    Check Splitter Answers
                  </button>
                  <button onClick={handleShowSplitterAnswers}>
                    Show Splitter Answers
                  </button>
                </div>

                <p><strong>Attempts:</strong> {splitterAttempts}</p>
                <p><strong>Status:</strong> {getSplitterSummaryMessage()}</p>
                {splitterFeedback && <p>{splitterFeedback}</p>}
              </>
            )}
          </section>

          <section className="card">
            <h2>Outlet Legs</h2>

            {outlets.length === 0 ? (
              <p>Select a splitter to generate outlet legs.</p>
            ) : (
              <>
                {outlets.map((outlet) => (
                  <div key={outlet.id} className="outlet-card">
                    <h3>Outlet {outlet.id}</h3>
                    <p><strong>Outlet Length:</strong> {outlet.length} ft</p>

                    <div className="field-group">
                      <label htmlFor={`outlet-${outlet.id}-tx`}>TX at outlet</label>
                      <div className="input-with-unit">
                        <input
                          id={`outlet-${outlet.id}-tx`}
                          type="number"
                          step="0.1"
                          value={outlet.answers.tx.value}
                          onChange={(event) =>
                            handleOutletInputChange(
                              outlet.id,
                              "tx",
                              event.target.value
                            )
                          }
                          disabled={outlet.answers.tx.isCorrect}
                        />
                        <span className="unit">dBmV</span>
                      </div>
                      <p className={getStatusClass(outlet.answers.tx)}>
                        {getStatusText(outlet.answers.tx)}
                      </p>
                      {shouldShowExactAnswer(outlet.answers.tx, showOutletAnswers) && (
                        <p className="answer-reveal">
                          Exact answer: {outlet.correct.tx} dBmV
                        </p>
                      )}
                    </div>

                    <div className="field-group">
                      <label htmlFor={`outlet-${outlet.id}-lowRx`}>
                        Low RX at outlet ({problem.lowFreq} MHz)
                      </label>
                      <div className="input-with-unit">
                        <input
                          id={`outlet-${outlet.id}-lowRx`}
                          type="number"
                          step="0.1"
                          value={outlet.answers.lowRx.value}
                          onChange={(event) =>
                            handleOutletInputChange(
                              outlet.id,
                              "lowRx",
                              event.target.value
                            )
                          }
                          disabled={outlet.answers.lowRx.isCorrect}
                        />
                        <span className="unit">dBmV</span>
                      </div>
                      <p className={getStatusClass(outlet.answers.lowRx)}>
                        {getStatusText(outlet.answers.lowRx)}
                      </p>
                      {shouldShowExactAnswer(
                        outlet.answers.lowRx,
                        showOutletAnswers
                      ) && (
                        <p className="answer-reveal">
                          Exact answer: {outlet.correct.lowRx} dBmV
                        </p>
                      )}
                    </div>

                    <div className="field-group">
                      <label htmlFor={`outlet-${outlet.id}-hiRx`}>
                        High RX at outlet ({problem.highFreq} MHz)
                      </label>
                      <div className="input-with-unit">
                        <input
                          id={`outlet-${outlet.id}-hiRx`}
                          type="number"
                          step="0.1"
                          value={outlet.answers.hiRx.value}
                          onChange={(event) =>
                            handleOutletInputChange(
                              outlet.id,
                              "hiRx",
                              event.target.value
                            )
                          }
                          disabled={outlet.answers.hiRx.isCorrect}
                        />
                        <span className="unit">dBmV</span>
                      </div>
                      <p className={getStatusClass(outlet.answers.hiRx)}>
                        {getStatusText(outlet.answers.hiRx)}
                      </p>
                      {shouldShowExactAnswer(
                        outlet.answers.hiRx,
                        showOutletAnswers
                      ) && (
                        <p className="answer-reveal">
                          Exact answer: {outlet.correct.hiRx} dBmV
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="section-action-row">
                  <button onClick={handleCheckOutletAnswers}>
                    Check Outlet Answers
                  </button>
                  <button onClick={handleShowOutletAnswers}>
                    Show Outlet Answers
                  </button>
                </div>

                <p><strong>Attempts:</strong> {outletAttempts}</p>
                <p><strong>Status:</strong> {getOutletSummaryMessage()}</p>
                {outletFeedback && <p>{outletFeedback}</p>}
              </>
            )}
          </section>
        </div>

        <SignalLossChart />
      </div>

      <div className="button-row action-bar">
        <button className="new-problem-button" onClick={handleNewProblem}>New Problem</button>
      </div>
    </main>
  );
}