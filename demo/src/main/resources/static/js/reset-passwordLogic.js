
function togglePassword(fieldId, button) {
    const passwordField = document.getElementById(fieldId);
    const icon = button.querySelector("i");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pwd = document.getElementById('password');
    const confirm = document.getElementById('confirm');
    const token = document.getElementById('token');

    // Ensure token is present before proceeding
    if (!token) {
        console.error("Token input field is missing.");
        return;
    }

    // Ensure password fields match before allowing submission
    confirm.addEventListener('input', () => {
        confirm.setCustomValidity(confirm.value === pwd.value ? '' : 'Passwords do not match');
    });

    // Function to submit reset request
    async function resetPassword() {
        const data = {
            token: token.value,
            newPassword: pwd.value.trim()
        };

        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get the error response if available
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            // Show success message or redirect the user
            alert("Password successfully reset!");
            window.location.href = "/login"; // Redirect to login page after reset
        } catch (error) {
            console.error("Error resetting password:", error);
            alert(`Error: ${error.message}`);
        }
    }

    // Attach resetPassword function to the form submission event
    document.getElementById('resetPasswordForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        resetPassword();
    });
});