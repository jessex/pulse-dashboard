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
  const maxRevocations = props.data.reduce((max, cell) => Math.max(max, parseInt(cell.total_revocations)), 0);

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
    const cells = props.data.filter(cell => cell.violation_type === violationType);
    const sum = cells.reduce((sum, cell) => sum += parseInt(cell.total_revocations), 0);

    return (
      <div
        key={i}
        className={`violation-row ${isSelected(violationType, "") ? 'is-selected' : ''}`}
      >
        <div className="violation-type-label">
          <button
            key={i}
            onClick={() => toggleFilter(violationType, "")}
          >
            {name}
          </button>
        </div>
        {cells.map(renderCell)}
        <span className="violation-sum violation-sum-column">{sum}</span>
      </div>
    )
  }

  const renderCell = (cell, i) => {
    const minRadius = 15;
    const maxRadius = 50;
    const ratio = parseInt(cell.total_revocations) / maxRevocations;
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
            className={`total-revocations ${isSelected(cell.violation_type, cell.reported_violations)  ? 'is-selected': ''}`}
            onClick={() => toggleFilter(cell.violation_type, cell.reported_violations)}
            style={cellStyle}
          >
            {cell.total_revocations}
          </button>
        </div>
      </div>
    )
  }

  const reportedViolationsSum = (count) => {
    const cells = props.data.filter(cell => cell.reported_violations === count);
    return cells.reduce((sum, cell) => sum += parseInt(cell.total_revocations), 0);
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
