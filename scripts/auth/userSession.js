export async function getUserSession() {
    try {
        const response = await fetch('/mali-clear-clinic/api/Auth/UserSession.php', {
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

export async function updateUserProfile(profileData) {
    try {
        const response = await fetch('/mali-clear-clinic/api/Auth/UpdateProfile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData),
            credentials: 'include'
        });

        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'ไม่สามารถอัพเดทข้อมูลได้');
        }

        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

export async function logout() {
    try {
        const response = await fetch('/mali-clear-clinic/api/Auth/LogoutService.php', {
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
