import { trendlineSlope } from './trendline';

const GOALS = {
  US_ND: {
    'days-at-liberty-snapshot-chart': {
      isUpward: true,
      value: 1095,
      label: '1095 days (3 years)',
    },
    'lsir-score-change-snapshot-chart': {
      isUpward: false,
      value: -1,
      label: '-1.0',
    },
    'revocation-admissions-snapshot-chart': {
      isUpward: false,
      value: 35,
      label: '35%',
    },
    'supervision-success-snapshot-chart': {
      isUpward: true,
      value: 75,
      label: '75%',
    },
  },
};

function Goal(isUpward, value, label) {
  this.isUpward = isUpward;
  this.value = value;
  this.label = label;
}

function getGoalForChart(stateCode, chartName) {
  const goalDict = GOALS[stateCode][chartName];
  return new Goal(goalDict.isUpward, goalDict.value, goalDict.label);
}

/**
 * Returns the string value describing whether the data is trending towards
 * or away from the goal.
 */
function trendlineGoalText(trendlineValues, goal) {
  const towards = 'towards the goal';
  const away = 'away from the goal';
  const slopeOfTrendline = trendlineSlope(trendlineValues);
  let trendlineText = '';

  if (goal.isUpward) {
    trendlineText = (slopeOfTrendline > 0) ? towards : away;
  } else {
    trendlineText = (slopeOfTrendline < 0) ? towards : away;
  }

  return trendlineText;
}

function getMinForGoalAndData(goalValue, dataPoints, tickScale) {
  let minValue = Math.min(...dataPoints);
  if (goalValue < minValue) {
    minValue = goalValue;
  }
  return (minValue - tickScale) - ((minValue - tickScale) % tickScale);
}

function getMaxForGoalAndData(goalValue, dataPoints, tickScale) {
  let maxValue = Math.max(...dataPoints);
  if (goalValue > maxValue) {
    maxValue = goalValue;
  }
  return (maxValue + tickScale) + (tickScale - (maxValue % tickScale));
}

export {
  getGoalForChart,
  getMaxForGoalAndData,
  getMinForGoalAndData,
  trendlineGoalText,
};
