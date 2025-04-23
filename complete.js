document.addEventListener("DOMContentLoaded", function () {
  console.log("Page Loaded - Running complete.js");

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

    // Clear old data before inserting new rows
    tbody.innerHTML = "";

    tasks.forEach((task) => {
      if (task.progress === "Completed") {
        //  Show only completed tasks
        let row = tbody.insertRow();

        let taskCell = row.insertCell(0);
        let startDateCell = row.insertCell(1); //  Added Start Date column
        let endDateCell = row.insertCell(2);
        let priorityCell = row.insertCell(3);
        let progressCell = row.insertCell(4); // Column for progress

        taskCell.textContent = task.taskText || "N/A";
        startDateCell.textContent = formatDate(task.startDate) || "Not Set";
        endDateCell.textContent = formatDate(task.endDate) || "No Due Date";
        priorityCell.textContent = task.priority || "N/A";

        // Set priority color
        if (task.priority === "Low") {
          priorityCell.style.backgroundColor = "green";
        } else if (task.priority === "Medium") {
          priorityCell.style.backgroundColor = "yellow";
        } else if (task.priority === "High") {
          priorityCell.style.backgroundColor = "red";
        }

        // Show Progress Bar (Fixed at 100%)
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
      }
    });

    console.log(
      "Raw tasks data from localStorage:",
      localStorage.getItem("tasks")
    );
  }

  // Make `loadTasks` Global
  window.loadTasks = loadTasks;

  // Call `loadTasks` on page load
  loadTasks();
});

