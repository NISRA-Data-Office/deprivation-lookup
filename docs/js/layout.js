const pages = [['index.html', 'Home'], ['about.html', 'About'], ['contact.html', 'Contact']];
const here = location.pathname.split('/').pop() || 'index.html';
const isHome = here === 'index.html';

const navLinks = pages.map(([href, name]) => `<a class="site-nav-link${href === here ? ' active' : ''}" href="${href}"${href === here ? ' aria-current="page"' : ''}>${name}</a>`).join('');

const navigation = isHome ? '' : `
    <div class="container py-3">
        <nav class="site-nav text-center" aria-label="Main navigation">
            ${navLinks}
        </nav>
    </div>`;

document.getElementById('site-header').innerHTML = `
    <div class="container-fluid navy-bg">
        <div class="container">
            <div class="row align-items-center py-2">
                <div class="col-12 col-xl-6 d-flex align-items-center justify-content-center justify-content-xl-start p-0">
                    <a class="navbar-brand ps-2 no-external-icon" href="https://www.nisra.gov.uk/" target="_blank" rel="noopener noreferrer">
                        <img src="assets/img/logo/nisra-only-white.svg" alt="NISRA website (opens in new tab)" height="60" class="me-3">
                    </a>
                </div>

                <div class="col-12 col-xl-6 d-flex align-items-center justify-content-center justify-content-xl-end text-center text-xl-end text-white p-0">
                    <h1 class="mb-0">Deprivation in Northern Ireland</h1>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid green-bg py-1"></div>

    <div class="container-fluid grey-bg">
        <div class="container py-3 text-center">
            <p class="mb-1">The 2017 statistics on deprivation in Northern Ireland, including the Multiple Deprivation Measure (NIMDM).</p>
            <p class="mb-0">Deprivation refers to people's unmet needs, a lack of access to opportunities and resources which we might expect in our society.</p>
        </div>
    </div>
    ${navigation}
    `;
    
const list = (items) => items.map(([href, name]) => `<li><a href="${href}">${name}</a></li>`).join('');

const social = [
    ['https://www.facebook.com/nisra.gov.uk', 'facebook-brands-solid-full.svg', 'Facebook'],
    ['https://x.com/NISRA/', 'x-twitter-brands-solid-full.svg', 'Twitter/X'],
    ['https://www.youtube.com/user/nisrastats', 'youtube-brands-solid-full.svg', 'YouTube'],
    ['https://www.linkedin.com/company/northern-ireland-statistics-and-research-agency/', 'linkedin-in-brands-solid-full.svg', 'LinkedIn'],
    ['https://www.instagram.com/nisra.gov.uk/', 'instagram-brands-solid-full.svg', 'Instagram']
]
    .map(([href, file, name]) => `<li class="list-inline-item"><a href="${href}"><img src="assets/img/logo/${file}" alt="${name}" class="img-50" /></a></li>`)
    .join('');

const legal = [
    ['https://www.nisra.gov.uk/crown-copyright', '© Crown Copyright'],
    ['https://www.nisra.gov.uk/terms-and-conditions', 'Terms and conditions'],
    ['https://www.nisra.gov.uk/cookies', 'Cookies'],
    ['https://www.nisra.gov.uk/nisra-privacy-notice', 'Privacy'],
    ['https://datavis.nisra.gov.uk/dissemination/accessibility-statement-visualisations.html', 'Accessibility Statement']
]
    .map(([href, name]) => `<li class="list-inline-item"><a href="${href}">${name}</a></li>`)
    .join('<li class="list-inline-item">|</li>');

document.getElementById('site-footer').innerHTML = `
<div class="container">
  <div class="row mb-3">
    <div class="col-md-4">
      <h3 class="h5">Data Tools</h3>
      <ul class="list-unstyled">${list([
          ['https://explore.nisra.gov.uk/local-stats/', 'Local Statistics Explorer'],
          ['https://data.nisra.gov.uk', 'Data Portal'],
          ['https://build.nisra.gov.uk/en/', 'Census Flexible Table Builder']
      ])}</ul>
    </div>
    <div class="col-md-4">
      <h3 class="h5">Corporate</h3>
      <ul class="list-unstyled">${list([
          ['https://www.nisra.gov.uk/', 'NISRA Website'],
          ['https://www.nisra.gov.uk/about-us/careers', 'Careers'],
          ['https://www.nisra.gov.uk/contact', 'Contact']
      ])}</ul>
    </div>
    <div class="col-md-4">
      <h3 class="h5">Follow</h3>
      <ul class="list-inline">${social}</ul>
    </div>
  </div>
  <ul class="list-inline footer-links text-center mb-0">${legal}</ul>
</div>`;