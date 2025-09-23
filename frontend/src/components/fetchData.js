const ERDDAP_BASE_URL =
    'https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.json';

// Variables in the desired order
const VARIABLES = ['latitude', 'longitude', 'pres', 'time', 'temp', 'psal'];

// Constraints
const CONSTRAINTS = {
    longitude: { min: -75.0, max: -45.0 },
    latitude: { min: 20.0, max: 30.0 },
    pres: { min: 0.0, max: 10.0 },
    time: { start: '2011-01-01T00:00:00Z', end: '2011-12-31T23:59:59Z' },
};

// Build properly encoded ERDDAP URL
function buildErddapUrl(baseUrl, variables, constraints) {
    const vars = variables.join(',');

    const constraintStr = variables
        .map((v) => {
            switch (v) {
                case 'longitude':
                    return `longitude>=${constraints.longitude.min}&longitude<=${constraints.longitude.max}`;
                case 'latitude':
                    return `latitude>=${constraints.latitude.min}&latitude<=${constraints.latitude.max}`;
                case 'pres':
                    return `pres>=${constraints.pres.min}&pres<=${constraints.pres.max}`;
                case 'time':
                    return `time>=${constraints.time.start}&time<=${constraints.time.end}`;
                default:
                    return '';
            }
        })
        .filter(Boolean)
        .join('&');

    return encodeURI(`${baseUrl}?${vars}&${constraintStr}`);
}

async function fetchArgoData() {
    const url = buildErddapUrl(ERDDAP_BASE_URL, VARIABLES, CONSTRAINTS);
    console.log('Fetching from:', url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    // Transform TableDAP rows into objects
    const columns = data.table.columnNames;
    const rows = data.table.rows.map((row) =>
        columns.reduce((obj, key, i) => ({ ...obj, [key]: row[i] }), {})
    );

    console.log('Transformed data:', rows);
    return rows;
}

// Usage
// CORS issue
fetchArgoData().catch((err) => console.error(err));
