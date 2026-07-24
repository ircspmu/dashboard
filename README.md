# Division Data Library Dashboard

A static web application that displays clickable document and resource links from a Google Sheet, organized by category with search and filtering.

## Features

- **Google Sheets Integration** - Data sourced from a Google Sheet via secure Apps Script proxy
- **Category Tabs** - Auto-generated tabs for filtering by category
- **Live Search** - Real-time search by name, description, or tags
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clickable Links** - Cards link directly to the resources
- **Secure** - No API keys exposed in the browser

---

## Google Sheets Setup

### 1. Create Your Google Sheet

Create a new Google Sheet with the following column headers in Row 1:

| A | B | C | D | E |
|---|---|---|---|---|
| **Name** | **URL** | **Category** | **Description** | **Tags** |

Then fill in your data rows:

| Name | URL | Category | Description | Tags |
|------|-----|----------|-------------|------|
| Company Policy | https://docs.google.com/... | Policies | Employee handbook | hr, policy, onboarding |
| Jira Board | https://jira.company.com | Tools | Project tracking | project, agile |
| Design System | https://figma.com/... | Templates | UI component library | design, ui, components |

### 2. Deploy the Apps Script Proxy

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste the contents of `apps-script.js`
3. Update `SHEET_NAME` at the top if your tab name is different from `Sheet1`
4. Click **Save** (floppy disk icon)
5. Click **Deploy > New deployment**
6. Click the gear icon and select **Web app**
7. Configure:
   - **Description**: "Sheet Data Proxy"
   - **Execute as**: Me
   - **Who has access**: Anyone (or "Anyone within [your org]" for Google Workspace)
8. Click **Deploy**
9. **Copy the Web App URL** (starts with `https://script.google.com/macros/...`)
10. Click **Done**

> **Important:** The Apps Script needs to be re-deployed each time you change the code. For testing, you can use the initial access URL (ending in `/dev`) instead.

### 3. Configure the Dashboard

Edit `js/config.js` and paste your Web App URL:

```javascript
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
    DEFAULT_CATEGORY: 'All',
    HIGHLIGHT_SEARCH: true
};
```

---

## Configuration

Edit `js/config.js`:

```javascript
const CONFIG = {
    // Your Apps Script Web App URL
    APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',

    // Default category to show ('All' shows everything)
    DEFAULT_CATEGORY: 'All',

    // Enable search highlighting
    HIGHLIGHT_SEARCH: true
};
```

---

## Running Locally

### Option 1: Direct File Opening

Simply double-click `index.html` to open it in your browser.

### Option 2: Local Server (Recommended)

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
npx serve .
```

Using PHP:
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Deploy to GitHub Pages

1. Create a new GitHub repo
2. Push all files (except `apps-script.js` - that stays in Google)
3. Go to **Settings > Pages**
4. Set source to **Deploy from a branch**, select `main` folder `/ (root)`
5. Your site will be live at `https://yourusername.github.io/repo-name/`

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Network error" | Check the Apps Script URL in config.js |
| "Server error: Sheet not found" | Verify `SHEET_NAME` in `apps-script.js` matches your tab name |
| "No data found" | Make sure the sheet has data starting from Row 2 |
| CORS errors | Make sure the Apps Script is deployed with access set to "Anyone" |
| Data not updating | Re-deploy the Apps Script after making changes to the code |

---

## Customization

### Add More Columns

1. Add new columns to your Google Sheet
2. Update the `COL` object in `apps-script.js` with the new indices
3. Update the mapping in the `handleRequest` function
4. Update `createLinkCard()` in `js/app.js` to display them

### Change Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary: #2563eb;      /* Main brand color */
    --primary-hover: #1d4ed8; /* Hover state */
    --primary-light: #dbeafe; /* Light background */
}
```

---

## File Structure

```
Dashboard/
├── index.html          # Main HTML page
├── apps-script.js      # Google Apps Script (deploy separately)
├── css/
│   └── style.css       # All styling
├── js/
│   ├── config.js       # Apps Script URL configuration
│   ├── sheets.js       # Data fetching logic
│   └── app.js          # UI rendering and interactions
└── README.md           # This file
```
