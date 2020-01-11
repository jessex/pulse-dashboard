// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2019 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================

import React, { useState, useEffect } from 'react';

// These can also be defined from the data
const VIOLATION_TYPES = [
  ["TECHNICAL", "Technical"],
  ["SUBSTANCE_ABUSE", "Subs. Use"],
  ["MUNICIPAL", "Municipal"],
  ["ABSCONSION", "Absconsion"],
  ["MISDEMEANOR", "Misdemeanor"],
  ["FELONY", "Felony"]
];
const VIOLATION_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const RevocationMatrix = props => {
  const isFiltered = props.filters.violationType || props.filters.reportedViolations;

  const [dataMatrix, setDataMatrix] = useState();
  const [maxRevocations, setMaxRevocations] = useState();

  const processResponse = () => {
    const matrix = props.data.reduce((result, { violation_type, reported_violations, total_revocations}) => {
      if (!result[violation_type]) {
        return { ...result, [violation_type]: { [reported_violations]: parseInt(total_revocations) } };
      }
      return {
        ...result,
        [violation_type]: {
          ...result[violation_type],
          [reported_violations]: (result[violation_type][reported_violations] || 0) + (parseInt(total_revocations) || 0)
        }
      }
    }, {});
    setDataMatrix(matrix);

    const max = Object.values(matrix).reduce((result, row) => (
      Math.max(result, Object.values(row).reduce((result, count) => Math.max(result, count), 0))
    ), 0);
    setMaxRevocations(max);
  }

  useEffect(() => {
    processResponse();
  }, [props.data]);

  const toggleFilter = (violationType, reportedViolations) => {
    if (isSelected(violationType, reportedViolations)) {
      violationType = "";
      reportedViolations = "";
    }

    props.updateFilters({ violationType, reportedViolations });
  }

  const isSelected = (violationType, reportedViolations) => {
    return props.filters.violationType === violationType &&
      props.filters.reportedViolations === reportedViolations;
  }

  const renderRow = ([violationType, name], i) => {
    const sum = Object.values(dataMatrix[violationType]).reduce((sum, count) => sum += count, 0);

    return (
      <div
        key={i}
        className={`violation-row ${isSelected(violationType, "") ? 'is-selected' : ''}`}
      >
        <div className="violation-type-label">
          <button
            onClick={() => toggleFilter(violationType, "")}
          >
            {name}
          </button>
        </div>
        {VIOLATION_COUNTS.map((violationCount, i) => renderCell(violationType, violationCount, i))}
        <span className="violation-sum violation-sum-column">{sum}</span>
      </div>
    )
  }

  const renderCell = (violationType, violationCount, i) => {
    const count = dataMatrix[violationType][violationCount] || 0;

    const minRadius = 15;
    const maxRadius = 50;
    const ratio = count / maxRevocations;
    const radius = Math.max(minRadius, Math.ceil(ratio * maxRadius));

    const containerStyle = {
      background: "white",
      display: "inline-block",
      width: radius,
      height: radius,
      lineHeight: `${radius}px`,
    }
    const cellStyle = {
      background: `rgba(240, 113, 50, ${ratio})`,
      width: "100%",
      height: "100%",
      borderRadius: Math.ceil(radius/2),
      color: ratio > 0.4 ? "white" : "rgba(240, 113, 50)",
    }

    return (
      <div key={i} className="cell">
        <div style={containerStyle}>
          <button
            className={`total-revocations ${isSelected(violationType, violationCount)  ? 'is-selected': ''}`}
            onClick={() => toggleFilter(violationType, violationCount)}
            style={cellStyle}
          >
            {count}
          </button>
        </div>
      </div>
    )
  }

  const reportedViolationsSum = (count) => {
    const items = props.data.filter(item => item.reported_violations === count);
    return items.reduce((sum, item) => sum += parseInt(item.total_revocations), 0);
  }

  if (!dataMatrix) {
    return null;
  }

  return (
    <div className="revocation-matrix">
      <h4>Revocations to prison from probation and parole</h4>
      <div className="d-f">
        <div className="y-label">
          Most severe violation reported during supervision term
        </div>
        <div className={`matrix ${isFiltered ? 'is-filtered': ''}`}>
          <div className="violation-counts">
            <span className="empty-cell"></span>
            {VIOLATION_COUNTS.map((count, i) => (
              <span key={i} className="violation-column">{count}</span>
            ))}
          </div>
          {VIOLATION_TYPES.map(renderRow)}
          <div className="violation-sum-row">
            <span className="empty-cell"></span>
            {VIOLATION_COUNTS.map((count, i) => (
              <span key={i} className="violation-column violation-sum">
                {reportedViolationsSum(count)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="x-label">
        Number of violation reports and notices of citations filled
      </div>
    </div>
  )
};

export default RevocationMatrix;
