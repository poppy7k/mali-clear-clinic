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

            this.initializeStatusModal();
            await this.updateBookingsAndRender();
        } catch (error) {
            toastManager.addToast('error', 'ข้อผิดพลาด', handleError(error, 'AdminBooking'));
        }
    }

    initializeStatusModal() {
        this.statusModal = document.createElement('div');
        this.statusModal.className = 'fixed inset-0 bg-gray-600/50 z-50 flex items-center justify-center hidden';
        this.statusModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl">
                <h3 class="text-lg font-semibold mb-4">เปลี่ยนสถานะการจอง</h3>
                <div class="space-y-3">
                    <button class="status-option w-full py-2 px-4 rounded hover:bg-gray-100 text-left" data-status="Pending">
                        <span class="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                        รอดำเนินการ
                    </button>
                    <button class="status-option w-full py-2 px-4 rounded hover:bg-gray-100 text-left" data-status="Confirmed">
                        <span class="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                        ยืนยันแล้ว
                    </button>
                    <button class="status-option w-full py-2 px-4 rounded hover:bg-gray-100 text-left" data-status="Cancelled">
                        <span class="inline-block w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                        ยกเลิก
                    </button>
                </div>
                <div class="mt-4 flex justify-end">
                    <button class="cancel-btn px-4 py-2 text-gray-600 hover:text-gray-800">ยกเลิก</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.statusModal);

        // Event listeners for modal
        this.statusModal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.hideStatusModal();
        });

        this.statusModal.addEventListener('click', (e) => {
            if (e.target === this.statusModal) {
                this.hideStatusModal();
            }
        });

        // Event listeners for status options
        this.statusModal.querySelectorAll('.status-option').forEach(button => {
            button.addEventListener('click', async (e) => {
                const newStatus = e.target.closest('.status-option').dataset.status;
                await this.updateBookingStatus(this.currentBookingId, newStatus);
                this.hideStatusModal();
            });
        });
    }

    showStatusModal(bookingId, currentStatus) {
        this.currentBookingId = bookingId;
        this.statusModal.classList.remove('hidden');
        
        // Highlight current status
        this.statusModal.querySelectorAll('.status-option').forEach(button => {
            if (button.dataset.status === currentStatus) {
                button.classList.add('bg-gray-100');
            } else {
                button.classList.remove('bg-gray-100');
            }
        });
    }

    hideStatusModal() {
        this.statusModal.classList.add('hidden');
        this.currentBookingId = null;
    }

    async updateBookingStatus(bookingId, newStatus) {
        try {
            console.log("🔹 Debug: Sending bookingId =", bookingId, "newStatus =", newStatus); // ✅ Debug
    
            await BookingService.updateBookingStatus(bookingId, newStatus);
            await this.updateBookingsAndRender();
            toastManager.addToast('success', 'สำเร็จ', `อัปเดตสถานะเป็น "${newStatus}" สำเร็จ`);
        } catch (error) {
            toastManager.addToast('error', 'ข้อผิดพลาด', handleError(error, 'AdminBooking'));
        }
    }

    setLoadingState() {
        this.innerHTML = `
            <div class="container mx-auto py-8 text-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-8">จัดการการจอง</h2>
                <div class="flex justify-center items-center">
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        `;
    }

    async loadBookings() {
        try {
            this.setLoadingState();
            const result = await BookingService.getBookings();
            this.bookings = result.bookings;
        } catch (error) {
            toastManager.addToast('error', 'ข้อผิดพลาด', handleError(error, 'AdminBooking'));
        }
    }

    async handleDeleteBooking(bookingId) {
        try {
            if (confirm('คุณต้องการลบการจองนี้ใช่หรือไม่?')) {
                await BookingService.deleteBooking(bookingId);
                await this.updateBookingsAndRender();
                toastManager.addToast('success', 'สำเร็จ', 'ลบการจองสำเร็จ');
            }
        } catch (error) {
            toastManager.addToast('error', 'ข้อผิดพลาด', handleError(error, 'AdminBooking'));
        }
    }

    renderTable() {
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
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.bookings.map(booking => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">${booking.username}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${booking.product_name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${new Date(booking.booking_date).toLocaleDateString('th-TH')}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                                            'bg-red-100 text-red-800'
                                        }" data-booking-id="${booking.id}" data-status="${booking.status}">
                                            ${booking.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        <button class="text-red-600 hover:text-red-900 delete-btn" data-booking-id="${booking.id}">ลบ</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        this.querySelectorAll('.status-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.bookingId;
                const currentStatus = e.target.dataset.status;
                this.showStatusModal(bookingId, currentStatus);
            });
        });

        this.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.bookingId;
                this.handleDeleteBooking(bookingId);
            });
        });
    }

    async updateBookingsAndRender() {
        await this.loadBookings();
        this.render();
    }

    render() {
        if (!Array.isArray(this.bookings) || this.bookings.length === 0) {
            this.innerHTML = `
                <div class="container mx-auto py-8 text-center">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">จัดการการจอง</h2>
                    <p class="text-gray-600">ไม่มีข้อมูลการจอง</p>
                </div>
            `;
            return;
        }
        this.renderTable();
        this.addEventListeners();
    }
}

customElements.define("admin-booking", AdminBooking);
