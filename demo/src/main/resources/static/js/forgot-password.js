document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("forgotPasswordForm");
    const message = document.getElementById("forgotPasswordMessage");

    if (!form || !message) {
        console.error("Forgot-password form could not be initialized.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        message.textContent = "";

        try {
            const response = await fetch("/req/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const responseMessage = await response.text();
            if (!response.ok) {
                throw new Error(responseMessage || "Request failed with status " + response.status);
            }

            message.textContent = responseMessage;
            form.reset();
        } catch (error) {
            console.error("Forgot-password request failed:", error);
            message.textContent = "Unable to send the reset link. Please try again.";
        }
    });
});
