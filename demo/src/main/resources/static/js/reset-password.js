document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resetPasswordForm");
    const message = document.getElementById("resetPasswordMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        message.textContent = "";

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch("/req/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: document.getElementById("token").value,
                    password
                })
            });
            message.textContent = await response.text();
            if (response.ok) {
                form.reset();
            }
        } catch (error) {
            console.error("Password reset failed:", error);
            message.textContent = "Unable to reset the password. Please try again.";
        }
    });
});
