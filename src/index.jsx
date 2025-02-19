import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { CollectionProvider } from './context/CollectionContext';

ReactDOM.render(
    <CollectionProvider>
        <App />
    </CollectionProvider>,
    document.getElementById('root')
);
