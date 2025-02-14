class CategoryList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = ""; // เก็บค่า category ที่เลือก
        this.selectedCategoryCallback = null; // เก็บ callback function
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="flex flex-wrap gap-2 p-4">
                <button class="category-btn bg-blue-500 text-white px-4 py-2 rounded-lg" data-id="">All</button>
            </div>
        `;
        await this.fetchCategories();
        this.addEventListeners();
    }

    async fetchCategories() {
        try {
            const response = await fetch("/mali-clear-clinic/api/Category.php");
            const data = await response.json();
            console.log("Fetched Categories:", data);

            if (data.status === "success") {
                const container = this.querySelector("div");
                data.categories.forEach(category => {
                    const button = document.createElement("button");
                    button.className = "category-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300";
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
                btn.classList.add("bg-blue-500", "text-white");
                btn.classList.remove("bg-gray-200", "text-gray-700");
            } else {
                btn.classList.add("bg-gray-200", "text-gray-700");
                btn.classList.remove("bg-blue-500", "text-white");
            }
        });
    }

    // ฟังก์ชันสำหรับตั้งค่า callback
    setCategorySelectedCallback(callback) {
        this.selectedCategoryCallback = callback;
    }
}

customElements.define("category-list", CategoryList);
