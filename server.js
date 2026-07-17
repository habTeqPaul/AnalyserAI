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
      title: 'Analysis Failed',
      metaDescription: 'Could not retrieve meta description',
      canonicalUrl: url || 'https://example.com',
      language: 'Unknown',
      favicon: '',
      httpsStatus: 'Unknown',
      server: 'Unknown',
      cms: 'CMS not detected',
      wordCount: 0,
      readingTime: '0 min',
      pageSize: '0 KB',
      loadTime: '0s',
      statusCode: 0
    },
    seo: {
      overall: 0,
      technical: 0,
      onPage: 0,
      contentQuality: 0,
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      security: 0
    },
    meta: {
      title: '',
      description: '',
      keywords: '',
      author: '',
      robots: '',
      viewport: '',
      canonical: '',
      openGraph: {
        title: '',
        description: '',
        image: ''
      },
      twitterCards: {
        card: '',
        title: '',
        description: '',
        image: ''
      },
      charset: '',
      language: ''
    },
    headings: {
      h1: 0,
      h2: 0,
      h3: 0,
      missing: 0,
      duplicates: 0,
      structure: []
    },
    images: {
      total: 0,
      missingAlt: 0,
      optimized: 0,
      large: 0,
      formats: []
    },
    links: {
      internal: 0,
      external: 0,
      broken: 0,
      nofollow: 0,
      dofollow: 0
    },
    analytics: null,
    searchConsole: null,
    performance: {
      score: 0,
      lcp: '0s',
      fcp: '0s',
      speedIndex: '0s',
      cls: 0,
      ttfb: '0s',
      inp: '0s'
    },
    coreWebVitals: {
      lcp: 'Unknown',
      fcp: 'Unknown',
      cls: 'Unknown',
      inp: 'Unknown',
      ttfb: 'Unknown'
    },
    accessibility: {
      aria: false,
      contrast: 'Unknown',
      labels: false,
      keyboardNav: false,
      screenReader: false,
      score: 0
    },
    security: {
      https: false,
      ssl: 'Unknown',
      securityHeaders: false,
      xssProtection: false,
      csp: false,
      hsts: false,
      mixedContent: false
    },
    mobileFriendly: {
      responsive: false,
      viewport: false,
      tapTargets: 'Unknown',
      fontSizes: 'Unknown',
      score: 0
    },
    structuredData: {
      schemaOrg: false,
      breadcrumb: false,
      organization: false,
      product: false,
      faq: false,
      article: false
    },
    socialPreview: {
      facebook: false,
      twitter: false,
      ogImage: false
    },
    technologies: [],
    recommendations: [],
    keywords: [],
    fullContent: ''
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
