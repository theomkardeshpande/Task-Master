// Authentication functionality for signin and signup pages
document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Sign In Form
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Reset previous validation
            this.classList.remove('was-validated');
            clearValidationErrors();

            let isValid = true;

            // Validate email
            if (!email) {
                showFieldError('email', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showFieldError('email', 'Please enter a valid email');
                isValid = false;
            }

            // Validate password
            if (!password) {
                showFieldError('password', 'Password is required');
                isValid = false;
            }

            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const spinner = submitBtn.querySelector('.spinner-border');
                const btnText = submitBtn.childNodes[submitBtn.childNodes.length - 1];

                spinner.classList.remove('d-none');
                btnText.textContent = ' Signing In...';
                submitBtn.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    // Store user session (in real app, this would be handled by backend)
                    localStorage.setItem('userSession', JSON.stringify({
                        email: email,
                        name: 'John Doe',
                        loginTime: new Date().toISOString()
                    }));

                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }

    // Sign Up Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const terms = document.getElementById('terms').checked;

            // Reset previous validation
            this.classList.remove('was-validated');
            clearValidationErrors();

            let isValid = true;

            // Validate name
            if (!name.trim()) {
                showFieldError('name', 'Name is required');
                isValid = false;
            }

            // Validate email
            if (!email) {
                showFieldError('email', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showFieldError('email', 'Please enter a valid email');
                isValid = false;
            }

            // Validate password
            if (!password) {
                showFieldError('password', 'Password is required');
                isValid = false;
            } else if (!validatePassword(password)) {
                showFieldError('password', 'Password must be at least 8 characters');
                isValid = false;
            }

            // Validate terms
            if (!terms) {
                showFieldError('terms', 'You must agree to the terms and conditions');
                isValid = false;
            }

            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const spinner = submitBtn.querySelector('.spinner-border');
                const btnText = submitBtn.childNodes[submitBtn.childNodes.length - 1];

                spinner.classList.remove('d-none');
                btnText.textContent = ' Creating Account...';
                submitBtn.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    // Store user session
                    localStorage.setItem('userSession', JSON.stringify({
                        email: email,
                        name: name,
                        loginTime: new Date().toISOString()
                    }));

                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }
});

// Validation helper functions
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.parentElement.querySelector('.invalid-feedback');

    field.classList.add('is-invalid');
    if (feedback) {
        feedback.textContent = message;
    }
}

function clearValidationErrors() {
    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Check if user is already logged in
function checkAuthStatus() {
    const userSession = localStorage.getItem('userSession');
    if (userSession && (window.location.pathname.includes('signin.html') || window.location.pathname.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
    }
}

// Run auth check on page load
checkAuthStatus();