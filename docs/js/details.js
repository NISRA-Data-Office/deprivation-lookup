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
        document.getElementById('summary').innerHTML = '<p class="text-danger">The data could not be loaded. Try again later.</p>';
        return;
    }

    const match = postcodes[pc];
    const area = match && dep.areas[match[0]];
    if (!match || !area) {
        document.getElementById('summary').innerHTML = `<p class="text-danger">No results found for ${esc(pc)}. Check the postcode and try again.</p>`;
        return;
    }

    const [soa, lgd, settlement] = match; // assigns based on order of data from postcodes.json
    const maxRank = Object.keys(dep.areas).length;

const rows = dep.indicators
    .map((indicator, i) => {
        const rank = area.ranks[i];

    //     return `<div class="row scale-row${i === 0 ? ' border-bottom border-dark mb-5 pb-2' : ''}">
    //         <div class="col-12 col-xl-4 text-xl-end">
    //             <p class="mb-1 fs-5 fw-bold">${esc(cleanIndicator(indicator.name))}</p>
    //             <p class="mb-0">Rank ${esc(rank)} of ${maxRank}</p>
    //         </div>
    //         <div class="col-12 col-xl-8">${rankScale(rank, maxRank, palette)}</div>
    //     </div>`;
    // })

return `<div class="row scale-row">
        <div class="col-12 col-xl-3 text-xl-end">
        <p class="mb-0">${esc(cleanIndicator(indicator.name))}</p>
        <p class="mb-0 small text-secondary">Rank ${esc(rank)} of ${maxRank}</p>
        </div>
        <div class="col-12 col-xl-9">${rankScale(rank, maxRank, palette)}</div>
        </div>`;
    });

    const summary = `<h2>${esc(pc.slice(0, -3) + ' ' + pc.slice(-3))}</h2>
        <table class="table lookup-table">
            <tbody>
                <tr><th scope="row">Super Output Area (SOA)</th><td>${esc(cleanName(area.label))} (${esc(soa)})</td></tr>
                <tr><th scope="row">Local Government District</th><td>${esc(councils[lgd] || lgd)} (${esc(lgd)})</td></tr>
                <tr><th scope="row">Urban/Rural Classification</th><td>${esc(sentenceCase(settlement))}</td></tr>
            </tbody>
        </table>
        `
    
    // const scales = `
    // <h3 class="mt-4">Rank in each type of deprivation</h3>
    // <div class="bg-light rounded p-3 mb-4">${rows[0]}</div>
    // <h3>Types of deprivation that make up the overall rank</h3>
    // ${rows.slice(1).join('')};
    // `;
    const overallRank = area.ranks[0];
    const decile = Math.ceil(overallRank / maxRank * 10);
    const band = decile <= 5
        ? `${decile * 10}% most deprived`
        : `${(11-decile) * 10}% least deprived`;
    const scales = `
    <h3 class="mt-4 mb-1">Multiple Deprivation Measure</h3>
    <p class="fs-5">Among the <strong>${band}</strong> areas in Northern Ireland</p>
    <div class="overall-scale">${rankScale(overallRank,maxRank,palette,'below')}</div>
    <hr class="border-dark opacity-100 my-4">
    <h4 class="mb-3">What makes up the overall rank</h4>
    ${rows.slice(1).join('')}`;

    document.getElementById('summary').innerHTML = summary;
    document.getElementById('scales').innerHTML = scales;
}



showDetails();