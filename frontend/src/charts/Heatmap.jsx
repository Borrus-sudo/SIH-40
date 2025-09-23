import { Map } from 'react-map-gl/maplibre';
import { DeckGL } from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import * as Read from '../api/utils';
import { fetchMeasurements } from '../api/fetch';
import { useState, useEffect } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW_STATE = {
    longitude: -60,
    latitude: 25,
    zoom: 9,
    maxZoom: 16,
    pitch: 0,
    bearing: 0,
};

const MAP_STYLE =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default function Heatmap() {
    const [points, setPoints] = useState([]);
    const [controls, setControls] = useState(INITIAL_VIEW_STATE);

    useEffect(() => {
        fetchMeasurements().then(setPoints);
    }, []);

    const layers = [
        new HeatmapLayer({
            data: points,
            id: 'heatmap-layer',
            pickable: false,
            getPosition: (d) => Read.getCoords(d),
            getWeight: (d) => Read.getTemp(d),
            intensity: 1,
            threshold: 0.03,
            radiusPixels: 30,
        }),
    ];

    return (
        <DeckGL initialViewState={controls} controller={true} layers={layers}>
            <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
    );
}
