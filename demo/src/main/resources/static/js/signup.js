document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signupForm");
    const signupMessage = document.getElementById("signupMessage");

    if (!signupForm || !signupMessage) {
        return;
    }

    signupForm.style.opacity = 0;
    setTimeout(() => {
        signupForm.style.transition = "opacity 1s ease-in-out";
        signupForm.style.opacity = 1;
    }, 100);

    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const typeAccount = document.querySelector("input[name='type_account']:checked")?.value;

        signupMessage.textContent = "";

        if (password !== confirmPassword) {
            signupMessage.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch("/req/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    type_account: typeAccount
                })
            });

            const message = await response.text();

            if (!response.ok) {
                signupMessage.textContent = message || "Registration failed. Please try again.";
                return;
            }

            signupMessage.textContent = message || "Registration successful. Check your email for a verification link.";
            signupForm.reset();
        } catch (error) {
            console.error("Signup request failed:", error);
            signupMessage.textContent = "Registration failed. Please try again.";
        }
    });
});
