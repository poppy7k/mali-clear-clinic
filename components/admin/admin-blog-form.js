import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';
import { BlogService } from '../../Services/BlogService.js';

class AdminBlogForm extends HTMLElement {
    constructor() {
        super();
        this.blog = null;
        this.isEditing = false;
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const blogId = urlParams.get('id');
            
            if (blogId) {
                this.isEditing = true;
                await this.loadBlog(blogId);
            }

            this.render();
            this.setupEventListeners();

            // Set initial content for rich text editor if editing
            if (this.blog?.content) {
                this.querySelector('rich-text-editor').setContent(this.blog.content);
            }
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    async loadBlog(id) {
        try {
            this.blog = await BlogService.getBlogById(id);
        } catch (error) {
            console.error('Error loading blog:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบล็อกได้');
        }
    }

    render() {
        this.innerHTML = `
            <div class="max-w-4xl mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="text-2xl font-bold text-gray-800">
                            ${this.isEditing ? 'แก้ไขบล็อก' : 'สร้างบล็อกใหม่'}
                        </h1>
                    </div>

                    <form id="blog-form" class="space-y-4">
                        <input type="hidden" id="blog-id" value="${this.blog?.id || ''}">
                        
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">หัวข้อ *</label>
                                <form-input
                                    type="text"
                                    id="title"
                                    value="${this.blog?.title || ''}"
                                    required>
                                </form-input>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบายย่อ *</label>
                                <form-input
                                    type="textarea"
                                    id="excerpt"
                                    value="${this.blog?.excerpt || ''}"
                                    required>
                                </form-input>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">เนื้อหา *</label>
                                <rich-text-editor id="content"></rich-text-editor>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
                                <div class="mt-1 flex items-center space-x-4">
                                    <div id="image-preview" class="w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
                                        ${this.blog?.image ? 
                                            `<img src="/mali-clear-clinic/assets/images/${this.blog.image}" 
                                                  class="w-full h-full object-cover"
                                                  alt="Preview">` : 
                                            '<div class="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>'
                                        }
                                    </div>
                                    <div class="flex-1">
                                        <form-input
                                            type="file"
                                            id="image"
                                            accept="image/*">
                                        </form-input>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ *</label>
                                <select id="status" required class="w-full px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 transition-all duration-300 outline-none">
                                    <option value="draft" ${this.blog?.status === 'draft' ? 'selected' : ''}>แบบร่าง</option>
                                    <option value="published" ${this.blog?.status === 'published' ? 'selected' : ''}>เผยแพร่</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <custom-button 
                                text="ยกเลิก"
                                color="gray-700"
                                bgColor="gray-100"
                                hoverBg="gray-200"
                                type="button"
                                id="cancel-btn"
                                class="w-auto">
                            </custom-button>
                            <custom-button 
                                text="บันทึก"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-500"
                                type="submit"
                                class="w-auto">
                            </custom-button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#blog-form');
        const cancelBtn = this.querySelector('#cancel-btn');
        const imageInput = this.querySelector('#image');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        cancelBtn.addEventListener('click', () => this.navigateBack());
        imageInput.addEventListener('change', (e) => this.handleImagePreview(e));

        // Listen for rich text editor changes
        this.querySelector('rich-text-editor').addEventListener('editor-change', (e) => {
            console.log('Editor content changed:', e.detail.html);
        });
    }

    navigateBack() {
        window.location.href = '/mali-clear-clinic/pages/admin-blogs.html';
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = this.querySelector('#image-preview');
                preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover" alt="Preview">`;
            }
            reader.readAsDataURL(file);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const titleInput = this.querySelector('#title');
            const excerptInput = this.querySelector('#excerpt');

            const title = titleInput?.querySelector('input')?.value || titleInput?.value || "";
            const excerpt = excerptInput?.querySelector('textarea')?.value || excerptInput?.value || "";
            const content = this.querySelector('rich-text-editor').getContent();
            const status = this.querySelector('#status').value;

            if (!title || !excerpt || !content || !status) {
                throw new Error('Missing required fields');
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('excerpt', excerpt);
            formData.append('content', content);
            formData.append('status', status);

            const imageInput = this.querySelector('#image');
            if (imageInput && imageInput.files?.length > 0) {
                formData.append('image', imageInput.files[0]);
            }

            const blogId = this.querySelector('#blog-id').value;
            if (blogId) {
                formData.append('id', blogId);
                formData.append('_method', 'PUT');
            }

            // Debug: แสดงรายการทั้งหมดใน FormData
            console.log('FormData entries:', Array.from(formData.entries()));

            if (blogId) {
                await BlogService.updateBlog(blogId, formData);
            } else {
                await BlogService.createBlog(formData);
            }

            toastManager.addToast(
                'success',
                'สำเร็จ',
                this.isEditing ? 'แก้ไขบล็อกเรียบร้อยแล้ว' : 'สร้างบล็อกเรียบร้อยแล้ว'
            );

            this.navigateBack();
        } catch (error) {
            console.error('Error saving blog:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
        }
    }
}

customElements.define('admin-blog-form', AdminBlogForm); 