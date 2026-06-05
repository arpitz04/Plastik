// signin.js — Login page logic

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect away
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn      = loginForm.querySelector('button[type="submit"]');

        btn.disabled     = true;
        btn.textContent  = 'Signing in...';
        removeMessage();

        try {
            const res  = await fetch('/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user',  JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 900);
            } else {
                showMessage(data.message || 'Invalid email or password.', 'danger');
            }
        } catch (err) {
            showMessage('Cannot connect to server. Is the backend running?', 'danger');
            console.error(err);
        } finally {
            btn.disabled    = false;
            btn.textContent = 'Sign in';
        }
    });

    function showMessage(msg, type) {
        removeMessage();
        const el = document.createElement('div');
        el.id        = 'authMsg';
        el.className = `alert alert-${type} mt-3`;
        el.textContent = msg;
        loginForm.prepend(el);
    }
    function removeMessage() {
        const el = document.getElementById('authMsg');
        if (el) el.remove();
    }
});
