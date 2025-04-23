// Logout function
function logout() {
    // Show confirmation using SweetAlert2 before logging out
    Swal.fire({
        title: 'Are you sure you want to log out?',
        text: "You will be redirected to the login page.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, log me out',
        cancelButtonText: 'No, stay logged in'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove token from localStorage
            localStorage.removeItem('token');

            // Optional: Call backend logout route (we're removing token, so this is safe)
            const token = localStorage.getItem('token');
            if (token) {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).catch(err => {
                    console.error("Logout API call failed:", err.message);
                });
            }

            // Redirect to login page after confirmation
            window.location.href = 'login.html';
        }
    });
}

// Wait for DOM to load fully before running logic
window.onload = function () {
    const token = localStorage.getItem('token');
    const addEmpLink = document.getElementById('addEmployeeLink');
    const removeEmpLink = document.getElementById('removeEmployeeLink');

    // If no token, redirect immediately to login page
    if (!token) {
        console.warn('No token found. Redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    // Fetch user profile to verify token and get role
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
        console.log('Logged in as:', user.email, 'Role:', user.role);

        // Display SweetAlert2 Welcome message with role
        Swal.fire({
            title: `Welcome to the site, ${user.role}!`,
            icon: 'success',
            confirmButtonText: 'Thanks!',
        });

        // Show/hide Add Employee link based on role
        if (user.role === 'admin') {
            addEmpLink.href = 'addemp.html';
            addEmpLink.style.pointerEvents = 'auto';
            addEmpLink.style.opacity = '1';
            addEmpLink.style.cursor = 'pointer';
            addEmpLink.title = '';

            // Show Remove Employee link for admin
            removeEmpLink.href = 'delemp.html';
            removeEmpLink.style.pointerEvents = 'auto';
            removeEmpLink.style.opacity = '1';
            removeEmpLink.style.cursor = 'pointer';
            removeEmpLink.title = '';
        } else {
            // Disable the Add Employee link for non-admin users
            addEmpLink.removeAttribute('href');
            addEmpLink.style.pointerEvents = 'none';
            addEmpLink.style.opacity = '0.5';
            addEmpLink.style.cursor = 'not-allowed';
            addEmpLink.title = 'Only accessible to admin';

            // Disable the Remove Employee link for non-admin users
            removeEmpLink.removeAttribute('href');
            removeEmpLink.style.pointerEvents = 'none';
            removeEmpLink.style.opacity = '0.5';
            removeEmpLink.style.cursor = 'not-allowed';
            removeEmpLink.title = 'Only accessible to admin';
        }
    })
    .catch(err => {
        console.error('Token invalid or profile fetch failed:', err.message);
        localStorage.removeItem('token');
        window.location.href = 'login.html'; // Redirect to login if token is invalid
    });

    // Attach logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
};
