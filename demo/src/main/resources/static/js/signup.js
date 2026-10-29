document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signupForm");
    signupForm.style.opacity = 0;
    setTimeout(() => {
        signupForm.style.transition = "opacity 1s ease-in-out";
        signupForm.style.opacity = 1;
    }, 100);
});
