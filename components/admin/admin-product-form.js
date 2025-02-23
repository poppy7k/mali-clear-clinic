import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';
import { ProductService } from '../../Services/ProductService.js';
import { CategoryService } from '../../Services/CategoryService.js';

class AdminProductForm extends HTMLElement {
    constructor() {
        super();
        this.product = null;
        this.loadingModal = null;
        this.categories = [];
    }

    async connectedCallback() {
        await this.checkAdminAndInit();
    }

    async checkAdminAndInit() {
        const user = await getUserSession();
        if (!user || user.role !== 'ADMIN') {
            window.location.href = '/mali-clear-clinic/index.html';
            return;
        }

        // สร้าง loading modal
        this.loadingModal = document.createElement('loading-modal');
        document.body.appendChild(this.loadingModal);

        try {
            this.loadingModal.show();
            
            // โหลดข้อมูล categories
            this.categories = await CategoryService.getAllCategories();
            
            // ตรวจสอบว่ามี product id ใน URL หรือไม่
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (productId) {
                await this.loadProduct(productId);
            }
        } catch (error) {
            console.error('Error initializing:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            this.loadingModal.hide();
        }
        
        this.render();
        this.setupEventListeners();
    }

    async loadProduct(id) {
        try {
            this.loadingModal.show();
            const product = await ProductService.getProductById(id);
            if (product) {
                this.product = product;
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่พบข้อมูลสินค้า');
                window.location.href = '/mali-clear-clinic/pages/admin-products.html';
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        } finally {
            this.loadingModal.hide();
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
                                <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
                                <select id="category_id" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="">เลือกหมวดหมู่</option>
                                    ${this.categories.map(category => `
                                        <option value="${category.id}" 
                                            ${this.product?.category_id === category.id ? 'selected' : ''}>
                                            ${category.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">ราคา *</label>
                                <input type="number" id="price" required 
                                    value="${this.product?.price || ''}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">ประเภท *</label>
                                <select id="type" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="">เลือกประเภท</option>
                                    <option value="PRODUCT" ${this.product?.type === 'PRODUCT' ? 'selected' : ''}>สินค้า</option>
                                    <option value="SERVICE" ${this.product?.type === 'SERVICE' ? 'selected' : ''}>บริการ</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ *</label>
                                <select id="status" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="ACTIVE" ${!this.product || this.product?.status === 'ACTIVE' ? 'selected' : ''}>เปิดใช้งาน</option>
                                    <option value="INACTIVE" ${this.product?.status === 'INACTIVE' ? 'selected' : ''}>ปิดใช้งาน</option>
                                </select>
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
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                            <rich-text-editor></rich-text-editor>
                        </div>

                        <div class="flex justify-end space-x-3 mt-6">
                            <custom-button 
                                id="cancel-btn"
                                text="ยกเลิก"
                                type="button"
                                color="gray-700"
                                bgColor="gray-100"
                                hoverBg="gray-200">
                            </custom-button>
                            <custom-button 
                                text="${this.product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า/บริการ'}"
                                type="submit"
                                color="white"
                                bgColor="blue-600"
                                hoverBg="blue-700">
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
            this.loadingModal.show();

            // เก็บค่าจากฟอร์ม
            const name = this.querySelector('#name').value;
            const category_id = this.querySelector('#category_id').value;
            const price = this.querySelector('#price').value;
            const type = this.querySelector('#type').value;
            const status = this.querySelector('#status').value;
            const description = this.querySelector('rich-text-editor').getContent();

            // Debug: แสดงค่าที่ได้จากฟอร์ม
            console.log('Form values:', {
                name,
                category_id,
                price,
                type,
                status,
                description
            });

            // ตรวจสอบข้อมูลที่จำเป็น
            const requiredFields = {
                'ชื่อสินค้า/บริการ': name,
                'หมวดหมู่': category_id,
                'ราคา': price,
                'ประเภท': type,
                'สถานะ': status
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([fieldName]) => fieldName);

            if (missingFields.length > 0) {
                throw new Error(`กรุณากรอก ${missingFields.join(', ')} ให้ครบถ้วน`);
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('category_id', category_id);
            formData.append('price', price);
            formData.append('type', type);
            formData.append('status', status);
            formData.append('description', description);

            // Debug: ตรวจสอบข้อมูลใน FormData
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const imageFile = this.querySelector('#image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
                console.log('Image file:', imageFile.name);
            }

            const productId = this.querySelector('#product-id').value;
            let result;
            
            if (productId) {
                console.log('Updating product:', productId);
                formData.append('id', productId);
                result = await ProductService.updateProduct(productId, formData);
            } else {
                console.log('Creating new product');
                result = await ProductService.createProduct(formData);
            }

            // Debug: แสดงผลลัพธ์จาก API
            console.log('API response:', result);

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
        } finally {
            this.loadingModal.hide();
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