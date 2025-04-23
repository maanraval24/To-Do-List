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
            Authorization: `Bearer ${token}`,
        },
    })
    .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
    })
    .then((user) => {
        if (user.role !== 'admin') {
            Swal.fire('Access Denied', 'Only admins can remove employee access.', 'error')
                .then(() => {
                    window.location.href = 'Front_page.html';
                });
        }
    })
    .catch((err) => {
        console.error('Error fetching profile:', err);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // ✅ Handle form submit
    document.getElementById('removeEmployeeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const statusMessage = document.getElementById('statusMessage');

        fetch(`http://localhost:3000/api/auth/getUserByEmail/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((userData) => {
            if (userData.error) {
                statusMessage.textContent = userData.error;
                statusMessage.style.color = 'red';
                Swal.fire('Error', userData.error, 'error');
                return;
            }

            //  SweetAlert2 confirmation
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to remove access for ${email}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (!result.isConfirmed) return;

                const encodedEmail = encodeURIComponent(email);
                fetch(`http://localhost:3000/api/auth/removeUserByEmail/${encodedEmail}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        statusMessage.textContent = data.error;
                        statusMessage.style.color = 'red';
                        Swal.fire('Error', data.error, 'error');
                    } else {
                        statusMessage.textContent = 'Employee access removed successfully!';
                        statusMessage.style.color = 'green';
                        document.getElementById('removeEmployeeForm').reset();
                        Swal.fire('Deleted!', 'Employee access has been removed.', 'success');
                    }
                })
                .catch((err) => {
                    console.error('Error removing employee access:', err);
                    statusMessage.textContent = 'Something went wrong.';
                    statusMessage.style.color = 'red';
                    Swal.fire('Error', 'Something went wrong while removing employee.', 'error');
                });
            });
        })
        .catch((err) => {
            console.error('Error fetching user ID:', err);
            statusMessage.textContent = 'Unable to find user ID.';
            statusMessage.style.color = 'red';
            Swal.fire('Error', 'Unable to find user by email.', 'error');
        });
    });
};
