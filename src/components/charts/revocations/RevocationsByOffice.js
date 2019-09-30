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
import { configureDownloadButtons } from '../../../assets/scripts/charts/chartJS/downloads';

const centerNDLong = -100.5;
const centerNDLat = 47.3;

const offices = [
  { titleSide: -1, name: 'Bismarck', coordinates: [-100.745186, 46.812513], revocationCount: 17 },
  { titleSide: 1, name: 'Jamestown', coordinates: [-98.708340, 46.901152], revocationCount: 2 },
  { titleSide: 1, name: 'Minot', coordinates: [-101.317666, 48.234138], revocationCount: 5 },
  { titleSide: 1, name: 'Fargo', coordinates: [-96.835261, 46.870340], revocationCount: 7 },
  { titleSide: 1, name: 'Grand Forks', coordinates: [-97.646431, 48.151925], revocationCount: 7 },
  { titleSide: -1, name: 'Devils Lake', coordinates: [-98.866727, 48.107663], revocationCount: 4 },
  { titleSide: 1, name: 'Wahpeton', coordinates: [-96.608167, 46.263930], revocationCount: 1 },
  { titleSide: 1, name: 'Rolla', coordinates: [-99.606512, 48.862795], revocationCount: 3 },
  { titleSide: -1, name: 'Washburn', coordinates: [-101.026420, 47.290287], revocationCount: 0 },
  { titleSide: 1, name: 'Williston', coordinates: [-103.612105, 48.156118], revocationCount: 2 },
  { titleSide: 1, name: 'Dickinson', coordinates: [-102.785458, 46.880403], revocationCount: 3 },
  { titleSide: 1, name: 'Grafton', coordinates: [-97.405384, 48.417929], revocationCount: 1 },
  { titleSide: 1, name: 'Mandan', coordinates: [-100.295054, 46.679802], revocationCount: 18 },
  { titleSide: -1, name: 'Bottineau', coordinates: [-100.445800, 48.826567], revocationCount: 0 },
  { titleSide: 1, name: 'Oakes', coordinates: [-98.093554, 46.140153], revocationCount: 0 },
  { titleSide: 1, name: 'Beulah', coordinates: [-101.785210, 47.260616], revocationCount: 0 },
];

class RevocationsByOffice extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    // this.revocaionsByOffice = this.props.revocaionsByOffice;
    this.chartDataPoints = [
      {
        siteName: 'Bismarck',
        longitude: -100.745186,
        latitude: 46.812513,
        revocationCount: 17,
      },
    ];
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
          height={500}
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
              {offices.map((office, i) => (
                <Marker
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
                    y={(office.revocationCount + 15) * (office.titleSide)}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '100%',
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
