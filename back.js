document.addEventListener("DOMContentLoaded", function () {
  let startDateInput = document.getElementById("editStartDate");
  let endDateInput = document.getElementById("editEndDate");
  if (startDateInput) startDateInput.setAttribute("min", today);
  if (endDateInput) endDateInput.setAttribute("min", today);
  let today = new Date().toISOString().split("T")[0];

  if (startDateInput) {
    startDateInput.setAttribute("min", today);
  }
  if (endDateInput) {
    endDateInput.setAttribute("min", today);
  }
});

function formatDate(dateString) {
  if (!dateString) return "Not Set";
  let [yyyy, mm, dd] = dateString.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

function loadTasks() {
  let table = document.getElementById("taskTable");

  if (!table) {
    console.error("Error: Task table not found in DOM");
    return;
  }

  let tasksData = localStorage.getItem("tasks");

  if (!tasksData) {
    console.warn("Warning: No tasks found in local storage");
    return;
  }

  let tasks;
  try {
    tasks = JSON.parse(tasksData);
  } catch (error) {
    console.error("Error parsing localStorage data", error);
    return;
  }

  if (!Array.isArray(tasks)) {
    console.error("Error: tasks data is not an array");
    return;
  }

  let tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  tasks.forEach((task, index) => {
    let row = tbody.insertRow();

    let taskCell = row.insertCell(0);
    let startDateCell = row.insertCell(1);
    let endDateCell = row.insertCell(2);
    let priorityCell = row.insertCell(3);
    let progressCell = row.insertCell(4);
    let descriptionCell = row.insertCell(5);
    let actionCell = row.insertCell(6);

    taskCell.textContent = task.taskText || "N/A";
    startDateCell.textContent = formatDate(task.startDate) || "Not Set";
    endDateCell.textContent = formatDate(task.endDate) || "No Due Date";
    priorityCell.textContent = task.priority || "N/A";
    descriptionCell.textContent = task.description || "No Description";

    if (task.priority === "Low") {
      priorityCell.style.backgroundColor = "green";
    } else if (task.priority === "Medium") {
      priorityCell.style.backgroundColor = "yellow";
    } else if (task.priority === "High") {
      priorityCell.style.backgroundColor = "red";
    }

    let progressSpan = document.createElement("span");
    progressSpan.textContent = task.progress || "Not Started";
    progressSpan.style.fontWeight = "bold";
    progressSpan.style.color = "blue";
    progressCell.appendChild(progressSpan);

    let viewButton = document.createElement("button");
    viewButton.innerHTML = "🔍"; // Magnifying glass icon for 'View'

    // Pencil icon for 'Edit'

    viewButton.style.width = "50px";
    viewButton.style.marginRight = "10px";
    viewButton.style.cursor = "pointer";
    viewButton.onclick = function () {
      showViewCard(task);
    };
    actionCell.appendChild(viewButton);

    let editButton = document.createElement("button");
    editButton.innerHTML = "✏️";

    editButton.style.width = "45px";
    editButton.style.marginLeft = "10px";
    editButton.style.cursor = "pointer";
    editButton.onclick = function () {
      showEditCard(task, index);
    };

    actionCell.appendChild(editButton);
  });
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
  closeButton.style.border = "none"; 
  closeButton.style.borderRadius="5px";

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

function showEditCard(task, index) {
  let existingEditCard = document.getElementById("editCard");
  if (existingEditCard) {
    existingEditCard.remove(); // Remove old edit card if exists
  }

  let editCard = document.createElement("div");
  editCard.id = "editCard";
  document.body.appendChild(editCard);

  editCard.style.position = "fixed";
  editCard.style.top = "0";
  editCard.style.left = "0";
  editCard.style.width = "100vw";
  editCard.style.height = "100vh";
  editCard.style.background = "rgba(0, 0, 0, 0.5)";
  editCard.style.display = "flex";
  editCard.style.alignItems = "center";
  editCard.style.justifyContent = "center";
  editCard.style.zIndex = "9999";

  let popup = document.createElement("div");
  popup.style.maxWidth = "550px";
  popup.style.width = "500px";
  popup.style.background = "#fff";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
  popup.style.padding = "20px";
  popup.style.fontFamily = "Arial";
  popup.style.lineHeight = "1.6";
  popup.style.textAlign = "left";
  popup.style.opacity = "0";
  popup.style.transform = "scale(0.8)";
  popup.style.transition =
    "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";

  popup.innerHTML = `
      <div><h3 style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Edit Task</h3></div>
      <div><label><b>Task:</b> <input type="text" id="editTaskText" value="${
        task.taskText
      }"></label></div>
      <div><label><b>Start Date:</b> <input type="date" id="editStartDate" value="${
        task.startDate || ""
      }"></label></div>
      <div><label><b>End Date:</b> <input type="date" id="editEndDate" value="${
        task.endDate || ""
      }"></label></div>
      <div><label><b>Priority:</b> 
          <select id="editPriority">
              <option value="Low" ${
                task.priority === "Low" ? "selected" : ""
              }>Low</option>
              <option value="Medium" ${
                task.priority === "Medium" ? "selected" : ""
              }>Medium</option>
              <option value="High" ${
                task.priority === "High" ? "selected" : ""
              }>High</option>
          </select>
      </label></div>
      <div><label><b>Progress:</b> 
          <select id="editProgress">
              <option value="Not Started" ${
                task.progress === "Not Started" ? "selected" : ""
              }>Not Started</option>
              <option value="Pending" ${
                task.progress === "Pending" ? "selected" : ""
              }>Pending</option>
              <option value="Under Testing" ${
                task.progress === "Under Testing" ? "selected" : ""
              }>Under Testing</option>
              <option value="Completed" ${
                task.progress === "Completed" ? "selected" : ""
              }>Completed</option>
          </select>
      </label></div>
      <div><label><b>Description:</b> <textarea id="editDescription" style="width: 100%;">${
        task.description || ""
      }</textarea></label></div>
  `;

  let saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.style.width = "30%";
  saveButton.style.height = "32px";
  saveButton.style.marginTop = "10px";
  saveButton.style.background = "#4CAF50";
  saveButton.style.color = "white";
  saveButton.style.border = "none";
  saveButton.style.fontWeight = "bold";
  saveButton.style.borderRadius = "5px";
  saveButton.style.cursor = "pointer";
  saveButton.style.transition = "0.3s";

  saveButton.onmouseover = () => (saveButton.style.background = "#45a049");
  saveButton.onmouseout = () => (saveButton.style.background = "#4CAF50");

  saveButton.onclick = function () {
    if (typeof index === "undefined") {
      console.error("Error: index is undefined!");
      return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (!tasks[index]) {
      console.error("Error: Task at index", index, "not found!");
      return;
    }

    tasks[index] = {
      taskText: document.getElementById("editTaskText").value,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      priority: document.getElementById("editPriority").value,
      progress: document.getElementById("editProgress").value,
      description: document.getElementById("editDescription").value,
    };

    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("Task updated successfully!");

    loadTasks();
    document.body.removeChild(editCard);
  };

  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.width = "30%";
  closeButton.style.height = "32px";
  closeButton.style.marginTop = "10px";
  closeButton.style.marginLeft = "40%";
  closeButton.style.background = "#ff4d4d";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.fontWeight = "bold";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.transition = "0.3s";

  closeButton.onmouseover = () => (closeButton.style.background = "#cc0000");
  closeButton.onmouseout = () => (closeButton.style.background = "#ff4d4d");

  closeButton.onclick = () => document.body.removeChild(editCard);

  popup.appendChild(saveButton);
  popup.appendChild(closeButton);

  editCard.appendChild(popup);
  requestAnimationFrame(() => {
    popup.style.opacity = "1";
    popup.style.transform = "scale(1)";
  });
}
