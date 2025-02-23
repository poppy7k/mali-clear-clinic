import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";
import BookingService from '../../services/BookingService.js';
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
            
            await this.loadBookings();
            this.render();
        } catch (error) {
            this.showErrorMessage(handleError(error, 'AdminBooking'));
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
            const result = await BookingService.getBookings();
            this.bookings = result.bookings;
        } catch (error) {
            this.showErrorMessage(handleError(error, 'AdminBooking'));
        }
    }

    async handleDeleteBooking(bookingId) {
        if (!this.confirmationModal?.open) {
            console.error('Confirmation modal is not ready');
            return;
        }
    
        this.confirmationModal.open(
            'ยืนยันการลบ',
            'คุณต้องการลบการจองนี้ใช่หรือไม่?',
            async () => {
                try {
                    await BookingService.deleteBooking(bookingId);
                    await this.loadBookings();
                    this.render();
                    
                    toastManager.addToast('success', 'ลบการจองสำเร็จ', 'ข้อมูลถูกลบเรียบร้อยแล้ว');
                } catch (error) {
                    toastManager.addToast('error', 'เกิดข้อผิดพลาด', handleError(error, 'AdminBooking'));
                }
            }
        );
    }
    

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'error') {
        let messageElement = this.querySelector('.message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'message p-4 rounded-lg mb-4';
            this.insertAdjacentElement('afterbegin', messageElement);
        }

        const isSuccess = type === 'success';
        messageElement.className = `message p-4 rounded-lg mb-4 ${
            isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`;
        messageElement.textContent = message;
    }

    render() {
        if (!Array.isArray(this.bookings)) {
            this.innerHTML = '<div class="p-4">ไม่พบข้อมูลการจอง</div>';
            return;
        }

        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-bold mb-6">จัดการการจอง</h2>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้จอง</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บริการ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่จอง</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.bookings.map(booking => `
                                <tr>
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
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            class="text-red-600 hover:text-red-900 delete-btn"
                                            data-booking-id="${booking.id}"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.addDeleteButtonListeners();
    }

    addDeleteButtonListeners() {
        const deleteButtons = this.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.bookingId;
                this.handleDeleteBooking(bookingId);
            });
        });
    }

    disconnectedCallback() {
        if (this.confirmationModal?.isConnected) {
            document.body.removeChild(this.confirmationModal);
        }
    }
}

customElements.define("admin-booking", AdminBooking);
