class PurchaseForm extends HTMLElement {
    constructor() {
        super();
        this.product = null;
        this.quantity = 1;
    }

    async connectedCallback() {
        await this.loadProductDetails();
        this.render();
        this.setupEventListeners();
    }

    async loadProductDetails() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const productType = params.get('type');

        try {
            const response = await fetch(`/mali-clear-clinic/api/products/${productId}`);
            this.product = await response.json();
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    render() {
        if (!this.product) {
            this.innerHTML = '<p class="text-center">ไม่พบข้อมูลสินค้า/บริการ</p>';
            return;
        }

        this.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="flex gap-6">
                    <img src="/mali-clear-clinic/assets/images/${this.product.image}" 
                         alt="${this.product.name}"
                         class="w-40 h-40 object-cover rounded">
                    
                    <div class="flex-1">
                        <h1 class="text-2xl font-semibold mb-2">${this.product.name}</h1>
                        <p class="text-gray-600 mb-4">${this.product.description}</p>
                        <div class="text-lg font-bold text-green-600 mb-4">
                            ฿${this.product.price}
                        </div>
                        
                        <div class="flex items-center gap-4 mb-6">
                            <span class="text-gray-700">จำนวน:</span>
                            <div class="flex items-center gap-2">
                                <button class="decrease-quantity px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">-</button>
                                <span class="quantity-display w-12 text-center">${this.quantity}</span>
                                <button class="increase-quantity px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">+</button>
                            </div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="text-lg font-bold">
                                รวมทั้งหมด: ฿${this.product.price * this.quantity}
                            </div>
                            <button class="confirm-purchase bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
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
                this.render();
            }
        });

        this.querySelector('.increase-quantity')?.addEventListener('click', () => {
            this.quantity++;
            this.render();
        });

        this.querySelector('.confirm-purchase')?.addEventListener('click', () => {
            this.handlePurchase();
        });
    }

    async handlePurchase() {
        try {
            // TODO: Implement purchase logic
            alert('ขอบคุณสำหรับการสั่งซื้อ');
            window.location.href = '/mali-clear-clinic/pages/service.html';
        } catch (error) {
            console.error('Error during purchase:', error);
            alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
        }
    }
}

customElements.define('purchase-form', PurchaseForm); 