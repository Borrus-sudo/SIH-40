const ERDDAP_BASE_URL =
    'https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.json';

// Variables in the desired order
const VARIABLES = ['latitude', 'longitude', 'pres', 'time', 'temp', 'psal'];

const SAMPLE_CONSTRAINTS = {
    longitude: { max: -175.0, min: -200.0 },
    latitude: { min: 10.0, max: 50.0 },
    pres: { min: 0, max: 10.0 },
    time: { start: '2011-01-01T00:00:00Z', end: '2011-01-31T23:59:59Z' },
};

// Build ERDDAP URL
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

    return `${baseUrl}?${vars}&${constraintStr}`;
}

let cachedRows = [];
// Front-end fetch using your Edge Function proxy
export async function fetchMeasurements(constraints) {
    if (cachedRows.length > 0) return cachedRows;
    constraints = constraints || SAMPLE_CONSTRAINTS;
    const targetUrl = buildErddapUrl(ERDDAP_BASE_URL, VARIABLES, constraints);
    console.log(targetUrl);
    // Replace with your deployed Edge Function URL
    const edgeProxyUrl =
        'https://kulyhcbjpmmogzomukyj.supabase.co/functions/v1/proxy';

    const res = await fetch(edgeProxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }), // send target URL to proxy
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    // Transform TableDAP rows into objects
    const columns = data.table.columnNames;
    const rows = data.table.rows.map((row) =>
        columns.reduce((obj, key, i) => {
            obj[key] = row[i];
            return obj;
        }, {})
    );
    cachedRows = rows;
    return rows;
}

// fetchMeasurements(SAMPLE_CONSTRAINTS).catch((err) => console.error(err));
