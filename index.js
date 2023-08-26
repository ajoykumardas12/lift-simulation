// -------Elements-------
// Containers
const formContainer = document.getElementById("lift-form-container");
const simulationContainer = document.getElementById(
  "lift-simulation-container"
);
// Form elements
const liftForm = document.querySelector(".form");
const noOfFloorsEl = document.getElementsByName("noOfFloors")[0];
const noOfLiftsEl = document.getElementsByName("noOfLifts")[0];
// Building element
const building = document.getElementById("building");

// -------Store/States-------
let noOfFloors = 0;
let noOfLifts = 0;
let upButtons;
let downButtons;
// Lifts and floors data
let allLifts;
let allLiftsData = [];
let allFloorsData = [];
// stores floorNo of pending calls
let pendingCalls = [];

// -------Building creation functions-------
const getFormData = () => {
  // Gets form data and updates variables
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
    window.alert("No of lifts can't be more than no of floors");
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
  upIcon.src = "/assets/icons/caret-up-outline.svg";
  const downIcon = document.createElement("img");
  downIcon.className = "button-icon down-icon";
  downIcon.src = "/assets/icons/caret-down-outline.svg";

  const upButton = newElement("button", "up-button");
  upButton.appendChild(upIcon);
  const downButton = newElement("button", "down-button");
  downButton.appendChild(downIcon);

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
  // Creates and returns lift element based on lift no
  const lift = newElement("div", "lift");
  lift.setAttribute("lift-no", liftNo);
  const lDoor = newElement("div", "door left-door");
  const rDoor = newElement("div", "door right-door");

  lift.appendChild(lDoor);
  lift.appendChild(rDoor);
  return lift;
};

const createLiftLine = (liftNo) => {
  // Creates and returns lift line element, which helps lift movement across floors
  const liftLine = newElement("div", "liftline");
  liftLine.setAttribute("liftline-no", liftNo);

  const lift = createLift(liftNo);
  lift.setAttribute("lift-no", liftNo);
  lift.setAttribute("current-floor", 0);
  liftLine.appendChild(lift);

  return liftLine;
};

const createLiftsContainer = () => {
  // Creates and returns Lift Container, which helps with positioning the Lifts
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
const moveLift = (liftNo, floorNo, lastFloor) => {
  // Handles lift movement
  // Update translateY for moving animation
  const t = 2 * Math.abs(floorNo - lastFloor);
  allLifts[liftNo - 1].style.transitionDuration = `${t}s`;
  allLifts[liftNo - 1].style.transform = `translateY(-${(floorNo - 1) * 5}rem)`;

  // Update lift data
  allLiftsData[`lift${liftNo}`].lastFloor = floorNo;
  allLiftsData[`lift${liftNo}`].isBusy = true;
  // Update floor data
  allFloorsData[`floor${floorNo}`].isALiftComing = true;

  // Change busy status when complete
  setTimeout(() => {
    // Start open-close door animation
    allLifts[liftNo - 1].classList.add("open-close-animation");
    setTimeout(() => {
      // Stop open-close animation
      allLifts[liftNo - 1].classList.remove("open-close-animation");
      // Update lifts and floors status data
      allLiftsData[`lift${liftNo}`].isBusy = false;
      allFloorsData[`floor${floorNo}`].isALiftComing = false;
      // After lift movement is complete, check if there are pending calls
      handlePendingCalls();
    }, 5000);
  }, t * 1000);
};

const findBestLift = (floorNo) => {
  // Finds and returns closest and free lift no, null if none available
  let bestLiftNo = null;
  let nearestDistance = Infinity;

  // Iterate over lifts data and find best(nearest and free) lift
  for (let i = 1; i <= noOfLifts; i++) {
    const liftId = `lift${i}`;
    if (
      Math.abs(allLiftsData[liftId].lastFloor - floorNo) < nearestDistance &&
      allLiftsData[liftId].isBusy === false
    ) {
      nearestDistance = allLiftsData[liftId].lastFloor - floorNo;
      bestLiftNo = i;
    }
  }

  return bestLiftNo;
};

const handlePendingCalls = () => {
  // Called after each lift movement completion,
  // if there are pending calls, lift is called for oldest request
  if (pendingCalls.length > 0) {
    const oldestPendingCall = pendingCalls.shift();
    callLift(oldestPendingCall);
  }
};

const callLift = (floorNo) => {
  // Handles lift calls
  // If a lift is already coming to this floor, do noting(printed to console)
  if (
    allFloorsData[`floor${floorNo}`].isALiftComing ||
    pendingCalls.includes(floorNo)
  ) {
    console.log("A lift is already coming to this floor.");
    return;
  }

  // Finds best lift available for the call
  const bestLiftNo = findBestLift(floorNo);
  // If a lift is available, call moveLift, else push the call in pendingCalls
  if (bestLiftNo) {
    moveLift(bestLiftNo, floorNo, allLiftsData[`lift${bestLiftNo}`].lastFloor);
  } else pendingCalls.push(floorNo);
};

const addListenerToControlButtons = () => {
  // Adds event listeners to up/down control buttons
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
  // Updates allLifts variable, called after building is created
  allLifts = document.querySelectorAll(".lift");
};

const setInitialLiftData = () => {
  // Sets initial data for lifts, called after building is created
  for (let i = 1; i <= noOfLifts; i++) {
    const id = `lift${i}`;
    const data = {
      lastFloor: 1,
      isBusy: false,
    };
    allLiftsData = { ...allLiftsData, [id]: data };
  }
};

const setInitialFloorData = () => {
  // Sets initial data for floors, called after building is created
  for (let i = 1; i <= noOfFloors; i++) {
    const id = `floor${i}`;
    const data = {
      isALiftComing: false,
    };
    allFloorsData = { ...allFloorsData, [id]: data };
  }
};

// -------Event functions-------
const simulateLift = (event) => {
  // Lift simulation after "simulate" button click
  // Gets form data and validates
  event.preventDefault();
  getFormData();
  const isValidData = validateData();
  if (!isValidData) return;

  // Hides form and creates lift simulation on "Simulate" button click
  toggleHideShow();
  createBuilding();

  // Adds functionalities to lift controls, updates lifts, floors datas
  addListenerToControlButtons();
  getAllLifts();
  setInitialLiftData();
  setInitialFloorData();
};

const backToForm = () => {
  // Shows form and hides+deletes previous buildings on "Back" button click
  toggleHideShow();

  // Remove previous floors
  while (building.firstChild) {
    building.removeChild(building.lastChild);
  }
};
