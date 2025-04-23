// Grab DOM elements
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskStartDate = document.getElementById("taskStartDate");
const taskEndDate = document.getElementById("taskEndDate");
const progressSelect = document.getElementById("progressSelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const descriptionInput = document.getElementById("descriptionInput");

document.addEventListener("DOMContentLoaded", function () {
  let today = new Date().toISOString().split("T")[0];
  taskStartDate.setAttribute("min", today);
  taskEndDate.setAttribute("min", today);
});

// Function to format date as DD-MM-YYYY for display
function formatDate(dateString) {
  if (!dateString) return "Not Set";
  let [yyyy, mm, dd] = dateString.split("-");
  return `${dd} - ${mm} - ${yyyy}`;
}

// Load tasks from localStorage on page load
function loadTasks() 
{
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    const tasks = JSON.parse(storedTasks);
    console.log("Loaded Tasks:", tasks); // Debugging
    taskList.innerHTML = "";
    tasks.forEach((task) => createTaskElement(task));
  }
  
}

// Ensure tasks are loaded when the page is refreshed
window.onload = function () {
  loadTasks();
};

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    const taskData = JSON.parse(li.dataset.task);
    tasks.push(taskData);
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Function to create and append task
function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("card");
  li.dataset.task = JSON.stringify(task);



  // Get task number and format it with two digits
  const taskNumber = String(
    document.querySelectorAll(".task-list .card").length + 1
  ).padStart(2, "0");

  // Function to generate a random gradient color
  function getRandomGradient() {
    const randomColor1 = `#${Math.floor(Math.random() * 16777215).toString(
      16
    )}`;
    const randomColor2 = `#${Math.floor(Math.random() * 16777215).toString(
      16
    )}`;
    return `linear-gradient(45deg, ${randomColor1}, ${randomColor2})`;
  }

  const randomColor = getRandomGradient();
  let priorityColor =
    task.priority === "Low"
      ? "green"
      : task.priority === "Medium"
      ? "yellow"
      : "red";

  li.innerHTML = `
          <span style="background-color: ${priorityColor}; padding: 4px; border-radius: 4px; color: black; margin-left: 10rem; top: 0; position: absolute">
            ${task.priority}
        </span>  
        <div><strong>${task.taskText}</strong></div>  
        <div> <strong style="font-size: 18px; margin-top:5px;">Progress:</strong> 
    <span>${
      task.progress || "Not Started"
    }</span>  
    </div>
            <div> Start Date: ${formatDate(task.startDate)}  
          <br>End Date: ${formatDate(task.endDate)}  </div>
        <div> <em>${task.description}</em> </div> 
    
    <div class="progress-container" style="width: 100%; height: 20px; background: #e0e0e0; border-radius: 6px; overflow: hidden; position: relative;">
            <div class="progress-bar" style="width: 0%; height: 100%; border-radius: 6px; text-align: center; color: white; line-height: 20px; transition: width 2s ease-in-out;"></div>
        </div> 
    <button class="delete-btn">
        <i class="fa-solid fa-trash"></i>
    </button>
  
     <div class="face face2" style="background: ${randomColor};">
            <h2>${taskNumber}</h2>  <!-- Two-digit formatted number -->
        </div>
        
    `;

  li.classList.add("slide-in");
  taskList.appendChild(li);


  const progressBar = li.querySelector(".progress-bar");

  // Set progress based on task status
  setTimeout(() => {
      if (task.progress === "Not Started") {
        progressBar.style.width = "0%";
        progressBar.style.color = "purple";
        progressBar.style.paddingLeft = "30%";
        progressBar.innerHTML = "0%&nbsp;Not&nbsp;Started";
      } else if (task.progress === "Pending") {
          progressBar.style.width = "50%";
          progressBar.style.backgroundColor = "orange";
          progressBar.textContent = "50% Pending";
      } else if (task.progress === "Under Testing") {
          progressBar.style.width = "70%";  
          progressBar.style.backgroundColor = "blue";
          progressBar.textContent = "70% Under Testing";
      } else if (task.progress === "Completed") {
          progressBar.style.width = "100%";
          progressBar.style.backgroundColor = "green";
          progressBar.textContent = "100% Completed";
      }
  }, 100);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const viewButton = document.createElement("button");
  viewButton.innerHTML = "🔍";
  viewButton.style.width = "50px";
  viewButton.style.backgroundColor = "transparent";
  viewButton.style.marginRight = "10px";
  viewButton.style.cursor = "pointer";
  viewButton.onclick = function () {
    showViewCard(task);
  };
  li.appendChild(viewButton);

  viewButton.onmouseover = function () {
    viewButton.style.backgroundColor = "#e0e0e0"; // Change background on hover
    viewButton.style.transform = "scale(1.1)"; // Slightly enlarge on hover
  };

  viewButton.onmouseout = function () {
    viewButton.style.backgroundColor = "transparent"; // Revert background
    viewButton.style.transform = "scale(1)"; // Reset scale
  };

  const deleteBtn = li.querySelector(".delete-btn");
  deleteBtn.innerHTML = "❌";
  deleteBtn.addEventListener("click", () => {
    deleteTask(task);
    li.remove();
    updateTaskNumbers(); // Update numbers after deletion
  });

  buttonContainer.appendChild(viewButton);
  buttonContainer.appendChild(deleteBtn);

  // Append the container to li
  li.appendChild(buttonContainer);

  setTimeout(() => li.classList.remove("fade-in"), 500);
}

