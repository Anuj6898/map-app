import {AUTH_TOKEN, BACKEND_SERVICE_URL, SERVICE_URL_CYCLIC} from "../../../configurations";


export function getData() {
    return fetch(SERVICE_URL_CYCLIC)
        .then(res => res.json())
        .then(data => {
            let arr = []
            data.map((x) => {
                arr.push([x.longitude, x.latitude])
            })
            return arr
        })
}

export function getAllData() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${BACKEND_SERVICE_URL}/api/latlongs`, requestOptions)
        .then(response => response.json())
        .then(result => {
            return result
        })
        .catch(error => console.log('error', error));

}

// console.log(await getAllData())




let pointsArray = [
  [
    8111995.823911391,
    2157436.7405757667
  ],
  [
    8112092.671868383,
    2157465.196564629
  ],
  [
    8112392.671868383,
    2157465.196564629
  ],
  [
    8112592.671868383,
    2157465.196564629
  ]
]

let result = {
    "1": [
        [
            8111995.823911391,
            2157436.7405757667
        ],
        [
            8112092.671868383,
            2157465.196564629
        ],
        [
            8112392.671868383,
            2157465.196564629
        ],
        [
            8112592.671868383,
            2157465.196564629
        ]
    ],
    "2": [
        [
            8111895.823911391,
            2157436.7405757667
        ],
        [
            8112192.671868383,
            2157465.196564629
        ],
        [
            8112292.671868383,
            2157465.196564629
        ],
        [
            8112692.671868383,
            2157565.196564629
        ]
    ]
}
