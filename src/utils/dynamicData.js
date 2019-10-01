function changeDataSetOfChart(officeName) {
  const updatedOfficeName = officeName.replace(' ', '-');
  const button = document.getElementById(`showOfficersOfOffice-${updatedOfficeName}`);
  button.click();
}

function configureDatasetChangeButton(chart, data, updateChart) {
  const mainButton = document.getElementById('showOfficersOfOffice');
  Object.keys(data).forEach((officeName) => {
    const dropdownButton = document.getElementById(`showOfficersOfOffice-${officeName}`);

    if (dropdownButton) {
      dropdownButton.onclick = function changeDataset() {
        mainButton.innerHTML = officeName.replace('-', ' ');
        updateChart(officeName);
      };
    }
  });
}

export {
  changeDataSetOfChart,
  configureDatasetChangeButton,
};
