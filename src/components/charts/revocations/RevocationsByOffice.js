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
import geographyObject from '../../../assets/static/maps/us_nd.json';
import { COLORS } from '../../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../../assets/scripts/utils/downloads';

const chartId = 'revocationsByOffice';
const centerNDLong = -100.5;
const centerNDLat = 47.3;

function xOffsetForOfficeTitle(office) {
  const revLabelOffset = (office.revocationCount > 9) ? 35 : 25;
  if (office.titleSide === 'left') {
    return (-1 * office.revocationCount) - (office.officeName.length * 7) - revLabelOffset;
  }

  if (office.titleSide === 'right') {
    return office.revocationCount + (office.officeName.length * 7) + revLabelOffset;
  }

  return 0;
}

function yOffsetForOfficeTitle(office) {
  if (office.titleSide === 'bottom') {
    return office.revocationCount + 25;
  }

  if (office.titleSide === 'top') {
    return -1 * office.revocationCount - 10;
  }

  return 10;
}

function colorForMarker(office) {
  return (office.revocationCount > 0) ? COLORS['red-standard'] : COLORS['grey-600'];
}

const officeClicked = (evt) => {
  const officeDropdownItem = document.getElementById(evt.officerDropdownItemId);
  if (officeDropdownItem) {
    officeDropdownItem.click();
  }
};

class RevocationsByOffice extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.officeData = this.props.officeData;
    this.revocationsByOffice = this.props.revocationsByOffice;
    this.officerDropdownId = this.props.officerDropdownId;
    this.offices = {};
    this.officeIds = [];

    // Load office metadata
    this.officeData.forEach((officeData) => {
      const {
        site_id: officeId,
        site_name: officeName,
        long, lat,
        title_side: titleSide,
      } = officeData;

      const office = {
        officeName, coordinates: [long, lat], titleSide,
      };

      this.offices[officeId] = office;
      this.officeIds.push(officeId);
    });

    // Load revocation data for each office
    this.chartDataPoints = [];
    this.officeIdsWithData = [];
    this.revocationsByOffice.forEach((data) => {
      const {
        site_id: officeId,
        absconsion_count: absconsionCount,
        felony_count: felonyCount, technical_count: technicalCount,
        unknown_count: unknownCount,
      } = data;

      const revocationCountNum = parseInt(absconsionCount, 10)
        + parseInt(felonyCount, 10) + parseInt(technicalCount, 10) + parseInt(unknownCount, 10);
      const officeIdInt = parseInt(officeId, 10);
      const office = this.offices[officeIdInt];
      if (office) {
        office.revocationCount = revocationCountNum;
        office.officerDropdownItemId = `${this.officerDropdownId}-${office.officeName.replace(' ', '-')}`;
        this.chartDataPoints.push(office);
        this.officeIdsWithData.push(officeIdInt);
      }
    });

    // Set the revocation count to 0 for offices without data
    const officeIdsWithoutData = this.officeIds.filter((value) => (
      !this.officeIdsWithData.includes(value)));

    officeIdsWithoutData.forEach((officeId) => {
      const office = this.offices[officeId];
      if (office) {
        office.revocationCount = 0;
        office.officerDropdownItemId = `${this.officerDropdownId}-${office.officeName.replace(' ', '-')}`;
        this.chartDataPoints.push(office);
      }
    });
  }

  componentDidMount() {
    const exportedStructureCallback = () => (
      {
        metric: 'Revocations by P&P office',
        series: [],
      });

    const dataArray = [];
    this.chartDataPoints.forEach((data) => {
      const {
        officeName,
        revocationCount,
      } = data;
      dataArray.push({ officeName, revocationCount });
    });

    const downloadableDataFormat = [{
      data: dataArray,
      label: chartId,
    }];

    configureDownloadButtons(chartId, downloadableDataFormat,
      Object.keys(this.chartDataPoints),
      document.getElementById(chartId), exportedStructureCallback);

    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 100);
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
          <ZoomableGroup center={[centerNDLong, centerNDLat]} zoom={8.2} disablePanning>
            <Geographies geography={geographyObject}>
              {(geographies, projection) => geographies.map((geography, i) => (
                <Geography
                  key={i}
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
              {this.chartDataPoints.map((office, i) => (
                <Marker
                  onClick={officeClicked}
                  key={i}
                  marker={office}
                  style={{
                    default: { fill: colorForMarker(office) },
                    hover: { fill: COLORS['blue-standard'] },
                    pressed: { fill: COLORS['blue-standard'] },
                  }}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={office.revocationCount + 3}
                  />
                  <text
                    textAnchor="middle"
                    x={xOffsetForOfficeTitle(office)}
                    y={yOffsetForOfficeTitle(office)}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '175%',
                      fontWeight: '900',
                      fill: '#607D8B',
                    }}
                  >
                    {office.officeName.concat(' (', office.revocationCount, ')')}
                  </text>
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

export default RevocationsByOffice;
