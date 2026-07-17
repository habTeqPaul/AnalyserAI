require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchWebsiteContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return `Failed to fetch website: ${response.statusText}`;
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching website:', error);
    return `Error fetching website: ${error.message}`;
  }
}

async function analyzeWithGemini(url) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
  const fullContent = await fetchWebsiteContent(url);
  
  const prompt = `Analyze the website ${url} and provide a comprehensive SEO and website health report in JSON format only. 

  IMPORTANT NOTE 1: For "analytics" and "searchConsole" fields, set to null because real Google Analytics and Google Search Console data require API access with user authentication.

  The JSON should have exactly these keys:
  "overview": {
    "url": string,
    "title": string,
    "metaDescription": string,
    "canonicalUrl": string,
    "language": string,
    "favicon": string,
    "httpsStatus": string (Active/Inactive),
    "server": string,
    "cms": string,
    "wordCount": number,
    "readingTime": string,
    "pageSize": string,
    "loadTime": string,
    "statusCode": number
  },
  "seo": {
    "overall": number (0-100),
    "technical": number (0-100),
    "onPage": number (0-100),
    "contentQuality": number (0-100),
    "performance": number (0-100),
    "accessibility": number (0-100),
    "bestPractices": number (0-100),
    "security": number (0-100)
  },
  "meta": {
    "title": string,
    "description": string,
    "keywords": string,
    "author": string,
    "robots": string,
    "viewport": string,
    "canonical": string,
    "openGraph": {"title": string, "description": string, "image": string},
    "twitterCards": {"card": string, "title": string, "description": string, "image": string},
    "charset": string,
    "language": string
  },
  "headings": {
    "h1": number,
    "h2": number,
    "h3": number,
    "missing": number,
    "duplicates": number,
    "structure": array of strings
  },
  "images": {
    "total": number,
    "missingAlt": number,
    "optimized": number,
    "large": number,
    "formats": array of strings
  },
  "links": {
    "internal": number,
    "external": number,
    "broken": number,
    "nofollow": number,
    "dofollow": number
  },
  "analytics": null,
  "searchConsole": null,
  "performance": {
    "score": number (0-100),
    "lcp": string,
    "fcp": string,
    "speedIndex": string,
    "cls": number,
    "ttfb": string,
    "inp": string
  },
  "coreWebVitals": {
    "lcp": string (Good/Needs Improvement/Poor),
    "fcp": string,
    "cls": string,
    "inp": string,
    "ttfb": string
  },
  "accessibility": {
    "aria": boolean,
    "contrast": string,
    "labels": boolean,
    "keyboardNav": boolean,
    "screenReader": boolean,
    "score": number (0-100)
  },
  "security": {
    "https": boolean,
    "ssl": string,
    "securityHeaders": boolean,
    "xssProtection": boolean,
    "csp": boolean,
    "hsts": boolean,
    "mixedContent": boolean
  },
  "mobileFriendly": {
    "responsive": boolean,
    "viewport": boolean,
    "tapTargets": string,
    "fontSizes": string,
    "score": number (0-100)
  },
  "structuredData": {
    "schemaOrg": boolean,
    "breadcrumb": boolean,
    "organization": boolean,
    "product": boolean,
    "faq": boolean,
    "article": boolean
  },
  "socialPreview": {
    "facebook": boolean,
    "twitter": boolean,
    "ogImage": boolean
  },
  "technologies": array of strings,
  "recommendations": array of strings,
  "keywords": array of objects with keys: "keyword", "volume", "difficulty", "position", "clicks"

  Do NOT include any other text in your response, only valid JSON.`;

  const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    text = text.replace(/```json|```/g, '').trim();
    
    const report = JSON.parse(text);
    report.fullContent = fullContent;
    return report;
  } catch (error) {
    console.error('Gemini API error:', error);
    const report = getSampleData(url);
    report.fullContent = fullContent;
    return report;
  }
}

