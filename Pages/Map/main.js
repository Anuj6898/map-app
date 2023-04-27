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
import {getAllData, getData} from "./Apis/latLong.js"
import {BoatConfig, CENTRE_POINT_X, CENTRE_POINT_Y, DEFAULT_BOAT_ID, INTO_METERS, RADIUS} from "./constants";
import { sqrt } from "math";

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
  layers: [
      tileLayer,
      vector
  ],
  target: 'map',
  view: new View({
    center: [8110000, 2155000],
    zoom: 14,
    multiWorld: true,
  }),
});


async function addDataInMap(boatId, coordinates) {
  var lineColor = BoatConfig[DEFAULT_BOAT_ID]["lineColor"]
  var pointColor = BoatConfig[DEFAULT_BOAT_ID]["pointColor"]
  if(BoatConfig[boatId]){
    lineColor = BoatConfig[boatId]["lineColor"]
    pointColor = BoatConfig[boatId]["pointColor"]
  }

  // coordinates.sort()

  let pointFeatures = coordinates.map(point => {
    let geom = new Point(fromLonLat([point[0], point[1]]));
    let feature = new Feature(geom);
    feature.setStyle(pointStyle(pointColor))
    return feature;
  });
  source.addFeatures(pointFeatures);
  console.log("Sources", source)

  if (coordinates.length > 1) {
    let lineCoords = coordinates.map(point => {
      return fromLonLat(point);
    });
    let geom = new LineString(lineCoords);
    let feature = new Feature(geom);
    feature.setStyle(lineStyle(lineColor));
    source.addFeature(feature);
  }
}

async function isPointOutSideZone(x, y){
  console.log("ispoint side zone", x, y)
  var result = (CENTRE_POINT_X - x) ** 2 + (CENTRE_POINT_Y - y) ** 2
  var result2 = sqrt(result)
  console.log("result", result2, result2 * INTO_METERS, result2 * INTO_METERS > RADIUS)
  return result2 * INTO_METERS > RADIUS;
}

async function loadMap() {
  let response = await getAllData()
  let data = response.data

  for (let key in data) {
    // let coordinates = data[key].map(obj => [obj.longitude, obj.latitude])
    let coordinates = []
    var flag = 0
    let data_key = data[key]
    for(var i = 0; i < data_key.length; i ++){
      var obj = data_key[i]
      if(await isPointOutSideZone(obj.latitude, obj.longitude)){
        // coordinates.push([obj.longitude, obj.latitude, true])
        // flag = 1
      } else {
        coordinates.push([obj.longitude, obj.latitude, false])
      }

    }
    addDataInMap(key, coordinates)
  }
}

// loadMap()


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
loadMap()
// window.setInterval(loadMap, 3000)

