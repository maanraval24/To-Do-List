window.onload = function () {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // ✅ Validate user role
  fetch('http://localhost:3000/api/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(user => {
      if (user.role !== 'admin') {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Only admins can add employees.',
        }).then(() => {
          window.location.href = 'Front_page.html';
        });
      }
    })
    .catch(err => {
      console.error('Error fetching profile:', err);
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });

  // ✅ Handle form submit
  document.getElementById('addEmployeeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const statusMessage = document.getElementById('statusMessage');

    fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email, password, role })
    })
      .then(res => {
        if (res.status === 204) return {};
        return res.json().catch(() => ({}));
      })
      .then(data => {
        console.log('Server response:', data);

        if (data.error) {
          statusMessage.textContent = data.error;
          statusMessage.style.color = 'red';
          Swal.fire('Error', data.error, 'error');
        } else {
          statusMessage.textContent = 'Employee added successfully!';
          statusMessage.style.color = 'green';
          Swal.fire('Success', 'Employee added successfully!', 'success');
          document.getElementById('addEmployeeForm').reset();
        }
      })
      .catch(err => {
        console.error('Error adding employee:', err);
        statusMessage.textContent = 'Something went wrong.';
        statusMessage.style.color = 'red';
        Swal.fire('Error', 'Something went wrong while adding the employee.', 'error');
      });
  });
};
