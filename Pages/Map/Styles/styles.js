import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";


export function lineStyle(color){
    return new Style({
        stroke: new Stroke({
            color: color,
            width: 3
        })
    });
}


export function pointStyle(color){
    return new Style({
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({
                color: 'white'
            }),
            stroke: new Stroke({
                color: color,
                width: 2
            })
        })
    });
}