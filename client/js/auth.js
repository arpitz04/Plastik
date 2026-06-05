// auth.js — Shared navbar auth state. Add to EVERY page before </body>

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
});

function updateNavbar() {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    const signInLink      = document.getElementById('signInLink');
    const signUpLink      = document.getElementById('signUpLink');
    const userProfileLink = document.getElementById('userProfileLink');
    const logoutButton    = document.getElementById('logoutButton');
    const userPointsDisplay = document.getElementById('userPointsDisplay');

    if (token && userRaw) {
        const user = JSON.parse(userRaw);

        if (signInLink)  signInLink.style.display  = 'none';
        if (signUpLink)  signUpLink.style.display  = 'none';

        if (userProfileLink) {
            userProfileLink.style.display = 'block';
            userProfileLink.textContent   = `Hi, ${user.username || user.email}`;
        }
        if (logoutButton) logoutButton.style.display = 'block';

        if (userPointsDisplay) {
            userPointsDisplay.style.display = 'block';
            userPointsDisplay.textContent   = `Points: ${user.points ?? 0}`;

            // Refresh points silently from server
            fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    userPointsDisplay.textContent = `Points: ${data.points ?? 0}`;
                    localStorage.setItem('user', JSON.stringify({ ...user, points: data.points }));
                }
            })
            .catch(() => {});
        }

    } else {
        if (signInLink)       signInLink.style.display       = 'block';
        if (signUpLink)       signUpLink.style.display       = 'block';
        if (userProfileLink)  userProfileLink.style.display  = 'none';
        if (logoutButton)     logoutButton.style.display     = 'none';
        if (userPointsDisplay) userPointsDisplay.style.display = 'none';
    }
}