// Function to update numbers when a task is deleted
function updateTaskNumbers() {
  document
    .querySelectorAll(".task-list .card .face2 h2")
    .forEach((el, index) => {
      el.textContent = String(index + 1).padStart(2, "0"); // Convert to two-digit format
    });
}

// Add task on button click
addTaskBtn.addEventListener("click", addTask);

function addTask() {
  const taskText = taskInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = prioritySelect.value;
  const progress = document.getElementById("progressSelect").value;
  const startDate = taskStartDate.value; // Store in YYYY-MM-DD format
  const endDate = taskEndDate.value;

  if (!taskText || !description) {
    alert("Please enter both Task and Description!");
    return;
  }

  if (!startDate) {
    alert("Please enter Start Date!");
    return;
  }

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (tasks.some((task) => task.taskText === taskText)) {
    alert("Entered Task already exists!");
    return;
  }

  const task = {
    taskText,
    description,
    priority,
    startDate,
    endDate,
    progress,
  };
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  createTaskElement(task);

  taskInput.value = "";
  descriptionInput.value = "";
  taskStartDate.value = "";
  taskEndDate.value = "";
  document.getElementById("progressSelect").value = "Not Started";
  saveTasks();
}

// Delete task functionality
function deleteTask(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((t) => t.taskText !== task.taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (e) {
  console.error("Error parsing localStorage data", e);
  localStorage.removeItem("tasks"); // Reset storage if corrupted
}

function showViewCard(task) {
  let viewCard = document.getElementById("viewCard");

  if (!viewCard) {
    viewCard = document.createElement("div");
    viewCard.id = "viewCard";
    document.body.appendChild(viewCard);
  }

  // Get priority color
  let priorityColor =
    task.priority === "Low"
      ? "green"
      : task.priority === "Medium"
      ? "yellow"
      : "red";

  // Apply styles dynamically
  viewCard.style.position = "fixed";
  viewCard.style.top = "0";
  viewCard.style.left = "0";
  viewCard.style.width = "100vw";
  viewCard.style.height = "100vh";
  viewCard.style.background = "rgba(0,0,0,0.3)"; // Background overlay
  viewCard.style.display = "flex";
  viewCard.style.alignItems = "center";
  viewCard.style.justifyContent = "center";
  viewCard.style.zIndex = "1000";

  // Inner popup box
  let popup = document.createElement("div");
  popup.style.maxWidth = "350px";
  popup.style.width = "350px";
  popup.style.background = "#fff";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
  popup.style.padding = "20px";
  popup.style.fontFamily = "Arial";
  popup.style.lineHeight = "1.6";
  popup.style.textAlign = "left";
  popup.style.opacity = "0"; // Start invisible
  popup.style.transform = "scale(0.8)"; // Start small
  popup.style.transition =
    "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";

  // Populate the popup content
  popup.innerHTML = `
      <h3 style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Task Details</h3>
      <p><b>Task:</b> ${task.taskText}</p>
      <p><b>Start Date:</b> ${formatDate(task.startDate)}</p>
      <p><b>End Date:</b> ${formatDate(task.endDate)}</p>
      <p><b>Priority:</b> <span style="background: ${priorityColor}; color: black; padding: 4px 8px; border-radius: 5px;">${
    task.priority
  }</span></p>
      <p><b>Progress:</b> ${task.progress}</p>
      <p><b>Description:</b> ${task.description || "No Description"}</p>
      
  `;

  // Create the close button
  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.width = "100%";
  closeButton.style.padding = "8px";
  closeButton.style.marginTop = "10px";
  closeButton.style.background = "#ff4d4d";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.fontWeight = "bold";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.transition = "0.2s";

  closeButton.onmouseover = () => (closeButton.style.background = "#cc0000");
  closeButton.onmouseleave = () => (closeButton.style.background = "#ff4d4d");

  // Close the popup when clicking the button
  closeButton.onclick = function () {
    viewCard.remove();
  };

  popup.appendChild(closeButton);
  viewCard.appendChild(popup);

  // Add the animation after a slight delay
  setTimeout(() => {
    popup.style.opacity = "1";
    popup.style.transform = "scale(1)";
  }, 50);
}

let progressBar = document.createElement("div");
        progressBar.style.width = "0%"; // Start from 0%
        progressBar.style.height = "20px";
        progressBar.style.borderRadius = "6px";

        progressBar.style.backgroundColor = "green";
        progressBar.style.textAlign = "center";
        progressBar.style.color = "white";
        progressBar.style.transition = "width 2s ease-in-out"; // Smooth transition effect

        progressCell.appendChild(progressBar);

        // Function to animate the progress bar
        setTimeout(() => {
          progressBar.style.width = "100%";
          progressBar.textContent = "100% Completed";
        }, 100);