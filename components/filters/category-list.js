class CategoryList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = ""; // เก็บค่า category ที่เลือก
        this.selectedCategoryCallback = null; // เก็บ callback function
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="flex flex-col space-y-2">
                    <button class="category-btn text-left px-4 py-2 rounded transition-colors duration-200 hover:bg-yellow-50 bg-yellow-100 text-yellow-700 font-medium" data-id="">
                        ทั้งหมด
                    </button>
                </div>
            </div>
        `;
        await this.fetchCategories();
        this.addEventListeners();
    }

    async fetchCategories() {
        try {
            const response = await fetch("/mali-clear-clinic/api/category/Category.php");
            const data = await response.json();
            console.log("Fetched Categories:", data);

            if (data.status === "success") {
                const container = this.querySelector(".flex-col");
                data.categories.forEach(category => {
                    const button = document.createElement("button");
                    button.className = "category-btn text-left px-4 py-2 rounded transition-colors duration-200 hover:bg-yellow-50 text-gray-600";
                    button.textContent = category.name;
                    button.dataset.id = category.id;
                    container.appendChild(button);
                });
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    addEventListeners() {
        this.addEventListener("click", (event) => {
            if (event.target.classList.contains("category-btn")) {
                this.selectedCategory = event.target.dataset.id;
                console.log("Category selected:", this.selectedCategory);
                this.updateSelectedCategory();

                // ส่งค่าที่เลือกไปยัง callback function
                if (this.selectedCategoryCallback) {
                    this.selectedCategoryCallback(this.selectedCategory);
                }
            }
        });
    }

    updateSelectedCategory() {
        this.querySelectorAll(".category-btn").forEach(btn => {
            if (btn.dataset.id === this.selectedCategory) {
                btn.classList.remove('text-gray-600');
                btn.classList.add('bg-yellow-100', 'text-yellow-700', 'font-medium');
            } else {
                btn.classList.remove('bg-yellow-100', 'text-yellow-700', 'font-medium');
                btn.classList.add('text-gray-600');
            }
        });
    }

    // ฟังก์ชันสำหรับตั้งค่า callback
    setCategorySelectedCallback(callback) {
        this.selectedCategoryCallback = callback;
    }
}

customElements.define("category-list", CategoryList);
