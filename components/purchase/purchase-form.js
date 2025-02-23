import { getUserSession } from '/mali-clear-clinic/scripts/auth/userSession.js';

class PurchaseForm extends HTMLElement {
    constructor() {
        super();
        this.product = null;
        this.quantity = 1;
        this.productId = new URLSearchParams(window.location.search).get('product_id');
        this.user = null;
    }

    async connectedCallback() {
        const user = await getUserSession();
        if (!user) {
            window.location.href = '/mali-clear-clinic/pages/login.html';
            return;
        }
        this.user = user;
        await this.loadProductDetails();
        this.render();
        this.setupEventListeners();
    }

    getProductDetailsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('product_id');
        
        if (!this.productId) {
            alert('ไม่พบข้อมูลสินค้า');
            window.location.href = '/mali-clear-clinic/pages/service.html';
            return;
        }
    }

    async loadProductDetails() {
        try {
            const response = await fetch(`/mali-clear-clinic/api/product/Product.php?product_id=${this.productId}`);
            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลสินค้าได้');
            }
            this.product = await response.json();
            console.log(this.product);
        } catch (error) {
            console.error('Error loading product:', error);
            this.showErrorMessage('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง');
        }
    }

    render() {
        if (!this.user) {
            return;
        }

        if (!this.product || !this.product.data) {
            this.innerHTML = '<p class="text-center">ไม่พบข้อมูลสินค้า/บริการ</p>';
            return;
        }

        const productData = this.product.data;
        
        this.innerHTML = `
            <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">ซื้อสินค้า</h2>
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="flex gap-6">
                    <img src="/mali-clear-clinic/assets/images/upload/${productData.image}" 
                        alt="${productData.name}"
                        class="w-40 h-40 object-cover rounded"
                        onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';"
                    >
                    
                    <div class="flex-1">
                        <h1 class="text-2xl font-semibold mb-2">${productData.name}</h1>
                        <p class="text-gray-600 mb-2">ประเภท: ${productData.category_name}</p>
                        <p class="text-gray-600 mb-4">${productData.description}</p>
                        <div class="text-lg font-bold text-green-600 mb-4">
                            ฿${parseFloat(productData.price).toLocaleString()}
                        </div>
                        
                        <div class="flex items-center gap-4 mb-6">
                            <span class="text-gray-700">จำนวน:</span>
                            <div class="flex items-center gap-2">
                                <custom-button 
                                    class="decrease-quantity"
                                    text="-"
                                    color="gray-700"
                                    bgColor="gray-100"
                                    hoverBg="gray-200">
                                </custom-button>
                                <span class="quantity-display w-12 text-center">${this.quantity}</span>
                                <custom-button 
                                    class="increase-quantity"
                                    text="+"
                                    color="gray-700"
                                    bgColor="gray-100"
                                    hoverBg="gray-200">
                                </custom-button>
                            </div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="text-lg font-bold total-price">
                                รวมทั้งหมด: ฿${(parseFloat(productData.price) * this.quantity).toLocaleString()}
                            </div>
                            <custom-button 
                                class="confirm-purchase"
                                text="ยืนยันการสั่งซื้อ"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-700"
                                icon="cart">
                            </custom-button>
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
        if (totalPriceDisplay && this.product?.data?.price) {
            const total = parseFloat(this.product.data.price) * this.quantity;
            totalPriceDisplay.textContent = `รวมทั้งหมด: ฿${total.toLocaleString()}`;
        }
    }

    async handlePurchase() {
        if (!this.user) {
            alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
            return;
        }

        try {
            const purchaseData = {
                userId: this.userId,
                productId: this.productId,
                quantity: this.quantity,
                totalPrice: this.product.price * this.quantity
            };

            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });

            if (!response.ok) {
                throw new Error('การสั่งซื้อไม่สำเร็จ');
            }

            const result = await response.json();
            if (result.status === 'success') {
                this.showSuccessMessage();
                setTimeout(() => {
                    window.location.href = '/mali-clear-clinic/pages/service.html';
                }, 2000);
            } else {
                this.showErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Error during purchase:', error);
            this.showErrorMessage('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
        }
    }

    showSuccessMessage() {
        const messageElement = this.querySelector('#success-message') || this.createMessageElement('success');
        messageElement.textContent = 'สั่งซื้อสำเร็จ! กำลังพาคุณไปยังหน้าบริการ...';
        messageElement.classList.remove('hidden');
    }

    showErrorMessage(message) {
        const messageElement = this.querySelector('#error-message') || this.createMessageElement('error');
        messageElement.textContent = message;
        messageElement.classList.remove('hidden');
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