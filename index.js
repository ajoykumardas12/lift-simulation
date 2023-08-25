// -------Elements-------
const formContainer = document.getElementById("lift-form-container");
const simulationContainer = document.getElementById(
  "lift-simulation-container"
);

const liftForm = document.querySelector(".form");
const noOfFloorsEl = document.getElementsByName("noOfFloors")[0];
const noOfLiftsEl = document.getElementsByName("noOfLifts")[0];

const building = document.getElementById("building");

// -------Store-------
let noOfFloors = 0;
let noOfLifts = 0;

let upButtons;
let downButtons;

let allLifts;

// -------Building creation functions-------
const getFormData = () => {
  noOfFloors = Number(noOfFloorsEl.value);
  noOfLifts = Number(noOfLiftsEl.value);
};

const validateData = () => {
  // 0 < noOfFloors <= 10 , 0 < noOfLifts <= 10 , noOfLifts <= noOfFloors
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
  // Toggles between form and simulation view
  formContainer.classList.toggle("hide");
  formContainer.classList.toggle("show");
  simulationContainer.classList.toggle("show");
  simulationContainer.classList.toggle("hide");
};

const newElement = (tag, cls) => {
  // returns new element of given tag, and class attribute added
  const el = document.createElement(tag);
  el.className = cls;
  return el;
};

const createButtons = () => {
  // creates and returns [up, down] buttons
  const upIcon = document.createElement("img");
  upIcon.className = "button-icon up-icon";
  upIcon.src = "/assets/icons/caret-up-circle-outline.svg";
  const downIcon = document.createElement("img");
  downIcon.className = "button-icon down-icon";
  downIcon.src = "/assets/icons/caret-down-circle-outline.svg";

  const upButton = newElement("button", "up-button");
  upButton.appendChild(upIcon);
  const upTextNode = document.createTextNode("Up");
  upButton.appendChild(upTextNode);

  const downButton = newElement("button", "down-button");
  downButton.appendChild(downIcon);
  const downTextNode = document.createTextNode("Down");
  downButton.appendChild(downTextNode);

  return [upButton, downButton];
};

const createFloorControlsEl = (floorNo) => {
  // Creates and returns floor controls depending on floorNo (0,10]
  floorControlsEl = newElement("div", "floor-controls");

  const [upButton, downButton] = createButtons();

  if (floorNo !== noOfFloors) floorControlsEl.appendChild(upButton);
  if (floorNo !== 1) floorControlsEl.appendChild(downButton);

  return floorControlsEl;
};

const createFloor = (floorNo) => {
  // Creates and returns particular floor controls depending on floorNo (0,10]
  const floor = newElement("div", "floor");
  floor.setAttribute("floor-no", floorNo);

  const floorNoContainer = newElement("div", "floor-no");
  floorNoContainer.textContent = "Floor " + floorNo;
  const floorArea = newElement("div", "floor-area");
  floorControlsEl = createFloorControlsEl(floorNo);

  floorArea.appendChild(floorControlsEl);

  floor.appendChild(floorArea);
  floor.appendChild(floorNoContainer);

  return floor;
};

const createLift = (liftNo) => {
  const lift = newElement("div", "lift");
  lift.setAttribute("lift-no", liftNo);
  return lift;
};

const createLiftLine = (liftNo) => {
  const liftLine = newElement("div", "liftline");
  liftLine.setAttribute("liftline-no", liftNo);

  const lift = createLift(liftNo);
  lift.setAttribute("lift-no", liftNo);
  lift.setAttribute("current-floor", 0);
  liftLine.appendChild(lift);

  return liftLine;
};

const createLiftsContainer = () => {
  const liftsContainer = newElement("div", "lifts-container");

  const liftsArr = Array.from({ length: noOfLifts }, (_, i) => i + 1);
  liftsArr.forEach((liftNo) => {
    const liftLine = createLiftLine(liftNo);
    liftsContainer.appendChild(liftLine);
  });
  return liftsContainer;
};

const createBuilding = () => {
  // Creates building with data from form and adds to DOM
  const floorArr = Array.from({ length: noOfFloors }, (_, i) => noOfFloors - i);
  floorArr.forEach((floorNo) => {
    const floor = createFloor(floorNo);
    building.appendChild(floor);
  });
  const liftsContainer = createLiftsContainer();
  building.appendChild(liftsContainer);
};

// -------Simulation controller functions-------
const callLift = (floorNo) => {
  console.log(`lift called on floor ${floorNo}`);
  allLifts[0].style.bottom = `${(floorNo - 1) * 5}rem`;
};

const addListenerToButtons = () => {
  upButtons = document.querySelectorAll(".up-button");
  downButtons = document.querySelectorAll(".down-button");

  upButtons.forEach((upButton, index) => {
    // top floor don't have up button, reduce 1 extra
    upButton.addEventListener("click", () => callLift(noOfFloors - index - 1));
  });

  downButtons.forEach((downButton, index) => {
    downButton.addEventListener("click", () => callLift(noOfFloors - index));
  });
};

const getAllLifts = () => {
  allLifts = document.querySelectorAll(".lift");
  console.log(allLifts);
};

// -------Event functions-------
const simulateLift = (event) => {
  // Hides form and creates lift simulation on "Simulate" button click
  event.preventDefault();
  getFormData();
  const isValidData = validateData();
  if (!isValidData) return;
  toggleHideShow();
  createBuilding();
  addListenerToButtons();
  getAllLifts();
};

const backToForm = () => {
  // Shows form and hides+deletes previous buildings on "Back" button click
  toggleHideShow();

  // Remove previous floors
  while (building.firstChild) {
    building.removeChild(building.lastChild);
  }
};
