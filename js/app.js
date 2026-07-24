/**
 * Main application logic
 * Handles rendering, search, filtering, and UI interactions
 */
class Dashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.categories = [];
        this.activeCategory = CONFIG.DEFAULT_CATEGORY;
        this.searchQuery = '';

        this.elements = {
            searchInput: document.getElementById('searchInput'),
            categoryTabs: document.getElementById('categoryTabs'),
            linksGrid: document.getElementById('linksGrid'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('errorMessage'),
            noResults: document.getElementById('noResults'),
            resultCount: document.getElementById('resultCount')
        };

        this.sheets = new SheetsAPI(CONFIG);
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
    }

    bindEvents() {
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.filterAndRender();
        });
    }

    async loadData() {
        try {
            this.showLoading();
            this.data = await this.sheets.fetchData();
            this.categories = this.extractCategories();
            this.filteredData = [...this.data];
            this.renderCategoryTabs();
            this.renderLinks();
            this.hideLoading();
        } catch (error) {
            this.showError(error.message);
        }
    }

    extractCategories() {
        const categorySet = new Set(this.data.map(item => item.category));
        return ['All', ...Array.from(categorySet).sort()];
    }

    filterAndRender() {
        this.filteredData = this.data.filter(item => {
            const matchesCategory = this.activeCategory === 'All' || item.category === this.activeCategory;

            if (!this.searchQuery) return matchesCategory;

            const matchesSearch =
                item.name.toLowerCase().includes(this.searchQuery) ||
                item.description.toLowerCase().includes(this.searchQuery) ||
                item.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));

            return matchesCategory && matchesSearch;
        });

        this.renderLinks();
    }

    renderCategoryTabs() {
        this.elements.categoryTabs.innerHTML = this.categories
            .map(category => `
                <button
                    class="category-tab ${category === this.activeCategory ? 'active' : ''}"
                    data-category="${this.escapeHtml(category)}"
                >
                    ${this.escapeHtml(category)}
                </button>
            `)
            .join('');

        this.elements.categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeCategory = tab.dataset.category;
                this.elements.categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterAndRender();
            });
        });
    }

    renderLinks() {
        if (this.filteredData.length === 0) {
            this.elements.linksGrid.innerHTML = '';
            this.elements.noResults.style.display = 'block';
            this.elements.resultCount.style.display = 'none';
            return;
        }

        this.elements.noResults.style.display = 'none';
        this.elements.resultCount.style.display = 'block';
        this.elements.resultCount.textContent = `Showing ${this.filteredData.length} resource${this.filteredData.length !== 1 ? 's' : ''}`;

        this.elements.linksGrid.innerHTML = this.filteredData
            .map(item => this.createLinkCard(item))
            .join('');
    }

    createLinkCard(item) {
        const description = this.searchQuery && CONFIG.HIGHLIGHT_SEARCH
            ? this.highlightText(item.description, this.searchQuery)
            : this.escapeHtml(item.description);

        const title = this.searchQuery && CONFIG.HIGHLIGHT_SEARCH
            ? this.highlightText(item.name, this.searchQuery)
            : this.escapeHtml(item.name);

        const tags = item.tags
            .map(tag => `<span class="link-tag">${this.escapeHtml(tag)}</span>`)
            .join('');

        return `
            <a href="${this.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="link-card">
                <div class="link-card-header">
                    <div class="link-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="link-title">${title}</div>
                        <span class="link-category-badge">${this.escapeHtml(item.category)}</span>
                    </div>
                </div>
                <div class="link-description">${description}</div>
                ${tags ? `<div class="link-tags">${tags}</div>` : ''}
            </a>
        `;
    }

    highlightText(text, query) {
        if (!query) return this.escapeHtml(text);

        const escaped = this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return escaped.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        this.elements.loading.style.display = 'block';
        this.elements.error.style.display = 'none';
        this.elements.noResults.style.display = 'none';
        this.elements.linksGrid.innerHTML = '';
    }

    hideLoading() {
        this.elements.loading.style.display = 'none';
    }

    showError(message) {
        this.elements.loading.style.display = 'none';
        this.elements.error.style.display = 'block';
        this.elements.errorMessage.textContent = message;
        this.elements.linksGrid.innerHTML = '';
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
