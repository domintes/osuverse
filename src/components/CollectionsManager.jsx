'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { addCollection, removeCollection, editCollection, addSubcollection, removeSubcollection, editSubcollection } from '@/store/reducers/actions';

export default function CollectionsManager() {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    dispatch(addCollection(newCollectionName.trim()));
    setNewCollectionName('');
  };

  return (
    <div className="collections-manager" style={{
      margin: '10px 0 14px',
      padding: 12,
      borderRadius: 10,
      background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
      border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)'
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
  <strong style={{ color: 'var(--accent)' }}>Manage Collections</strong>
        <input
          type="text"
          value={newCollectionName}
          onChange={e => setNewCollectionName(e.target.value)}
          placeholder="New collection name"
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff'
          }}
        />
  <button onClick={handleAddCollection} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--accent)', background: 'color-mix(in oklab, var(--accent) 25%, transparent)', color: 'var(--text)' }}>Add</button>
      </div>

      <div className="collections-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.collections.map(col => (
          <div key={col.id} data-collection-id={col.id} style={{ padding: 8, borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                defaultValue={col.name}
                onBlur={e => dispatch(editCollection(col.id, e.target.value))}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#fff'
                }}
              />
              {!col.isSystemCollection && (
                <button
                  onClick={() => dispatch(removeCollection(col.id))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--accent)',
                    background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
                    color: '#fff'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <div style={{ marginTop: 8, paddingLeft: 8 }}>
              <SubcollectionsEditor collection={col} onAdd={(name) => dispatch(addSubcollection(col.id, name))} onEdit={(subId, name) => dispatch(editSubcollection(col.id, subId, name))} onRemove={(subId) => dispatch(removeSubcollection(col.id, subId))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubcollectionsEditor({ collection, onAdd, onEdit, onRemove }) {
  const [newName, setNewName] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New subcollection name"
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff'
          }}
        />
        <button onClick={() => { if (newName.trim()) { onAdd(newName.trim()); setNewName(''); } }} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #64c8ff', background: 'rgba(100,200,255,0.2)', color: '#fff' }}>Add sub</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {collection.subcollections?.map(sub => (
          <div key={sub.id} data-subcollection-id={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              defaultValue={sub.name}
              onBlur={e => onEdit(sub.id, e.target.value)}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
                background: 'rgba(0,0,0,0.2)',
                color: '#fff'
              }}
            />
            <button
              onClick={() => onRemove(sub.id)}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--accent)',
                background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
                color: '#fff'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
