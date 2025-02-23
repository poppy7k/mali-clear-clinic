class PurchaseList extends HTMLElement {
    constructor() {
        super();
        this.selectedStatus = '';
        this.loadingModal = null;
    }

    async connectedCallback() {
        await this.initializeComponents();
        await this.fetchPurchases();
    }

    async initializeComponents() {
        // สร้าง loading modal
        this.loadingModal = document.createElement('loading-modal');
        document.body.appendChild(this.loadingModal);
        
        // รอให้ modal ถูกเพิ่มเข้าไปใน DOM
        await new Promise(resolve => setTimeout(resolve, 0));

        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex gap-2">
                            <button class="status-filter px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700" data-status="">
                                ทั้งหมด
                            </button>
                            <button class="status-filter px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700" data-status="PENDING">
                                รอชำระเงิน
                            </button>
                            <button class="status-filter px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700" data-status="PAID">
                                ชำระเงินแล้ว
                            </button>
                            <button class="status-filter px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700" data-status="CANCELLED">
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>

                <div id="purchase-list" class="space-y-4">
                    <!-- รายการประวัติการซื้อจะถูกเพิ่มที่นี่ -->
                </div>
            </div>
        `;
    }

    async fetchPurchases() {
        try {
            this.loadingModal.show();
            const response = await fetch(`/mali-clear-clinic/api/purchases/list.php?status=${this.selectedStatus}`);
            const data = await response.json();

            if (data.status === 'success') {
                this.renderPurchases(data.data);
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            this.loadingModal.hide();
        }
    }

    renderPurchases(purchases) {
        const purchaseList = this.querySelector('#purchase-list');
        
        if (!purchases || purchases.length === 0) {
            purchaseList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    ไม่พบประวัติการซื้อ
                </div>
            `;
            return;
        }

        purchaseList.innerHTML = purchases.map(purchase => `
            <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">${purchase.product_name}</h3>
                        <p class="text-gray-600">ลูกค้า: ${purchase.first_name} ${purchase.last_name}</p>
                        <p class="text-gray-600">อีเมล: ${purchase.email}</p>
                        <p class="text-gray-600">เบอร์โทร: ${purchase.phone}</p>
                        <p class="text-gray-600">จำนวน: ${purchase.quantity} ชิ้น</p>
                        <p class="text-gray-600">ราคารวม: ${purchase.total_price} บาท</p>
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusStyle(purchase.status)}">
                            ${this.getStatusText(purchase.status)}
                        </span>
                        <p class="text-sm text-gray-500 mt-1">${this.formatDate(purchase.created_at)}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">วิธีชำระเงิน: ${this.getPaymentMethodText(purchase.payment_method)}</p>
                        <p class="text-sm text-gray-600">สถานะการชำระ: ${this.getPaymentStatusText(purchase.payment_status)}</p>
                        ${purchase.note ? `<p class="text-sm text-gray-600">หมายเหตุ: ${purchase.note}</p>` : ''}
                    </div>
                    ${purchase.status === 'PENDING' ? `
                        <div class="flex gap-2">
                            <button onclick="this.closest('purchase-list').confirmPayment(${purchase.id})" 
                                    class="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                                ยืนยันการชำระเงิน
                            </button>
                            <button onclick="this.closest('purchase-list').cancelPurchase(${purchase.id})" 
                                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                                ยกเลิก
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getStatusStyle(status) {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'PENDING': return 'รอชำระเงิน';
            case 'PAID': return 'ชำระเงินแล้ว';
            case 'CANCELLED': return 'ยกเลิก';
            default: return status;
        }
    }

    getPaymentMethodText(method) {
        switch (method) {
            case 'CASH': return 'เงินสด';
            case 'CREDIT_CARD': return 'บัตรเครดิต';
            case 'TRANSFER': return 'โอนเงิน';
            default: return 'ไม่ระบุ';
        }
    }

    getPaymentStatusText(status) {
        switch (status) {
            case 'PENDING': return 'รอชำระเงิน';
            case 'COMPLETED': return 'ชำระเงินแล้ว';
            case 'FAILED': return 'ชำระเงินไม่สำเร็จ';
            default: return status;
        }
    }

    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    }

    setupEventListeners() {
        this.querySelectorAll('.status-filter').forEach(button => {
            button.addEventListener('click', async () => {
                this.selectedStatus = button.dataset.status;
                
                // Update button styles
                this.querySelectorAll('.status-filter').forEach(btn => {
                    btn.classList.remove('bg-yellow-100', 'text-yellow-700');
                    btn.classList.add('bg-white', 'text-gray-700');
                });
                button.classList.remove('bg-white', 'text-gray-700');
                button.classList.add('bg-yellow-100', 'text-yellow-700');
                
                await this.fetchPurchases();
            });
        });
    }

    async confirmPayment(purchaseId) {
        try {
            if (!confirm('ยืนยันการชำระเงินรายการนี้?')) {
                return;
            }

            this.loadingModal.show();
            const response = await fetch(`/mali-clear-clinic/api/purchases/confirm_payment.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purchase_id: purchaseId })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'ยืนยันการชำระเงินสำเร็จ');
                await this.fetchPurchases();
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถยืนยันการชำระเงินได้');
        } finally {
            this.loadingModal.hide();
        }
    }

    async cancelPurchase(purchaseId) {
        try {
            if (!confirm('ยืนยันการยกเลิกรายการนี้?')) {
                return;
            }

            this.loadingModal.show();
            const response = await fetch(`/mali-clear-clinic/api/purchases/cancel_purchase.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purchase_id: purchaseId })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'ยกเลิกรายการสำเร็จ');
                await this.fetchPurchases();
            } else {
                toastManager.addToast('error', 'ข้อผิดพลาด', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่สามารถยกเลิกรายการได้');
        } finally {
            this.loadingModal.hide();
        }
    }
}

customElements.define('purchase-list', PurchaseList);  