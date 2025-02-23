import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';
import { ProductService } from '../../Services/ProductService.js';

class AdminProductForm extends HTMLElement {
    constructor() {
        super();
        this.product = null;
    }

    connectedCallback() {
        this.checkAdminAndInit();
    }

    async checkAdminAndInit() {
        const user = await getUserSession();
        if (!user || user.role !== 'ADMIN') {
            window.location.href = '/mali-clear-clinic/index.html';
            return;
        }

        // ตรวจสอบว่ามี product id ใน URL หรือไม่
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            await this.loadProduct(productId);
        }
        
        this.render();
        this.setupEventListeners();
    }

    async loadProduct(id) {
        try {
            const result = await ProductService.getProductById(id);
            if (result) {
                this.product = result;
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่พบข้อมูลสินค้า');
                window.location.href = '/mali-clear-clinic/pages/admin-products.html';
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        }
    }

    render() {
        this.innerHTML = `
            <div class="max-w-4xl mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="text-2xl font-bold text-gray-800">
                            ${this.product ? 'แก้ไขสินค้า/บริการ' : 'เพิ่มสินค้า/บริการ'}
                        </h1>
                    </div>

                    <form id="product-form" class="space-y-4">
                        <input type="hidden" id="product-id" value="${this.product?.id || ''}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า/บริการ *</label>
                                <input type="text" id="name" required 
                                    value="${this.product?.name || ''}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">ประเภท *</label>
                                <select id="type" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="PRODUCT" ${this.product?.type === 'PRODUCT' ? 'selected' : ''}>สินค้า</option>
                                    <option value="SERVICE" ${this.product?.type === 'SERVICE' ? 'selected' : ''}>บริการ</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) *</label>
                                <input type="number" id="price" required min="0" 
                                    value="${this.product?.price || ''}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ *</label>
                                <select id="status" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="ACTIVE" ${this.product?.status === 'ACTIVE' ? 'selected' : ''}>เปิดใช้งาน</option>
                                    <option value="INACTIVE" ${this.product?.status === 'INACTIVE' ? 'selected' : ''}>ปิดใช้งาน</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด *</label>
                            <rich-text-editor id="description"></rich-text-editor>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
                            <input type="file" id="image" accept="image/*" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <div id="image-preview" class="mt-2">
                                ${this.product?.image ? 
                                    `<img src="/mali-clear-clinic/assets/images/${this.product.image}" 
                                          class="h-32 object-cover rounded-lg">` : 
                                    ''}
                            </div>
                        </div>

                        <div class="flex justify-end gap-2">
                            <custom-button 
                                text="ยกเลิก"
                                color="gray-700"
                                bgColor="gray-100"
                                hoverBg="gray-200"
                                type="button"
                                id="cancel-btn"
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
                    </form>
                </div>
            </div>
        `;

        // Set initial content if editing
        if (this.product?.description) {
            this.querySelector('rich-text-editor').setContent(this.product.description);
        }

        // Listen for changes
        this.querySelector('rich-text-editor').addEventListener('editor-change', (e) => {
            console.log('Editor content changed:', e.detail.html);
        });
    }

    setupEventListeners() {
        this.querySelector('#cancel-btn').addEventListener('click', () => {
            window.location.href = '/mali-clear-clinic/pages/admin-products.html';
        });

        this.querySelector('#product-form').addEventListener('submit', (e) => this.handleSubmit(e));
        this.querySelector('#image').addEventListener('change', (e) => this.handleImagePreview(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', this.querySelector('#name').value);
            formData.append('type', this.querySelector('#type').value);
            formData.append('price', this.querySelector('#price').value);
            formData.append('status', this.querySelector('#status').value);
            formData.append('description', this.querySelector('rich-text-editor').getContent());

            const imageFile = this.querySelector('#image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const productId = this.querySelector('#product-id').value;
            let result;
            
            if (productId) {
                result = await ProductService.updateProduct(productId, formData);
            } else {
                result = await ProductService.createProduct(formData);
            }

            if (result.status === 'success') {
                toastManager.addToast(
                    'success',
                    'สำเร็จ',
                    productId ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว'
                );
                window.location.href = '/mali-clear-clinic/pages/admin-products.html';
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
        }
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = this.querySelector('#image-preview');
                preview.innerHTML = `<img src="${e.target.result}" class="h-32 object-cover rounded-lg">`;
            }
            reader.readAsDataURL(file);
        }
    }
}

customElements.define('admin-product-form', AdminProductForm); 