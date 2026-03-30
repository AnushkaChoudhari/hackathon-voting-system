// 🗳️ HACKVOTE AUTH LOGIC (Google Apps Script Version)
const GAS_URL = "https://script.google.com/macros/s/AKfycbyfL-ANFGJGF7O8ZpFrDSoa_Wmj6Kyy39DzbSEv1tQvx_BCXCj61MwgWezmCFWAFLva9Q/exec"; // Update this with your deployed URL

// Multi-step signup state
let isOtpSent = false;

// Toast Utility
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

// 🛡️ PRN VALIDATION (8 Digits + 1 Alphabet)
function validatePRN(prn) {
    if (!prn) return false;
    const prnRegex = /^\d{8}[A-Za-z]$/;
    const isValid = prnRegex.test(prn.trim());
    
    if (!isValid) {
        console.error("PRN Validation Failed:", prn);
        alert("CRITICAL ERROR: Invalid PRN Number!\n\nFormat must be: 8 NUMBERS followed by 1 ALPHABET\nExample: 67548378A\n\nYou typed: " + prn);
    }
    return isValid;
}

// 📧 SEND OTP FLOW
async function sendOtp() {
    const email = document.getElementById('email').value.trim();
    if (!email) return showToast("Email is required!", "error");
    
    // Check if other fields are filled before sending OTP to prevent empty signups
    const name = document.getElementById('fullName').value.trim();
    const branch = document.getElementById('branch').value;
    const year = document.getElementById('year').value;
    const prn = document.getElementById('prn').value.trim();

    if (!name || !branch || !year || !prn) {
        return showToast("Please fill all fields before sending OTP!", "error");
    }

    if (!validatePRN(prn)) {
        return showToast("Invalid PRN! Format: 8 numbers + 1 alphabet (e.g. 72315270A)", "error");
    }
    
    const sendBtn = document.getElementById('send-otp-btn');
    if(sendBtn) sendBtn.innerText = "Sending...";

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "sendOtp", email: email })
        });
        const data = await response.json();
        
        if (data.status === "success") {
            showToast("OTP sent to your email!", "success");
            isOtpSent = true;
            const signupBtn = document.getElementById('signup-submit-btn');
            if(signupBtn) signupBtn.disabled = false;
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error sending OTP. Please try again.", "error");
    } finally {
        if(sendBtn) sendBtn.innerText = "Send OTP";
    }
}

// 👤 STUDENT SIGNUP
async function signupStudent(event) {
    if (event) event.preventDefault();
    
    const prnInput = document.getElementById('prn');
    const prnValue = prnInput ? prnInput.value.trim() : "";
    
    if (!validatePRN(prnValue)) {
        return; 
    }

    if (!isOtpSent) {
        alert("Please verify your OTP first!");
        return showToast("Please verify OTP first!", "error");
    }

    const payload = {
        action: "signup",
        name: document.getElementById('fullName').value.trim(),
        branch: document.getElementById('branch').value.trim(),
        year: document.getElementById('year').value.trim(),
        prn: prnValue.toUpperCase(),
        email: document.getElementById('email').value.trim(),
        otp: document.getElementById('otp-input').value.trim()
    };

    try {
        const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === "success") {
            showToast("Account created successfully!", "success");
            setTimeout(() => window.location.href = '../login.html', 1500);
        } else {
            showToast(data.message, "error");
            alert("Registration Failed: " + data.message);
        }
    } catch (err) {
        showToast("Signup failed. Server error.", "error");
    }
}

// 🔑 STUDENT LOGIN
async function loginStudent(event) {
    if (event) event.preventDefault();
    const prnEl = document.getElementById('prn');
    if(!prnEl) return;
    const prn = prnEl.value.trim();

    if (!validatePRN(prn)) {
        return showToast("Invalid PRN format! (e.g. 72315270A)", "error");
    }

    try {
        const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "login", prn: prn.toUpperCase() })
        });
        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem('student_prn', data.prn);
            localStorage.setItem('student_name', data.name);
            localStorage.setItem('student_branch', data.branch);
            localStorage.setItem('student_year', data.year);
            localStorage.setItem('voted_list', JSON.stringify(data.votedProjects));
            
            showToast("Login Successful!", "success");
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Login failed. Check connection.", "error");
    }
}

// Global Exports
window.sendOtp = sendOtp;
window.signupStudent = signupStudent;
window.loginStudent = loginStudent;
window.validatePRN = validatePRN;