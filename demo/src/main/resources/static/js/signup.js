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
                    password
                })
            });

            if (!response.ok) {
                throw new Error("Signup failed with status " + response.status);
            }

            signupMessage.textContent = "Registration successful. You can now log in.";
            signupForm.reset();
        } catch (error) {
            console.error("Signup request failed:", error);
            signupMessage.textContent = "Registration failed. Please try again.";
        }
    });
});
