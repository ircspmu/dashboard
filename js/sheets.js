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
            const response = await fetch(this.apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.message || 'Unknown error from Apps Script');
            }

            return result.data || [];
        } catch (error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network error. Please check your internet connection and verify the Apps Script URL is correct and deployed.');
            }
            throw error;
        }
    }
}
