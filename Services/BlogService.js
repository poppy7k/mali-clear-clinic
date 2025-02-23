class BlogService {
    static async getAllBlogs() {
        try {
            const response = await fetch('/mali-clear-clinic/api/blog/Blog.php', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }

            const data = await response.json();
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch blogs');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            throw error;
        }
    }

    static async getBlogById(id) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/blog/Blog.php?id=${id}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch blog');
            }

            const data = await response.json();
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch blog');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            throw error;
        }
    }

    static async createBlog(blogData) {
        try {
            const response = await fetch('/mali-clear-clinic/api/blog/Blog.php', {
                method: 'POST',
                credentials: 'include',
                body: blogData
            });

            const data = await response.json();
            if (data.status === 'success') {
                return data;
            } else {
                throw new Error(data.message || 'Failed to create blog');
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    }

    static async updateBlog(id, blogData) {
        try {
            // Debug: แสดงรายการทั้งหมดใน FormData
            console.log('FormData entries before sending:', Array.from(blogData.entries()));

            const response = await fetch('/mali-clear-clinic/api/blog/Blog.php', {
                method: 'POST',
                credentials: 'include',
                body: blogData
            });

            const data = await response.json();
            if (data.status === 'success') {
                return data;
            } else {
                throw new Error(data.message || 'Failed to update blog');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    }

    static async deleteBlog(id) {
        try {
            const response = await fetch('/mali-clear-clinic/api/blog/Blog.php', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();
            if (data.status === 'success') {
                return data;
            } else {
                throw new Error(data.message || 'Failed to delete blog');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    }
}

export { BlogService };
