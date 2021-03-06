const API_ROUTE = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48';
const DME_COORDS = [55.410307, 37.902451];
const KNOT_COEFFICIENT = 1.852;
const FOOT_COEFFICIENT = 0.3048;
const fillAction = (data) => { return { type: 'FILL', data } };
const changeCssModeAction = (mode) => { return { type: 'CHANGE_CSS_MODE', mode } };
const changeSortModeAction = (mode) => { return { type: 'CHANGE_SORT_MODE', mode } };
const addOpacityRowAction = (rowNum) => { return { type: 'ADD_OPACITY_ROW', rowNum } };
const removeOpacityRowAction = (rowNum) => { return { type: 'REMOVE_OPACITY_ROW', rowNum } };

if (localStorage.selectedRows === undefined) localStorage.selectedRows = JSON.stringify([]);

let initialState = {
    data: {},
    sortMode: false,
    cssMode: false,
    selectedRows: JSON.parse(localStorage.selectedRows)
};


function reducer(state, action) {
    switch (action.type) {
        case 'FILL':
            return {...state, ... { data: action.data } };
        case 'CHANGE_CSS_MODE':
            return {...state, ... { cssMode: action.mode } };
        case 'CHANGE_SORT_MODE':
            return {...state, ... { sortMode: action.mode } };
        case 'ADD_OPACITY_ROW':
            {
                let sR = store.getState().selectedRows;
                sR.push(action.rowNum);
                localStorage.selectedRows = JSON.stringify(sR); // saving selected rows to the localStorage
                return {...state, ... { selectedRows: sR } };
            };
        case 'REMOVE_OPACITY_ROW':
            {
                let sR = store.getState().selectedRows.filter(row => row !== action.rowNum);
                localStorage.selectedRows = JSON.stringify(sR); // saving selected rows to the localStorage
                return {...state, ... { selectedRows: sR } };
            }
    }
}
//dispatch callback function
function dispatchCallback() {
    // filling table
    // console.log(store.getState());
    let stylesButton = document.getElementById('stylesButton');
    stylesButton.innerText = store.getState().cssMode ? 'включить стили' : 'отключить стили';

    let table = document.getElementById('table');
    table.innerHTML = '';
    let airplanes = store.getState().data;
    airplanes.sort((a, b) => a.rangeToDME - b.rangeToDME);
    store.getState().sortMode && airplanes.reverse(); // sorting changing
    airplanes.forEach((ap, i) => {
        const row = document.createElement('div');
        row.className = 'row';

        row.addEventListener('click', () => {
            if (store.getState().selectedRows.includes(i))
                store.dispatch(removeOpacityRowAction(i))
            else
                store.dispatch(addOpacityRowAction(i))

        }); // row selecting event
        store.getState().selectedRows.includes(i) && (row.style = 'opacity: 0.2') // includes check

        Object.keys(ap).forEach(key => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.innerText = ap[key];
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
}

const store = createStore(reducer, initialState); // create store
store.subscribe(dispatchCallback); // subscribe to state updating

// range to dme
function getRangeToDME(coords) {
    return Math.sqrt(
        Math.pow(coords[0] - DME_COORDS[0], 2) +
        Math.pow(coords[1] - DME_COORDS[1], 2)
    );
}

// converter to valid data obj
function converter(key, dataObj) {
    return {
        flightNum: `${dataObj[13]}/${dataObj[16]}`,
        coordinates1: dataObj[1],
        coordinates2: dataObj[2],
        speed: (dataObj[5] * KNOT_COEFFICIENT).toFixed(2),
        degreesDirection: dataObj[3],
        altitude: (dataObj[4] * FOOT_COEFFICIENT).toFixed(2),
        departureAirport: dataObj[11],
        arrivalAirport: dataObj[12],
        rangeToDME: getRangeToDME([dataObj[1], dataObj[2]]) * 1000
    }
}

function stylesButtonAction() {
    let table = document.getElementById('table');

    table.className = store.getState().cssMode ? 'table' : '';

    store.dispatch(changeCssModeAction(!store.getState().cssMode));
}

function sortModeButtonAction() {
    store.dispatch(changeSortModeAction(!store.getState().sortMode));
}

fetch(API_ROUTE, {
    method: 'GET',
}).then((response) => response.json()).then((body) => {
    let airplanes = [];
    Object.keys(body)
        .filter(key => typeof body[key] === "object")
        .forEach(key => airplanes.push(converter(key, body[key])));
    store.dispatch(fillAction(airplanes));
});

setInterval(
    () => {
        console.log(store.getState());
        fetch(API_ROUTE, {
            method: 'GET',
        }).then((response) => response.json()).then((body) => {
            let airplanes = [];
            Object.keys(body)
                .filter(key => typeof body[key] === "object")
                .forEach(key => airplanes.push(converter(key, body[key])));
            store.dispatch(fillAction(airplanes));
        });
    },
    3000
);