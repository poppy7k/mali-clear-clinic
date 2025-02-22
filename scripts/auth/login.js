import { AppError, ErrorTypes, handleError } from '../../utils/ErrorHandler.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message hidden';
    loginForm.appendChild(errorDiv);

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        try {
            const formData = new FormData(this);
            const response = await fetch("/mali-clear-clinic/api/Auth/LoginService.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new AppError(`Server error: ${response.status}`, ErrorTypes.API_ERROR);
            }

            const result = await response.json();
            if (result.status === "success") {
                window.location.href = "service.html";
            } else {
                throw new AppError(result.message, ErrorTypes.AUTH_ERROR);
            }
        } catch (error) {
            const errorMessage = handleError(error, 'LoginForm');
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove('hidden');
        }
    });
});
