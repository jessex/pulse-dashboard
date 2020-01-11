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

const CHART_LABELS = ["Overall", "Low", "Moderate", "High", "Very high"];
const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];
const GENDERS = ["FEMALE", "MALE"];

const RevocationsBySex = props => {
  const [chartDataPoints, setChartDataPoints] = useState([]);

  const getRiskLevelArrayForGender = forGender => RISK_LEVELS.map(riskLevel => (
    props.data
      .filter(({ gender, risk_level }) => gender == forGender && risk_level == riskLevel)
      .reduce((result, { population_count }) => result += parseInt(population_count), 0)
  ));

  const processResponse = () => {
    const genderToCount = props.data.reduce((result, { gender, population_count }) => {
      return { ...result, [gender]: (result[gender] || 0) + (parseInt(population_count) || 0) };
    }, {});

    const dataPoints = GENDERS.map(gender => [genderToCount[gender], ...getRiskLevelArrayForGender(gender)])
    setChartDataPoints(dataPoints);
  }

  useEffect(() => {
    processResponse();
  }, [props.data]);

  return (
    <div>
      <h4>Revocations by sex</h4>
      <Bar
        data={{
          labels: CHART_LABELS,
          datasets: [{
            label: 'Female',
            backgroundColor: COLORS['light-blue-500'],
            hoverBackgroundColor: COLORS['light-blue-500'],
            hoverBorderColor: COLORS['light-blue-500'],
            data: chartDataPoints[0],
          }, {
            label: 'Male',
            backgroundColor: COLORS['orange-500'],
            hoverBackgroundColor: COLORS['orange-500'],
            hoverBorderColor: COLORS['orange-500'],
            data: chartDataPoints[1],
          }],
        }}
        options={{
          legend: {
            position: 'bottom',
          },
          responsive: true,
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Sex',
              },
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '# of revocations',
              },
              ticks: {
                beginAtZero: true
              },
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

export default RevocationsBySex;
