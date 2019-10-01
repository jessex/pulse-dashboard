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
import { COLORS_FIVE_VALUES } from '../../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../../assets/scripts/utils/downloads';
import { configureDatasetChangeButton } from '../../../utils/dynamicData';

const siteIDsToNames = {
  1: 'Bismarck',
  2: 'Jamestown',
  3: 'Minot',
  4: 'Fargo',
  5: 'Grand-Forks',
  6: 'Devils-Lake',
  7: 'Wahpeton',
  8: 'Rolla',
  9: 'Washburn',
  10: 'Williston',
  11: 'Dickinson',
  12: 'Grafton',
  13: 'Mandan',
  14: 'Bottineau',
  15: 'Oakes',
  16: 'Beulah',
};

const RevocationCountByOfficer = (props) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [absconsionDataPoints, setAbsconsionDataPoints] = useState([]);
  const [newOffenseDataPoints, setNewOffenseDataPoints] = useState([]);
  const [technicalDataPoints, setTechnicalDataPoints] = useState([]);
  const [unknownDataPoints, setUnknownDataPoints] = useState([]);
  const [allChartData, setAllChartData] = useState({});

  const processResponse = () => {
    const { revocationCountsByOfficer } = props;

    const dataPoints = {};
    revocationCountsByOfficer.forEach((data) => {
      const {
        officer_external_id: officerID, absconsion_count: absconsionCount,
        felony_count: felonyCount, technical_count: technicalCount,
        unknown_count: unknownCount, SITEID: siteId,
      } = data;

      const violationsByType = {
        ABSCONDED: parseInt(absconsionCount, 10),
        FELONY: parseInt(felonyCount, 10),
        TECHNICAL: parseInt(technicalCount, 10),
        UNKNOWN_VIOLATION_TYPE: parseInt(unknownCount, 10),
      };

      let overallRevocationCount = 0;
      Object.keys(violationsByType).forEach((violationType) => {
        overallRevocationCount += violationsByType[violationType];
      });

      const siteName = siteIDsToNames[parseInt(siteId, 10)];

      if (officerID !== 'OFFICER_UNKNOWN') {
        if (dataPoints[siteName] == null) {
          dataPoints[siteName] = [{
            officerID,
            violationsByType,
            overallRevocationCount,
          }];
        } else {
          dataPoints[siteName].push({
            officerID,
            violationsByType,
            overallRevocationCount,
          });
        }
      }
    });

    const officerLabels = [];
    const violationArrays = {
      ABSCONDED: [],
      FELONY: [],
      TECHNICAL: [],
      UNKNOWN_VIOLATION_TYPE: [],
    };

    // const sortedDataPoints = dataPoints.sort((a, b) => (
    //   b.overallRevocationCount - a.overallRevocationCount));

    const sortedDataPoints = dataPoints['Bismarck'].sort((a, b) => (
      a.officerID - b.officerID));

    for (let i = 0; i < sortedDataPoints.length; i += 1) {
      officerLabels.push(sortedDataPoints[i].officerID);
      const data = sortedDataPoints[i].violationsByType;
      Object.keys(data).forEach((violationType) => {
        violationArrays[violationType].push(data[violationType]);
      });
    }

    setChartLabels(officerLabels);
    setAbsconsionDataPoints(violationArrays.ABSCONDED);
    setNewOffenseDataPoints(violationArrays.FELONY);
    setTechnicalDataPoints(violationArrays.TECHNICAL);
    setUnknownDataPoints(violationArrays.UNKNOWN_VIOLATION_TYPE);
    setAllChartData(dataPoints);
  };

  useEffect(() => {
    processResponse();
  }, [props.revocationCountsByOfficer]);

  const chart = (
    <Bar
      id="revocationsByOfficer"
      data={{
        labels: chartLabels,
        datasets: [{
          label: 'Absconsion',
          backgroundColor: COLORS_FIVE_VALUES[0],
          data: absconsionDataPoints,
        }, {
          label: 'New Offense',
          backgroundColor: COLORS_FIVE_VALUES[1],
          data: newOffenseDataPoints,
        }, {
          label: 'Technical',
          backgroundColor: COLORS_FIVE_VALUES[2],
          data: technicalDataPoints,
        }, {
          label: 'Unknown Type',
          backgroundColor: COLORS_FIVE_VALUES[3],
          data: unknownDataPoints,
        },
        ],
      }}
      options={{
        responsive: true,
        legend: {
          position: 'bottom',
          boxWidth: 10,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItem) => ('Officer '.concat(tooltipItem[0].label)),
          },
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Officer ID',
            },
            stacked: true,
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Revocation count',
            },
            stacked: true,
            ticks: {
              stepSize: 1,
            },
          }],
        },
      }}
    />
  );

  const exportedStructureCallback = () => (
    {
      office: 'Bismarck',
      metric: 'Revocation counts by officer',
      series: [],
    });

  let downloadableDataFormat = [];
  if (allChartData.length > 0) {
    downloadableDataFormat = [{
      data: Object.values(allChartData['Bismarck']),
      label: 'revocationsByOfficer',
    }];
  } else {
    downloadableDataFormat = [];
  }

  configureDownloadButtons('revocationsByOfficer', downloadableDataFormat,
    chart.props.data.labels, document.getElementById('revocationsByOfficer'),
    exportedStructureCallback);

  const updateChart = (officeName) => {
    const officerLabels = [];
    const violationArrays = {
      ABSCONDED: [],
      FELONY: [],
      TECHNICAL: [],
      UNKNOWN_VIOLATION_TYPE: [],
    };

    const sortedDataPoints = allChartData[officeName].sort((a, b) => (
      a.officerID - b.officerID));

    for (let i = 0; i < sortedDataPoints.length; i += 1) {
      officerLabels.push(sortedDataPoints[i].officerID);
      const data = sortedDataPoints[i].violationsByType;
      Object.keys(data).forEach((violationType) => {
        violationArrays[violationType].push(data[violationType]);
      });
    }

    setChartLabels(officerLabels);
    setAbsconsionDataPoints(violationArrays.ABSCONDED);
    setNewOffenseDataPoints(violationArrays.FELONY);
    setTechnicalDataPoints(violationArrays.TECHNICAL);
    setUnknownDataPoints(violationArrays.UNKNOWN_VIOLATION_TYPE);

    const updatedExportedStructureCallback = () => (
      {
        office: officeName,
        metric: 'Revocation counts by officer',
        series: [],
      });

    downloadableDataFormat = [{
      data: Object.values(allChartData[officeName]),
      label: 'revocationsByOfficer',
    }];

    configureDownloadButtons('revocationsByOfficer', downloadableDataFormat,
      chart.props.data.labels, document.getElementById('revocationsByOfficer'),
      updatedExportedStructureCallback);
  };

  configureDatasetChangeButton(chart, allChartData, updateChart);

  return chart;
};


export default RevocationCountByOfficer;
