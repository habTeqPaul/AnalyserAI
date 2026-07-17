let charts = [];
let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem('theme', 'light');
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    if (currentData) {
      renderCharts(currentData);
    }
  });

  // Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  const savedSidebarState = localStorage.getItem('sidebarCollapsed');
  
  if (savedSidebarState === 'true') {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
  }

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });

  // Analyze Button
  document.getElementById('analyzeBtn').addEventListener('click', analyzeWebsite);
  document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeWebsite();
  });

  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      navigateToSection(section, link);
    });
  });
});

function navigateToSection(section, activeLink) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (activeLink) activeLink.classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) targetSection.classList.add('active');
}

async function analyzeWebsite() {
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const url = urlInput.value.trim();

    if (!url) {
        showToast('Please enter a valid URL', 'warning');
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        currentData = data;

        // Show report menu
  document.getElementById('reportMenu').classList.remove('d-none');
  document.getElementById('report-sections').classList.remove('d-none');

  // Render all sections
  renderAllSections(data);

  // Navigate to Website Content first
  const websiteContentLink = document.querySelector('[data-section="website-content"]');
  navigateToSection('website-content', websiteContentLink);

        showToast('Analysis complete!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Error analyzing website', 'danger');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search me-2"></i>Analyze Website';
    }
}

function renderAllSections(data) {
    renderOverview(data.overview);
    renderSeoScore(data.seo);
    renderMeta(data.meta);
    renderHeadings(data.headings);
    renderImages(data.images);
    renderLinks(data.links);
    renderAnalytics(data.analytics);
    renderSearchConsole(data.searchConsole);
    renderPerformance(data.performance);
    renderCoreWebVitals(data.coreWebVitals);
    renderAccessibility(data.accessibility);
    renderSecurity(data.security);
    renderMobile(data.mobileFriendly);
    renderStructuredData(data.structuredData);
    renderSocial(data.socialPreview);
    renderTechnologies(data.technologies);
    renderRecommendations(data.recommendations);
    renderKeywords(data.keywords);
    renderWebsiteContent(data.fullContent, data.overview ? data.overview.url : '');
    renderCharts(data);
}

function buildWebsitePreviewDocument(content, url) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    const baseTag = url ? `<base href="${url}">` : '';
    const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    let documentContent = content;

    if (/<head[\s\S]*?>/i.test(documentContent)) {
        if (!/<base[\s\S]*?>/i.test(documentContent) && baseTag) {
            documentContent = documentContent.replace(/<head([\s\S]*?)>/i, `<head$1>${baseTag}`);
        }

        if (!/name=["']viewport["']/i.test(documentContent)) {
            documentContent = documentContent.replace(/<head([\s\S]*?)>/i, `<head$1>${viewportTag}`);
        }
    } else if (/<html[\s\S]*?>/i.test(documentContent)) {
        documentContent = documentContent.replace(
            /<html([\s\S]*?)>/i,
            `<html$1><head>${baseTag}${viewportTag}</head>`
        );
    } else {
        documentContent = `<!doctype html><html><head>${baseTag}${viewportTag}</head><body>${documentContent}</body></html>`;
    }

    return documentContent;
}

