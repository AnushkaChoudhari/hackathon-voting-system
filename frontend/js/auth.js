const API_URL = "http://127.0.0.1:8000";

// Toast Notification Utility
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Student Login Function
async function loginStudent(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const password = document.getElementById('prn').value.trim();
    const submitBtn = event?.target?.querySelector('button[type="submit"]');

    if (!name || !password) {
        showToast('All fields are required.', 'error');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Logging in...';
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            // Save student info to localStorage for dashboard
            localStorage.setItem('student_name', data.name);
            localStorage.setItem('student_branch', data.branch);
            localStorage.setItem('student_year', data.year);
            localStorage.setItem('role', 'student');

            showToast('Login successful! Welcome back.', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(data.message || 'Login failed.', 'error');
        }
    } catch (err) {
        console.error('Login error:', err);
        showToast('Connection error. Please check the server.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login';
        }
    }
}

// Student Signup Function
async function signupStudent(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const branch = document.getElementById('branch').value.trim();
    const year = document.getElementById('year').value.trim();
    const password = document.getElementById('prn').value.trim();
    const confirmPrn = document.getElementById('confirmPrn').value.trim();
    const submitBtn = event?.target?.querySelector('button[type="submit"]');

    if (!name || !branch || !year || !password || !confirmPrn) {
        showToast('All fields are required.', 'error');
        return;
    }

    if (password !== confirmPrn) {
        showToast('PRN does not match. Please re-enter.', 'error');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Account...';
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, branch, year, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast('Signup successful! Redirecting to login…', 'success');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showToast(data.message || 'Signup failed.', 'error');
        }
    } catch (err) {
        console.error('Signup error:', err);
        showToast('Server error. Please try again later.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create Account';
        }
    }
}

// Expose functions to global context for HTML onsubmit handlers
window.loginStudent = loginStudent;
window.signupStudent = signupStudent;