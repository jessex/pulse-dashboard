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

const RevocationsByDistrict = props => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);

  const processResponse = () => {
    const districtToCount = props.data.reduce((result, { district, population_count }) => {
      return { ...result, [district]: (result[district] || 0) + (parseInt(population_count) || 0) };
    }, {});

    const labels = Object.keys(districtToCount);
    const dataPoints = labels.map(district => districtToCount[district])
    setChartLabels(labels);
    setChartDataPoints(dataPoints);
  }

  useEffect(() => {
    processResponse();
  }, [props.data]);

  return (
    <div>
      <h4>Revocations by district</h4>
      <Bar
        data={{
          labels: chartLabels,
          datasets: [{
            label: 'District',
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
                labelString: 'District',
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

export default RevocationsByDistrict;
