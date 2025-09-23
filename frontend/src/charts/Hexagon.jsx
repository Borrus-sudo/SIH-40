import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { DeckGL } from '@deck.gl/react';
import * as Read from '../api/utils';
import { fetchMeasurements } from '../api/fetch';
import { useState, useEffect } from 'react';

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
});

const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
    ambientLight,
    pointLight1,
    pointLight2,
});

const INITIAL_VIEW_STATE = {
    longitude: -60,
    latitude: 25,
    zoom: 9,
    maxZoom: 16,
    pitch: 60,
    bearing: 30,
};
const getRadius = (zoom) => {
    if (zoom < 5) return 50000; // 50 km for wide view
    if (zoom < 8) return 20000; // 20 km
    if (zoom < 12) return 5000; // 5 km
    return 1000; // 1 km for city-level
};

const MAP_STYLE =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const colorRange = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];

function getTooltip({ object }) {
    if (!object) {
        return null;
    }
    const [long, lat] = Read.getCoords(object);
    const temp = Read.getTemp(object);

    return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(long) ? lng.toFixed(6) : ''}
    ${temp} Temperature`;
}

export default function Hexagon() {
    const [points, setPoints] = useState([]);
    const [controls, setControls] = useState(INITIAL_VIEW_STATE);

    useEffect(() => {
        fetchMeasurements().then(setPoints);
    }, []);

    const layers = [
        new HexagonLayer({
            id: 'hexagon',
            gpuAggregation: true,
            colorRange,
            data: points,
            elevationRange: [0, 3000],
            elevationScale: 50,
            getElevationWeight: (d) => 100 * Read.getTemp(d), // use your temp as weight
            getColorWeight: (d) => 100 * Read.getTemp(d),
            // extruded: true,
            getPosition: (d) => Read.getCoords(d),
            pickable: true,
            material: {
                ambient: 0.64,
                diffuse: 0.6,
                shininess: 32,
                specularColor: [51, 51, 51],
            },

            transitions: {
                elevationScale: 3000,
            },
            mapStyle: MAP_STYLE,
            radius: getRadius(INITIAL_VIEW_STATE),
            upperPercentile: 100,
            coverage: 1,
        }),
    ];

    return (
        <DeckGL
            layers={layers}
            effects={[lightingEffect]}
            initialViewState={controls}
            controller={true}
            getTooltip={getTooltip}
        >
            <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
    );
}
