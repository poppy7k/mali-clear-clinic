import { getUserSession } from '../../scripts/auth/userSession.js';
import { toastManager } from '../../scripts/utils/toast.js';

class PurchaseHistory extends HTMLElement {
    constructor() {
        super();
        this.purchases = [];
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user) {
                window.location.href = '/mali-clear-clinic/pages/login.html';
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
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">ประวัติการซื้อสินค้าทั้งหมด</h2>
                </div>

                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">วันที่</th>
                                <th class="p-3 text-left">รายการ</th>
                                <th class="p-3 text-left">จำนวน</th>
                                <th class="p-3 text-left">ราคารวม</th>
                                <th class="p-3 text-left">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="purchase-list">
                            <tr><td colspan="7" class="p-4 text-center">กำลังโหลด...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <confirmation-modal></confirmation-modal>
        `;
    }

    async loadPurchases() {
        try {
            // TODO: เรียก API เพื่อดึงข้อมูลประวัติการซื้อ
            this.purchases = [
                {
                    id: 1,
                    date: '2024-03-20',
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
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
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
            </tr>
        `).join('');
    }

    getStatusStyle(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'completed':
                return 'สำเร็จ';
            case 'pending':
                return 'รอดำเนินการ';
            case 'cancelled':
                return 'ยกเลิก';
            default:
                return 'ไม่ทราบสถานะ';
        }
    }

    getPaymentStatusStyle(status) {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getPaymentStatusText(status) {
        switch (status) {
            case 'paid':
                return 'ชำระเงินแล้ว';
            case 'pending':
                return 'รอชำระเงิน';
            case 'failed':
                return 'ชำระเงินไม่สำเร็จ';
            default:
                return 'ไม่ทราบสถานะ';
        }
    }

    getPaymentMethodText(method) {
        switch (method) {
            case 'credit_card':
                return 'บัตรเครดิต/เดบิต';
            case 'bank_transfer':
                return 'โอนเงินผ่านธนาคาร';
            case 'promptpay':
                return 'พร้อมเพย์';
            default:
                return 'ไม่ระบุ';
        }
    }
}

customElements.define('purchase-history', PurchaseHistory); 