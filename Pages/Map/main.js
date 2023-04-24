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
import {BoatConfig} from "./constants";


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


async function addDataInMap(boatId, coordinates) {
  const lineColor = BoatConfig[boatId]["lineColor"]
  const pointColor = BoatConfig[boatId]["pointColor"]
  coordinates.sort()

  let pointFeatures = coordinates.map(point => {
    let geom = new Point(fromLonLat(point));
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


let result = {
  "1": [
    [ 72.87129833333333, 19.02124 ],
    [ 72.8722072112705, 19.022486883444827 ],
    [ 72.8717249624107, 19.021112912277605 ],
    [ 72.87194808539974, 19.021814590997296 ],
    [ 72.87264912891828, 19.022731462758387 ],
    [ 72.87296472056748, 19.022359792961505 ],
    [ 72.87369534803419, 19.022652422979674 ],
    [ 72.87407977988146, 19.021825192659693 ],
    [ 72.87419921678132, 19.02252111572918 ],
    [ 72.8730512732237, 19.021863325485146 ]
  ],
  "2": [
    [ 72.87049005307729, 19.022096178311442 ],
    [ 72.87138890071002, 19.022250130372607 ],
    [ 72.87071627457045, 19.023623058296072 ],
    [ 72.87176135109955, 19.02399735965082 ],
    [ 72.87215950827513, 19.02307062328522 ],
    [ 72.87243438036985, 19.022355290140953 ],
    [ 72.87126908485081, 19.02258620637172 ],
    [ 72.87033372410158, 19.023679690461365 ],
    [ 72.87012949045794, 19.023246388811624 ],
    [ 72.87086650316967, 19.023291300916934 ]
  ],
  "3": [
    [ 72.87196449967084, 19.018225933032788 ],
    [ 72.87213539934585, 19.020124088804216 ],
    [ 72.87141070671363, 19.01757610635317 ],
    [ 72.87066032735646, 19.01708088008981 ],
    [ 72.87139334062138, 19.0149173118458 ],
    [ 72.87174734076103, 19.016300062097212 ],
    [ 72.87239633384189, 19.01883519740361 ],
    [ 72.8731338057982, 19.016416826774076 ],
    [ 72.8729896473579, 19.013898749509465 ]
  ]
}


async function loadMap() {
  let response = await getAllData()
  let data = response.data

  for (let key in data) {
    let coordinates = data[key].map(obj => [obj.longitude, obj.latitude])
    console.log(coordinates, "key", key)
    addDataInMap(key, coordinates)
  }
}

loadMap()


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

