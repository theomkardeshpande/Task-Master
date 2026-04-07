document.getElementById("forgotPasswordForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const fullname = document.getElementById("fullname").value.trim();
  const submitButton = document.getElementById("submitBtn");

  // Disable button and show loading state
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
  submitButton.disabled = true;

  try {
    // Send as form params (matches @RequestParam in your controller)
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("fullname", fullname);

    const response = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (response.ok) {
      submitButton.innerHTML = '<i class="fas fa-check-circle me-2"></i> Link Sent!';
      submitButton.classList.replace("btn-primary", "btn-success");
      alert(`Password reset link sent to ${email}`);
    } else {
      // User not found or server error
      alert("No account found with that email and name. Please check and try again.");
      // Re-enable button so user can correct input
      submitButton.innerHTML = '<i class="fas fa-envelope me-2"></i> Send Reset Link';
      submitButton.disabled = false;
    }
  } catch (error) {
    console.error("Request failed:", error);
    alert("Something went wrong. Please try again later.");
    submitButton.innerHTML = '<i class="fas fa-envelope me-2"></i> Send Reset Link';
    submitButton.disabled = false;
  }
});