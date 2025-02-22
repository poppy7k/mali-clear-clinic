class ProductCard extends HTMLElement {
    constructor() {
        super();
    }

    set data(product) {
        this.product = product;
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden relative">
                <div class="absolute top-3 right-2.5 z-10">
                    <span class="px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 ${
                        this.product.type === 'SERVICE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }">
                        ${this.product.type === 'SERVICE' 
                            ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                                <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
                               </svg>`
                            : `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7h-3V6c0-1.654-1.346-3-3-3h-2C9.346 3 8 4.346 8 6v1H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm-9-1c0-.551.449-1 1-1h2c.551 0 1 .449 1 1v1h-4V6zm9 11H5V9h14v8z"/>
                               </svg>`
                        }
                        ${this.product.type === 'SERVICE' ? 'บริการ' : 'สินค้า'}
                    </span>
                </div>
                
                <img src="/mali-clear-clinic/assets/images/${this.product.image}" 
                     alt="${this.product.name}" 
                     class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-semibold mb-2">${this.product.name}</h3>
                    <p class="text-gray-600 mb-4">${this.product.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-green-600">฿${this.product.price}</span>
                        ${this.renderActionButton()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderActionButton() {
        if (this.product.type === 'SERVICE') {
            return `
                <custom-button 
                    id="bookButton"
                    text="จองบริการ"
                    bg="green-500"
                    hoverBg="green-600"
                    color="white">
                </custom-button>
            `;
        } else {
            return `
                <custom-button 
                    id="buyButton"
                    text="หยิบใส่ตะกร้า"
                    bg="blue-500"
                    hoverBg="blue-600"
                    color="white">
                </custom-button>
            `;
        }
    }

    setupEventListeners() {
        const bookButton = this.querySelector('#bookButton');
        const buyButton = this.querySelector('#buyButton');

        if (bookButton) {
            bookButton.addEventListener('click', () => this.handleBooking());
        }

        if (buyButton) {
            buyButton.addEventListener('click', () => this.handleAddToCart());
        }
    }

    async handleBooking() {
        const user = await getUserSession();
        if (!user) {
            window.location.href = '/mali-clear-clinic/pages/login.html';
            return;
        }
        window.location.href = `/mali-clear-clinic/pages/booking.html?service=${this.product.id}`;
    }

    async handleAddToCart() {
        const user = await getUserSession();
        if (!user) {
            window.location.href = '/mali-clear-clinic/pages/login.html';
            return;
        }

        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === this.product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: this.product.id,
                    name: this.product.name,
                    price: this.product.price,
                    image: this.product.image,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert('เพิ่มสินค้าลงตะกร้าแล้ว');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
        }
    }
}

customElements.define('product-card', ProductCard); 