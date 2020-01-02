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
import { Bar } from 'react-chartjs-2';

import { COLORS } from '../../../assets/scripts/constants/colors';

const RevocationsByRiskLevel = props => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);

  const processResponse = () => {
    const riskLevelToCount = props.data.reduce((result, { risk_level, population_count }) => {
      return { ...result, [risk_level]: (result[risk_level] || 0) + (parseInt(population_count) || 0) };
    }, {});

    setChartLabels(Object.keys(riskLevelToCount));
    setChartDataPoints(Object.values(riskLevelToCount));
  }

  useEffect(() => {
    processResponse();
  }, [props.data]);

  return (
    <div>
      <h4>Revocations by risk level</h4>
      <Bar
        data={{
          labels: chartLabels,
          datasets: [{
            label: 'risk level',
            backgroundColor: COLORS['orange-500'],
            hoverBackgroundColor: COLORS['orange-500'],
            hoverBorderColor: COLORS['orange-500'],
            data: chartDataPoints,
          }],
        }}
        options={{
          legend: {
            display: false,
          },
          responsive: true,
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Risk level',
              },
              stacked: true,
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '# of revocations',
              },
              stacked: true,
            }],
          },
          tooltips: {
            backgroundColor: COLORS['grey-800-light'],
            mode: 'index',
            intersect: false,
          },
        }}
      />
    </div>
  )
}

export default RevocationsByRiskLevel;
