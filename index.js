let initialState = { data: {} };

// console.log(initialState)

function reducer(state = { data: {} }, action) {
    switch (action.type) {
        case 'FILL': return { data: action.data };
    }
}

const fillAction = (data) => { return { type: 'FILL', data } };

const store = createStore(reducer, initialState);



$(document).ready(() => {
    store.subscribe(() => console.log(store.getState()));
});


$.getJSON(
    'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48',
    (data) => store.dispatch(fillAction(data))
)



// console.log(store.getState());
