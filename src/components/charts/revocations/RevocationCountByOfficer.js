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
import * as $ from 'jquery';
import { Bar } from 'react-chartjs-2';
import { COLORS_FIVE_VALUES } from '../../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../../assets/scripts/utils/downloads';

const RevocationCountByOfficer = (props) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [absconsionDataPoints, setAbsconsionDataPoints] = useState([]);
  const [newOffenseDataPoints, setNewOffenseDataPoints] = useState([]);
  const [technicalDataPoints, setTechnicalDataPoints] = useState([]);
  const [unknownDataPoints, setUnknownDataPoints] = useState([]);
  const [allChartData, setAllChartData] = useState({});
  const [visibleOfficeName, setvisibleOfficeName] = useState('');
  const chartId = 'revocationsByOfficer';

  function setDataForVisibleOffice(dataPoints, visibleOffice) {
    const officerLabels = [];
    const violationArrays = {
      ABSCONDED: [],
      FELONY: [],
      TECHNICAL: [],
      UNKNOWN_VIOLATION_TYPE: [],
    };

    const visibleOfficeData = dataPoints[visibleOffice];
    const sortedDataPoints = visibleOfficeData.sort((a, b) => (
      a.officerID - b.officerID));

    for (let i = 0; i < sortedDataPoints.length; i += 1) {
      officerLabels.push(sortedDataPoints[i].officerID);
      const data = sortedDataPoints[i].violationsByType;
      Object.keys(data).forEach((violationType) => {
        violationArrays[violationType].push(data[violationType]);
      });
    }

    setvisibleOfficeName(visibleOffice);
    setChartLabels(officerLabels);
    setAbsconsionDataPoints(violationArrays.ABSCONDED);
    setNewOffenseDataPoints(violationArrays.FELONY);
    setTechnicalDataPoints(violationArrays.TECHNICAL);
    setUnknownDataPoints(violationArrays.UNKNOWN_VIOLATION_TYPE);
  }

  function configureDownloads(chart, chartData, visibleOffice) {
    const exportedStructureCallback = () => (
      {
        office: visibleOffice,
        metric: 'Revocation counts by officer',
        series: [],
      });

    let downloadableDataFormat = [];
    if (chartData[visibleOffice]) {
      downloadableDataFormat = [{
        data: Object.values(chartData[visibleOffice]),
        label: chartId,
      }];
    } else {
      downloadableDataFormat = [];
    }

    configureDownloadButtons(chartId, downloadableDataFormat,
      chart.props.data.labels, document.getElementById(chartId),
      exportedStructureCallback);
  }

  const processResponse = () => {
    const { revocationCountsByOfficer, officeData, dropdownId } = props;
    const offices = {};
    const officeIds = [];

    officeData.forEach((office) => {
      const {
        site_id: officeId,
        site_name: officeName,
      } = office;

      offices[officeId] = officeName.replace(' ', '-');
      officeIds.push(officeId);
    });

    const dataPoints = {};
    revocationCountsByOfficer.forEach((data) => {
      const {
        officer_external_id: officerID, absconsion_count: absconsionCount,
        felony_count: felonyCount, technical_count: technicalCount,
        unknown_count: unknownCount, site_id: officeId,
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

      let officeName = offices[parseInt(officeId, 10)];
      if (officeName && officerID !== 'OFFICER_UNKNOWN') {
        officeName = officeName.replace(' ', '-');
        if (dataPoints[officeName] == null) {
          dataPoints[officeName] = [{
            officerID,
            violationsByType,
            overallRevocationCount,
          }];
        } else {
          dataPoints[officeName].push({
            officerID,
            violationsByType,
            overallRevocationCount,
          });
        }
      }
    });

    // Disable any office name from the dropdown menu if there is no data
    // for that office
    Object.values(offices).forEach((officeName) => {
      if (!dataPoints[officeName]) {
        $(`#${dropdownId}-${officeName}`).addClass('disabled');
      }
    });

    // Show data for the first office name that has data
    const sortedOfficeNames = Object.keys(dataPoints).sort();
    const visibleOffice = sortedOfficeNames[0];
    setDataForVisibleOffice(dataPoints, visibleOffice);
    setAllChartData(dataPoints);
  };

  useEffect(() => {
    processResponse();
  }, [props.revocationCountsByOfficer]);

  const chart = (
    <Bar
      id={chartId}
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

  configureDownloads(chart, allChartData, visibleOfficeName);

  const processDatasetChange = (officeName) => {
    setDataForVisibleOffice(allChartData, officeName);
    configureDownloads(chart, allChartData, officeName);
  };

  // Set the dropdown toggle text to be the visible office name
  $(`#${props.dropdownId}`).text(visibleOfficeName.replace('-', ' '));

  Object.keys(allChartData).forEach((officeName) => {
    const dropdownItemId = `${props.dropdownId}-${officeName}`;
    const dropdownItem = document.getElementById(dropdownItemId);
    if (dropdownItem) {
      // Configure the callback for each dropdown item to change the visible dataset
      dropdownItem.onclick = function changeDataset() {
        processDatasetChange(officeName);
      };

      // Set the active dropdown item to be the visible office name
      if (officeName === visibleOfficeName) {
        $(`#${dropdownItemId}`).addClass('active');
      } else {
        $(`#${dropdownItemId}`).removeClass('active');
      }
    }
  });

  return chart;
};


export default RevocationCountByOfficer;
