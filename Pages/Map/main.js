import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Circle as CircleStyle, Stroke, Style } from 'ol/style.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { easeOut } from 'ol/easing.js';
import { fromLonLat } from 'ol/proj.js';
import { getVectorContext } from 'ol/render.js';
import { unByKey } from 'ol/Observable.js';
import {Circle, LineString, MultiPoint} from 'ol/geom';
import {Fill} from "ol/style";
import {lineStyle, pointStyle} from "./Styles/styles.js"
import {getData} from "./Apis/latLong.js"



const tileLayer = new TileLayer({
  source: new OSM({
    wrapX: false,
  }),
});

const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});


const map = new Map({
  layers: [tileLayer, vector],
  target: 'map',
  view: new View({
    center: [8110000, 2155000],
    zoom: 14,
    multiWorld: true,
  }),
});

async function addFeature() {
  var pointsArray = []
  pointsArray = await getData().then(x => { return x })
  let pointFeatures = pointsArray.map(point => {
    let geom = new Point(fromLonLat(point));
    let feature = new Feature(geom);
    feature.setStyle(pointStyle("blue"))
    return feature;
  });
  source.addFeatures(pointFeatures);

  if (pointsArray.length > 1) {
    let lineCoords = pointsArray.map(point => {
      return fromLonLat(point);
    });
    let geom = new LineString(lineCoords);
    let feature = new Feature(geom);
    feature.setStyle(lineStyle("red"));
    source.addFeature(feature);
  }
}


const duration = 5000;
function flash(feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = tileLayer.on('postrender', animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.15 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    // tell OpenLayers to continue postrender animation
    map.render();
  }
}

// source.on('addfeature', function (e) {
//   flash(e.feature);
// });

// window.setInterval(addRandomFeature, 2000)
addFeature()