import { getUserSession, updateUserProfile } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';

class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.userData = null;
    }

    async connectedCallback() {
        await this.loadUserData();
        this.render();
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            const user = await getUserSession();
            if (!user) {
                window.location.href = '/mali-clear-clinic/pages/login.html';
                return;
            }
            
            // เรียก API เพื่อดึงข้อมูลผู้ใช้
            const response = await fetch(`/mali-clear-clinic/api/Auth/GetUserProfile.php`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
            }

            const result = await response.json();
            if (result.status === 'success') {
                this.userData = result.data;
            } else {
                throw new Error(result.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        }
    }

    render() {
        if (!this.userData) return;

        this.innerHTML = `
            <div class="max-w-4xl mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">โปรไฟล์ของฉัน</h1>
                    
                    <div class="space-y-6">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-700 mb-4">ข้อมูลส่วนตัว</h2>
                            <form id="profile-form" class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                                        <input type="text" id="username" value="${this.userData.username}" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readonly>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                        <input type="email" id="email" value="${this.userData.email}" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readonly>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                                        <input type="text" id="fullName" value="${this.userData.full_name}" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="กรอกชื่อ-นามสกุล">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input type="tel" id="phone" value="${this.userData.phone}" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="กรอกเบอร์โทรศัพท์">
                                    </div>
                                </div>

                                <div class="flex justify-end">
                                    <custom-button 
                                        text="บันทึกข้อมูล"
                                        color="white"
                                        bgColor="green-600"
                                        hoverBg="green-500"
                                        type="submit"
                                        class="w-auto">
                                    </custom-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#profile-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = {
                full_name: this.querySelector('#fullName').value.trim(),
                phone: this.querySelector('#phone').value.trim()
            };

            await updateUserProfile(formData);
            toastManager.addToast('success', 'สำเร็จ', 'อัพเดทข้อมูลเรียบร้อยแล้ว');
            await this.loadUserData();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error updating profile:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถอัพเดทข้อมูลได้');
        }
    }
}

customElements.define('user-profile', UserProfile); 