function renderWebsiteContent(content, url) {
  const element = document.getElementById('website-content');
  if (!content) {
    element.innerHTML = '<p class="text-muted text-center py-5">No content available</p>';
    return;
  }

  // Store original content for reset
  let currentContent = content;
  let originalContent = content;

  element.innerHTML = `
    <div class="website-preview-shell">
      <div class="website-preview-header">
        <span>Responsive Website Preview</span>
        <div class="translation-controls">
          <select class="language-select" id="languageSelect">
            <option value="English">English</option>
            <option value="Spanish">Español (Spanish)</option>
            <option value="French">Français (French)</option>
            <option value="German">Deutsch (German)</option>
            <option value="Italian">Italiano (Italian)</option>
            <option value="Portuguese">Português (Portuguese)</option>
            <option value="Chinese">中文 (Chinese)</option>
            <option value="Japanese">日本語 (Japanese)</option>
            <option value="Korean">한국어 (Korean)</option>
            <option value="Arabic">العربية (Arabic)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Malayalam">മലയാളം (Malayalam)</option>
            <option value="Russian">Русский (Russian)</option>
          </select>
          <button class="translate-btn" id="translateBtn">
            <i class="fas fa-language"></i> Translate
          </button>
          <button class="reset-btn" id="resetBtn">
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
        <div class="responsive-controls">
          <button class="responsive-btn active" data-view="desktop">
            <i class="fas fa-desktop"></i> Desktop
          </button>
          <button class="responsive-btn" data-view="tablet">
            <i class="fas fa-tablet-alt"></i> Tablet
          </button>
          <button class="responsive-btn" data-view="mobile">
            <i class="fas fa-mobile-alt"></i> Mobile
          </button>
        </div>
        ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="website-preview-link">Open Site</a>` : ''}
      </div>
      <div class="iframe-container">
        <div class="iframe-wrapper view-desktop">
          <iframe
            title="Website Preview"
            loading="lazy"
            referrerpolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>
      </div>
    </div>
  `;

  const iframe = element.querySelector('iframe');
  iframe.srcdoc = buildWebsitePreviewDocument(currentContent, url);

  // Add responsive view buttons event listeners
  const buttons = element.querySelectorAll('.responsive-btn');
  const wrapper = element.querySelector('.iframe-wrapper');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      wrapper.classList.remove('view-desktop', 'view-tablet', 'view-mobile');
      wrapper.classList.add(`view-${view}`);
    });
  });

  // Add translation functionality
  const translateBtn = document.getElementById('translateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const languageSelect = document.getElementById('languageSelect');

  translateBtn.addEventListener('click', async () => {
    const targetLang = languageSelect.value;
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalContent, targetLanguage: targetLang })
      });
      
      const data = await response.json();
      currentContent = data.translatedContent;
      iframe.srcdoc = buildWebsitePreviewDocument(currentContent, url);
      showToast(`Successfully translated to ${targetLang}!`, 'success');
    } catch (error) {
      console.error('Translation error:', error);
      showToast('Translation failed. Please try again.', 'danger');
    } finally {
      translateBtn.disabled = false;
      translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
    }
  });

  resetBtn.addEventListener('click', () => {
    currentContent = originalContent;
    iframe.srcdoc = buildWebsitePreviewDocument(currentContent, url);
    showToast('Content reset to original!', 'info');
  });
}

// Render Functions
function renderOverview(overview) {
    document.getElementById('overview').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Website URL</strong>
                    <a href="${overview.url}" target="_blank" class="text-decoration-none text-primary">${overview.url}</a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Title</strong>
                    <div>${overview.title}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Meta Description</strong>
                    <div>${overview.metaDescription}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Canonical URL</strong>
                    <div>${overview.canonicalUrl}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Language</strong>
                    <div>${overview.language}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">HTTPS</strong>
                    <span class="badge bg-success">${overview.httpsStatus}</span>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Server</strong>
                    <div>${overview.server}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">CMS</strong>
                    <div>${overview.cms}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Word Count</strong>
                    <div>${overview.wordCount.toLocaleString()}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3 border rounded">
                    <strong class="text-muted d-block mb-1">Load Time</strong>
                    <div>${overview.loadTime}</div>
                </div>
            </div>
        </div>
    `;
}

