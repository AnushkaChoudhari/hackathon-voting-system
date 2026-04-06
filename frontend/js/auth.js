// 🗳️ HACKVOTE AUTH LOGIC (Google Apps Script Version)
const GAS_URL = "https://script.google.com/macros/s/AKfycbyNlcYykBEFaJtNssNVMWfI6315zJmOZPBbj9ywVFwjBbrcrstSaeBpxKRskEYeo-F7Zg/exec"; // Update this with your deployed URL

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
        alert("Verification Error: The PRN provided is not in the correct format. Please double-check your official ID.");
    }
    return isValid;
}

// 📧 SEND OTP FLOW (Frontend SDK Version)
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
        return showToast("Invalid PRN format. Please check and try again.", "error");
    }
    
    const sendBtn = document.getElementById('send-otp-btn');
    if (sendBtn) {
        sendBtn.setAttribute('loading', '');
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = 'Sending...';

        try {
            // 1. Get OTP from GAS (Generating it securely on the server)
            const response = await fetch(GAS_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "sendOtp", email: email })
            });
            const data = await response.json();
            
            if (data.status === "success") {
                console.log("OTP received from GAS:", data.otp);
                console.log("Sending to email:", email);

                // 2. Send via EmailJS SDK (Bypassing GAS permission error)
                // Sending multiple variations of keys to ensure compatibility with your template
                const templateParams = {
                    to_email: email,
                    otp_code: data.otp,
                    to_name: name.split(' ')[0]
                };

                console.log("Final payload being sent to EmailJS:", templateParams);

                try {
                    const EMAILJS_PUBLIC_KEY = "yMyJcQw19j6P_qJO6";
                    const emailResponse = await emailjs.send("service_oqyts3d", "template_5d6gp3e", templateParams, EMAILJS_PUBLIC_KEY);
                    console.log("EmailJS Success:", emailResponse);
                    showToast("OTP sent to your email!", "success");
                    isOtpSent = true;
                    const signupBtn = document.getElementById('signup-submit-btn');
                    if(signupBtn) signupBtn.disabled = false;
                } catch (emailErr) {
                    console.error("EmailJS Detailed Error:", emailErr);
                    // This will show exactly what EmailJS is complaining about
                    const errorText = emailErr.text || emailErr.message || JSON.stringify(emailErr);
                    alert("EmailJS ERROR: " + errorText + "\n\n(Check if your Service ID or Template ID is linked correctly in the EmailJS dashboard)");
                    throw emailErr;
                }
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            console.error("OTP Error:", err);
            showToast("Error sending OTP. Please try again.", "error");
        } finally {
            sendBtn.removeAttribute('loading');
            sendBtn.innerHTML = originalText;
        }
    }
}

// 👤 STUDENT SIGNUP
async function signupStudent(event) {
    if (event) event.preventDefault();
    
    // Form validation check
    const prnInput = document.getElementById('prn');
    const prnValue = prnInput ? prnInput.value.trim() : "";
    
    if (!validatePRN(prnValue)) return; 

    if (!isOtpSent) {
        alert("Please verify your OTP first!");
        return showToast("Please verify OTP first!", "error");
    }

    // Use a direct targeted approach for the button
    const signupBtn = document.getElementById('signup-submit-btn');
    let originalSignupText = "";
    if (signupBtn) {
        originalSignupText = signupBtn.innerHTML;
        signupBtn.setAttribute('loading', '');
        signupBtn.innerHTML = 'Processing...';
        console.log("Signup process started, button state updated.");
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
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === "success") {
            showToast("Account created successfully!", "success");
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showToast(data.message, "error");
            alert("Registration Failed: " + data.message);
        }
    } catch (err) {
        console.error("Signup error:", err);
        showToast("Signup failed. Server error.", "error");
    } finally {
        if (signupBtn) {
            signupBtn.removeAttribute('loading');
            signupBtn.innerHTML = originalSignupText;
        }
    }
}

// 🔑 STUDENT LOGIN
async function loginStudent(event) {
    if (event) event.preventDefault();
    const prnEl = document.getElementById('prn');
    if(!prnEl) return;
    const prn = prnEl.value.trim();

    if (!validatePRN(prn)) {
        return showToast("Invalid PRN format. Please check and try again.", "error");
    }

    const loginBtn = document.querySelector("#student-login-form button") || event.target.querySelector('button[type="submit"]');
    let originalLoginText = "";
    if (loginBtn) {
        originalLoginText = loginBtn.innerHTML;
        loginBtn.setAttribute('loading', '');
        loginBtn.innerHTML = 'Logging in...';
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
    } finally {
        if (loginBtn) {
            loginBtn.removeAttribute('loading');
            loginBtn.innerHTML = originalLoginText;
        }
    }
}

// Global Exports
window.sendOtp = sendOtp;
window.signupStudent = signupStudent;
window.loginStudent = loginStudent;
window.validatePRN = validatePRN;