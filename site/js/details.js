const DATA = 'data/';

//  colourPalette values from the Svelte project
const palette = ['#08306b', '#2162a8', '#5a9bd0', '#a6cbe6', '#dfeaf3', '#e3f1e0', '#a9d8a4', '#5cb267', '#1f8a41', '#00491c'];

const councils = {
    N09000001: 'Antrim and Newtownabbey',
    N09000002: 'Armagh City, Banbridge and Craigavon',
    N09000003: 'Belfast',
    N09000004: 'Causeway Coast and Glens',
    N09000005: 'Derry City and Strabane',
    N09000006: 'Fermanagh and Omagh',
    N09000007: 'Lisburn and Castlereagh',
    N09000008: 'Mid and East Antrim',
    N09000009: 'Mid Ulster',
    N09000010: 'Newry, Mourne and Down',
    N09000011: 'Ards and North Down'
};

// prevents cross site scripts
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const cleanName = (label) => label.replace(/_/g, ' '); // 
const cleanIndicator = (name) => name.replace(/\s*Rank \(where 1 is most deprived\)/, '').replace(/ Domain$/, ''); // remove additional text from indicators
const sentenceCase = (text) => text.charAt(0) + text.slice(1).toLowerCase(); // 

async function showDetails() {
    const result = document.getElementById('result');
    const pc = (new URLSearchParams(location.search).get('pc') || '').toUpperCase().replace(/\s+/g, '');
    if (!pc) return;
    document.getElementById('pc').value = pc;

    let postcodes, dep;
    try {
        // fetches both files and converts to js object from json in response
        [postcodes, dep] = await Promise.all(
            ['postcodes.json', 'deprivation.json'].map((file) => fetch(DATA + file).then((r) => r.json()))
        );
    } catch (error) {
        console.error(error);
        result.innerHTML = '<p class="text-danger">The data could not be loaded. Try again later.</p>';
        return;
    }

    const match = postcodes[pc];
    const area = match && dep.areas[match[0]];
    if (!match || !area) {
        result.innerHTML = `<p class="text-danger">No results found for ${esc(pc)}. Check the postcode and try again.</p>`;
        return;
    }

    const [soa, lgd, settlement] = match; // assigns based on order of data from postcodes.json
    const maxRank = Object.keys(dep.areas).length;
    const last = dep.indicators.length - 1;

    const rows = dep.indicators
        .map((indicator, i) => {
            const rank = area.ranks[i];
            const labels = i === 0 ? 'above' : i === last ? 'below' : undefined; // shows labels for scale on 1st and last scale only
            return `<div class="row align-items-center scale-row${i === 0 ? ' border-bottom border-dark mb-3 pb-2' : ''}">
                <div class="col-12 col-xl-4 text-xl-end">
                    <p class="mb-0 fs-5">${esc(cleanIndicator(indicator.name))}</p>
                    <p class="mb-0">Rank ${esc(rank)} of ${maxRank}</p>
                </div>
                <div class="col-12 col-xl-8">${rankScale(rank, maxRank, palette, labels)}</div>
            </div>`;
        })
        .join('');

    result.innerHTML = `
        <h2>${esc(cleanName(esc(pc)))}</h2>
        <table class="table lookup-table">
            <tbody>
                <tr><th scope="row">Neighbourhood</th><td>${esc(cleanName(area.label))} (${esc(soa)})</td></tr>
                <tr><th scope="row">Council area</th><td>${esc(councils[lgd] || lgd)} (${esc(lgd)})</td></tr>
                <tr><th scope="row">Urban or rural</th><td>${esc(sentenceCase(settlement))}</td></tr>
            </tbody>
        </table>
        <h3 class="mt-4">Rank in each type of deprivation</h3>
        ${rows}`;
}

showDetails();