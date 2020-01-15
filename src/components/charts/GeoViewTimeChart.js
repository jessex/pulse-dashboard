// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
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

import React, { Component } from 'react';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker,
} from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { geoAlbersUsa } from 'd3-geo';
import { scaleLinear } from 'd3-scale';

import { COLORS } from '../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../assets/scripts/utils/downloads';
import geographyObject from '../../assets/static/maps/us_nd.json';
import { colorForValue } from '../../utils/charts/choropleth';
import { toHtmlFriendly, toInt } from '../../utils/transforms/labels';

const minMarkerRadius = 10;
const maxMarkerRadius = 35;

const TIME_WINDOWS = ['1m', '3m', '6m', '1y', '3y'];

function normalizedOfficeKey(officeName) {
  return toHtmlFriendly(officeName).toLowerCase();
}

function normalizedSupervisionTypeKey(supervisionType) {
  if (!supervisionType) {
    return 'none';
  }
  return supervisionType.toLowerCase();
}

function getOfficeDataValue(office, metricType, timeWindow, supervisionType) {
  const supervisionTypeKey = normalizedSupervisionTypeKey(supervisionType);
  if (metricType === 'counts') {
    if (supervisionTypeKey === 'all') {
      return office.dataValues[timeWindow].parole.numerator + office.dataValues[timeWindow].probation.numerator;
    }
    return office.dataValues[timeWindow][supervisionTypeKey].numerator;
  }

  if (supervisionTypeKey === 'all') {
    const paroleCount = office.dataValues[timeWindow].parole.numerator;
    const probationCount = office.dataValues[timeWindow].probation.numerator;
    const paroleDenominator = office.dataValues[timeWindow].parole.denominator;
    const probationDenominator = office.dataValues[timeWindow].probation.denominator;

    return (100 * ((paroleCount + probationCount) / (paroleDenominator + probationDenominator)))
      .toFixed(2);
  }
  return office.dataValues[timeWindow][supervisionTypeKey].rate;
}

function relatedMaxValue(maxValues, metricType, timeWindow, supervisionTypeKey) {
  let maxValue = 0;
  const valueKey = metricType === 'counts' ? 'numerator' : 'rate';
  if (supervisionTypeKey === 'all') {
    // TODO re-test this once all is made explicit
    maxValue = maxValues[timeWindow].parole[valueKey] + maxValues[timeWindow].probation[valueKey];
  } else {
    maxValue = maxValues[timeWindow][supervisionTypeKey][valueKey];
  }
  return maxValue;
}

/**
 * Returns the radius pixel size for the marker of the given office.
 * The size of the markers are distributed a linear scale given the count or
 * rate of the offices, where the office with the highest number or percentage of
 * numerator events will have a marker with the radius size of `maxMarkerRadius`.
 */
function radiusOfMarker(office, maxValues, metricType, timeWindow, supervisionType) {
  const supervisionTypeKey = normalizedSupervisionTypeKey(supervisionType);
  const maxValue = relatedMaxValue(maxValues, metricType, timeWindow, supervisionTypeKey);

  const officeScale = scaleLinear()
    .domain([0, maxValue])
    .range([minMarkerRadius, maxMarkerRadius]);

  const dataValue = getOfficeDataValue(office, metricType, timeWindow, supervisionType);
  // We use the absolute value so that the radius is tied to distance away from 0.
  // An alternative to consider is making the domain of the scale the minimum value, but this fits
  // the only negative value use case we have right now: LSIR Score Change, where large negative
  // values should lead to large radii.
  return officeScale(Math.abs(dataValue));
}

function toggleTooltip(office, metricType, timeWindow, supervisionType) {
  const value = getOfficeDataValue(office, metricType, timeWindow, supervisionType);
  if (metricType === 'counts') {
    return `${office.officeName}: ${value}`;
  }

  return `${office.officeName}: ${value}%`;
}

