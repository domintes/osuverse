import { useState } from 'react';
import useBeatmapStore from '../../stores/beatmapStore';

export default function CollectionExport({ onClose }) {
    const [selectedCollections, setSelectedCollections] = useState(new Set());
    const [exportFormat, setExportFormat] = useState('osu');
    const { collections } = useBeatmapStore();

    // Eksport kolekcji
    const handleExport = () => {
        const selectedData = Array.from(selectedCollections).map(id => {
            const collection = collections.get(id);
            return {
                id: collection.id,
                name: collection.name,
                beatmaps: Array.from(collection.beatmaps.entries()).map(([id, data]) => ({
                    id,
                    tags: Array.from(data.tags)
                })),
                createdAt: collection.createdAt,
                updatedAt: collection.updatedAt
            };
        });

        // Format eksportu
        let exportData;
        if (exportFormat === 'osu') {
            exportData = selectedData.map(collection => ({
                ...collection,
                format: 'osu',
                version: '1.0.0'
            }));
        } else {
            exportData = selectedData;
        }

        // Tworzenie i pobieranie pliku
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `osuverse_collections_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import kolekcji
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // TODO: Dodać logikę importu do store'a
                console.log('Zaimportowane dane:', importedData);
            } catch (error) {
                console.error('Błąd podczas importu:', error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="collection-export void-container">
            <div className="export-header">
                <h3>Export/Import Collections</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="export-content">
                <div className="export-section">
                    <h4>Select Collections to Export</h4>
                    <div className="collections-list">
                        {Array.from(collections.values()).map(collection => (
                            <label key={collection.id} className="collection-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedCollections.has(collection.id)}
                                    onChange={(e) => {
                                        const newSelected = new Set(selectedCollections);
                                        if (e.target.checked) {
                                            newSelected.add(collection.id);
                                        } else {
                                            newSelected.delete(collection.id);
                                        }
                                        setSelectedCollections(newSelected);
                                    }}
                                />
                                <span className="checkbox-custom" />
                                <span className="collection-name">{collection.name}</span>
                                <span className="beatmap-count">
                                    {collection.beatmaps.size} beatmaps
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="export-options">
                        <label className="format-select">
                            <span>Export Format:</span>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                            >
                                <option value="osu">osu! Collection (.json)</option>
                                <option value="raw">Raw Data (.json)</option>
                            </select>
                        </label>
                    </div>

                    <button
                        className="export-btn"
                        onClick={handleExport}
                        disabled={selectedCollections.size === 0}
                    >
                        Export Selected Collections
                    </button>
                </div>

                <div className="import-section">
                    <h4>Import Collections</h4>
                    <div className="import-dropzone">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            id="collection-import"
                        />
                        <label htmlFor="collection-import">
                            <div className="dropzone-content">
                                <span className="icon">📁</span>
                                <span className="text">
                                    Drop collection file here or click to select
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
