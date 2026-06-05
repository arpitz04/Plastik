// signup.js — Registration page logic

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username        = document.getElementById('username').value.trim();
        const email           = document.getElementById('email').value.trim();
        const password        = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const btn             = registerForm.querySelector('button[type="submit"]');

        removeMessage();

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'danger');
            return;
        }

        btn.disabled    = true;
        btn.textContent = 'Creating account...';

        try {
            const res  = await fetch('/api/auth/register', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user',  JSON.stringify(data.user));
                showMessage('Account created! Redirecting...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 900);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (err) {
            showMessage('Cannot connect to server. Is the backend running?', 'danger');
            console.error(err);
        } finally {
            btn.disabled    = false;
            btn.textContent = 'Create account';
        }
    });

    function showMessage(msg, type) {
        removeMessage();
        const el = document.createElement('div');
        el.id          = 'authMsg';
        el.className   = `alert alert-${type} mt-3`;
        el.textContent = msg;
        registerForm.prepend(el);
    }
    function removeMessage() {
        const el = document.getElementById('authMsg');
        if (el) el.remove();
    }
});
