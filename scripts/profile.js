import { getUserSession, updateUserProfile } from '/mali-clear-clinic/scripts/auth/userSession.js';
import { toastManager } from './utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await getUserSession();
        if (!user) {
            window.location.href = '/mali-clear-clinic/pages/login.html';
            return;
        }

        // แสดงข้อมูลผู้ใช้
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('fullName').value = user.full_name || '';
        document.getElementById('phone').value = user.phone || '';

        // จัดการการส่งฟอร์มข้อมูลส่วนตัว
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = {
                    full_name: document.getElementById('fullName').value.trim(),
                    phone: document.getElementById('phone').value.trim()
                };

                await updateUserProfile(formData);
                toastManager.addToast(
                    'success',
                    'สำเร็จ',
                    'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว'
                );

                // รีโหลดข้อมูลผู้ใช้
                const updatedUser = await getUserSession();
                if (updatedUser) {
                    document.getElementById('fullName').value = updatedUser.full_name || '';
                    document.getElementById('phone').value = updatedUser.phone || '';
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                toastManager.addToast(
                    'error',
                    'ข้อผิดพลาด',
                    'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
                );
            }
        });
    } catch (error) {
        console.error('Error initializing profile page:', error);
        toastManager.addToast(
            'error',
            'ข้อผิดพลาด',
            'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        );
    }
}); 