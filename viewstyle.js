function formatDateForInput(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/todos", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((tasks) => {
      renderTasks(tasks);
    })
    .catch((err) => {
      console.error("Failed to load tasks:", err);
      document.getElementById("taskContainer").innerHTML =
        "<h2>Unable to fetch tasks.</h2>";
    });
});

function renderTasks(tasks) {
  const taskContainer = document.getElementById("taskContainer");
  if (!taskContainer) return;

  taskContainer.innerHTML = "";

  if (!tasks.length) {
    taskContainer.innerHTML = "<h2>No tasks found.</h2>";
    return;
  }

  tasks
    .filter((task) => {
      const status = task.status.toLowerCase();
      return status === "not started" || status === "pending";
    })
    .forEach(task => {
      const card = createTaskCard(task, tasks);
      taskContainer.appendChild(card);
    });
}

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

  setTimeout(() => {
    container.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const taskId = btn.getAttribute("data-id");
        const taskData = tasks.find(t => t.id == taskId);

        if (!taskData) {
          Swal.fire("Error", "Task not found", "error");
          return;
        }

        if (action === "view") {
          showViewPopup(taskData);
        } else if (action === "edit") {
          showTaskPopup(taskData);
        } else if (action === "delete") {
          Swal.fire({
            title: "Are you sure?",
            text: "This will delete the task permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
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

function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-warning";
    case "work in progress":
      return "bg-warning text-dark";
    case "completed":
      return "bg-success";
    default:
      return "bg-danger";
  }
}

function deleteTask(taskId) {
  fetch(`http://localhost:3000/api/todos/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete task");
      Swal.fire("Deleted!", "Task deleted successfully!", "success").then(() => {
        location.reload();
      });
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Error", "Error deleting task.", "error");
    });
}

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
        <button onclick="closePopup()" style="cursor:pointer; font-family: Arial; background-color:red; color:white; border-radius:5px; border:none;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}

function showTaskPopup(task) {
  const popup = document.createElement("div");
  popup.classList.add("popup-overlay");

  const today = new Date().toISOString().split("T")[0];

  popup.innerHTML = `
    <div class="popup-content" style="font-family: Arial; row-gap:20px">
      <div><h3 style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Edit Task</h3></div>
      <div class="tsk-name mb-3">
        <p class="mb-1"><b>Task Name:</b></p>
        <input type="text" id="taskName" value="${task.title}" style="width: 100%;" />
      </div>
      <div class="des-name mb-3">
        <p class="mb-1"><b>Description:</b></p>
        <textarea id="taskDescription" style="width: 100%; height: 50%">${task.description || ""}</textarea>
      </div>
      <div class="sts-name mb-3">
        <p class="mb-1"><b>Status:</b></p>
        <select id="taskProgress">
          <option value="Not Started" ${task.status === "Not Started" ? "selected" : ""}>Not Started</option>
          <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Work in Progress" ${task.status === "Work in Progress" ? "selected" : ""}>Work in Progress</option>
          <option value="Under Testing" ${task.status === "Under Testing" ? "selected" : ""}>Under Testing</option>
          <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </div>
      <div>
        <p class="mb-1"><b>Start Date:</b></p>
        <input type="date" id="taskStartDate" value="${task.start_date ? formatDateForInput(task.start_date) : ""}" min="${today}" />
      </div>
      <div class="cal-form mb-3">
        <p class="mb-1"><b>End Date:</b></p>
        <input type="date" id="taskEndDate" value="${task.end_date ? formatDateForInput(task.end_date) : ""}" min="${today}" />
      </div>
      <div>
        <button onclick="saveTask(${task.id})" style="cursor:pointer; font-family: Arial; background-color:blue; color:white; border-radius:5px; border:none;">Save</button>
        <button onclick="closePopup()" style="cursor:pointer; font-family: Arial; background-color:red; color:white; border-radius:5px; border:none;">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

function saveTask(taskId) {
  const title = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskProgress").value;
  const start_date = document.getElementById("taskStartDate").value;
  const end_date = document.getElementById("taskEndDate").value;

  if (!title || !description || !start_date) {
    Swal.fire("Warning", "Please fill all required fields.", "warning");
    return;
  }

  let progress = 0;
  switch (status) {
    case "Pending": progress = 25; break;
    case "Work in Progress": progress = 50; break;
    case "Under Testing": progress = 75; break;
    case "Completed": progress = 100; break;
    case "Not Started":
    default: progress = 0;
  }

  fetch(`http://localhost:3000/api/todos/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title,
      description,
      status,
      start_date,
      end_date,
      progress,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update task");
      Swal.fire("Updated!", "Task updated successfully!", "success").then(() => {
        closePopup();  // Close the popup automatically after updating
      });
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Error", "Something went wrong while updating the task.", "error");
    });
}

// Dynamically update the task in the DOM after update
function updateTaskInDOM(taskId, updatedTask) {
  const taskCard = document.querySelector(`[data-id="${taskId}"]`).closest('.card_mb');
  if (taskCard) {
    taskCard.querySelector('.card-title').textContent = updatedTask.title;
    taskCard.querySelector('.badge').textContent = updatedTask.status;
    taskCard.querySelector('.row .col:nth-child(1) p').textContent = new Date(updatedTask.start_date).toLocaleDateString("en-GB");
    taskCard.querySelector('.row .col:nth-child(2) p').textContent = new Date(updatedTask.end_date).toLocaleDateString("en-GB");
    // Update progress as well
    const progress = updatedTask.progress || 0;
    const strokeDashoffset = 157 - (157 * progress) / 100;
    taskCard.querySelector('circle:nth-of-type(2)').setAttribute("stroke-dashoffset", strokeDashoffset);
    taskCard.querySelector('.position-absolute strong').textContent = `${progress}%`;
  }
}


function closePopup() {
  const popup = document.querySelector(".popup-overlay");
  if (popup) popup.remove();  // Close the popup immediately after save
}