function renderSeoScore(seo) {
    const scores = [
        { name: 'Overall SEO', score: seo.overall, color: '#2563eb' },
        { name: 'Technical', score: seo.technical, color: '#0ea5e9' },
        { name: 'On Page', score: seo.onPage, color: '#22c55e' },
        { name: 'Content Quality', score: seo.contentQuality, color: '#f59e0b' },
        { name: 'Performance', score: seo.performance, color: '#8b5cf6' },
        { name: 'Accessibility', score: seo.accessibility, color: '#ec4899' },
        { name: 'Best Practices', score: seo.bestPractices, color: '#14b8a6' },
        { name: 'Security', score: seo.security, color: '#ef4444' }
    ];

    document.getElementById('seoScore').innerHTML = `
        <div class="row g-4">
            ${scores.map(s => `
                <div class="col-md-3 col-6 text-center">
                    <div class="seo-circle mb-2">
                        <svg width="120" height="120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="${document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0'}" stroke-width="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="${s.color}" stroke-width="10" stroke-dasharray="${2 * Math.PI * 50}" stroke-dashoffset="${2 * Math.PI * 50 * (1 - s.score / 100)}" />
                        </svg>
                        <div class="position-absolute top-50 start-50 translate-middle">
                            <h4 class="fw-bold mb-0">${s.score}${s.name === 'Overall SEO' ? '' : '%'}</h4>
                        </div>
                    </div>
                    <p class="mb-0 text-muted small">${s.name}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderMeta(meta) {
    document.getElementById('meta').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Title</h6>
                    <p class="mb-0">${meta.title}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Description</h6>
                    <p class="mb-0">${meta.description}</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Keywords</h6>
                    <p class="mb-0">${meta.keywords}</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Robots</h6>
                    <p class="mb-0">${meta.robots}</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Viewport</h6>
                    <p class="mb-0">${meta.viewport}</p>
                </div>
            </div>
        </div>
    `;
}

function renderHeadings(headings) {
    document.getElementById('headings').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-heading text-primary fa-3x mb-3"></i>
                    <h5>H1</h5>
                    <h2 class="fw-bold">${headings.h1}</h2>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-heading text-secondary fa-3x mb-3"></i>
                    <h5>H2</h5>
                    <h2 class="fw-bold">${headings.h2}</h2>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-heading text-success fa-3x mb-3"></i>
                    <h5>H3</h5>
                    <h2 class="fw-bold">${headings.h3}</h2>
                </div>
            </div>
        </div>
    `;
}

function renderImages(images) {
    document.getElementById('images').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-3">Total Images</h6>
                    <h3 class="mb-0">${images.total}</h3>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-3">Missing Alt Text</h6>
                    <h3 class="mb-0 text-danger">${images.missingAlt}</h3>
                </div>
            </div>
        </div>
    `;
}

function renderLinks(links) {
    document.getElementById('links').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-3">Internal Links</h6>
                    <h3 class="mb-0">${links.internal}</h3>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-3">External Links</h6>
                    <h3 class="mb-0">${links.external}</h3>
                </div>
            </div>
        </div>
    `;
}

function renderAnalytics(analytics) {
    if (!analytics) {
        document.getElementById('analytics').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-info-circle text-muted fa-3x mb-3"></i>
                <h5 class="fw-bold mb-2">Analytics Data Not Available</h5>
                <p class="text-muted mb-0">Real Google Analytics data requires API integration with user authentication.</p>
            </div>
        `;
        return;
    }
    document.getElementById('analytics').innerHTML = `
        <div class="row g-4">
            <div class="col-md-3">
                <div class="p-4">
                    <i class="fas fa-users text-primary fa-2x mb-2"></i>
                    <h3 class="fw-bold mb-0">${analytics.visitors.toLocaleString()}</h3>
                    <p class="mb-0 text-muted small">Visitors</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="p-4">
                    <i class="fas fa-user text-secondary fa-2x mb-2"></i>
                    <h3 class="fw-bold mb-0">${analytics.users.toLocaleString()}</h3>
                    <p class="mb-0 text-muted small">Users</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="p-4">
                    <i class="fas fa-clock text-success fa-2x mb-2"></i>
                    <h3 class="fw-bold mb-0">${analytics.sessions.toLocaleString()}</h3>
                    <p class="mb-0 text-muted small">Sessions</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="p-4">
                    <i class="fas fa-eye text-warning fa-2x mb-2"></i>
                    <h3 class="fw-bold mb-0">${analytics.pageViews.toLocaleString()}</h3>
                    <p class="mb-0 text-muted small">Page Views</p>
                </div>
            </div>
        </div>
    `;
}

function renderSearchConsole(searchConsole) {
    if (!searchConsole) {
        document.getElementById('searchConsole').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-info-circle text-muted fa-3x mb-3"></i>
                <h5 class="fw-bold mb-2">Search Console Data Not Available</h5>
                <p class="text-muted mb-0">Real Google Search Console data requires API integration with user authentication.</p>
            </div>
        `;
        return;
    }
    document.getElementById('searchConsole').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Indexed Pages</h6>
                    <h3 class="mb-0">${searchConsole.indexedPages.toLocaleString()}</h3>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Coverage</h6>
                    <h3 class="mb-0 text-success">${searchConsole.coverage}</h3>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">CTR</h6>
                    <h3 class="mb-0">${searchConsole.ctr}</h3>
                </div>
            </div>
        </div>
    `;
}

function renderPerformance(perf) {
    document.getElementById('performance').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Performance Score</h6>
                    <h2 class="fw-bold text-success">${perf.score}/100</h2>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">LCP</h6>
                    <h2 class="fw-bold">${perf.lcp}</h2>
                </div>
            </div>
        </div>
    `;
}

function renderCoreWebVitals(cwv) {
    document.getElementById('coreWebVitals').innerHTML = `
        <div class="row g-4">
            <div class="col-md-3 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-tachometer-alt text-success fa-3x mb-3"></i>
                    <h6 class="fw-bold mb-2">LCP</h6>
                    <h4 class="mb-0 text-success">${cwv.lcp}</h4>
                </div>
            </div>
            <div class="col-md-3 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-clock text-success fa-3x mb-3"></i>
                    <h6 class="fw-bold mb-2">FCP</h6>
                    <h4 class="mb-0 text-success">${cwv.fcp}</h4>
                </div>
            </div>
            <div class="col-md-3 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-arrows-alt text-success fa-3x mb-3"></i>
                    <h6 class="fw-bold mb-2">CLS</h6>
                    <h4 class="mb-0 text-success">${cwv.cls}</h4>
                </div>
            </div>
            <div class="col-md-3 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-plug text-success fa-3x mb-3"></i>
                    <h6 class="fw-bold mb-2">TTFB</h6>
                    <h4 class="mb-0 text-success">${cwv.ttfb}</h4>
                </div>
            </div>
        </div>
    `;
}

function renderAccessibility(acc) {
    document.getElementById('accessibility').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">ARIA</h6>
                    <i class="fas fa-check-circle text-success fa-2x"></i>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Score</h6>
                    <h3 class="mb-0">${acc.score}/100</h3>
                </div>
            </div>
        </div>
    `;
}

function renderSecurity(sec) {
    document.getElementById('security').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">HTTPS</h6>
                    ${sec.https ? '<i class="fas fa-check-circle text-success fa-2x"></i>' : '<i class="fas fa-times-circle text-danger fa-2x"></i>'}
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">SSL</h6>
                    <p class="mb-0">${sec.ssl}</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Security Headers</h6>
                    ${sec.securityHeaders ? '<i class="fas fa-check-circle text-success fa-2x"></i>' : '<i class="fas fa-times-circle text-danger fa-2x"></i>'}
                </div>
            </div>
        </div>
    `;
}

function renderMobile(mobile) {
    document.getElementById('mobile').innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Responsive</h6>
                    ${mobile.responsive ? '<i class="fas fa-check-circle text-success fa-2x"></i>' : '<i class="fas fa-times-circle text-danger fa-2x"></i>'}
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 border rounded">
                    <h6 class="fw-bold mb-2">Mobile Score</h6>
                    <h3 class="mb-0">${mobile.score}/100</h3>
                </div>
            </div>
        </div>
    `;
}

function renderStructuredData(sd) {
    const items = [
        { name: 'Schema.org', value: sd.schemaOrg },
        { name: 'Breadcrumb', value: sd.breadcrumb },
        { name: 'Organization', value: sd.organization },
        { name: 'FAQ', value: sd.faq },
        { name: 'Article', value: sd.article }
    ];

    document.getElementById('structuredData').innerHTML = `
        <div class="row g-3">
            ${items.map(item => `
                <div class="col-md-4">
                    <div class="p-3 border rounded">
                        <strong class="d-block mb-2">${item.name}</strong>
                        ${item.value ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-times-circle text-danger"></i>'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderSocial(social) {
    document.getElementById('socialPreview').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fab fa-facebook text-primary fa-3x mb-3"></i>
                    <h5 class="fw-bold mb-2">Facebook Preview</h5>
                    ${social.facebook ? '<span class="text-success">Active</span>' : '<span class="text-danger">Missing</span>'}
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fab fa-twitter text-info fa-3x mb-3"></i>
                    <h5 class="fw-bold mb-2">Twitter Preview</h5>
                    ${social.twitter ? '<span class="text-success">Active</span>' : '<span class="text-danger">Missing</span>'}
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="p-4 border rounded">
                    <i class="fas fa-image text-warning fa-3x mb-3"></i>
                    <h5 class="fw-bold mb-2">OG Image</h5>
                    ${social.ogImage ? '<span class="text-success">Active</span>' : '<span class="text-danger">Missing</span>'}
                </div>
            </div>
        </div>
    `;
}

function renderTechnologies(techs) {
    document.getElementById('technologies').innerHTML = techs.map(tech => `<span class="tech-badge">${tech}</span>`).join('');
}

function renderRecommendations(recs) {
    document.getElementById('recommendations').innerHTML = recs.map(rec => `
        <div class="recommendation-item">
            <i class="fas fa-lightbulb"></i>
            <div>${rec}</div>
        </div>
    `).join('');
}

function renderKeywords(keywords) {
    document.getElementById('keywords').innerHTML = `
        <thead>
            <tr>
                <th>Keyword</th>
                <th>Volume</th>
                <th>Difficulty</th>
                <th>Position</th>
                <th>Clicks</th>
            </tr>
        </thead>
        <tbody>
            ${keywords.map(kw => `
                <tr>
                    <td>${kw.keyword}</td>
                    <td>${kw.volume.toLocaleString()}</td>
                    <td>${kw.difficulty}</td>
                    <td>${kw.position}</td>
                    <td>${kw.clicks.toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

function renderCharts(data) {
  charts.forEach(c => c.destroy());
  charts = [];

  const isDark = document.body.classList.contains('dark-mode');
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const grid = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Render performance chart only if we have real SEO data from Gemini
  if (data.seo && data.seo.overall > 0) {
    const perfCtx = document.getElementById('performanceChart').getContext('2d');
    charts.push(new Chart(perfCtx, {
      type: 'bar',
      data: {
        labels: ['SEO', 'Performance', 'Accessibility', 'Best Practices', 'Security'],
        datasets: [{
          label: 'Score',
          data: [data.seo.overall, data.seo.performance, data.seo.accessibility, data.seo.bestPractices, data.seo.security],
          backgroundColor: ['#2563eb', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: text } } },
        scales: {
          x: { ticks: { color: text }, grid: { color: grid } },
          y: { min: 0, max: 100, ticks: { color: text }, grid: { color: grid } }
        }
      }
    }));
  } else {
    // Hide performance chart if no real data
    const perfChartEl = document.getElementById('performanceChart');
    if (perfChartEl) {
      perfChartEl.parentElement.innerHTML = '';
    }
  }

  // Analytics charts are hidden (no data)
  const analyticsSection = document.getElementById('analytics-section');
  const chartRow = analyticsSection.querySelector('.row.mt-4');
  if (chartRow) {
    chartRow.innerHTML = '';
  }
}

function showToast(message, type = 'info') {
    const bg = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-primary';
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${bg} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    setTimeout(() => toast.remove(), 5000);
}
