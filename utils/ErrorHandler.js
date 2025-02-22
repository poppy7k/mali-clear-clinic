export const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    DB_ERROR: 'DB_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export class AppError extends Error {
    constructor(message, type = ErrorTypes.UNKNOWN_ERROR, originalError = null) {
        super(message);
        this.type = type;
        this.originalError = originalError;
        this.timestamp = new Date();
    }

    logError() {
        console.error({
            type: this.type,
            message: this.message,
            timestamp: this.timestamp,
            originalError: this.originalError
        });
    }
}

export const handleError = (error, component = 'Unknown') => {
    console.error(`Error in ${component}:`, error);

    if (error.error_code) {
        switch (error.error_code) {
            case 'DB_ERROR':
                return 'เกิดข้อผิดพลาดกับฐานข้อมูล กรุณาลองใหม่อีกครั้ง';
            case 'AUTH_ERROR':
                return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
        }
    }

    switch (error.type) {
        case ErrorTypes.NETWORK_ERROR:
            return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        case ErrorTypes.API_ERROR:
            return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ กรุณาลองใหม่อีกครั้ง';
        case ErrorTypes.VALIDATION_ERROR:
            return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลใหม่';
        case ErrorTypes.AUTH_ERROR:
            return 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่';
        case ErrorTypes.DB_ERROR:
            return 'เกิดข้อผิดพลาดกับฐานข้อมูล กรุณาลองใหม่ภายหลัง';
        default:
            return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
    }
};

export const handleFormError = (error, formElement) => {
    const errorDiv = formElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = handleError(error);
        errorDiv.classList.remove('hidden');
    }
};

export const clearFormError = (formElement) => {
    const errorDiv = formElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }
}; 