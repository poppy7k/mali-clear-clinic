export class CategoryService {
    static async getAllCategories() {
        try {
            const response = await fetch('/mali-clear-clinic/api/category/Category.php');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }
} 