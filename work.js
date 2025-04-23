// 🔐 Redirect if no token
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Create circular progress bar
function createCircularProgressBar(progress) {
  const circle = document.createElement("div");
  circle.classList.add("circular-progress");

  const innerCircle = document.createElement("div");
  innerCircle.classList.add("inner-circle");
  innerCircle.textContent = `${progress}%`;

  circle.appendChild(innerCircle);

  const progressColor = "#A700C1";
  circle.style.background = `conic-gradient(${progressColor} ${progress}%, #E0E0E0 ${progress}% 100%)`;
  circle.style.animation = `fillCircle 2s ease-out forwards`;

  return circle;
}

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

// Fetch and render tasks from backend
document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/todos", {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(tasks => {
      renderTasks(tasks);
    })
    .catch(err => {
      console.error("Failed to load tasks:", err);
      document.getElementById("taskContainer").innerHTML = "<h2>Unable to fetch tasks.</h2>";
    });
});

// Renders the task cards
// Renders the task cards
function renderTasks(tasks) {
  const taskContainer = document.getElementById("taskContainer");
  if (!taskContainer) return;

  taskContainer.innerHTML = "";

  if (!tasks.length) {
    taskContainer.innerHTML = "<h2>No tasks found.</h2>";
    return;
  }

  tasks
    .filter(task => {
      const status = task.status.toLowerCase();
      return status === "work in progress" || status === "under testing";
    })
    .forEach(task => {
      const card = createTaskCard(task, tasks); // 🔥 pass all tasks
      taskContainer.appendChild(card);
    });
}

// Your card creator function (updated)
function createTaskCard(task, tasks) {
  const container = document.createElement("div");
  container.className = "d-flex justify-content-center";

  const card = document.createElement("div");
  card.className = "card_mb shadow rounded-4 p-3 mb-4";
  card.style.backgroundColor = "#e0d4f7";
  card.style.width = "30%";

  const progress = task.progress || 0;
  const strokeDashoffset = 157 - (157 * progress) / 100;

  card.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h5 class="card-title fw-bold mb-2">${task.title}</h5>
        <span class="badge ${getStatusBadge(task.status)} mb-3">${task.status}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-dark btn-sm rounded-circle action-btn" data-action="view" data-id="${task.id}" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-warning btn-sm rounded-circle action-btn" data-action="edit" data-id="${task.id}" title="Edit">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn btn-danger btn-sm rounded-circle action-btn" data-action="delete" data-id="${task.id}" title="Delete">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <div class="row mt-3">
      <div class="col">
        <p class="mb-1 fw-semibold">Start Date</p>
        <p>${new Date(task.start_date).toLocaleDateString("en-GB")}</p>
      </div>
      <div class="col">
        <p class="mb-1 fw-semibold">End Date</p>
        <p>${new Date(task.end_date).toLocaleDateString("en-GB")}</p>
      </div>
      <div class="col text-center">
        <div class="position-relative d-inline-block" style="width: 60px; height: 60px;">
          <svg class="position-absolute top-0 start-0" width="60" height="60">
            <circle cx="30" cy="30" r="25" stroke="#eee" stroke-width="6" fill="none" />
            <circle cx="30" cy="30" r="25" stroke="#28a745" stroke-width="6" fill="none"
              stroke-dasharray="157" stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 30 30)" />
          </svg>
          <div class="position-absolute top-50 start-50 translate-middle">
            <strong>${progress}%</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners to buttons
  setTimeout(() => {
    container.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", (event) => {
        const action = btn.getAttribute("data-action");
        const taskId = btn.getAttribute("data-id");
        const taskData = tasks.find(t => t.id == taskId);

        if (!taskData) return alert("Task not found");

        if (action === "view") {
          showViewPopup(taskData); // ✅ opens popup with data
        } else if (action === "edit") {
          showTaskPopup(taskData); // ✅ opens popup with editable fields
        } else if (action === "delete") {
          // Use SweetAlert2 for confirmation
          Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.isConfirmed) {
              deleteTask(taskId);
            }
          });
        }
      });
    });
  }, 0);

  container.appendChild(card);
  return container;
}

