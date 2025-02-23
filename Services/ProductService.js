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

    static async createProduct(formData) {
        try {
            const response = await fetch('/mali-clear-clinic/api/product/Product.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    static async updateProduct(id, formData) {
        try {
            // เพิ่ม method type เป็น POST และใส่ _method=PUT เพื่อจำลอง PUT request
            formData.append('_method', 'PUT');
            formData.append('id', id);

            const response = await fetch('/mali-clear-clinic/api/product/Product.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        try {
            const response = await fetch('/mali-clear-clinic/api/product/Product.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const response = await fetch('/mali-clear-clinic/api/product/Product.php', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id,
                    status
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product status');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating product status:', error);
            throw error;
        }
    }
}
