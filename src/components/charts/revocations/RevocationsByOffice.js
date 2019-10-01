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
import geographyObject from '../../../assets/static/maps/us_nd.json';
import { COLORS } from '../../../assets/scripts/constants/colors';
import { configureDownloadButtons } from '../../../assets/scripts/utils/downloads';
import { changeDataSetOfChart } from '../../../utils/dynamicData';

// TODO: Move this ND-specific info out of this file
const centerNDLong = -100.5;
const centerNDLat = 47.3;

const offices = {
  1: { titleSide: 'top', name: 'Bismarck', coordinates: [-100.745186, 46.812513] },
  2: { titleSide: 'bottom', name: 'Jamestown', coordinates: [-98.708340, 46.901152] },
  3: { titleSide: 'bottom', name: 'Minot', coordinates: [-101.317666, 48.234138] },
  4: { titleSide: 'bottom', name: 'Fargo', coordinates: [-96.835261, 46.870340] },
  5: { titleSide: 'bottom', name: 'Grand Forks', coordinates: [-97.646431, 48.151925] },
  6: { titleSide: 'top', name: 'Devils Lake', coordinates: [-98.866727, 48.107663] },
  7: { titleSide: 'bottom', name: 'Wahpeton', coordinates: [-96.608167, 46.263930] },
  8: { titleSide: 'bottom', name: 'Rolla', coordinates: [-99.606512, 48.862795] },
  9: { titleSide: 'top', name: 'Washburn', coordinates: [-101.026420, 47.290287] },
  10: { titleSide: 'bottom', name: 'Williston', coordinates: [-103.612105, 48.156118] },
  11: { titleSide: 'bottom', name: 'Dickinson', coordinates: [-102.785458, 46.880403] },
  12: { titleSide: 'top', name: 'Grafton', coordinates: [-97.405384, 48.417929] },
  13: { titleSide: 'bottom', name: 'Mandan', coordinates: [-100.295054, 46.679802] },
  14: { titleSide: 'top', name: 'Bottineau', coordinates: [-100.445800, 48.826567] },
  15: { titleSide: 'bottom', name: 'Oakes', coordinates: [-98.093554, 46.140153] },
  16: { titleSide: 'bottom', name: 'Beulah', coordinates: [-101.785210, 47.260616] },
};

function offsetForOfficeTitle(office) {
  if (office.titleSide === 'bottom') {
    return office.revocationCount + 25;
  }

  return -1 * office.revocationCount - 15;
}

const showRevocationsForOffice = (evt) => {
  changeDataSetOfChart(evt.name);
};

class RevocationsByOffice extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.revocationsByOffice = this.props.revocationsByOffice;
    this.chartDataPoints = []

    this.revocationsByOffice.forEach((data) => {
      const {
        site_id: siteId,
        total: revocationCount,
      } = data;

      const siteIdNum = parseInt(siteId, 10);
      const revocationCountNum = parseInt(revocationCount, 10);
      const office = offices[siteIdNum];
      office.revocationCount = revocationCountNum;
      office.siteId = siteIdNum;
      if (revocationCountNum > 0) {
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

    const downloadableDataFormat = [{
      data: Object.values(this.chartDataPoints),
      label: 'revocationsByOffice',
    }];

    configureDownloadButtons('revocationsByOffice', downloadableDataFormat,
      Object.keys(this.chartDataPoints),
      document.getElementById('revocationsByOffice'), exportedStructureCallback);

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
          <ZoomableGroup center={[centerNDLong, centerNDLat]} zoom={7} disablePanning>
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
                  onClick={showRevocationsForOffice}
                  key={i}
                  marker={office}
                  style={{
                    default: { fill: COLORS['red-standard'] },
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
                    y={offsetForOfficeTitle(office)}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '175%',
                      fontWeight: '900',
                      fill: '#607D8B',
                    }}
                  >
                    {office.name.concat(' (', office.revocationCount, ')')}
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
