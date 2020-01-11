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
import { Line } from 'react-chartjs-2';

import { COLORS } from '../../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../../assets/scripts/utils/downloads';
import { sortFilterAndSupplementMostRecentMonths } from '../../../utils/transforms/datasets';
import { monthNamesWithYearsFromNumbers } from '../../../utils/transforms/months';

const RevocationsOverTime = (props) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);

  const chartId = 'RevocationsOverTime';

  const processResponse = () => {
    if (!props.data) {
      return;
    }

    const yearAndMonthToCount = props.data.reduce((result, { year, month, total_revocations }) => {
      return { ...result, [`${year}:${month}`]: (result[`${year}:${month}`] || 0) + (parseInt(total_revocations) || 0) };
    }, {});
    const chartData = Object.entries(yearAndMonthToCount).map(([yearAndMonth, count]) => {
      const [year, month] = yearAndMonth.split(':');
      return { year, month, count };
    });

    const sortedChartData = sortFilterAndSupplementMostRecentMonths(chartData, 6, 'count', 0);
    const labels = monthNamesWithYearsFromNumbers(sortedChartData.map((element) => element.month), false)
    const dataPoints = (sortedChartData.map((element) => element.count));
    setChartLabels(labels);
    setChartDataPoints(dataPoints);
  };

  useEffect(() => {
    processResponse();
  }, [props.data]);

  const exportedStructureCallback = () => ({
    metric: 'Revocations over time',
    series: [],
  });

  const datasets = [{
    label: 'Revocations',
    borderColor: COLORS['light-blue-500'],
    pointBackgroundColor: COLORS['light-blue-500'],
    fill: false,
    lineTension: 0,
    borderWidth: 2,
    data: chartDataPoints,
  }];

  configureDownloadButtons(chartId, 'REVOCATIONS OVER TIME', datasets, chartLabels,
    document.getElementById(chartId), exportedStructureCallback);

  return (
    <div className="revocations-time-graph">
      <Line
        id={chartId}
        data={{
          labels: chartLabels,
          datasets: datasets,
        }}
        options={{
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              ticks: {
                autoSkip: false,
              },
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '# of revocations',
              },
            }],
          },
          tooltips: {
            backgroundColor: COLORS['grey-800-light'],
            mode: 'x',
          },
        }}
      />
    </div>
  );
};

export default RevocationsOverTime;
