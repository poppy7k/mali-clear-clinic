import { AppError, ErrorTypes, handleError } from '../../utils/ErrorHandler.js';

class Products extends HTMLElement {
    constructor() {
        super();
        this.products = [];
        this.activeTab = 'all'; // 'all', 'service', 'product'
    }

    async connectedCallback() {
        await this.loadProducts();
        this.render();
    }

    async loadProducts() {
        try {
            const response = await fetch('/mali-clear-clinic/api/product/Product.php');
            if (!response.ok) {
                throw new AppError('ไม่สามารถโหลดข้อมูลสินค้า', ErrorTypes.API_ERROR);
            }
            const data = await response.json();
            if (data.status === 'success') {
                this.products = data.data;
                this.render();
            } else {
                throw new AppError(data.message, ErrorTypes.API_ERROR);
            }
        } catch (error) {
            const errorMessage = handleError(error, 'Products');
            this.showErrorMessage(errorMessage);
        }
    }

    showErrorMessage(message) {
        const productList = this.querySelector('#productServiceList');
        if (productList) {
            productList.innerHTML = `
                <div class="col-span-full text-center text-gray-500">
                    ${message}
                </div>
            `;
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-center space-x-4 mb-8">
                    <button 
                        class="px-4 py-2 rounded ${this.activeTab === 'all' ? 'bg-yellow-400' : 'bg-gray-200'}"
                        onclick="this.closest('products-list').setActiveTab('all')">
                        ทั้งหมด
                    </button>
                    <button 
                        class="px-4 py-2 rounded ${this.activeTab === 'service' ? 'bg-yellow-400' : 'bg-gray-200'}"
                        onclick="this.closest('products-list').setActiveTab('service')">
                        บริการ
                    </button>
                    <button 
                        class="px-4 py-2 rounded ${this.activeTab === 'product' ? 'bg-yellow-400' : 'bg-gray-200'}"
                        onclick="this.closest('products-list').setActiveTab('product')">
                        สินค้า
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.renderProducts()}
                </div>
            </div>
        `;
    }

    renderProducts() {
        return this.getFilteredProducts()
            .map(product => `
                <product-card id="product-${product.id}"></product-card>
            `).join('');
    }

    getFilteredProducts() {
        if (this.activeTab === 'all') return this.products;
        return this.products.filter(p => 
            this.activeTab === 'service' ? p.type === 'SERVICE' : p.type === 'PRODUCT'
        );
    }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.render();
    }

    connectedCallback() {
        const cards = this.querySelectorAll('product-card');
        cards.forEach((card, index) => {
            card.data = this.getFilteredProducts()[index];
        });
    }
}

customElements.define('products-list', Products); 