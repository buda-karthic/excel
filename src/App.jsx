import React, { useState, useCallback } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import "./App.css";

const COL_COUNT = 10000;
const ROW_COUNT = 10000;
const COL_WIDTH = 100;
const ROW_HEIGHT = 30;

// Convert column index to Excel-style letters (e.g., 0 => A, 25 => Z, 26 => AA)
const columnToLetter = (col) => {
  let temp = col;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
};

// Get cell key like "A1"
const getCellKey = (rowIndex, columnIndex) =>
  `${columnToLetter(columnIndex)}${rowIndex + 1}`;

export default function App() {
  const [data, setData] = useState(new Map());
  const [editingCell, setEditingCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleChange = (key, value) => {
    setData((prev) => {
      const newData = new Map(prev);
      newData.set(key, value);
      return newData;
    });
  };

  const evaluate = useCallback((formula, getValue) => {
    if (!formula.startsWith("=")) return formula;
    const expr = formula
      .slice(1)
      .replace(/([A-Z]+\d+)/g, (match) => getValue(match) || 0);
    try {
      return eval(expr);
    } catch {
      return "#ERR";
    }
  }, []);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const key = getCellKey(rowIndex, columnIndex);
    const rawValue = data.get(key) || "";
    const value = evaluate(rawValue, (refKey) => data.get(refKey));
    const isEditing = editingCell === key;

    return (
      <div
        className={`cell ${isEditing ? "editing" : ""}`}
        style={style}
        onDoubleClick={() => setEditingCell(key)}
        onClick={() => setSelectedCell(key)}
      >
        {isEditing ? (
          <input
            className="cell-input"
            autoFocus
            value={rawValue}
            onBlur={(e) => {
              handleChange(key, e.target.value);
              setEditingCell(null);
            }}
            onChange={(e) => handleChange(key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
            }}
          />
        ) : (
          value
        )}
      </div>
    );
  };

  return (
    <div className="sheet-container">
      <div className="formula-bar">
        {selectedCell ? (
          <>
            <strong>{selectedCell}</strong>: {data.get(selectedCell) || ""}
          </>
        ) : (
          "Select a cell"
        )}
      </div>
      <div className="sheet">
        <Grid
          columnCount={COL_COUNT}
          rowCount={ROW_COUNT}
          columnWidth={COL_WIDTH}
          rowHeight={ROW_HEIGHT}
          width={window.innerWidth}
          height={window.innerHeight - 30} // Leave space for formula bar
        >
          {Cell}
        </Grid>
      </div>
    </div>
  );
}
