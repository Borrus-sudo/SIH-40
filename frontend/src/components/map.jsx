import { useState, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { createClient } from '@supabase/supabase-js';

const MAP_STYLE =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'; // free basemap

const INITIAL_VIEW_STATE = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12,
    pitch: 0,
    bearing: 0,
};

const supabaseURL = 'https://faeqtixmrdxqlhxitvcu.supabase.co/';
const key = import.meta.env.PUB_KEY; // ✅ safer naming convention (VITE_)
const supabase = createClient(supabaseURL, key);

async function loadData() {
    const { data, error } = await supabase.from('measurements').select('*');
    if (error) {
        console.error('Supabase error:', error);
        return [];
    }
    return data;
}

export default function MapWithDeck() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [data, setData] = useState([]);

    useEffect(() => {
        loadData().then((rows) => {
            setData(rows);
        });
    }, []);

    // Create the Hexagon layer once data is fetched
    const layers = [
        new HexagonLayer({
            id: 'hexagon-layer',
            data,
            gpuAggregation: true,
            extruded: true,
            getPosition: (d) => [d.longitude, d.latitude], // ✅ map your table’s columns
            getColorWeight: (d) => d.temperature ?? 1,
            getElevationWeight: (d) => d.temperature ?? 1,
            elevationScale: 4,
            radius: 200,
            pickable: true,
            colorRange: [
                [1, 152, 189],
                [73, 227, 206],
                [216, 254, 181],
                [254, 237, 177],
                [254, 173, 84],
                [209, 55, 78],
            ],
        }),
    ];

    return (
        <div className="w-screen h-screen">
            <DeckGL
                initialViewState={viewState}
                controller={true}
                layers={layers}
                onViewStateChange={(e) => setViewState(e.viewState)}
            >
                <Map
                    reuseMaps
                    mapLib={import('maplibre-gl')}
                    mapStyle={MAP_STYLE}
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                >
                    <NavigationControl position="top-left" />
                </Map>
            </DeckGL>
        </div>
    );
}
