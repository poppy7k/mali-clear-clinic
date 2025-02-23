import { getUserSession } from '/mali-clear-clinic/scripts/auth/userSession.js';
import { toastManager } from './utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await getUserSession();
    if (!user) {
        window.location.href = '/mali-clear-clinic/pages/login.html';
        return;
    }

    // แสดงข้อมูลผู้ใช้
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('phone').value = user.phone || '';

    // จัดการการส่งฟอร์มข้อมูลส่วนตัว
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const updatedData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value
            };

            // TODO: เพิ่มการเรียก API เพื่ออัพเดทข้อมูล
            console.log('Updating profile:', updatedData);
            toastManager.addToast(
                'success',
                'สำเร็จ',
                'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว'
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            toastManager.addToast(
                'error',
                'ข้อผิดพลาด',
                'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
            );
        }
    });

    // จัดการการเปลี่ยนรหัสผ่าน
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            toastManager.addToast(
                'error',
                'ข้อผิดพลาด',
                'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'
            );
            return;
        }

        try {
            // TODO: เพิ่มการเรียก API เพื่อเปลี่ยนรหัสผ่าน
            console.log('Changing password');
            toastManager.addToast(
                'success',
                'สำเร็จ',
                'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
            );
            document.getElementById('password-form').reset();
        } catch (error) {
            console.error('Error changing password:', error);
            toastManager.addToast(
                'error',
                'ข้อผิดพลาด',
                'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'
            );
        }
    });
}); 