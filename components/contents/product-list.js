class ProductServiceList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = ""; // เก็บค่าหมวดหมู่ที่เลือก
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="container mx-auto py-2">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Our Products and Services</h2>
                <div class="grid grid-cols-4">
                    <category-list></category-list>
                    <div id="productServiceList" class="grid col-span-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4"></div>
                </div>
            </div>
        `;

        // ใช้ MutationObserver เพื่อรอให้ category-list โหลดเสร็จ
        const observer = new MutationObserver(() => {
            this.filterList = this.querySelector("category-list");
            if (this.filterList) {
                console.log("filterList found, setting callback");
                this.filterList.setCategorySelectedCallback((categoryId) => {
                    console.log("Category selected in ProductServiceList:", categoryId);
                    this.selectedCategory = categoryId;
                    this.fetchProducts();
                });
                observer.disconnect(); // หยุดสังเกตเมื่อพบแล้ว
            }
        });
        observer.observe(this, { childList: true, subtree: true });

        await this.fetchProducts();  // ทำการดึงข้อมูลสินค้าครั้งแรก
    }

    async fetchProducts() {
        console.log("Fetching products for category ID:", this.selectedCategory);
        try {
            let url = "/mali-clear-clinic/api/Product.php";
            if (this.selectedCategory) {
                url += `?category_id=${this.selectedCategory}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.status === "success") {
                const products = result.data;
                this.renderProducts(products);
            } else {
                console.error("Error: Invalid response status", result);
                this.showNoProductsMessage();
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            this.showNoProductsMessage();
        }
    }

    showNoProductsMessage() {
        const productList = this.querySelector("#productServiceList");
        productList.innerHTML = `
            <div class="text-center text-gray-600 text-lg col-span-3">
                No products available at the moment.
            </div>
        `;
    }

    renderProducts(products) {
        const productList = this.querySelector("#productServiceList");
        productList.innerHTML = ""; 

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("bg-white", "p-6", "rounded-lg", "shadow-md");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded-md mb-4">
                <h3 class="text-xl font-semibold text-gray-700">${product.name}</h3>
                <p class="text-gray-600 mb-4">${product.description}</p>
                <button class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none" data-id="${product.id}">
                    Book Now
                </button>
            `;
            const bookButton = productCard.querySelector("button");
            bookButton.addEventListener("click", () => this.handleBookingClick(product));

            productList.appendChild(productCard);
        });

        if (products.length === 0) {
            this.showNoProductsMessage();
        }
    }

    handleBookingClick(product) {
        window.location.href = `/mali-clear-clinic/pages/booking.html?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}`;
    }
}

customElements.define("product-list", ProductServiceList);
