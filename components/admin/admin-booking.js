import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";
import BookingService from '../../Services/BookingService.js';
import { handleError } from '../../utils/ErrorHandler.js';
import { toastManager } from '../../scripts/utils/toast.js';

class AdminBooking extends HTMLElement {
    constructor() {
        super();
        this.bookings = [];
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = "/mali-clear-clinic/index.html";
                return;
            }

            await this.initializeConfirmationModal();
            await this.updateBookingsAndRender();
        } catch (error) {
            this.setErrorState(handleError(error, 'AdminBooking'));
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

    async loadBookings() {
        try {
            this.setLoadingState();
            const result = await BookingService.getBookings();
            this.bookings = result.bookings;
        } catch (error) {
            this.setErrorState(handleError(error, 'AdminBooking'));
        }
    }

    async updateBookingsAndRender() {
        await this.loadBookings();
        this.render();
    }

    async handleDeleteBooking(bookingId) {
        if (!bookingId) {
            console.error("❌ bookingId is undefined");
            return;
        }

        if (!this.confirmationModal?.open) {
            console.error('❌ Confirmation modal is not ready');
            return;
        }

        this.confirmationModal.open(
            'ยืนยันการลบ',
            'คุณต้องการลบการจองนี้ใช่หรือไม่?',
            async () => {
                try {
                    await BookingService.deleteBooking(bookingId);
                    await this.updateBookingsAndRender();
                    
                    toastManager.addToast('success', 'ลบการจองสำเร็จ', 'ข้อมูลถูกลบเรียบร้อยแล้ว');
                } catch (error) {
                    toastManager.addToast('error', 'เกิดข้อผิดพลาด', handleError(error, 'AdminBooking'));
                }
            }
        );
    }

    async setLoadingState() {
        try {
            const response = await fetch('/mali-clear-clinic/assets/icons/loading.html');
            const loadingIcon = response.ok ? await response.text() : '<p>กำลังโหลด...</p>';
            
            this.innerHTML = `
                <div class="container mx-auto py-8 text-center">
                    <h2 class="text-2xl font-bold text-gray-800 mb-8">จัดการการจอง</h2>
                    <div class="flex justify-center items-center">
                        ${loadingIcon}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading loading icon:', error);
            this.innerHTML = `
                <div class="container mx-auto py-8 text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8">Promotions</h2>
                    <p class="text-gray-700 opacity-75">กำลังโหลดโปรโมชั่น...</p>
                </div>
            `;
        }
    }  

    setErrorState(message) {
        this.innerHTML = `
            <div class="container mx-auto py-8 text-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">จัดการการจอง</h2>
                <p class="text-red-600">${message}</p>
            </div>
        `;
    }

    render() {
        if (!Array.isArray(this.bookings) || this.bookings.length === 0) {
            this.setErrorState("ไม่มีข้อมูลการจอง");
            return;
        }
        this.renderTable();
        this.addDeleteButtonListeners();
    }

    renderTableHeader() {
        return `
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้จอง</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บริการ</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่จอง</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
            </thead>
        `;
    }

    renderTableRows() {
        return this.bookings.map(booking => `
            <tr data-booking-id="${booking.id}">
                <td class="px-6 py-4 whitespace-nowrap">${booking.username}</td>
                <td class="px-6 py-4 whitespace-nowrap">${booking.product_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(booking.booking_date).toLocaleDateString('th-TH')}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                    }">
                        ${booking.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button class="text-red-600 hover:text-red-900 delete-btn">
                        ลบ
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderTable() {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-bold mb-6">จัดการการจอง</h2>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full">
                        ${this.renderTableHeader()}
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    addDeleteButtonListeners() {
        this.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;

                const bookingId = row.dataset.bookingId;
                this.handleDeleteBooking(bookingId);
            });
        });
    }
}

customElements.define("admin-booking", AdminBooking);