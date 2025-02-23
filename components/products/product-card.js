import { getUserSession } from '../../scripts/auth/userSession.js';

class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.product = null;
    }

    set data(product) {
        if (!product) {
            console.error("❌ Product data is null or undefined.");
            return;
        }
        this.product = product;
        this.render();
    }

    render() {
        if (!this.product) {
            this.innerHTML = `<p class="text-red-500 text-center">⚠️ ไม่พบข้อมูลสินค้า</p>`;
            return;
        }

        this.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden relative z-10">
                <div class="absolute top-3 right-2.5 z-0">
                    <span class="px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 border-1 ${
                        this.product.type === 'SERVICE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }">
                        ${this.product.type === 'SERVICE' ? 'บริการ' : 'สินค้า'}
                    </span>
                </div>
                
                <img src="/mali-clear-clinic/assets/images/${this.product.image || 'default-image.jpg'}" 
                     alt="${this.product.name}" 
                     class="w-full h-64 object-cover"
                     onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">

                <div class="p-4">
                    <h3 class="text-xl font-semibold mb-2">${this.product.name}</h3>
                    <p class="text-gray-600 max-w-96 truncate mb-4">${this.product.description}</p>
                    <div class="flex justify-between items-center gap-10">
                        <span class="text-lg font-bold text-green-600">฿${this.product.price}</span>
                        ${this.renderActionButton()}
                    </div>
                </div>
            </div>
        `;
    }

    renderActionButton() {
        if (!this.product) return '';

        if (this.product.type === 'SERVICE') {
            return `
                <custom-button 
                    text="จองบริการ"
                    color="white"
                    bgColor="green-600"
                    hoverBg="green-500"
                    type="button"
                    hoverText="white"
                    class="w-full text-sm"
                    icon="calendar"
                    href="/mali-clear-clinic/pages/booking.html?product_id=${this.product.id}&product_name=${this.product.name}">
                </custom-button>
            `;
        } else {
            return `    
                <custom-button 
                    text="สั่งซื้อ"
                    color="white"
                    bgColor="blue-600"
                    hoverBg="blue-500"
                    type="button"
                    hoverText="white"
                    class="w-full text-sm"
                    icon="cart"
                    href="/mali-clear-clinic/pages/purchase.html?product_id=${this.product.id}">
                </custom-button>
            `;
        }
    }
}

customElements.define('product-card', ProductCard);
