export const collectionReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_COLLECTION':
            return [...state, action.payload];
        default:
            return state;
    }
};
