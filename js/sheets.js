/**
 * Google Sheets integration via Apps Script proxy
 * Fetches data from a deployed Google Apps Script web app
 */
class SheetsAPI {
    constructor(config) {
        this.apiUrl = config.APPS_SCRIPT_URL;
    }

    /**
     * Fetch all data from the Apps Script proxy
     * @returns {Promise<Array<Object>>} Array of parsed row objects
     */
    async fetchData() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();

            // Try to parse as JSON
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Response text:', text.substring(0, 500));
                throw new Error('Invalid JSON response from Apps Script. Check if the script is deployed correctly.');
            }

            if (result.error) {
                throw new Error(result.message || 'Unknown error from Apps Script');
            }

            return result.data || [];
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network error. Check your internet and verify the Apps Script URL is correct and deployed as a Web App.');
            }
            throw error;
        }
    }
}
