/**
 * Main application logic
 * Icon grid dashboard with search and category filtering
 */
class Dashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.categories = [];
        this.activeCategory = CONFIG.DEFAULT_CATEGORY;
        this.searchQuery = '';

        // Color palette for icons
        this.colors = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'pink', 'yellow', 'indigo', 'cyan'];

        // Icon SVGs by category keyword
        this.iconMap = {
            'document': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
            'tool': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
            'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
            'template': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            'policy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
            'data': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
            'team': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            'report': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            'training': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
            'project': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
            'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
        };

        this.elements = {
            searchInput: document.getElementById('searchInput'),
            categoryTabs: document.getElementById('categoryTabs'),
            iconsGrid: document.getElementById('iconsGrid'),
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
            this.renderIcons();
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
        this.renderIcons();
    }

    renderCategoryTabs() {
        this.elements.categoryTabs.innerHTML = this.categories
            .map(category => `
                <button class="category-tab ${category === this.activeCategory ? 'active' : ''}" data-category="${this.escapeHtml(category)}">
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

    renderIcons() {
        if (this.filteredData.length === 0) {
            this.elements.iconsGrid.innerHTML = '';
            this.elements.noResults.style.display = 'block';
            this.elements.resultCount.style.display = 'none';
            return;
        }

        this.elements.noResults.style.display = 'none';
        this.elements.resultCount.style.display = 'block';
        this.elements.resultCount.textContent = `Showing ${this.filteredData.length} resource${this.filteredData.length !== 1 ? 's' : ''}`;

        this.elements.iconsGrid.innerHTML = this.filteredData
            .map((item, index) => this.createIconTile(item, index))
            .join('');
    }

    createIconTile(item, index) {
        const colorClass = this.colors[index % this.colors.length];
        const icon = this.getIcon(item.category, item.name);
        const label = this.escapeHtml(item.name);
        const tooltip = this.escapeHtml(item.description || item.name);

        return `
            <a href="${this.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="icon-tile icon-${colorClass}" data-tooltip="${tooltip}">
                <div class="icon-circle">${icon}</div>
                <span class="icon-label">${label}</span>
            </a>
        `;
    }

    getIcon(category, name) {
        const key = category.toLowerCase();
        const nameKey = name.toLowerCase();

        // Match by category or name keywords
        for (const [keyword, svg] of Object.entries(this.iconMap)) {
            if (key.includes(keyword) || nameKey.includes(keyword)) {
                return svg;
            }
        }

        return this.iconMap['default'];
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
        this.elements.iconsGrid.innerHTML = '';
    }

    hideLoading() {
        this.elements.loading.style.display = 'none';
    }

    showError(message) {
        this.elements.loading.style.display = 'none';
        this.elements.error.style.display = 'block';
        this.elements.errorMessage.textContent = message;
        this.elements.iconsGrid.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
