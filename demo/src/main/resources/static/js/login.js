document.addEventListener("DOMContentLoaded", function() {
    const loginMessage = document.getElementById("loginMessage");
    const error = new URLSearchParams(window.location.search).get("error");

    if (!loginMessage) {
        return;
    }

    if (error === "unverified") {
        loginMessage.textContent = "Your account is not verified. Check your email for the verification link.";
    } else if (error === "invalid") {
        loginMessage.textContent = "The username or password is incorrect, or the account does not exist.";
    }
});
