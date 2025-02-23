import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';
import { BlogService } from '../../Services/BlogService.js';

class AdminBlogManager extends HTMLElement {
    constructor() {
        super();
        this.blogs = [];
        this.confirmationModal = null;
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }

            await this.initializeConfirmationModal();
            this.render();
            this.setupEventListeners();
            await this.loadBlogs();
            this.confirmationModal = this.querySelector('confirmation-modal');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async initializeConfirmationModal() {
        return new Promise((resolve) => {
            this.confirmationModal = document.createElement('confirmation-modal');
            document.body.appendChild(this.confirmationModal);

            if (this.confirmationModal.isConnected) {
                resolve();
            } else {
                this.confirmationModal.addEventListener('connected', resolve, { once: true });
            }
        });
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">จัดการบล็อก</h2>
                    <custom-button 
                        text="เพิ่มบล็อกใหม่"
                        color="white"
                        bgColor="green-600"
                        hoverBg="green-500"
                        icon=""
                        id="add-blog-btn"
                        class="w-auto">
                    </custom-button>
                </div>

                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">รูปภาพ</th>
                                <th class="p-3 text-left">หัวข้อ</th>
                                <th class="p-3 text-left">วันที่สร้าง</th>
                                <th class="p-3 text-left">สถานะ</th>
                                <th class="p-3 text-left">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="blogs-table-body">
                            <tr><td colspan="5" class="p-4 text-center">กำลังโหลด...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <confirmation-modal></confirmation-modal>
        `;
    }

    setupEventListeners() {
        this.querySelector('#add-blog-btn').addEventListener('click', () => {
            window.location.href = '/mali-clear-clinic/pages/admin-blog-form.html';
        });
    }

    async loadBlogs() {
        try {
            this.blogs = await BlogService.getAllBlogs();
            this.renderBlogsTable();
        } catch (error) {
            console.error('Error loading blogs:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบล็อกได้');
        }
    }

    renderBlogsTable() {
        const tableBody = this.querySelector('#blogs-table-body');
        tableBody.innerHTML = this.blogs.length > 0
            ? this.blogs.map(blog => `
                <tr class="border-b border-gray-200 text-gray-700">
                    <td class="p-3">
                        <img src="/mali-clear-clinic/assets/images/${blog.image}" 
                             alt="${blog.title}" 
                             class="h-16 w-16 object-cover rounded-lg"
                             onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                    </td>
                    <td class="p-3">
                        <div class="font-medium">${blog.title}</div>
                        <div class="text-sm text-gray-500">${blog.excerpt}</div>
                    </td>
                    <td class="p-3">${new Date(blog.created_at).toLocaleDateString('th-TH')}</td>
                    <td class="p-3">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            blog.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }">
                            ${blog.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                        </span>
                    </td>
                    <td class="p-3">
                        <button onclick="window.location.href='/mali-clear-clinic/pages/admin-blog-form.html?id=${blog.id}'" 
                                class="text-blue-600 hover:text-blue-900 mr-3">
                            แก้ไข
                        </button>
                        <button data-id="${blog.id}" class="delete-btn text-red-600 hover:text-red-900">
                            ลบ
                        </button>
                    </td>
                </tr>
            `).join("")
            : "<tr><td colspan='5' class='p-4 text-center'>ไม่พบข้อมูลบล็อก</td></tr>";

        // เพิ่ม event listeners สำหรับปุ่มลบ
        this.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteBlog(btn.dataset.id));
        });
    }

    async deleteBlog(id) {
        const blogToDelete = this.blogs.find(b => b.id === parseInt(id));
        if (!blogToDelete) return;

        if (!this.confirmationModal?.open) {
            console.error('❌ Confirmation modal is not ready');
            return;
        }

        this.confirmationModal.open(
            'ยืนยันการลบ',
            `คุณต้องการลบบล็อก "${blogToDelete.title}" ใช่หรือไม่?`,
            async () => {
                try {
                    await BlogService.deleteBlog(id);
                    toastManager.addToast('success', 'สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว');
                    await this.loadBlogs();
                } catch (error) {
                    console.error('Error deleting blog:', error);
                    toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
                }
            }
        );
    }
}

customElements.define('admin-blog-manager', AdminBlogManager); 