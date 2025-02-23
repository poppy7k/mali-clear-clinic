export class PurchaseService {
    static async getAllPurchases() {
        try {
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php');
            if (!response.ok) {
                throw new Error('Failed to fetch purchases');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching purchases:', error);
            return [];
        }
    }

    static async getPurchaseById(id) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/purchase/Purchase.php?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch purchase');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : null;
        } catch (error) {
            console.error(`Error fetching purchase with ID ${id}:`, error);
            return null;
        }
    }

    static async getUserPurchases(userId, status = null) {
        try {
            let url = `/mali-clear-clinic/api/purchase/Purchase.php?user_id=${userId}`;
            if (status) {
                url += `&status=${status}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch user purchases');
            }
            const result = await response.json();
            return result.status === 'success' ? result.data : [];
        } catch (error) {
            console.error('Error fetching user purchases:', error);
            return [];
        }
    }    

    static async createPurchase(purchaseData) {
        try {
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create purchase');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    }

    static async updatePurchase(id, updateData) {
        try {
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    ...updateData
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update purchase');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating purchase:', error);
            throw error;
        }
    }

    static async deletePurchase(id) {
        try {
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete purchase');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting purchase:', error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const response = await fetch('/mali-clear-clinic/api/purchase/Purchase.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id,
                    status,
                    payment_status: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update purchase status');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating purchase status:', error);
            throw error;
        }
    }
} 