import React, { useState, useEffect } from "react";

import { Bar } from 'react-chartjs-2';
import { COLORS_FIVE_VALUES } from "../../../assets/scripts/constants/colors";
import { useAuth0 } from "../../../react-auth0-spa";

const RevocationCountByViolationType = () => {
  const [chartLabels, setChartLabels] = useState([]);
  const [absconsionDataPoints, setAbsconsionDataPoints] = useState([]);
  const [newOffenseDataPoints, setNewOffenseDataPoints] = useState([]);
  const [technicalDataPoints, setTechnicalDataPoints] = useState([]);
  const { getTokenSilently } = useAuth0();

  const processResponse = (responseData) => {
    const countsByMonth = responseData.revocationCountsByMonthByViolationType;

    var byMonth = [];
    for (var month in countsByMonth) {
        byMonth.push([month, countsByMonth[month]]);
    }

    return byMonth;
  }

  const fetchChartData = async () => {
    try {
      const token = await getTokenSilently();
      // Likely needs to point to app engine URL
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/external`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      const sorted = processResponse(responseData);

      setChartLabels(sorted.map(element => element[0]));
      setAbsconsionDataPoints(sorted.map(element => element[1].absconsion));
      setNewOffenseDataPoints(sorted.map(element => element[1].new_offense));
      setTechnicalDataPoints(sorted.map(element => element[1].technical));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <Bar data={{
      labels: chartLabels,
      datasets: [{
          label: "Absconsion",
          backgroundColor: COLORS_FIVE_VALUES[1],
          data: absconsionDataPoints,
        }, {
          label: "New Offense",
          backgroundColor: COLORS_FIVE_VALUES[2],
          data: newOffenseDataPoints,
        }, {
          label: "Technical",
          backgroundColor: COLORS_FIVE_VALUES[4],
          data: technicalDataPoints,
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
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Month',
          },
          stacked: true,
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Revocation counts',
          },
          stacked: true,
        }],
      },
    }}
    />
  );
}

export default RevocationCountByViolationType;