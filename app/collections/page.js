'use client';

import { useState, useRef } from 'react';
import UserCollectionsSection from '@/components/UserCollectionsSection';
import MainOsuverseDiv from '@/components/MainOsuverseDiv';
import TagsSection from '@/components/TagSections.jsx/TagSections';
import { Edit, Tag, Database, Download, Upload } from 'lucide-react';
import './collections.scss';
import CollectionsManager from '@/components/CollectionsManager';
import { useAtom } from "jotai";
import { collectionsAtom } from "@/store/collectionAtom";
import { loadTestCollectionsData } from '@/utils/testCollectionsData';

export default function Collections() {
  const [editMode, setEditMode] = useState(false);
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [rowCount, setRowCount] = useState(2);
  const fileInputRef = useRef(null);

  // Funkcja do wczytania danych testowych
  const handleLoadTestData = () => {
    loadTestCollectionsData(setCollections);
  };

  const addNotification = (type, message) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);
    // Auto close after 15s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 15000);
  };

  const stripUIFields = (state) => {
    const {
      expandedCollection,
      expandedSubcollection,
      editingCollectionId,
      editingSubcollectionId,
      editingName,
      errors,
      validationStates,
      showTagSelector,
      ...data
    } = state || {};
    return data;
  };

  const handleExport = () => {
    try {
      const data = stripUIFields(collections);
      const payload = {
        schema: 'osuverse.collections',
        version: { major: 1, minor: 0 },
        exportedAt: new Date().toISOString(),
        data: {
          collections: data.collections || [],
          beatmaps: data.beatmaps || {},
          beatmapsets: data.beatmapsets || {},
          tags: data.tags || {}
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osuverse-collections-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      addNotification('error', `Export failed: ${e.message || e}`);
    }
  };

  const validateImport = (obj) => {
    if (!obj || typeof obj !== 'object') throw new Error('File is not a JSON object');
    if (obj.schema !== 'osuverse.collections') throw new Error('Invalid schema');
    if (!obj.version || typeof obj.version.major !== 'number') throw new Error('Missing version');
    if (!obj.data || typeof obj.data !== 'object') throw new Error('Missing data');
    const { collections, beatmaps, beatmapsets, tags } = obj.data;
    if (!Array.isArray(collections)) throw new Error('data.collections must be an array');
    if (beatmaps && typeof beatmaps !== 'object') throw new Error('data.beatmaps must be an object');
    if (beatmapsets && typeof beatmapsets !== 'object') throw new Error('data.beatmapsets must be an object');
    if (tags && typeof tags !== 'object') throw new Error('data.tags must be an object');
    return obj.data;
  };

  const handleImportFile = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const data = validateImport(json);
      // Zbuduj nowy stan z resetem pól UI
      const newState = {
        collections: data.collections || [],
        beatmaps: data.beatmaps || {},
        beatmapsets: data.beatmapsets || {},
        tags: data.tags || {},
        expandedCollection: null,
        expandedSubcollection: null,
        editingCollectionId: null,
        editingSubcollectionId: null,
        editingName: '',
        errors: {},
        validationStates: { collection: { isValid: true, message: '' }, subcollections: {} },
        showTagSelector: false
      };
      setCollections(newState);
      setImportOpen(false);
      addNotification('success', 'Import Successful');
    } catch (e) {
      setImportError(e.message || String(e));
      addNotification('error', `Import failed: ${e.message || e}`);
    }
  };

  return (
    <MainOsuverseDiv className={`collections-container`}>
      <div className="collections-header">
        <h1 style={{ fontSize: 32, color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Collections</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Layout selector */}
          <div className="collections-layout-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: '#b8a6c1' }}>Layout</label>
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(234,129,251,0.35)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
            >
              <option value={1}>1 column</option>
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
            </select>
          </div>
          {/* Import / Export */}
          <button
            onClick={() => setImportOpen(true)}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(100, 200, 255, 0.2)',
              border: '1px solid #64c8ff', color: 'white', display: 'flex',
              alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <Upload size={16} /> Import
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(234, 129, 251, 0.2)',
              border: '1px solid #ea81fb', color: 'white', display: 'flex',
              alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <Download size={16} /> Export
          </button>
          
          {/* Przycisk do wczytania danych testowych */}
          <button
            onClick={handleLoadTestData}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(100, 200, 255, 0.2)',
              border: '1px solid #64c8ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <Database size={16} /> Load Test Data
          </button>
          
          <button 
            className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: editMode ? 'rgba(234, 129, 251, 0.4)' : 'rgba(234, 129, 251, 0.2)',
              border: '1px solid #ea81fb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {editMode ? (
              <>
                <Tag size={16} /> Display Mode
              </>
            ) : (
              <>
                <Edit size={16} /> Edit Mode
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Import Modal */}
      {importOpen && (
        <div
          className="import-modal-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setImportOpen(false)}
          onKeyDown={(e)=>{ if(e.key==='Escape'){ e.stopPropagation(); setImportOpen(false); } }}
          tabIndex={-1}
        >
          <div
            className="import-modal"
            style={{ width: 'min(640px, 95vw)', background: '#2f0f3a', border: '1px solid #ea81fb', borderRadius: 12, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ color: '#ea81fb', margin: 0 }}>Import Collections</h3>
              <button onClick={() => setImportOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setImportError('');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleImportFile(e.dataTransfer.files[0]);
                }
              }}
              style={{
                border: '2px dashed rgba(234,129,251,0.5)', borderRadius: 10, padding: 20,
                textAlign: 'center', color: '#ffcae6', background: 'rgba(234,129,251,0.05)'
              }}
            >
              <p style={{ margin: 0, marginBottom: 8 }}>Select or Drop Collection File</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={(e) => {
                  setImportError('');
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                }}
                style={{ marginTop: 8 }}
              />
            </div>
            {importError && (
              <div style={{ marginTop: 10, color: '#ff7eba' }}>Error: {importError}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setImportOpen(false)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(100,200,255,0.2)', border: '1px solid #64c8ff', color: '#fff' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div style={{ position: 'fixed', right: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2100 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            minWidth: 260,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid',
            borderColor: n.type === 'success' ? '#3ddc84' : '#ff7eba',
            background: n.type === 'success' ? 'rgba(61,220,132,0.15)' : 'rgba(255,126,186,0.15)',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div>{n.message}</div>
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Komponent sekcji tagów - wyświetlany tylko w trybie wyświetlania */}
      {!editMode && <TagsSection />}
      {editMode && (
        <div style={{ marginBottom: 12 }}>
          <CollectionsManager />
        </div>
      )}
      
      <UserCollectionsSection editMode={editMode} rowCount={rowCount} />
    </MainOsuverseDiv>
  );
}