function colorForMarker(office, maxValues, metricType, timeWindow, supervisionType) {
  const supervisionTypeKey = normalizedSupervisionTypeKey(supervisionType);
  const dataValue = getOfficeDataValue(office, metricType, timeWindow, supervisionType);
  const maxValue = relatedMaxValue(maxValues, metricType, timeWindow, supervisionTypeKey);

  return colorForValue(Math.abs(dataValue), maxValue, true);
}

function sortChartDataPoints(dataPoints, metricType, timeWindow, supervisionType) {
  return dataPoints.sort((a, b) => (getOfficeDataValue(b, metricType, timeWindow, supervisionType)
    - getOfficeDataValue(a, metricType, timeWindow, supervisionType)));
}

class GeoViewTimeChart extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.initializeChartData = this.initializeChartData.bind(this);
    this.initializeChartData();
  }

  componentDidMount() {
    this.initializeChartData();
    this.reconfigureExports();

    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 100);
  }

  componentDidUpdate(prevProps, prevState) {
    this.reconfigureExports();
  }

  setEmptyOfficeData(office) {
    TIME_WINDOWS.forEach((window) => {
      office.dataValues[window] = {
        // Add all here?
        none: { numerator: 0, denominator: 0, rate: 0.00 },
        parole: { numerator: 0, denominator: 0, rate: 0.00 },
        probation: { numerator: 0, denominator: 0, rate: 0.00 },
      };
    });
  }

  reconfigureExports() {
    const exportedStructureCallback = () => (
      {
        metric: 'Events by P&P office',
        series: [],
      });

    const dataPointsByOffice = [];
    const officeNames = [];
    this.chartDataPoints.forEach((data) => {
      const { officeName } = data;
      const officeDataValue = getOfficeDataValue(
        data, this.props.metricType, this.props.timeWindow, this.props.supervisionType,
      );

      officeNames.push(officeName);
      dataPointsByOffice.push(officeDataValue);
    });

    const downloadableDataFormat = [{
      data: dataPointsByOffice,
      label: 'Event count',
    }];

    configureDownloadButtons(this.props.chartId, this.props.chartTitle,
      downloadableDataFormat, officeNames, document.getElementById(this.props.chartId),
      exportedStructureCallback, this.props);
  }

  initializeMaxValues() {
    this.maxValues = {};
    TIME_WINDOWS.forEach((timeWindow) => {
      this.maxValues[timeWindow] = {
        none: { numerator: -1e100, rate: -1e100 },
        parole: { numerator: -1e100, rate: -1e100 },
        probation: { numerator: -1e100, rate: -1e100 },
      }
    });
  }

  initializeChartData() {
    this.officeData = this.props.officeData;
    this.dataPointsByOffice = this.props.dataPointsByOffice;
    this.offices = {};
    this.officeKeys = [];
    this.initializeMaxValues();

    if (this.officeData) {
      // Load office metadata
      this.officeData.forEach((officeData) => {
        const {
          site_name: name,
          long: longValue,
          lat: latValue,
          title_side: titleSideValue,
        } = officeData;

        const office = {
          officeName: name,
          coordinates: [longValue, latValue],
          titleSide: titleSideValue,
          dataValues: {},
        };

        const officeNameKey = normalizedOfficeKey(name);
        this.offices[officeNameKey] = office;
        this.officeKeys.push(officeNameKey);
      });
    }

    // Load data for each office
    this.chartDataPoints = [];
    this.officeKeysWithData = [];
    if (this.dataPointsByOffice) {
      this.dataPointsByOffice.forEach((data) => {
        const {
          district,
          time_window: timeWindow,
          supervision_type: supervisionType,
        } = data;
        const supervisionTypeKey = normalizedSupervisionTypeKey(supervisionType);

        const officeNameKey = normalizedOfficeKey(district);
        const office = this.offices[officeNameKey];
        if (office) {
          if (!office.dataValues[timeWindow]) {
            office.dataValues[timeWindow] = {
              none: { numerator: 0, denominator: 0, rate: 0.00 },
              parole: { numerator: 0, denominator: 0, rate: 0.00 },
              probation: { numerator: 0, denominator: 0, rate: 0.00 },
            };
          }
          if (!office.dataValues[timeWindow][supervisionTypeKey]) {
            office.dataValues[timeWindow][supervisionTypeKey] = {};
          }

          const numeratorKeysToSum = this.props.numeratorKeys;
          let numerator = 0;
          numeratorKeysToSum.forEach((key) => {
            numerator += Number(data[key] || 0);
          });

          const denominatorKeysToSum = this.props.denominatorKeys;
          let denominator = 0;
          denominatorKeysToSum.forEach((key) => {
            denominator += Number(data[key] || 0);
          });

          if (numerator === 0 || (denominator === 0 && denominatorKeysToSum.length > 0)) {
            return;
          }

          let rate = 0.0;
          if (denominatorKeysToSum.length > 0) {
            rate = (100 * (numerator / denominator));
          }
          const rateFixed = rate.toFixed(2);

          office.dataValues[timeWindow][supervisionTypeKey] = {
            numerator,
            denominator,
            rate: rateFixed,
          };

          if (!this.officeKeysWithData.includes(officeNameKey)) {
            this.chartDataPoints.push(office);
            this.officeKeysWithData.push(officeNameKey);
          }

          const numeratorAbs = Math.abs(numerator);
          if (numeratorAbs > this.maxValues[timeWindow][supervisionTypeKey].numerator) {
            this.maxValues[timeWindow][supervisionTypeKey].numerator = numeratorAbs;
          }
          if (rate > this.maxValues[timeWindow][supervisionTypeKey].rate) {
            this.maxValues[timeWindow][supervisionTypeKey].rate = rate;
          }
        }
      });
    }

    // Set the count to 0 for offices without data
    const officeKeysWithoutData = this.officeKeys.filter((value) => (
      !this.officeKeysWithData.includes(value)));

    officeKeysWithoutData.forEach((officeKey) => {
      const office = this.offices[officeKey];
      if (office) {
        this.setEmptyOfficeData(office);
        this.chartDataPoints.push(office);
      }
    });

    const { metricType, timeWindow, supervisionType } = this.props;
    sortChartDataPoints(this.chartDataPoints, metricType, timeWindow, supervisionType);
  }

  render() {
    return (
      <div className="map-container">
        <ComposableMap
          projection={geoAlbersUsa}
          projectionConfig={{ scale: 1000 }}
          width={980}
          height={580}
          style={{
            width: '100%',
            height: 'auto',
          }}
        >
          <ZoomableGroup center={[this.props.centerLong, this.props.centerLat]} zoom={8.2}>
            <Geographies geography={geographyObject}>
              {(geographies, projection) => geographies.map((geography) => (
                <Geography
                  key={geography.properties.NAME}
                  geography={geography}
                  projection={projection}
                  style={{
                    default: {
                      fill: '#F5F6F7',
                      stroke: COLORS['grey-300'],
                      strokeWidth: 0.2,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#F5F6F7',
                      stroke: COLORS['grey-300'],
                      strokeWidth: 0.2,
                      outline: 'none',
                    },
                    pressed: {
                      fill: '#F5F6F7',
                      stroke: COLORS['grey-300'],
                      strokeWidth: 0.2,
                      outline: 'none',
                    },
                  }}
                />
              ))
              }
            </Geographies>
            <Markers>
              {this.chartDataPoints.map((office) => (
                <Marker
                  key={office.officeName}
                  marker={office}
                  style={{
                    default: {
                      fill: colorForMarker(office, this.maxValues, this.props.metricType, this.props.timeWindow, this.props.supervisionType),
                      stroke: '#F5F6F7',
                      strokeWidth: '3',
                    },
                    hover: { fill: COLORS['blue-standard'] },
                    pressed: { fill: COLORS['blue-standard'] },
                  }}
                >
                  <circle
                    data-tip={toggleTooltip(office, this.props.metricType, this.props.timeWindow, this.props.supervisionType)}
                    cx={0}
                    cy={0}
                    r={radiusOfMarker(office, this.maxValues, this.props.metricType, this.props.timeWindow, this.props.supervisionType)}
                  />
                </Marker>
              ))}
            </Markers>
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip />
      </div>
    );
  }
}

export default GeoViewTimeChart;
