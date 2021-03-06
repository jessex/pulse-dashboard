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

import AdmissionsVsReleases from '../../../components/charts/reincarcerations/AdmissionsVsReleases';
import ReincarcerationCountOverTime
  from '../../../components/charts/reincarcerations/ReincarcerationCountOverTime';
import ReincarcerationRateByStayLength
  from '../../../components/charts/reincarcerations/ReincarcerationRateByStayLength';

const Reincarcerations = () => {
  const { loading, user, getTokenSilently } = useAuth0();
  const [apiData, setApiData] = useState({});
  const [awaitingApi, setAwaitingApi] = useState(true);

  const fetchChartData = async () => {
    try {
      const responseData = await callMetricsApi('us_nd/reincarcerations', getTokenSilently);
      setApiData(responseData);
      setAwaitingApi(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  if (awaitingResults(loading, user, awaitingApi)) {
    return <Loading />;
  }

  return (
    <main className="main-content bgc-grey-100">
      <div id="mainContent">
        <div className="row gap-20 pos-r">

          {/* #Reincarcerations by month chart ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    REINCARCERATIONS BY MONTH
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-reincarcerationCountsByMonth" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-reincarcerationCountsByMonth">
                          <a className="dropdown-item" id="downloadChartAsImage-reincarcerationCountsByMonth" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-reincarcerationCountsByMonth" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20">
                  <h4 style={{ height: '20px' }} className="dynamic-chart-header" id="reincarcerationCountsByMonth-header" />
                </div>
                <div className="layer w-100 pX-20 pT-30 row">
                  <div className="col-md-12">
                    <div className="layer w-100 p-20">
                      <ReincarcerationCountOverTime
                        reincarcerationCountsByMonth={apiData.reincarcerations_by_month}
                        header="reincarcerationCountsByMonth-header"
                      />
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyReincarcerationCountsByMonth">
                  <div className="mb-0" id="methodologyHeadingReincarcerationCountsByMonth">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyReincarcerationCountsByMonth" aria-expanded="true" aria-controls="collapseMethodologyReincarcerationCountsByMonth">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div id="collapseMethodologyReincarcerationCountsByMonth" className="collapse" aria-labelledby="methodologyHeadingReincarcerationCountsByMonth" data-parent="#methodologyReincarcerationCountsByMonth">
                    <div>
                      <ul>
                        <li>
                          An admission to prison counts as a reincarceration if
                          the person has been incarcerated previously in a North
                          Dakota prison.
                        </li>
                        <li>
                          Reincarcerations are included regardless of when the initial incarceration
                          took place. There is no upper bound on the follow up period in
                          this metric.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* #Releases vs admissions ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    ADMISSIONS VERSUS RELEASES
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-admissionsVsReleases" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-admissionsVsReleases">
                          <a className="dropdown-item" id="downloadChartAsImage-admissionsVsReleases" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-admissionsVsReleases" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20">
                  <h4 style={{ height: '20px' }} className="dynamic-chart-header" id="admissionsVsReleases-header" />
                </div>
                <div className="layer w-100 p-20">
                  <AdmissionsVsReleases
                    admissionsVsReleases={apiData.admissions_versus_releases_by_month}
                    header="admissionsVsReleases-header"
                  />
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyAdmissionsVsReleases">
                  <div className="mb-0" id="methodologyHeadingAdmissionsVsReleases">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyAdmissionsVsReleases" aria-expanded="true" aria-controls="collapseMethodologyAdmissionsVsReleases">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div id="collapseMethodologyAdmissionsVsReleases" className="collapse" aria-labelledby="methodologyHeadingAdmissionsVsReleases" data-parent="#methodologyAdmissionsVsReleases">
                    <div>
                      <ul>
                        <li>
                          "Admissions versus releases" is the difference between the number of
                          people who were admitted to DOCR facilities and the number of people who
                          were released from DOCR facilities during a particular time frame.
                        </li>
                        <li>
                          Admissions include unique people admitted to any DOCR facility during a
                          particular time frame.
                        </li>
                        <li>
                          Releases include unique people released from any DOCR facility, whether
                          released to a term of supervision or not, during a particular time frame.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* #Reincarcerations by previous stay length ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    REINCARCERATION RATE BY PREVIOUS STAY LENGTH
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-reincarcerationRateByStayLength" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-reincarcerationRateByStayLength">
                          <a className="dropdown-item" id="downloadChartAsImage-reincarcerationRateByStayLength" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-reincarcerationRateByStayLength" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 p-20">
                  <ReincarcerationRateByStayLength
                    ratesByStayLength={apiData.reincarceration_rate_by_stay_length}
                  />
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyReincarcerationRateByStayLength">
                  <div className="mb-0" id="methodologyHeadingReincarcerationRateByStayLength">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyReincarcerationRateByStayLength" aria-expanded="true" aria-controls="collapseMethodologyReincarcerationRateByStayLength">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div id="collapseMethodologyReincarcerationRateByStayLength" className="collapse" aria-labelledby="methodologyHeadingReincarcerationRateByStayLength" data-parent="#methodologyReincarcerationRateByStayLength">
                    <div>
                      <ul>
                        <li>
                          Reincarceration cohorts include all admissions to incarceration of a
                          person who was previously incarcerated in a DOCR facility. The
                          reincarceration must have happened within the noted follow up period
                          directly after their release.
                        </li>
                        <li>
                          Stay length refers to time actually spent incarcerated prior to their most
                          recent release from a DOCR facility. This is bucketed into 12-month
                          windows for sampling.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100">
                  <div className="peers ai-c jc-c gapX-20">
                    <div className="peer">
                      <span className="fsz-def fw-600 mR-10 c-grey-800">
                        /* TODO(138): Make the release cohort year dynamic ==================== */
                        <small className="c-grey-500 fw-600">Release Cohort </small>
                        2018
                      </span>
                    </div>
                    <div className="peer fw-600">
                      <span className="fsz-def fw-600 mR-10 c-grey-800">
                        <small className="c-grey-500 fw-600">Follow Up Period </small>
                        1 year
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reincarcerations;
