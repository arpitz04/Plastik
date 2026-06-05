// frontend/js/signin.js (create this file)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token); // Store the JWT token
                    localStorage.setItem('username', data.username); // Store username
                    localStorage.setItem('rewardPoints', data.rewardPoints); // Store reward points
                    alert('Login successful!');
                    window.location.href = 'index.html'; // Redirect to dashboard or home page
                } else {
                    alert(data.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    }
});