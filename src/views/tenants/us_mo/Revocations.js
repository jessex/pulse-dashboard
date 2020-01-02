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
import Select from 'react-select';

import Loading from '../../../components/Loading';
import '../../../assets/styles/index.scss';
import { useAuth0 } from '../../../react-auth0-spa';
import { callMetricsApi, awaitingResults } from '../../../utils/metricsClient';

import RevocationMatrix
  from '../../../components/charts/revocations/RevocationMatrix';
import RevocationCountOverTime
  from '../../../components/charts/revocations/RevocationCountOverTime';
import RevocationsByDistrict
  from '../../../components/charts/revocations/RevocationsByDistrict';
import RevocationsByRiskLevel
  from '../../../components/charts/revocations/RevocationsByRiskLevel';
import RevocationsByViolation
  from '../../../components/charts/revocations/RevocationsByViolation';
import RevocationsBySex
  from '../../../components/charts/revocations/RevocationsBySex';
import RevocationsByRace
  from '../../../components/charts/revocations/RevocationsByRace';
import CaseTable
  from '../../../components/charts/revocations/CaseTable';

// TODO: replace with actual filter constants
const DISTRICTS = [
  { value: '', label: 'All districts'}
];
const CHARGE_CATEGORIES = [
  { value: '', label: 'All'},
  { value: 'General', label: 'General' },
  { value: 'Sex offense', label: 'Sex offense' },
  { value: 'Domestic Violence', label: 'Domestic Violence' },
  { value: 'SIS/SES', label: 'SIS/SES' }
];
const SUPERVISION_TYPES = [
  { value: '', label: 'All'},
  { value: 'Probation', label: 'Probation' },
  { value: 'Parole', label: 'Parole' },
  { value: 'Dual supervision', label: 'Dual supervision' },
];

const CHARTS = ["District", "Risk level", "Violation", "Sex", "Race"];

const Revocations = () => {
  const { loading, user, getTokenSilently } = useAuth0();
  const [apiData, setApiData] = useState({});
  const [awaitingApi, setAwaitingApi] = useState(true);

  const [filters, setFilters] = useState({});
  const [selectedChart, setSelectedChart] = useState('District');

  const fetchChartData = async () => {
    try {
      const responseData = await callMetricsApi('us_mo/newRevocations', getTokenSilently);
      setApiData(responseData);
      setAwaitingApi(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const updateFilters = (newFilters) => {
    setFilters(Object.assign({}, filters, newFilters));
  }

  const filterData = data => {
    // TODO: add other filters: district, charge category, and supervisionType
    return data.filter(item => {
      if (filters.violationType) {
        if (item.violation_type !== filters.violationType) return false
      }
      if (filters.reportedViolations) {
        if (parseInt(item.reported_violations) !== parseInt(filters.reportedViolations)) return false;
      }

      return true;
    });
  };

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'Risk level':
        return <RevocationsByRiskLevel
          data={filterData(apiData.revocations_matrix_distribution_by_risk_level)} />
      case 'Violation':
        return <RevocationsByViolation
          data={filterData(apiData.revocations_matrix_distribution_by_violation)} />
      case 'Sex':
        return <RevocationsBySex
          data={filterData(apiData.revocations_matrix_distribution_by_gender)} />
      case 'Race':
        return <RevocationsByRace
          data={filterData(apiData.revocations_matrix_distribution_by_race)} />
      default:
        return <RevocationsByDistrict
          data={filterData(apiData.revocations_matrix_distribution_by_district)} />
    }
  }

  if (awaitingResults(loading, user, awaitingApi)) {
    return <Loading />;
  }

  return (
    <main className="dashboard bgc-grey-100">
      <div className="top-level-filters d-f">
        <div className="top-level-filter">
          <h4>District</h4>
          <Select
            options={DISTRICTS}
            onChange={option => updateFilters({ district: option.value })}
          />
        </div>
        <div className="top-level-filter">
          <h4>Charge Category</h4>
          <Select
            options={CHARGE_CATEGORIES}
            onChange={option => updateFilters({ chargeCategory: option.value })}
          />
        </div>
        <div className="top-level-filter">
          <h4>Supervision Type</h4>
          <Select
            options={SUPERVISION_TYPES}
            onChange={option => updateFilters({ supervisionType: option.value })}
          />
        </div>
      </div>
      <div className="bgc-white p-20 m-20">
        <h4>Revocations over time</h4>
        <RevocationCountOverTime
          revocationCountsByMonth={apiData.revocations_by_month}
        />
      </div>
      <div className="d-f">
        <div className="bgc-white p-20 m-20">
          <RevocationMatrix
            data={apiData.revocations_matrix_cells}
            filters={filters}
            updateFilters={updateFilters}
          />
        </div>
        <div className="matrix-explanation bgc-white p-20 m-20">
          <h4>Using this chart</h4>
          <p className="fw-600">
            This chart shows the number of people revoked to prison from
            probation and parole, broken down by their most severe violation
            and the number of violation reports filed before revocation.
          </p>
          <div className="d-f mT-20">
            <div className="example-icon-container">
              <div className="example-violation-total">
                35
              </div>
            </div>
            <p className="fs-i fw-600">
              Click on a bubble to filter the dashboard by that set of
              revocations
            </p>
          </div>
          <div className="d-f mT-20">
            <div className="example-icon-container">
              <div className="example-violation-type">
                Technical
              </div>
            </div>
            <p className="fs-i fw-600">
              Click on the violation to filter the dashboard by that violation.
            </p>
          </div>
        </div>
      </div>
      <div className="static-charts d-f bgc-white m-20">
        <div className="chart-type-labels p-20">
          {CHARTS.map((chart, i) => (
            <div key={i}>
              <button
                className={`chart-type-label ${selectedChart === chart ? 'selected' : ''}`}
                onClick={() => setSelectedChart(chart)}
              >
                {chart}
              </button>
            </div>
          ))}
        </div>
        <div className="selected-chart p-20">
          {renderSelectedChart()}
        </div>
      </div>
      <div className="bgc-white m-20">
        <CaseTable
          data={filterData(apiData.revocation_cases)}
        />
      </div>
    </main>
  );
};

export default Revocations;