// Show task details in a popup
function showTaskPopup(task) {
  const popup = document.createElement("div");
  popup.classList.add("popup-overlay");

  const today = new Date().toISOString().split("T")[0];

  popup.innerHTML = `
    <div class="popup-content" style="font-family: Arial; row-gap:20px">
      <div>
        <h3 style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Edit Task</h3>
      </div>
      <div class="mb-3">
        <p class="mb-1"><b>Task Name:</b></p>
        <input type="text" id="taskName" value="${task.title}" style="width: 100%;" />
      </div>
      <div class="mb-3">
        <p class="mb-1"><b>Description:</b></p>
        <textarea id="taskDescription" style="width: 100%; height: 50%">${task.description || ""}</textarea>
      </div>
      <div class="mb-3">
        <p class="mb-1"><b>Status:</b></p>
        <select id="taskProgress">
          <option value="Work in Progress" ${task.status === "Work in Progress" ? "selected" : ""}>Work in Progress</option>
          <option value="Under Testing" ${task.status === "Under Testing" ? "selected" : ""}>Under Testing</option>
          <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </div>
      <div>
        <p class="mb-1"><b>Start Date:</b></p>
        <input type="date" id="taskStartDate" value="${task.start_date ? formatDateForInput(task.start_date) : ""}" min="${today}" />
      </div>
      <div class="mb-3">
        <p class="mb-1"><b>End Date:</b></p>
        <input type="date" id="taskEndDate" value="${task.end_date ? formatDateForInput(task.end_date) : ""}" min="${today}" />
      </div>
      <div>
        <button onclick="saveTask(${task.id})" style="cursor:pointer; font-family: Arial; background-color:blue; color:white; border:none; border-radius:5px">Save</button>
        <button onclick="closePopup()" style="cursor:pointer; font-family: Arial; background-color:red; color:white; border:none; border-radius:5px">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// Function to close the popup
function closePopup() {
  const popup = document.querySelector(".popup-overlay");
  if (popup) popup.remove();
}



function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-success';
    case 'in progress':
      return 'bg-warning text-dark';
    case 'completed':
      return 'bg-primary';
    default:
      return 'bg-primary';
  }
}

// Handle delete action
function deleteTask(taskId) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:3000/api/todos/${taskId}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }
      Swal.fire(
        'Deleted!',
        'Your task has been deleted.',
        'success'
      );
      location.reload();
    })
    .catch((error) => {
      console.error(error);
      Swal.fire(
        'Error!',
        'There was an error deleting the task.',
        'error'
      );
    });
}

// Handle save task changes
function saveTask(taskId) {
  const title = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskProgress").value;
  const start_date = document.getElementById("taskStartDate").value;
  const end_date = document.getElementById("taskEndDate").value;

  if (!title || !description || !start_date) {
    Swal.fire({
      title: 'Error!',
      text: 'Please fill all required fields.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }

  let progress = 0;
  switch (status) {
    case "Pending": progress = 25; break;
    case "Work in Progress": progress = 50; break;
    case "Under Testing": progress = 75; break;
    case "Completed": progress = 100; break;
    default: progress = 0;
  }

  fetch(`http://localhost:3000/api/todos/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ title, description, status, start_date, end_date, progress })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update task");

      // Assuming task is updated successfully, update the DOM or notify
      Swal.fire(
        'Updated!',
        'Your task has been updated successfully.',
        'success'
      );
      closePopup(); // Close the popup after update

      // Update the task dynamically instead of reloading the entire page
      const updatedTask = { title, description, status, start_date, end_date, progress };
      updateTaskInDOM(taskId, updatedTask);  // Update DOM without reloading
    })
    .catch(err => {
      console.error(err);
      Swal.fire(
        'Error!',
        'Something went wrong while updating the task.',
        'error'
      );
    });
}

// Dynamically update the task in the DOM (without page reload)
function updateTaskInDOM(taskId, updatedTask) {
  // Find the task card by task ID
  const taskCard = document.querySelector(`[data-id="${taskId}"]`).closest('.card_mb');
  if (taskCard) {
    // Update task card content dynamically
    taskCard.querySelector('.card-title').textContent = updatedTask.title;
    taskCard.querySelector('.badge').textContent = updatedTask.status;
    taskCard.querySelector('.row .col:nth-child(1) p').textContent = new Date(updatedTask.start_date).toLocaleDateString("en-GB");
    taskCard.querySelector('.row .col:nth-child(2) p').textContent = new Date(updatedTask.end_date).toLocaleDateString("en-GB");

    // Update progress (if applicable)
    const progress = updatedTask.progress || 0;
    const strokeDashoffset = 157 - (157 * progress) / 100;
    taskCard.querySelector('circle:nth-of-type(2)').setAttribute("stroke-dashoffset", strokeDashoffset);
    taskCard.querySelector('.position-absolute strong').textContent = `${progress}%`;

    // Optionally, update any other parts of the task card
  }
}

// Show task details in a popup
function showViewPopup(task) {
  const popup = document.createElement("div");
  popup.classList.add("popup-overlay");

  popup.innerHTML = `
    <div class="popup-content" style="font-family: Arial; row-gap:20px">
      <div><h3 style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Task Details</h3></div>
      <div><p><b>Task:</b> ${task.title}</p></div>
      <div><p><b>Description:</b></p>
        <p>${task.description || "No description available"}</p>
      </div> 
      <div><p><b>Status:</b> ${task.status}</p></div>
      <div><p><b>Start Date:</b> ${task.start_date ? new Date(task.start_date).toLocaleDateString("en-GB") : "N/A"}</p></div>
      <div><p><b>End Date:</b> ${task.end_date ? new Date(task.end_date).toLocaleDateString("en-GB") : "N/A"}</p></div>
      <div>
        <button onclick="closePopup()" style="cursor:pointer; font-family: Arial; background-color:red; color:white; border-radius:5px;">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// Close the popup
function closePopup() {
  const popup = document.querySelector(".popup-overlay");
  if (popup) popup.remove();
}

