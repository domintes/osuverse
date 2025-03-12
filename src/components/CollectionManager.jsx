import { useState } from 'react';
import useStore from '../store';
import { styled } from '@linaria/react';

const CollectionManagerContainer = styled.div`
    padding: 1rem;
    background: #1a1a1a;
    border-radius: 8px;
    margin: 1rem 0;
`;

const Form = styled.form`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    flex: 1;
    padding: 0.5rem;
    background: #2a2a2a;
    border: 1px solid #333;
    color: #fff;
    border-radius: 4px;
`;

const CollectionsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const CollectionButton = styled.button`
    padding: 0.5rem 1rem;
    background: #333;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;

    &:hover {
        background: #444;
    }
`;

export default function CollectionManager({ beatmap }) {
    const [newCollectionName, setNewCollectionName] = useState('');
    const { collections, createCollection, addBeatmapToCollection } = useStore();

    const handleCreateCollection = (e) => {
        e.preventDefault();
        if (newCollectionName.trim()) {
            createCollection(newCollectionName.trim());
            setNewCollectionName('');
        }
    };

    const handleAddToCollection = (collectionName) => {
        addBeatmapToCollection(collectionName, beatmap);
    };

    return (
        <CollectionManagerContainer>
            <Form onSubmit={handleCreateCollection}>
                <Input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name..."
                />
                <CollectionButton type="submit">Create Collection</CollectionButton>
            </Form>
            
            <CollectionsList>
                <h3>Add to collection:</h3>
                {Object.keys(collections).map((collectionName) => (
                    <CollectionButton
                        key={collectionName}
                        onClick={() => handleAddToCollection(collectionName)}
                    >
                        {collectionName}
                    </CollectionButton>
                ))}
            </CollectionsList>
        </CollectionManagerContainer>
    );
}
