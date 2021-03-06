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
import { toInt } from '../../../utils/transforms/labels';
import { sortAndFilterMostRecentMonths } from '../../../utils/transforms/datasets';
import { monthNamesWithYearsFromNumbers } from '../../../utils/transforms/months';
import {
  getGoalForChart, getMinForGoalAndData, getMaxForGoalAndData, trendlineGoalText,
  goalLabelContentString,
} from '../../../utils/charts/metricGoal';
import {
  generateTrendlineDataset, getTooltipWithoutTrendline,
} from '../../../utils/charts/trendline';

const SupervisionSuccessSnapshot = (props) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [chartMinValue, setChartMinValue] = useState();
  const [chartMaxValue, setChartMaxValue] = useState();

  const chartId = 'supervisionSuccessSnapshot';
  const GOAL = getGoalForChart('US_ND', chartId);
  const stepSize = 10;

  const processResponse = () => {
    const { supervisionSuccessRates: countsByMonth } = props;

    const today = new Date();
    const yearNow = today.getFullYear();
    const monthNow = today.getMonth() + 1;

    const dataPoints = [];
    if (countsByMonth) {
      countsByMonth.forEach((data) => {
        let { projected_year: year, projected_month: month } = data;
        const successful = toInt(data.successful_termination);
        const revocation = toInt(data.revocation_termination);
        const successRate = (100 * (successful / (successful + revocation))).toFixed(2);

        year = toInt(year);
        month = toInt(month);

        // Don't add completion rates for months in the future
        if (year < yearNow || (year === yearNow && month <= monthNow)) {
          dataPoints.push({ year, month, successRate });
        }
      });
    }
    const sorted = sortAndFilterMostRecentMonths(dataPoints, 13);
    const chartDataValues = (sorted.map((element) => element.successRate));
    const min = getMinForGoalAndData(GOAL.value, chartDataValues, stepSize);
    const max = getMaxForGoalAndData(GOAL.value, chartDataValues, stepSize);

    setChartLabels(monthNamesWithYearsFromNumbers(sorted.map((element) => element.month), true));
    setChartDataPoints(chartDataValues);
    setChartMinValue(min);
    setChartMaxValue(max);
  };

  useEffect(() => {
    processResponse();
  }, [props.supervisionSuccessRates]);

  const chart = (
    <Line
      id={chartId}
      data={{
        labels: chartLabels,
        datasets: [{
          label: 'Supervision success rate',
          backgroundColor: COLORS['blue-standard'],
          borderColor: COLORS['blue-standard'],
          pointBackgroundColor: COLORS['blue-standard'],
          pointHoverBackgroundColor: COLORS['blue-standard'],
          pointHoverBorderColor: COLORS['blue-standard'],
          pointRadius: 4,
          hitRadius: 5,
          fill: false,
          borderWidth: 2,
          lineTension: 0,
          data: chartDataPoints,
        }, generateTrendlineDataset(chartDataPoints, COLORS['blue-standard-light']),
        ],
      }}
      options={{
        legend: {
          display: false,
          position: 'right',
          labels: {
            usePointStyle: true,
            boxWidth: 5,
          },
        },
        tooltips: {
          backgroundColor: COLORS['grey-800-light'],
          enabled: true,
          mode: 'point',
          callbacks: {
            label: (tooltipItem, data) => (getTooltipWithoutTrendline(tooltipItem, data, '%')),
          },
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: COLORS['grey-600'],
              autoSkip: false,
            },
            scaleLabel: {
              display: true,
              labelString: 'Month of scheduled supervision termination',
              fontColor: COLORS['grey-500'],
              fontStyle: 'bold',
            },
            gridLines: {
              color: '#FFF',
            },
          }],
          yAxes: [{
            ticks: {
              fontColor: COLORS['grey-600'],
              min: chartMinValue,
              max: chartMaxValue,
              stepSize,
            },
            scaleLabel: {
              display: true,
              labelString: '% of people',
              fontColor: COLORS['grey-500'],
              fontStyle: 'bold',
            },
            gridLines: {
              color: COLORS['grey-300'],
            },
          }],
        },
        annotation: {
          drawTime: 'afterDatasetsDraw',
          events: ['click'],

          // Array of annotation configuration objects
          // See below for detailed descriptions of the annotation options
          annotations: [{
            type: 'line',
            mode: 'horizontal',
            value: GOAL.value,

            // optional annotation ID (must be unique)
            id: 'supervisionSuccessSnapshotGoalLine',
            scaleID: 'y-axis-0',

            drawTime: 'afterDatasetsDraw',

            borderColor: COLORS['red-standard'],
            borderWidth: 2,
            borderDash: [2, 2],
            borderDashOffset: 5,
            label: {
              enabled: true,
              content: goalLabelContentString(GOAL),
              position: 'right',

              // Background color of label, default below
              backgroundColor: 'rgba(0, 0, 0, 0)',

              fontFamily: 'sans-serif',
              fontSize: 12,
              fontStyle: 'bold',
              fontColor: COLORS['red-standard'],

              // Adjustment along x-axis (left-right) of label relative to above
              // number (can be negative). For horizontal lines positioned left
              // or right, negative values move the label toward the edge, and
              // positive values toward the center.
              xAdjust: 0,

              // Adjustment along y-axis (top-bottom) of label relative to above
              // number (can be negative). For vertical lines positioned top or
              // bottom, negative values move the label toward the edge, and
              // positive values toward the center.
              yAdjust: -10,
            },

            onClick(e) { return e; },
          }],
        },
      }}
    />
  );

  const exportedStructureCallback = function exportedStructureCallback() {
    return {
      metric: 'Percentage of successful completion of supervision',
      series: [],
    };
  };

  configureDownloadButtons(chartId, 'SUCCESSFUL COMPLETION OF SUPERVISION', chart.props.data.datasets,
    chart.props.data.labels, document.getElementById(chartId),
    exportedStructureCallback);

  const header = document.getElementById(props.header);
  const trendlineValues = chart.props.data.datasets[1].data;
  const trendlineText = trendlineGoalText(trendlineValues, GOAL);

  if (header) {
    const title = `The rate of successful completion of supervision has been <b style='color:#809AE5'>trending ${trendlineText}.</b>`;
    header.innerHTML = title;
  }

  return (chart);
};

export default SupervisionSuccessSnapshot;
