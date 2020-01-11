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

import React, { useState } from 'react';

const CASES_PER_PAGE = 15;
const CaseTable = props => {
  const [index, setIndex] = useState(0);

  const updatePage = change => {
    setIndex(index + change);
  }

  const beginning = index * CASES_PER_PAGE;
  const end = beginning + CASES_PER_PAGE < props.data.length ?
    (beginning + CASES_PER_PAGE) : props.data.length;

  return (
    <div className="case-table">
      <table>
        <thead>
          <tr>
            <th>State ID</th>
            <th>District</th>
            <th>Supervisor</th>
            <th>Officer</th>
            <th>Risk level</th>
            <th>Officer rec.</th>
            <th>Violation record</th>
          </tr>
        </thead>
        <tbody>
          {props.data.slice(beginning, end).map((details, i) => (
            <tr key={i}>
              <td>{details.state_id}</td>
              <td>{details.district}</td>
              <td>{details.supervisor}</td>
              <td>{details.officer}</td>
              <td>{details.risk_level}</td>
              <td>{details.officer_recommendation}</td>
              <td>{details.violation_record}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.data.length > CASES_PER_PAGE &&
        <div className="table-navigation">
          {beginning != 0 &&
            <button onClick={e => updatePage(-1)}>&#10094;</button>
          }
          Showing {beginning+1} {beginning+1 != end && <> - {end} </>} of {props.data.length}
          {end < props.data.length &&
            <button onClick={e => updatePage(1)}>&#10095;</button>
          }
        </div>
      }
    </div>
  )
}

export default CaseTable;
