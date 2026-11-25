function cleanPostcode(text) {
    return text.toUpperCase().replace(/\s+/g, ''); // replaces all whitespaces
}

document.getElementById('search').addEventListener('submit', (event) => {
    event.preventDefault();
    const pc = cleanPostcode(document.getElementById('pc').value);
    const error = document.getElementById('search-error');
    if (!/^BT\d{1,2}\d[A-Z]{2}$/.test(pc)) { // must start with BT, 1/2 digits, another digit then 2 letters
        error.textContent = 'Enter a full Northern Ireland postcode, for example BT1 1AA.';
        error.hidden = false;
        return;
    }
    location.href = 'details.html?pc=' + encodeURIComponent(pc);
});