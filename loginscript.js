document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      //  SweetAlert2 success message
      await Swal.fire({
        title: 'Success!',
        text: 'Login successful!',
        icon: 'success',
        confirmButtonText: 'Continue'
      });

      localStorage.setItem('token', data.token);
      window.location.href = 'Front_page.html';
    } else {
      document.getElementById('error').textContent = data.error || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('error').textContent = 'Something went wrong. Please try again.';
  }
});

window.onload = function () {
  if (window.location.pathname.includes('login.html')) return;

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  fetch('/api/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(user => {
      console.log('Logged in as:', user.email);

      if (user.role === 'admin') {
        document.getElementById('adminSection').style.display = 'block';
      } else {
        document.getElementById('adminSection').style.display = 'none';
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
};

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', function () {
  localStorage.removeItem('token');
  fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});
