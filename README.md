# SEO & Google Analytics Website Analyzer

A modern, professional, and responsive single-page web application for analyzing website SEO, performance, security, and more.

## Features

- **Instant Website Analysis**: Enter any URL and get a complete report
- **Professional Dashboard**: Glass-morphism design with smooth animations
- **SEO Score Cards**: Colorful progress circles showing various metrics
- **Google Analytics Integration (Sample Data)**: Beautiful charts and analytics cards
- **Core Web Vitals**: Lighthouse-style performance metrics
- **Dark/Light Mode**: Toggle between themes
- **Fully Responsive**: Works on desktop, tablet, and mobile
- **Sample Reports**: Pre-populated data for demonstration purposes

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome

## Installation & Usage

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Steps

1. **Clone or download the project files**
2. **Navigate to the project directory** in your terminal
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the server**:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```
5. **Open your browser** and go to `http://localhost:3000`
6. **Enter a website URL** and click "Analyze Website" to see the report!

## Project Structure

```
project/
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── routes/                  # API routes
├── controllers/             # Request handlers
├── services/                # Business logic
├── public/                  # Static files
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   └── main.js          # Frontend logic
│   └── images/
├── views/
│   └── index.html           # Main HTML page
├── api/
├── config/
├── utils/
└── README.md                # This file
```

## API Endpoint

### POST /api/analyze
Analyzes a website and returns sample report data.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "overview": {...},
  "seo": {...},
  "analytics": {...},
  "performance": {...},
  ...
}
```

## Future Enhancements

- Google Analytics Data API integration
- Google Search Console API integration
- Google PageSpeed API
- Lighthouse integration
- OpenAI API for recommendations
- Ahrefs, SEMrush, Moz API integrations
- Export report to PDF
- Download report as JSON
- Print report
- Share report link
- Search history
- User authentication

## License

MIT
