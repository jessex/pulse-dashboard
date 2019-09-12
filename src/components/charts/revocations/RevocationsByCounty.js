import React, { Component, useState, useEffect } from "react"
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
import geographyObject from '../../../assets/static/maps/us_nd.json';
import { COLORS } from '../../../assets/scripts/constants/colors';

let max = -1e100;

function countyNameFromCode(stateCode, countyCode) {
  let newCountyName = countyCode.replace(stateCode.concat('_'), '');
  newCountyName = newCountyName.replace('_', ' ');
  return newCountyName;
}

function revocationCountForCounty(chartDataPoints, countyName) {
  const revocationsForCounty = chartDataPoints[countyName.toUpperCase()];
  if (revocationsForCounty) {
    return revocationsForCounty;
  }

  return 0;
}

function colorForCounty(chartDataPoints, countsByCounty, countyName) {
  const countyScale = scaleLinear()
    .domain([0, max / 2, max])
    .range(['#E0E2E7', '#AFBDE3', COLORS['blue-standard-2']]);

  const revocationsForCounty = revocationCountForCounty(chartDataPoints, countyName);
  return countyScale(revocationsForCounty);
}

class RevocationsByCounty extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.revocationsByCounty = this.props.revocationsByCounty;
    this.chartDataPoints = {};
    this.revocationsByCounty.forEach((data) => {
      const {
        state_code: stateCode,
        county_code: countyCode,
        revocation_count: revocationCount,
      } = data;

      if (countyCode !== 'UNKNOWN_COUNTY') {
        if (revocationCount > max) max = revocationCount;
        const standardCountyName = countyNameFromCode(stateCode, countyCode);
        this.chartDataPoints[standardCountyName] = revocationCount;
      }
    });
  }

  componentDidMount() {
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
          height={551}
          style={{
            width: '100%',
            height: 'auto',
          }}
        >
          <ZoomableGroup center={[-101, 47]} zoom={6} disablePanning>
            <Geographies geography={geographyObject}>
              {(geographies, projection) => geographies.map((geography, i) => (
                <Geography
                  key={i}
                  data-tip={geography.properties.NAME
                    + ' ('.concat(revocationCountForCounty(this.chartDataPoints, geography.properties.NAME), ')')}
                  geography={geography}
                  projection={projection}
                  style={{
                    default: {
                      fill: colorForCounty(this.chartDataPoints,
                        this.revocationsByCounty,
                        geography.properties.NAME),
                      stroke: COLORS['grey-700'],
                      strokeWidth: 0.2,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#CFD8DC',
                      stroke: COLORS['grey-700'],
                      strokeWidth: 0.2,
                      outline: 'none',
                    },
                  }}
                />
              ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip />
      </div>
    );
  }
}

export default RevocationsByCounty;
