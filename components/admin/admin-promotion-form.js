import { getUserSession } from '../../scripts/auth/userSession.js';
import { PromotionService } from '../../services/PromotionService.js';
import { ProductService } from '../../Services/ProductService.js';
import { toastManager } from '../../scripts/utils/toast.js';

class AdminPromotionForm extends HTMLElement {
    constructor() {
        super();
        this.products = [];
        this.services = [];
        this.selectedItems = new Set();
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }

            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">สร้างโปรโมชั่นใหม่</h2>
                </div>

                <form id="promotion-form" class="bg-white border border-gray-200 shadow-md rounded-lg p-6">
                    <div class="grid grid-cols-1 gap-6">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อโปรโมชั่น *</label>
                            <form-input 
                                type="text"
                                name="title"
                                required>
                            </form-input>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">รายละเอียด *</label>
                            <form-input 
                                type="textarea"
                                name="description"
                                required>
                            </form-input>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">รูปภาพ *</label>
                            <form-input 
                                type="file"
                                name="image"
                                accept="image/*"
                                required>
                            </form-input>
                            <p class="text-sm text-gray-500 mt-1"></p>
                        </div>

                        <div class="flex justify-end space-x-4">
                            <custom-button 
                                text="ยกเลิก"
                                color="white"
                                bgColor="gray-600"
                                hoverBg="gray-500"
                                type="button"
                                id="back-btn"
                                class="w-auto">
                            </custom-button>
                            <custom-button 
                                text="บันทึก"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-500"
                                type="submit"
                                class="w-auto">
                            </custom-button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#promotion-form');
        const backBtn = this.querySelector('#back-btn');
        const checkboxes = this.querySelectorAll('.item-checkbox');

        form.addEventListener('submit', this.handleSubmit.bind(this));
        backBtn.addEventListener('click', () => this.navigateBack());

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedItems.add(e.target.value);
                } else {
                    this.selectedItems.delete(e.target.value);
                }
            });
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
    
        try {
            const formData = new FormData(event.target);

            formData.append('title', this.querySelector('form-input[name="title"] input')?.value || '');
            formData.append('excerpt', this.querySelector('form-input[name="excerpt"] textarea')?.value || '');
            formData.append('content', this.querySelector('rich-text-editor').getContent());
            formData.append('status', this.querySelector('#status').value);
    
            // ✅ เช็คว่ามีรูปภาพหรือไม่
            const imageInput = this.querySelector("input[name='image']");
            if (!imageInput.files.length) {
                toastManager.addToast("error", "ข้อผิดพลาด", "กรุณาอัปโหลดรูปภาพ");
                return;
            }
    
            // ✅ เรียก API เพื่อสร้างโปรโมชั่น
            const response = await PromotionService.createPromotion(formData);
            
            if (response) {
                toastManager.addToast("success", "สำเร็จ", "สร้างโปรโมชั่นเรียบร้อยแล้ว");
                this.navigateBack();
            } else {
                toastManager.addToast("error", "ข้อผิดพลาด", "ไม่สามารถสร้างโปรโมชั่นได้");
            }
        } catch (error) {
            console.error("Error creating promotion:", error);
            toastManager.addToast("error", "ข้อผิดพลาด", "เกิดข้อผิดพลาดในการสร้างโปรโมชั่น");
        }
    }
    

    navigateBack() {
        window.location.href = '/mali-clear-clinic/pages/admin-promotions.html';
    }
}

customElements.define('admin-promotion-form', AdminPromotionForm); 