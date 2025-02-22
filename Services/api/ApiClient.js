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
}

export default ApiClient; 