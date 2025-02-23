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

            await this.loadItems();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    async loadItems() {
        try {
            // TODO: เรียก API จริง
            this.products = await ProductService.getProducts();
            this.services = await ServiceService.getServices();
        } catch (error) {
            console.error('Error loading items:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าและบริการได้');
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
                            <p class="text-sm text-gray-500 mt-1">แนะนำขนาดรูปภาพ 800x600 pixels</p>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">เลือกสินค้าและบริการ *</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 class="font-semibold mb-2">สินค้า</h3>
                                    <div class="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                                        ${this.products.map(product => `
                                            <label class="flex items-center space-x-2">
                                                <input type="checkbox" 
                                                       value="product-${product.id}"
                                                       class="item-checkbox"
                                                       ${this.selectedItems.has(`product-${product.id}`) ? 'checked' : ''}>
                                                <span>${product.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <h3 class="font-semibold mb-2">บริการ</h3>
                                    <div class="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                                        ${this.services.map(service => `
                                            <label class="flex items-center space-x-2">
                                                <input type="checkbox" 
                                                       value="service-${service.id}"
                                                       class="item-checkbox"
                                                       ${this.selectedItems.has(`service-${service.id}`) ? 'checked' : ''}>
                                                <span>${service.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">ส่วนลด *</label>
                            <div class="flex space-x-4">
                                <form-input 
                                    type="number"
                                    name="discount"
                                    required
                                    class="w-24"
                                    min="0"
                                    max="100">
                                </form-input>
                                <select name="discountType" 
                                        class="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 transition-all duration-300 outline-none">
                                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                                    <option value="fixed">บาท</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">วันที่เริ่มต้น *</label>
                                <form-input 
                                    type="date"
                                    name="startDate"
                                    required>
                                </form-input>
                            </div>
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">วันที่สิ้นสุด *</label>
                                <form-input 
                                    type="date"
                                    name="endDate"
                                    required>
                                </form-input>
                            </div>
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
        const cancelBtn = this.querySelector('#cancel-btn');
        const checkboxes = this.querySelectorAll('.item-checkbox');

        form.addEventListener('submit', this.handleSubmit.bind(this));
        backBtn.addEventListener('click', () => this.navigateBack());
        cancelBtn.addEventListener('click', () => this.navigateBack());

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
        
        if (this.selectedItems.size === 0) {
            toastManager.addToast('error', 'ข้อผิดพลาด', 'กรุณาเลือกสินค้าหรือบริการอย่างน้อย 1 รายการ');
            return;
        }

        try {
            const formData = new FormData(event.target);
            formData.append('items', Array.from(this.selectedItems));

            // TODO: เรียก API สร้างโปรโมชั่น
            await PromotionService.createPromotion(formData);
            
            toastManager.addToast('success', 'สำเร็จ', 'สร้างโปรโมชั่นเรียบร้อยแล้ว');
            this.navigateBack();
        } catch (error) {
            console.error('Error creating promotion:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถสร้างโปรโมชั่นได้');
        }
    }

    navigateBack() {
        window.location.href = '/mali-clear-clinic/pages/admin-promotions.html';
    }
}

customElements.define('admin-promotion-form', AdminPromotionForm); 