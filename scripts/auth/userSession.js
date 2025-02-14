export async function getUserSession() {
    try {
        const response = await fetch('/mali-clear-clinic/Services/Auth/UserSession.php', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log(data);
        
        if (data.status === 'success') {
            return data.user;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user session:', error);
        return null;
    }
}

export async function logout() {
    try {
        const response = await fetch('/mali-clear-clinic/Services/Auth/LogoutService.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (data.status === 'success') {
            window.location.href = "/mali-clear-clinic/index.html";
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}
