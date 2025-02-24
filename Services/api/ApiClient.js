class ApiClient {
    static async request(endpoint, options = {}) {
        const baseUrl = '/mali-clear-clinic/api';
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new AppError(data.message, ErrorTypes.API_ERROR);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(error.message, ErrorTypes.NETWORK_ERROR);
        }
    }

    static get(endpoint) {
        return this.request(endpoint);
    }

    static post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint, data) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

export default ApiClient; 