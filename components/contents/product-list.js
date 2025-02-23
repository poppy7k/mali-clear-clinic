import { ProductService } from '../../Services/ProductService.js';

class ProductServiceList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = "";
        this.selectedType = "all";
        this.products = [];
    }

    async connectedCallback() {
        this.renderFilters();  // ✅ โหลด Filters ก่อน ไม่ต้องรอ Product
        this.renderProductGrid();  // ✅ โหลด Product List แบบว่างเปล่าก่อน

        // ✅ โหลด Filters และ Products พร้อมกัน (แต่ไม่รอกัน)
        await Promise.all([
            this.setupCategoryObserver(), // ✅ โหลด Category List
            this.fetchProducts() // ✅ โหลด Products
        ]);
    }

    async fetchProducts() {
        try {
            this.setLoadingState();
            const allProducts = await ProductService.getAllProducts();
            
            // Debug: แสดง category_id ของแต่ละผลิตภัณฑ์
            allProducts.forEach(product => {
                console.log(`Product ID: ${product.id}, Category ID: ${product.category_id}`);
            });

            // กรองเฉพาะสินค้าที่มีสถานะ ACTIVE, หมวดหมู่ที่เลือก, และประเภทที่เลือก
            this.products = allProducts.filter(product => 
                product.status === 'ACTIVE' && 
                (this.selectedCategory === "" || product.category_id === this.selectedCategory) &&
                (this.selectedType === "all" || product.type === this.selectedType)
            );
            
            this.renderProductGrid();
        } catch (error) {
            console.error("Error fetching products:", error);
            this.setErrorState("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
    }

    async setLoadingState() {
        try {
            const response = await fetch('/mali-clear-clinic/assets/icons/loading.html');
            const loadingIcon = response.ok ? await response.text() : '<p>กำลังโหลด...</p>';
            
            this.querySelector("#productServiceList").innerHTML = `
                <div class="flex justify-center items-center">
                    ${loadingIcon}
                </div>
            `;
        } catch (error) {
            console.error('Error loading loading icon:', error);
            this.querySelector("#productServiceList").innerHTML = `<p class="text-gray-700 opacity-75">กำลังโหลดสินค้า...</p>`;
        }
    }  

    setErrorState(message) {
        this.querySelector("#productServiceList").innerHTML = `
            <p class="text-red-600 text-center">${message}</p>
        `;
    }

    renderFilters() {
        this.innerHTML = `
            <div class="container mx-auto py-2">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">สินค้าและบริการ</h2>
                <div class="flex gap-6">
                    <div class="w-1/4 bg-white rounded-lg shadow-md p-4">
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">ประเภท</h3>
                            <div class="flex flex-col space-y-2">
                                ${this.renderFilterButton("ทั้งหมด", "all", "grid")}
                                ${this.renderFilterButton("บริการ", "SERVICE", "clock")}
                                ${this.renderFilterButton("สินค้า", "PRODUCT", "shopping-bag")}
                            </div>
                        </div>
                        <div class="relative flex py-0 items-center">
                            <div class="flex-grow border-t border-gray-300"></div>
                            <div class="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div class="pt-4">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">หมวดหมู่</h3>
                            <category-list class="flex flex-col"></category-list>
                        </div>
                    </div>
                    <div class="w-3/4">
                        <div id="productServiceList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- ✅ Loading state จะแสดงที่นี่ -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderFilterButton(text, type, icon) {
        return `
            <custom-button 
                class="type-btn w-full"
                text="${text}"
                color="${this.selectedType === type ? 'yellow-700' : 'gray-700'}"
                bgColor="${this.selectedType === type ? 'yellow-100' : 'white'}"
                hoverBg="yellow-50"
                data-type="${type}"
                icon="${icon}"
                align="left">
            </custom-button>
        `;
    }

    renderProductGrid() {
        const productList = this.querySelector("#productServiceList");
        if (!this.products || this.products.length === 0) {
            productList.innerHTML = `<p class="text-gray-500 text-center py-8">ไม่พบสินค้าหรือบริการ</p>`;
            return;
        }

        productList.innerHTML = this.products.map(product => {
            const card = document.createElement("product-card");
            card.data = product;
            return card.outerHTML;
        }).join('');
    }

    setupEventListeners() {
        this.addTypeButtonListeners();
    }

    addTypeButtonListeners() {
        this.querySelectorAll('custom-button.type-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.selectedType = type;
                this.updateTypeButtonStyles();
                this.fetchProducts();
            });
        });
    }

    updateTypeButtonStyles() {
        this.querySelectorAll('custom-button.type-btn').forEach(button => {
            const type = button.getAttribute('data-type');
            if (type === this.selectedType) {
                button.setAttribute('color', 'yellow-700');
                button.setAttribute('bgColor', 'yellow-100');
            } else {
                button.setAttribute('color', 'gray-700');
                button.setAttribute('bgColor', 'white');
            }

            // ✅ บังคับให้ปุ่มอัปเดต
            const newButton = button.cloneNode(true);
            button.replaceWith(newButton);
        });

        // ✅ ผูกอีเวนต์ลิสเนอร์ใหม่หลังจากแทนที่ปุ่ม
        this.addTypeButtonListeners();
    }

    setupCategoryObserver() {
        const observer = new MutationObserver(() => {
            this.filterList = this.querySelector("category-list");
            if (this.filterList) {
                this.filterList.setCategorySelectedCallback((categoryId) => {
                    this.selectedCategory = categoryId;
                    this.fetchProducts();
                });
                observer.disconnect();
            }
        });
        observer.observe(this, { childList: true, subtree: true });
    }
}

customElements.define('product-list', ProductServiceList);
