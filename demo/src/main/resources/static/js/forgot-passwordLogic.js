

    // Handle the forgot password form submission
    document.getElementById("forgotPasswordForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const fullname=document.getElementById("fullname").value;

      // Show a loading message (replace with actual API call)
      const submitButton = event.target.querySelector("button");
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
      submitButton.disabled = true;

        data={
            email:email.trim()
            fullname:fullname.trim()
        };
        const response = await fetch('/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
      setTimeout(() => {
        alert(`Password reset link sent to ${email}`);
        submitButton.innerHTML = '<i class="fas fa-envelope me-2"></i> Send Reset Link';
        submitButton.disabled = false;
      }, 1500);

      // Simulate sending the reset link after a short delay

    });