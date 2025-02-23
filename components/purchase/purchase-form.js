import { getUserSession } from '/mali-clear-clinic/scripts/auth/userSession.js';
import { toastManager } from '/mali-clear-clinic/scripts/utils/toast.js';


class PurchaseForm extends HTMLElement {
    constructor() {
        super();
        this.product = null;
        this.quantity = 1;
        this.productId = new URLSearchParams(window.location.search).get('product_id');
        this.user = null;
    }

    async connectedCallback() {
        this.user = await getUserSession();
        if (!this.user) {
            window.location.href = '/mali-clear-clinic/pages/login.html';
            return;
        }

        await this.loadProductDetails();
        this.render();
        this.setupEventListeners();
    }

    async loadProductDetails() {
        try {
            const response = await fetch(`/mali-clear-clinic/api/product/Product.php?product_id=${this.productId}`);
            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลสินค้าได้');
            }
            const result = await response.json();
            this.product = result.data; // ✅ แก้ไขให้ดึงข้อมูลจาก `result.data`
            console.log('Product loaded:', this.product);
        } catch (error) {
            console.error('Error loading product:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
        }
    }

    render() {
        if (!this.user) {
            return;
        }

        if (!this.product) {
            this.innerHTML = '<p class="text-center">ไม่พบข้อมูลสินค้า/บริการ</p>';
            return;
        }

        this.innerHTML = `
            <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">ซื้อสินค้า</h2>
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="flex gap-6">
                    <img src="/mali-clear-clinic/assets/images/upload/${this.product.image}" 
                        alt="${this.product.name}"
                        class="w-40 h-40 object-cover rounded"
                        onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/DD.jpg';"
                    >
                    
                    <div class="flex-1">
                        <h1 class="text-2xl font-semibold mb-2">${this.product.name}</h1>
                        <p class="text-gray-600 mb-2">ประเภท: ${this.product.category_name}</p>
                        <p class="text-gray-600 mb-4">${this.product.description}</p>
                        <div class="text-lg font-bold text-green-600 mb-4">
                            ฿${parseFloat(this.product.price).toLocaleString()}
                        </div>
                        
                        <div class="flex items-center gap-4 mb-6">
                            <span class="text-gray-700">จำนวน:</span>
                            <div class="flex items-center gap-2">
                                <button class="decrease-quantity px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">-</button>
                                <span class="quantity-display w-12 text-center">${this.quantity}</span>
                                <button class="increase-quantity px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">+</button>
                            </div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="text-lg font-bold total-price">
                                รวมทั้งหมด: ฿${(parseFloat(this.product.price) * this.quantity).toLocaleString()}
                            </div>
                            <button class="confirm-purchase px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                ยืนยันการสั่งซื้อ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.querySelector('.decrease-quantity')?.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                this.updateQuantityDisplay();
            }
        });

        this.querySelector('.increase-quantity')?.addEventListener('click', () => {
            this.quantity++;
            this.updateQuantityDisplay();
        });

        this.querySelector('.confirm-purchase')?.addEventListener('click', () => {
            this.handlePurchase();
        });
    }

    updateQuantityDisplay() {
        const quantityDisplay = this.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = this.quantity;
        }

        const totalPriceDisplay = this.querySelector('.total-price');
        if (totalPriceDisplay && this.product?.price) {
            const total = parseFloat(this.product.price) * this.quantity;
            totalPriceDisplay.textContent = `รวมทั้งหมด: ฿${total.toLocaleString()}`;
        }
    }

    async handlePurchase() {
        if (!this.user) {
            toastManager.addToast('error', 'ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
            return;
        }
    
        try {
            const purchaseData = {
                user_id: this.user.user_id,
                product_id: this.productId,
                quantity: this.quantity,
                total_price: parseFloat(this.product.price) * this.quantity
            };
    
            console.log('Sending purchase data:', purchaseData);
    
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData)
            });
    
            const result = await response.json();
            if (result.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'สั่งซื้อสำเร็จ! กำลังพาคุณไปยังหน้าบริการ...');
                setTimeout(() => {
                    window.location.href = '/mali-clear-clinic/pages/service.html';
                }, 2000);
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', result.message);
            }
        } catch (error) {
            console.error('Error during purchase:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
        }
    }

    createMessageElement(type) {
        const element = document.createElement('div');
        element.id = `${type}-message`;
        element.classList.add('text-center', 'p-4', 'rounded', 'mt-4');
        
        if (type === 'success') {
            element.classList.add('bg-green-100', 'text-green-700');
        } else {
            element.classList.add('bg-red-100', 'text-red-700');
        }

        this.querySelector('.max-w-2xl').appendChild(element);
        return element;
    }
}

customElements.define('purchase-form', PurchaseForm);