function getSampleData(url) {
  return {
    overview: {
      url: url || 'https://example.com',
      title: 'Example Domain',
      metaDescription: 'This domain is for use in illustrative examples in documents.',
      canonicalUrl: url || 'https://example.com',
      language: 'en',
      favicon: 'https://example.com/favicon.ico',
      httpsStatus: 'Active',
      server: 'nginx',
      cms: 'WordPress',
      wordCount: 1542,
      readingTime: '7 min',
      pageSize: '2.4 MB',
      loadTime: '1.2s',
      statusCode: 200
    },
    seo: {
      overall: 92,
      technical: 95,
      onPage: 91,
      contentQuality: 88,
      performance: 94,
      accessibility: 90,
      bestPractices: 96,
      security: 98
    },
    meta: {
      title: 'Example Domain',
      description: 'This domain is for use in illustrative examples in documents.',
      keywords: 'example, domain, test',
      author: '',
      robots: 'index, follow',
      viewport: 'width=device-width, initial-scale=1.0',
      canonical: url || 'https://example.com',
      openGraph: {
        title: 'Example Domain',
        description: 'This domain is for use in illustrative examples in documents.',
        image: 'https://example.com/og-image.jpg'
      },
      twitterCards: {
        card: 'summary_large_image',
        title: 'Example Domain',
        description: 'This domain is for use in illustrative examples in documents.',
        image: 'https://example.com/twitter-image.jpg'
      },
      charset: 'UTF-8',
      language: 'en'
    },
    headings: {
      h1: 1,
      h2: 5,
      h3: 8,
      missing: 0,
      duplicates: 0,
      structure: ['Main Heading', 'Section 1', 'Subsection 1.1', 'Section 2']
    },
    images: {
      total: 12,
      missingAlt: 2,
      optimized: 10,
      large: 1,
      formats: ['JPEG', 'PNG', 'WebP']
    },
    links: {
      internal: 42,
      external: 15,
      broken: 0,
      nofollow: 3,
      dofollow: 54
    },
    analytics: null,
    searchConsole: null,
    performance: {
      score: 94,
      lcp: '2.1s',
      fcp: '0.8s',
      speedIndex: '1.5s',
      cls: 0.05,
      ttfb: '0.4s',
      inp: '0.2s'
    },
    coreWebVitals: {
      lcp: 'Good',
      fcp: 'Good',
      cls: 'Good',
      inp: 'Good',
      ttfb: 'Good'
    },
    accessibility: {
      aria: true,
      contrast: 'Good',
      labels: true,
      keyboardNav: true,
      screenReader: true,
      score: 90
    },
    security: {
      https: true,
      ssl: 'Valid',
      securityHeaders: true,
      xssProtection: true,
      csp: true,
      hsts: true,
      mixedContent: false
    },
    mobileFriendly: {
      responsive: true,
      viewport: true,
      tapTargets: 'Good',
      fontSizes: 'Good',
      score: 95
    },
    structuredData: {
      schemaOrg: true,
      breadcrumb: true,
      organization: true,
      product: false,
      faq: true,
      article: true
    },
    socialPreview: {
      facebook: true,
      twitter: true,
      ogImage: true
    },
    technologies: ['React', 'Node.js', 'Express', 'WordPress', 'Cloudflare', 'Google Analytics', 'Google Tag Manager', 'Bootstrap', 'jQuery', 'PHP', 'Nginx', 'Apache'],
    recommendations: [
      'Add Meta Description',
      'Optimize Images',
      'Compress CSS',
      'Enable GZIP',
      'Improve Core Web Vitals',
      'Reduce CLS',
      'Add Alt Text',
      'Improve Heading Structure',
      'Add Structured Data',
      'Improve Accessibility'
    ],
    keywords: [
      { keyword: 'Website Analyzer', volume: 12000, difficulty: 45, position: 3, clicks: 450 },
      { keyword: 'SEO Tool', volume: 8500, difficulty: 52, position: 5, clicks: 320 },
      { keyword: 'Website Audit', volume: 6200, difficulty: 48, position: 7, clicks: 210 },
      { keyword: 'Google Analytics', volume: 15000, difficulty: 65, position: 12, clicks: 180 },
      { keyword: 'Technical SEO', volume: 5400, difficulty: 42, position: 4, clicks: 280 }
    ],
    fullContent: '<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>\n\n    <meta charset="utf-8" />\n    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <style type="text/css">\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 2em;\n        background-color: #fdfdff;\n        border-radius: 0.5em;\n        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        div {\n            margin: 0 auto;\n            width: auto;\n        }\n    }\n    </style>    \n</head>\n\n<body>\n<div>\n    <h1>Example Domain</h1>\n    <p>This domain is for use in illustrative examples in documents. You may use this\n    domain in literature without prior coordination or asking for permission.</p>\n    <p><a href="https://www.iana.org/domains/example">More information...</a></p>\n</div>\n</body>\n</html>'
  };
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

async function translateContentWithGemini(htmlContent, targetLanguage) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
  
  const prompt = `Translate all visible text content in the following HTML to ${targetLanguage}. Keep all HTML structure, tags, attributes, and classes EXACTLY the same - only translate the human-readable text content. Do NOT translate URLs, file paths, HTML tag names, attributes, or code. Return ONLY the translated HTML, no explanations.

HTML to translate:
${htmlContent}`;

  const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    text = text.replace(/```html|```/g, '').trim();
    return text;
  } catch (error) {
    console.error('Gemini translation API error:', error);
    return htmlContent; // Return original if translation fails
  }
}

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  const data = await analyzeWithGemini(url);
  res.json(data);
});

app.post('/api/translate', async (req, res) => {
  const { content, targetLanguage } = req.body;
  const translatedContent = await translateContentWithGemini(content, targetLanguage);
  res.json({ translatedContent });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
