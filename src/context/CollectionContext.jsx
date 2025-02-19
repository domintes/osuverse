import { useReducer, createContext, useContext } from 'react';
import { collectionReducer } from './collectionReducer';

const CollectionContext = createContext();

export const useCollection = () => {
    return useContext(CollectionContext);
};

export { CollectionContext };

export const CollectionProvider = ({ children }) => {
    const [collection, dispatch] = useReducer(collectionReducer, []);

    return (
        <CollectionContext.Provider value={{ collection, dispatch }}>
            {children}
        </CollectionContext.Provider>
    );
};
