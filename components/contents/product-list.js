class ProductServiceList extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `
            <div class="container mx-auto py-16">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Our Products and Services</h2>
                <div id="productServiceList" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"></div>
            </div>
        `;
        await this.fetchProducts();
    }

    async fetchProducts() {
        try {
            const response = await fetch('/mali-clear-clinic/api/Product.php');
            const result = await response.json();
    
            // ตรวจสอบว่า status เป็น 'success' หรือไม่
            if (result.status === 'success') {
                const products = result.data;  // ใช้ result.data แทน result
                this.renderProducts(products);
            } else {
                console.error('Error: Invalid response status', result);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }
    
    showNoProductsMessage() {
        const productList = this.querySelector('#productServiceList');
        productList.innerHTML = `
            <div class="text-center text-gray-600 text-lg col-span-3">
                No products available at the moment.
            </div>
        `;
    }

    renderProducts(products) {
        const productList = this.querySelector('#productServiceList');
        productList.innerHTML = ''; // Clear existing items

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded-md mb-4">
                <h3 class="text-xl font-semibold text-gray-700">${product.name}</h3>
                <p class="text-gray-600 mb-4">${product.description}</p>
                <button class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none" data-id="${product.id}">
                    Book Now
                </button>
            `;
            const bookButton = productCard.querySelector('button');
            bookButton.addEventListener('click', () => this.handleBookingClick(product));

            productList.appendChild(productCard);
        });
    }

    handleBookingClick(product) {
        // Redirect to the booking page with the product details
        window.location.href = `/mali-clear-clinic/pages/booking.html?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}`;
    }
}

customElements.define('product-list', ProductServiceList);