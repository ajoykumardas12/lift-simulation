// Elements
const formContainer = document.getElementById("lift-form-container");
const simulationContainer = document.getElementById(
  "lift-simulation-container"
);

const liftForm = document.querySelector(".form");
const noOfFloorsEl = document.getElementsByName("noOfFloors")[0];
const noOfLiftsEl = document.getElementsByName("noOfLifts")[0];

// Store
let noOfFloors = 0;
var noOfLifts = 0;

// Functions
const getFormData = () => {
  noOfFloors = noOfFloorsEl.value;
  noOfLifts = noOfLiftsEl.value;
  console.log(noOfFloors, noOfLifts);
};

const validateData = () => {
  let isValid = true;
  if (noOfFloors > 10 || noOfFloors < 1) {
    isValid = false;
    window.alert("No of floors must be between 1 an 10");
  } else if (noOfLifts > 10 || noOfLifts < 1) {
    isValid = false;
    window.alert("No of lifts must be between 1 an 10");
  } else if (noOfLifts > noOfFloors) {
    isValid = false;
    window.alert("No of lists can't be more than no of floors");
  }
  return isValid;
};

const toggleHideShow = () => {
  formContainer.classList.toggle("hide");
  formContainer.classList.toggle("show");
  simulationContainer.classList.toggle("show");
  simulationContainer.classList.toggle("hide");
};

const simulateLift = (event) => {
  event.preventDefault();
  getFormData();
  const isValidData = validateData();
  if (!isValidData) return;
  toggleHideShow();
};

const backToForm = () => toggleHideShow();
