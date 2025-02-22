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
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
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