import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useBeatmapStore from '../stores/beatmapStore';
import CustomTags from '../components/CustomTags/CustomTags';
import './AddBeatmap.css';

const AddBeatmap = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { addBeatmap, collections } = useBeatmapStore();
  const [tags, setTags] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: URL input, 2: Full form
  const [beatmapUrl, setBeatmapUrl] = useState('');

  // Funkcja do walidacji URL beatmapy
  const validateBeatmapUrl = async () => {
    if (!beatmapUrl.trim()) {
      setError('Proszę podać URL beatmapy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sprawdź czy URL jest poprawny
      if (!beatmapUrl.includes('osu.ppy.sh/beatmapsets/')) {
        throw new Error('Nieprawidłowy URL. Musi zawierać "osu.ppy.sh/beatmapsets/"');
      }

      // Tutaj możesz dodać kod do pobierania danych beatmapy z URL
      // Na potrzeby tego przykładu, po prostu przejdziemy do kroku 2
      
      // Symulacja opóźnienia - zastąp to rzeczywistym pobieraniem danych
      setTimeout(() => {
        // Tutaj możesz wypełnić formularz danymi pobranymi z URL
        // Przykład:
        // setValue('title', beatmapData.title);
        // setValue('artist', beatmapData.artist);
        // itd.
        
        setStep(2);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas walidacji URL');
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Symulacja dodawania beatmapy
      const beatmapData = {
        ...data,
        id: Date.now(),
        tags,
        collections: selectedCollections,
        status: 'ranked',
        star_rating: parseFloat(data.star_rating) || 0,
        bpm: parseInt(data.bpm) || 0,
        covers: {
          cover: 'https://assets.ppy.sh/beatmaps/1189904/covers/cover.jpg'
        },
        url: beatmapUrl // Dodajemy URL do danych beatmapy
      };

      addBeatmap(beatmapData);
      setSuccess(true);
      reset();
      setTags([]);
      setSelectedCollections([]);
      setBeatmapUrl('');
      setStep(1); // Powrót do pierwszego kroku po pomyślnym dodaniu
      
      // Resetuj komunikat sukcesu po 3 sekundach
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas dodawania beatmapy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag) => {
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleCollection = (collectionId) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(selectedCollections.filter(id => id !== collectionId));
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  return (
    <div className="add-beatmap">
      <h1 className="add-beatmap__title">Dodaj nową beatmapę</h1>
      
      {step === 1 ? (
        // Krok 1: Wprowadzenie URL beatmapy
        <div className="add-beatmap__form">
          <div className="form-group">
            <label className="form-label">URL Beatmapy</label>
            <input 
              type="url" 
              className="form-input"
              placeholder="https://osu.ppy.sh/beatmapsets/..." 
              value={beatmapUrl}
              onChange={(e) => setBeatmapUrl(e.target.value)}
            />
            <p className="form-hint">
              Podaj link do beatmapy z osu.ppy.sh, np. https://osu.ppy.sh/beatmapsets/1189904
            </p>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="submit-button"
              onClick={validateBeatmapUrl}
              disabled={loading}
            >
              {loading ? 'Sprawdzanie...' : 'Dalej'}
            </button>
          </div>
          
          {error && (
            <div className="form-error-message">
              {error}
            </div>
          )}
        </div>
      ) : (
        // Krok 2: Pełny formularz z danymi beatmapy
        <form className="add-beatmap__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">URL Beatmapy</label>
            <input 
              type="url" 
              className="form-input"
              value={beatmapUrl}
              disabled
            />
            <button 
              type="button" 
              className="link-button"
              onClick={() => setStep(1)}
            >
              Zmień URL
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tytuł</label>
            <input 
              type="text" 
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              placeholder="Tytuł beatmapy" 
              {...register('title', { required: true })}
            />
            {errors.title && <span className="form-error">Tytuł jest wymagany</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Artysta</label>
            <input 
              type="text" 
              className={`form-input ${errors.artist ? 'form-input--error' : ''}`}
              placeholder="Artysta" 
              {...register('artist', { required: true })}
            />
            {errors.artist && <span className="form-error">Artysta jest wymagany</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Mapper</label>
            <input 
              type="text" 
              className={`form-input ${errors.creator ? 'form-input--error' : ''}`}
              placeholder="Nazwa mappera" 
              {...register('creator', { required: true })}
            />
            {errors.creator && <span className="form-error">Mapper jest wymagany</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">BPM</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="BPM" 
                {...register('bpm')}
              />
            </div>
            
            <div className="form-group form-group--half">
              <label className="form-label">Gwiazdki</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="Poziom trudności" 
                step="0.01"
                {...register('star_rating')}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tagi</label>
            <CustomTags 
              tags={tags} 
              onAddTag={handleAddTag} 
              onRemoveTag={handleRemoveTag} 
              placeholder="Dodaj tagi..."
            />
          </div>
          
          {collections.length > 0 && (
            <div className="form-group">
              <label className="form-label">Dodaj do kolekcji</label>
              <div className="collections-list">
                {collections.map(collection => (
                  <div 
                    key={collection.id} 
                    className={`collection-checkbox ${selectedCollections.includes(collection.id) ? 'collection-checkbox--selected' : ''}`}
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.includes(collection.id)} 
                      onChange={() => {}} 
                      id={`collection-${collection.id}`}
                    />
                    <label htmlFor={`collection-${collection.id}`}>{collection.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Dodawanie...' : 'Dodaj beatmapę'}
            </button>
          </div>
          
          {success && (
            <div className="form-success">
              Beatmapa została dodana pomyślnie!
            </div>
          )}
          
          {error && (
            <div className="form-error-message">
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default AddBeatmap;
