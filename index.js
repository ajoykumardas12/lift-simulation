const formContainer = document.getElementById("lift-form-container");
const simulationContainer = document.getElementById(
  "lift-simulation-container"
);

const toggleHideShow = () => {
  formContainer.classList.toggle("hide");
  formContainer.classList.toggle("show");
  simulationContainer.classList.toggle("show");
  simulationContainer.classList.toggle("hide");
};

const simulateLift = (event) => {
  event.preventDefault();
  toggleHideShow();
};

const backToForm = () => toggleHideShow();
