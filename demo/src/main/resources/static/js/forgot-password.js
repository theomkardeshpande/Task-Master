

// Handle the forgot password form submission
function showNotification(message, type = "success") {
  const div = document.createElement("div")
  const base = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down text-white"
  const color = type === "success" ? "bg-green-500" : type === "info" ? "bg-slate-700" : "bg-red-500"
  div.className = `${base} ${color}`
  const icon = type === "success" ? "fa-check-circle" : type === "info" ? "fa-info-circle" : "fa-exclamation-circle"
  div.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`
  document.body.appendChild(div)
  setTimeout(() => {
    div.style.opacity = "0"
    div.style.transform = "translateY(-20px)"
    setTimeout(() => div.remove(), 500)
  }, 3000)
}

document.getElementById("forgot-password-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const fullname = document.getElementById("fullname").value;

    // Show a loading message (replace with actual API call)
    const submitButton = event.target.querySelector("button");
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
    document.getElementById("email").value=""
    document.getElementById("fullname").value=""
    submitButton.disabled = true;

    data = {
        email: email.trim(),
        fullname: fullname.trim()
    };
    console.log(data)
    const response =  await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const txt = await response.text()
    console.log(txt)
    if (!response.ok) {
        showNotification(txt,"error");
//        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        submitButton.disabled=false;
    }
    if(response.ok){
        showNotification(txt,"success");
    }
//    setTimeout(() => {
//        alert(`Password reset link sent to ${email}`);
//        submitButton.innerHTML = '<i class="fas fa-envelope me-2"></i> Send Reset Link';
//        submitButton.disabled = false;
//    }, 1500);

    // Simulate sending the reset link after a short delay

});