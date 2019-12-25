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
import ReviewCases
  from '../../../components/charts/revocations/ReviewCases';

// TODO: replace with actual filter constants
const DISTRICTS = ['one', 'two', 'three'];
const CHARGE_CATEGORIES = ['a', 'b', 'c'];
const SUPERVISION_TYPES = ['alpha', 'beta', 'gamma'];

const CHARTS = ["District", "Risk level", "Violation", "Sex", "Race"];

const Revocations = () => {
  const { loading, user, getTokenSilently } = useAuth0();
  const [apiData, setApiData] = useState({});
  const [awaitingApi, setAwaitingApi] = useState(true);

  const [filters, setFilters] = useState({});
  const [selectedChart, setSelectedChart] = useState();

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
    return data.filter(item => {
      if (filters.violationType) {
        if (item.violation_type !== filters.violationType) return false
      }
      if (filters.reportedViolations) {
        if (item.reported_violations !== filters.reportedViolations) return false;
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
    <main className="main-content bgc-grey-100">
      <div>
        <div>
          <h3>District</h3>
          <select onChange={e => updateFilters({ district: e.target.value })}>
            <option value=''>All districts</option>
            {DISTRICTS.map((district, i) =>
              <option key={i} value={district}>{district}</option>
            )}
          </select>
        </div>
        <div>
          <h3>Charge Category</h3>
          <select onChange={e => updateFilters({ chargeCategory: e.target.value })}>
            <option value=''>General</option>
            {CHARGE_CATEGORIES.map((chargeCategory, i) =>
              <option key={i} value={chargeCategory}>{chargeCategory}</option>
            )}
          </select>
        </div>
        <div>
          <h3>Supervision Type</h3>
          <select onChange={e => updateFilters({ supervisionType: e.target.value })}>
            <option value=''>All</option>
            {SUPERVISION_TYPES.map((supervisionType, i) =>
              <option key={i} value={supervisionType}>{supervisionType}</option>
            )}
          </select>
        </div>
      </div>
      <RevocationCountOverTime
        revocationCountsByMonth={apiData.revocations_by_month}
      />
      <div className="bgc-white p-20">
        <RevocationMatrix
          data={apiData.revocations_matrix_cells}
          filters={filters}
          updateFilters={updateFilters}
        />
      </div>
      <div className="static-charts bgc-white p-20">
        <div>
          {CHARTS.map((chart, i) => (
            <button
              key={i}
              className={`chart-type-label ${selectedChart === chart ? 'selected' : ''}`}
              onClick={() => setSelectedChart(chart)}
            >
              {chart}
            </button>
          ))}
        </div>
        {renderSelectedChart()}
      </div>
      {/* TODO: Review cases based on violation type and count */}
    </main>
  );
};

export default Revocations;
