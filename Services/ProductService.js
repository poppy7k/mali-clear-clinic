export class ProductService {
    static async getAllProducts() {
        try {
            const response = await fetch('/mali-clear-clinic/api/product/Product.php');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    static async getProductsByType(type) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/product/Product.php?type=${type}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products by type');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error(`Error fetching products of type ${type}:`, error);
            return [];
        }
    }

    static async getProductById(product_id) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/product/Product.php?product_id=${product_id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : null;
        } catch (error) {
            console.error(`Error fetching product with ID ${product_id}:`, error);
            return null;
        }
    }    
}
