import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';

class AdminPurchaseHistory extends HTMLElement {
    constructor() {
        super();
        this.purchases = [];
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }

            this.render();
            await this.loadPurchases();
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    render() {
        this.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-6">ประวัติการซื้อสินค้าทั้งหมด</h1>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันที่
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ลูกค้า
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        รายการ
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        จำนวน
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ราคารวม
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        การชำระเงิน
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="purchase-list" class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async loadPurchases() {
        try {
            // TODO: เรียก API เพื่อดึงข้อมูลประวัติการซื้อทั้งหมด
            this.purchases = [
                {
                    id: 1,
                    date: '2024-03-20',
                    customer: {
                        name: 'คุณสมศรี ใจดี',
                        email: 'somsri@example.com'
                    },
                    items: [
                        {
                            name: 'ครีมบำรุงผิว',
                            quantity: 2,
                            price: 590
                        }
                    ],
                    totalQuantity: 2,
                    totalAmount: 1180,
                    status: 'completed',
                    paymentStatus: 'paid',
                    paymentMethod: 'credit_card'
                }
            ];

            this.renderPurchases();
        } catch (error) {
            console.error('Error loading purchases:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลประวัติการซื้อได้');
        }
    }

    renderPurchases() {
        const purchaseList = this.querySelector('#purchase-list');
        
        if (this.purchases.length === 0) {
            purchaseList.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        ไม่พบประวัติการซื้อสินค้า
                    </td>
                </tr>
            `;
            return;
        }

        purchaseList.innerHTML = this.purchases.map(purchase => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(purchase.date).toLocaleDateString('th-TH')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${purchase.customer.name}</div>
                    <div class="text-gray-500 text-xs">${purchase.customer.email}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="space-y-1">
                        ${purchase.items.map(item => `
                            <div>
                                ${item.name} x ${item.quantity}
                                <span class="text-gray-500">
                                    (${item.price.toLocaleString()} บาท/ชิ้น)
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${purchase.totalQuantity} ชิ้น
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${purchase.totalAmount.toLocaleString()} บาท
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getStatusStyle(purchase.status)}">
                        ${this.getStatusText(purchase.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getPaymentStatusStyle(purchase.paymentStatus)}">
                        ${this.getPaymentStatusText(purchase.paymentStatus)}
                    </span>
                    <div class="text-xs text-gray-500 mt-1">
                        ${this.getPaymentMethodText(purchase.paymentMethod)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ... helper methods เหมือนกับ purchase-history component ...
}

customElements.define('admin-purchase-history', AdminPurchaseHistory); 