import { useReducer } from 'react';
import { CollectionContext } from './CollectionContext';
import { collectionReducer } from './collectionReducer';

export const CollectionProvider = ({ children }) => {
    
    const [collection, dispatch] = useReducer(collectionReducer, []);

    return (
        <CollectionContext.Provider value={{ collection, dispatch }}>
            {children}
        </CollectionContext.Provider>
    );
};
