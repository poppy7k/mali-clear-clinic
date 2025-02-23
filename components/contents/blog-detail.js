import { BlogService } from '../../Services/BlogService.js';

class BlogDetail extends HTMLElement {
    constructor() {
        super();
        this.blog = null; // จะเก็บข้อมูลบล็อกที่ดึงมา
    }

    async connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        const blogId = params.get('id');  // ดึง 'id' จาก URL query string

        if (!blogId) {
            this.innerHTML = `<p>ไม่พบบล็อกที่คุณต้องการดู</p>`;
            return;
        }

        try {
            const response = await BlogService.getBlogById(blogId);
            this.blog = response;

            this.render(); // เรียก render เพื่อแสดงข้อมูลบล็อก
        } catch (error) {
            this.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดรายละเอียดบล็อก</p>`;
        }
    }

    render() {
        if (this.blog) {
            this.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden container mx-auto px-4 py-8 my-20 ">
                    <div class="relative">
                        <img src="/mali-clear-clinic/assets/images/${this.blog.image}" 
                             alt="${this.blog.title}" 
                             class="w-1/2 h-1/2 object-cover mx-auto"
                             onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                    </div>
                    <div class="p-6">
                        <h1 class="text-3xl font-semibold text-gray-800 mb-4">${this.blog.title}</h1>
                        <p class="text-gray-600 mb-4">${this.blog.content}</p>
                    </div>
                </div>
            `;
        }
    }
}

customElements.define('blog-detail', BlogDetail);
