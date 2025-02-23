import { BlogService } from '../../Services/BlogService.js';

class ContentBlogs extends HTMLElement {
    constructor() {
        super();
        this.blogs = [];
    }

    async connectedCallback() {
        await this.loadBlogs();
    }

    async loadBlogs() {
        try {
            const response = await BlogService.getAllBlogs();
            this.blogs = response || []; // ✅ ดึงข้อมูลจาก response
            this.render();
        } catch (error) {
            this.setErrorState('เกิดข้อผิดพลาดในการโหลดบล็อก');
        }
    }

    setErrorState(message) {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ${message}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.blogs || this.blogs.length === 0) {
            this.innerHTML = `
                <div class="container mx-auto px-4 py-16">
                    <p class="text-center text-gray-500">ยังไม่มีบล็อกในขณะนี้</p>
                </div>
            `;
            return;
        }

        this.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${this.blogs.map(blog => `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105  transition-all duration-300 cursor-pointer"
                             onclick="this.closest('blog-list').viewBlogDetails(${blog.id})">
                            <div class="relative h-48">
                                <img src="/mali-clear-clinic/assets/images/${blog.image}" 
                                     alt="${blog.title}"
                                     class="w-full h-full object-cover"
                                     onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                            </div>
                            <div class="p-6">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${blog.title}</h3>
                                <p class="text-gray-600 line-clamp-2">${blog.excerpt}</p>
                            </div>
                            <div class="px-6 pb-4">
                                <div class="flex items-center text-blue-600">
                                    <span>ดูรายละเอียดเพิ่มเติม</span>
                                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    viewBlogDetails(id) {
        window.location.href = `/mali-clear-clinic/pages/blog-details.html?id=${id}`;
    }
}

customElements.define('blog-list', ContentBlogs);
