import React, { useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';

const MAP_STYLE =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'; // free basemap

const INITIAL_VIEW_STATE = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12,
    pitch: 0,
    bearing: 0,
};

export default function MapWithDeck() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    // Example LineLayer
    const layers = [
        new LineLayer({
            id: 'line-layer',
            data: [
                { source: [-122.45, 37.78], target: [-122.4, 37.8] },
                { source: [-122.45, 37.78], target: [-122.48, 37.73] },
            ],
            getSourcePosition: (d) => d.source,
            getTargetPosition: (d) => d.target,
            getColor: [255, 0, 0],
            getWidth: 5,
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
