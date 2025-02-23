import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';
import { ProductService } from '../../Services/ProductService.js';

class AdminProduct extends HTMLElement {
    constructor() {
        super();
        this.products = [];
        this.confirmationModal = null;
        this.loadingModal = null;
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }

            await this.initializeModals();
            this.render();
            this.setupEventListeners();
            await this.loadProducts();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async initializeModals() {
        // สร้าง confirmation modal
        this.confirmationModal = document.createElement('confirmation-modal');
        
        // สร้าง loading modal
        this.loadingModal = document.createElement('loading-modal');
        
        document.body.appendChild(this.confirmationModal);
        document.body.appendChild(this.loadingModal);

        // รอให้ modal ถูกเพิ่มเข้าไปใน DOM
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">จัดการสินค้าและบริการ</h2>
                    <custom-button 
                        text="เพิ่มสินค้า/บริการ"
                        color="white"
                        bgColor="green-600"
                        hoverBg="green-500"
                        icon=""
                        id="add-product-btn"
                        class="w-auto">
                    </custom-button>
                </div>

                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">รูปภาพ</th>
                                <th class="p-3 text-left">ชื่อ</th>
                                <th class="p-3 text-left">ประเภท</th>
                                <th class="p-3 text-left">ราคา</th>
                                <th class="p-3 text-left">สถานะ</th>
                                <th class="p-3 text-left">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body">
                            <tr><td colspan="6" class="p-4 text-center">กำลังโหลด...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <confirmation-modal></confirmation-modal>
        `;
    }

    setupEventListeners() {
        this.querySelector('#add-product-btn').addEventListener('click', () => {
            window.location.href = '/mali-clear-clinic/pages/admin-product-form.html';
        });
    }

    async loadProducts() {
        try {
            this.loadingModal.show();
            const products = await ProductService.getAllProducts();
            this.products = products;
            this.renderProductsTable();
        } catch (error) {
            console.error('Error loading products:', error);
            toastManager.addToast('danger', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        } finally {
            this.loadingModal.hide();
        }
    }

    renderProductsTable() {
        const tableBody = this.querySelector('#products-table-body');
        tableBody.innerHTML = this.products.length > 0
            ? this.products.map(product => `
                <tr class="border-b border-gray-200 text-gray-700">
                    <td class="p-3">
                        <img src="/mali-clear-clinic/assets/images/${product.image}" 
                             alt="${product.name}" 
                             class="h-16 w-16 object-cover rounded-lg"
                             onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                    </td>
                    <td class="p-3">${product.name}</td>
                    <td class="p-3">${product.type === 'SERVICE' ? 'บริการ' : 'สินค้า'}</td>
                    <td class="p-3">${product.price.toLocaleString()} บาท</td>
                    <td class="p-3">
                        <button 
                            class="status-toggle-btn px-3 py-1 rounded-full text-sm font-semibold
                            ${product.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'}"
                            data-id="${product.id}"
                            data-status="${product.status}">
                            ${product.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </button>
                    </td>
                    <td class="p-3">
                        <button onclick="window.location.href='/mali-clear-clinic/pages/admin-product-form.html?id=${product.id}'" 
                                class="text-blue-600 hover:text-blue-900 mr-3">
                            แก้ไข
                        </button>
                        <button data-id="${product.id}" class="delete-btn text-red-600 hover:text-red-900">
                            ลบ
                        </button>
                    </td>
                </tr>
            `).join("")
            : "<tr><td colspan='6' class='p-4 text-center'>ไม่พบข้อมูลสินค้าและบริการ</td></tr>";

        // เพิ่ม event listeners สำหรับปุ่มเปลี่ยนสถานะ
        this.querySelectorAll('.status-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleStatus(btn));
        });

        // เพิ่ม event listeners สำหรับปุ่มลบ
        this.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteProduct(btn.dataset.id));
        });
    }

    openModal(product = null) {
        const modal = this.querySelector('#product-modal');
        const form = this.querySelector('#product-form');
        const modalTitle = this.querySelector('#modal-title');

        modalTitle.textContent = product ? 'แก้ไขสินค้า/บริการ' : 'เพิ่มสินค้า/บริการ';
        
        if (product) {
            this.querySelector('#product-id').value = product.id;
            this.querySelector('#name').value = product.name;
            this.querySelector('#type').value = product.type;
            this.querySelector('#price').value = product.price;
            this.querySelector('#status').value = product.status;
            this.querySelector('#description').value = product.description;
            
            if (product.image) {
                const preview = this.querySelector('#image-preview');
                preview.innerHTML = `<img src="/mali-clear-clinic/assets/images/${product.image}" class="h-32 object-cover rounded-lg">`;
            }
        } else {
            form.reset();
            this.querySelector('#product-id').value = '';
            this.querySelector('#image-preview').innerHTML = '';
        }

        modal.classList.remove('hidden');
    }

    closeModal() {
        this.querySelector('#product-modal').classList.add('hidden');
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', this.querySelector('#name').value);
            formData.append('type', this.querySelector('#type').value);
            formData.append('price', this.querySelector('#price').value);
            formData.append('status', this.querySelector('#status').value);
            formData.append('description', this.querySelector('#description').value);

            const imageFile = this.querySelector('#image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const productId = this.querySelector('#product-id').value;
            
            // TODO: เรียก API เพื่อบันทึกข้อมูล
            console.log('Saving product:', formData);

            toastManager.addToast(
                'success',
                'สำเร็จ',
                productId ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว'
            );

            this.closeModal();
            this.loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
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

    async editProduct(id) {
        try {
            // TODO: เรียก API เพื่อดึงข้อมูลสินค้า
            const product = {
                id: id,
                name: "ทรีทเมนต์หน้าใส",
                type: "SERVICE",
                price: 1500,
                status: "ACTIVE",
                description: "รายละเอียดบริการ",
                image: "treatment.jpg"
            };
            this.openModal(product);
        } catch (error) {
            console.error('Error loading product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        }
    }

    async deleteProduct(id) {
        const productToDelete = this.products.find(p => p.id === parseInt(id));
        if (!productToDelete) return;

        this.confirmationModal.open(
            'ยืนยันการลบ',
            `คุณต้องการลบ "${productToDelete.name}" ใช่หรือไม่?`,
            async () => {
                try {
                    this.loadingModal.show();
                    const result = await ProductService.deleteProduct(id);
                    if (result.status === 'success') {
                        toastManager.addToast('success', 'สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว');
                        await this.loadProducts();
                    } else {
                        throw new Error(result.message || 'เกิดข้อผิดพลาด');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    toastManager.addToast('error', 'ข้อผิดพลาด', error.message || 'ไม่สามารถลบข้อมูลได้');
                } finally {
                    this.loadingModal.hide();
                }
            }
        );
    }

    async toggleStatus(button) {
        const id = button.dataset.id;
        const currentStatus = button.dataset.status;
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        
        try {
            this.loadingModal.show();
            const result = await ProductService.updateStatus(id, newStatus);
            if (result.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'อัปเดตสถานะเรียบร้อยแล้ว');
                await this.loadProducts();
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตสถานะได้');
        } finally {
            this.loadingModal.hide();
        }
    }
}

customElements.define('admin-product', AdminProduct);