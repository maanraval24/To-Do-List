// Function to initialize input fields with custom styling
function initializeForm() {
  const today = new Date().toISOString().split('T')[0];

  document.querySelector('.taskname').innerHTML = `
  <label class="form-label fw-bold">Task Name</label>
  <input type="text" id="taskName" placeholder="Enter Task Name" 
    style="background-color: white; 
           border: 1px solid #ccc; 
           outline: none; 
           width: 100%; 
           height: 45px; 
           font-family: Arial; 
           font-size: 20px; 
           font-weight: 500; 
           color: gray; 
           padding: 8px 12px; 
           border-radius: 6px;" />`;

  document.querySelector('.description_content').innerHTML = `
  <label class="form-label fw-bold mt-5">Description</label>
  <textarea id="description" placeholder="Enter Description here"
    style="background-color: white; 
           border: 1px solid #ccc; 
           outline: none; 
           width: 100%; 
           height: 100px; 
           font-family: Arial; 
           font-size: 16px; 
           color: gray; 
           padding: 10px; 
           border-radius: 6px;">
  </textarea>`;

  document.querySelector('.startdate .date').innerHTML = `
    <span class="calendar-icon" data-target="startDate" style="cursor:pointer"></span>
    <input type="date" id="startDate" min="${today}"
      style="background-color: rgba(184, 145, 243, 0); border:  none; outline: none; font-family: Arial; font-size: 20px; font-weight: 500; color: black;" />`;

  document.querySelector('.enddate .date').innerHTML = `
    <span class="calendar-icon" data-target="endDate" style="cursor:pointer"></span>
    <input type="date" id="endDate" min="${today}"
      style="background-color: rgba(184, 145, 243, 0); border: none; outline: none; font-family: Arial; font-size: 20px; font-weight: 500; color: black;" />`;

  function handlePlaceholder(input, defaultText) {
    input.addEventListener('focus', function () {
      if (input.value === defaultText) {
        input.value = '';
        input.style.color = 'black';
      }
    });

    input.addEventListener('blur', function () {
      if (input.value.trim() === '') {
        input.value = defaultText;
        input.style.color = 'gray';
      }
    });
  }

  handlePlaceholder(document.getElementById('taskName'), 'Enter Task Name');
  handlePlaceholder(document.getElementById('description'), 'Enter Description here');

  document.querySelectorAll('.calendar-icon').forEach(icon => {
    icon.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      document.getElementById(targetId).showPicker();
    });
  });

  document.getElementById('startDate').addEventListener('change', function () {
    const startDate = this.value;
    document.getElementById('endDate').min = startDate;
  });
}

initializeForm();

document.querySelector('.addbutton').addEventListener('click', (e) => {
  e.preventDefault();

  const taskName = document.getElementById('taskName').value.trim();
  const description = document.getElementById('description').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!taskName || taskName === "Enter Task Name") {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Task Name',
      text: 'Please enter a valid task name.'
    });
    return;
  }

  if (!description || description === "Enter Description here") {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Description',
      text: 'Please enter a description for the task.'
    });
    return;
  }

  if (!startDate) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Start Date',
      text: 'Please select a start date.'
    });
    return;
  }

  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      title: taskName,
      description: description,
      status: "Not Started",
      start_date: startDate,
      end_date: endDate,
      progress: 0
    })
  })
    .then(res => res.json())
    .then(async data => {
      await Swal.fire({
        icon: 'success',
        title: 'Task Added',
        text: 'Task added successfully!'
      });
      window.location.href = "view2.html";
    })
    .catch(error => {
      console.error("Error saving task:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save task.'
      });
    });
});
