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

import React, { useState, useEffect } from "react";

import Loading from "../components/Loading";
import "../assets/styles/index.scss";
import { useAuth0 } from "../react-auth0-spa";

import FtrReferralCountByMonth from '../components/charts/programEvaluation/FtrReferralCountByMonth';
import FtrParticipationCountByMonth from '../components/charts/programEvaluation/FtrParticipationCountByMonth';
import FtrReferralsParticipationByRace from '../components/charts/programEvaluation/FtrReferralsParticipationByRace';
import FtrReferralsParticipationByGender from '../components/charts/programEvaluation/FtrReferralsParticipationByGender';

const FtrProgramEvaluation = () => {
  const { loading, user, getTokenSilently } = useAuth0();
  const [apiData, setApiData] = useState({});

  const fetchChartData = async () => {
    try {
      const token = await getTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/programEval`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      setApiData(responseData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <main className="main-content bgc-grey-100">
      <div id="mainContent">
        <div className="row gap-20 pos-r">

          {/* #FTR referral counts by month chart ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    FTR REFERRAL COUNT BY MONTH
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-ftrReferralCountByMonth" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-ftrReferralCountByMonth">
                          <a className="dropdown-item" id="downloadChartAsImage-ftrReferralCountByMonth" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-ftrReferralCountByMonth" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20">
                  <h4 style={{ height: '20px' }} className="dynamic-chart-header" id="ftrReferralCountByMonth-header" />
                </div>
                <div className="layer w-100 pX-20 pT-20 row">
                  <div className="col-md-12">
                    <div className="layer w-100 p-20">
                      <FtrReferralCountByMonth
                        ftrReferralCountByMonth={apiData.ftr_referrals_by_month}
                        header="ftrReferralCountByMonth-header"
                      />
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyFtrReferralCountByMonth">
                  <div className="mb-0" id="methodologyHeadingFtrReferralCountByMonth">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyFtrReferralCountByMonth" aria-expanded="true" aria-controls="collapseMethodologyFtrReferralCountByMonth">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div id="collapseMethodologyFtrReferralCountByMonth" className="collapse" aria-labelledby="methodologyHeadingFtrReferralCountByMonth" data-parent="#methodologyFtrReferralCountByMonth">
                    <div>
                      <ul>
                        <li>
                          METHODOLOGY HERE
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* #FTR participation counts by month chart ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    FTR PARTICIPATION COUNT BY MONTH
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-ftrParticipationCountByMonth" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-ftrParticipationCountByMonth">
                          <a className="dropdown-item" id="downloadChartAsImage-ftrParticipationCountByMonth" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-ftrParticipationCountByMonth" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20">
                  <h4 style={{ height: '20px' }} className="dynamic-chart-header" id="ftrParticipationCountByMonth-header" />
                </div>
                <div className="layer w-100 pX-20 pT-20 row">
                  <div className="col-md-12">
                    <div className="layer w-100 p-20">
                      <FtrParticipationCountByMonth
                        ftrParticipationCountByMonth={apiData.ftr_participation_by_month}
                        header="ftrParticipationCountByMonth-header"
                      />
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyFtrParticipationCountByMonth">
                  <div className="mb-0" id="methodologyHeadingFtrParticipationCountByMonth">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyFtrParticipationCountByMonth" aria-expanded="true" aria-controls="collapseMethodologyFtrParticipationCountByMonth">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div id="collapseMethodologyFtrParticipationCountByMonth" className="collapse" aria-labelledby="methodologyHeadingFtrParticipationCountByMonth" data-parent="#methodologyFtrParticipationCountByMonth">
                    <div>
                      <ul>
                        <li>
                          METHODOLOGY HERE
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* #FTR Referrals and Participation by race chart ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    FTR REFERRALS AND PARTICIPATION BY RACE
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-ftrReferralsParticipationByRace" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-ftrReferralsParticipationByRace">
                          <a className="dropdown-item" id="downloadChartAsImage-ftrReferralsParticipationByRace" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-ftrReferralsParticipationByRace" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20 row">
                  <div className="layer w-100 p-20">
                    <FtrReferralsParticipationByRace
                      ftrReferralsByRace={
                        apiData.ftr_referrals_by_race_and_ethnicity_60_days}
                      ftrParticipationByRace={
                        apiData.ftr_participation_by_race_and_ethnicity_60_days}
                      supervisionPopulationByRace={
                        apiData.supervision_population_by_race_and_ethnicity_60_days
                      }
                    />
                  </div>
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyFtrReferralsParticipationByRace">
                  <div className="mb-0" id="methodologyHeadingsFtrReferralsParticipationByRace">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyFtrReferralsParticipationByRace" aria-expanded="true" aria-controls="collapseMethodologyFtrReferralsParticipationByRace">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div className="collapse" id="collapseMethodologyFtrReferralsParticipationByRace" aria-labelledby="methodologyHeadingFtrReferralsParticipationByRace" data-parent="#methodologyFtrReferralsParticipationByRace">
                    <div>
                      <ul>
                        <li>
                          METHODOLOGY
                        </li>
                        <li>
                          The supervision population counts people on probation or parole in North
                          Dakota at any point during the time period.
                        </li>
                        <li>
                          The race proportions for the population of North Dakota were taken from
                          the U.S. Census Bureau.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100">
                  <div className="peers ai-c jc-c gapX-20">
                    <div className="peer fw-600">
                      <span className="fsz-def fw-600 mR-10 c-grey-800">
                        <small className="c-grey-500 fw-600">Period </small>
                        Last 60 days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* #FTR Referrals and Participation by gender chart ==================== */}
          <div className="col-md-6">
            <div className="bd bgc-white p-20">
              <div className="layers">
                <div className="layer w-100 pX-20 pT-20">
                  <h6 className="lh-1">
                    FTR REFERRALS AND PARTICIPATION BY RACE
                    <span className="fa-pull-right">
                      <div className="dropdown show">
                        <a className="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="exportDropdownMenuButton-ftrReferralsParticipationByGender" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Export
                        </a>
                        <div className="dropdown-menu" aria-labelledby="exportDropdownMenuButton-ftrReferralsParticipationByGender">
                          <a className="dropdown-item" id="downloadChartAsImage-ftrReferralsParticipationByGender" href="javascript:void(0);">Export image</a>
                          <a className="dropdown-item" id="downloadChartData-ftrReferralsParticipationByGender" href="javascript:void(0);">Export data</a>
                        </div>
                      </div>
                    </span>
                  </h6>
                </div>
                <div className="layer w-100 pX-20 pT-20 row">
                  <div className="layer w-100 p-20">
                    <FtrReferralsParticipationByGender
                      ftrReferralsByGender={
                        apiData.ftr_referrals_by_gender_60_days}
                      ftrParticipationByGender={
                        apiData.ftr_participation_by_gender_60_days}
                      supervisionPopulationByGender={
                        apiData.supervision_population_by_gender_60_days
                      }
                    />
                  </div>
                </div>
                <div className="layer bdT p-20 w-100 accordion" id="methodologyFtrReferralsParticipationByGender">
                  <div className="mb-0" id="methodologyHeadingsFtrReferralsParticipationByGender">
                    <div className="mb-0">
                      <button className="btn btn-link collapsed pL-0" type="button" data-toggle="collapse" data-target="#collapseMethodologyFtrReferralsParticipationByGender" aria-expanded="true" aria-controls="collapseMethodologyFtrReferralsParticipationByGender">
                        <h6 className="lh-1 c-blue-500 mb-0">Methodology</h6>
                      </button>
                    </div>
                  </div>
                  <div className="collapse" id="collapseMethodologyFtrReferralsParticipationByGender" aria-labelledby="methodologyHeadingFtrReferralsParticipationByGender" data-parent="#methodologyFtrReferralsParticipationByGender">
                    <div>
                      <ul>
                        <li>
                          METHODOLOGY
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="layer bdT p-20 w-100">
                  <div className="peers ai-c jc-c gapX-20">
                    <div className="peer fw-600">
                      <span className="fsz-def fw-600 mR-10 c-grey-800">
                        <small className="c-grey-500 fw-600">Period </small>
                        Last 60 days
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

export default FtrProgramEvaluation;
