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
