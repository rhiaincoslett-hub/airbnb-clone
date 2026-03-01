import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_BASE } from '../api';
import styles from './CreateListingPage.module.css';

const AMENITY_OPTIONS = ['wifi', 'kitchen', 'parking', 'pool', 'washer', 'dryer', 'ac', 'heating', 'tv', 'workspace'];

/**
 * Create listing form with validation; POST /api/accommodations with JWT.
 */
export function CreateListingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    location: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    type: 'Entire place',
    price: '',
    amenities: [],
    images: [],
    weeklyDiscount: '',
    cleaningFee: '',
    serviceFee: '',
    occupancyTaxes: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!token) {
      setUploadError('Please log in again.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) fd.append('images', files[i]);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || (res.status === 401 ? 'Please log in again.' : `Upload failed (${res.status})`);
        setUploadError(msg);
        return;
      }
      if (data.urls?.length) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.location.trim()) next.location = 'Location is required';
    if (form.price === '' || form.price == null) next.price = 'Price is required';
    else if (Number(form.price) < 0) next.price = 'Price must be 0 or more';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildBody = () => ({
    title: form.title.trim(),
    location: form.location.trim(),
    description: form.description.trim() || undefined,
    bedrooms: form.bedrooms === '' ? undefined : Number(form.bedrooms),
    bathrooms: form.bathrooms === '' ? undefined : Number(form.bathrooms),
    guests: form.guests === '' ? undefined : Number(form.guests),
    type: form.type || undefined,
    price: Number(form.price),
    amenities: form.amenities.length ? form.amenities : undefined,
    images: form.images.length ? form.images : undefined,
    weeklyDiscount: form.weeklyDiscount === '' ? undefined : Number(form.weeklyDiscount),
    cleaningFee: form.cleaningFee === '' ? undefined : Number(form.cleaningFee),
    serviceFee: form.serviceFee === '' ? undefined : Number(form.serviceFee),
    occupancyTaxes: form.occupancyTaxes === '' ? undefined : Number(form.occupancyTaxes),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/accommodations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.message || 'Failed to create listing');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>Create listing</h1>
      <form onSubmit={handleSubmit}>
        {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          error={errors.title}
          required
        />
        <Input
          label="Location"
          name="location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          error={errors.location}
          required
        />
        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description}
        />
        <div className={styles.field} style={{ marginBottom: 'var(--spacing-md)' }}>
          <span className={styles.checkboxLabel} style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>Photos</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className={styles.fileInput}
          />
          {uploading && <span className={styles.uploadStatus}>Uploading…</span>}
          {uploadError && <div className={styles.serverError}>{uploadError}</div>}
          {form.images.length > 0 && (
            <div className={styles.thumbnails}>
              {form.images.map((url) => (
                <div key={url} className={styles.thumbWrap}>
                  <img src={url} alt="" className={styles.thumb} />
                  <button type="button" onClick={() => removeImage(url)} className={styles.removeThumb} aria-label="Remove photo">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => update('bedrooms', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => update('bathrooms', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Guests"
              name="guests"
              type="number"
              min="1"
              value={form.guests}
              onChange={(e) => update('guests', e.target.value)}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <Input
              label="Type"
              name="type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              placeholder="e.g. Entire place"
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Price per night"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              error={errors.price}
              required
            />
          </div>
        </div>
        <div className={styles.field} style={{ marginBottom: 'var(--spacing-md)' }}>
          <span className={styles.checkboxLabel} style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>Amenities</span>
          <div className={styles.amenitiesGroup}>
            {AMENITY_OPTIONS.map((a) => (
              <label key={a} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                />
                {a}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <Input
              label="Weekly discount %"
              name="weeklyDiscount"
              type="number"
              min="0"
              max="100"
              value={form.weeklyDiscount}
              onChange={(e) => update('weeklyDiscount', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Cleaning fee"
              name="cleaningFee"
              type="number"
              min="0"
              value={form.cleaningFee}
              onChange={(e) => update('cleaningFee', e.target.value)}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <Input
              label="Service fee"
              name="serviceFee"
              type="number"
              min="0"
              value={form.serviceFee}
              onChange={(e) => update('serviceFee', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Occupancy taxes"
              name="occupancyTaxes"
              type="number"
              min="0"
              value={form.occupancyTaxes}
              onChange={(e) => update('occupancyTaxes', e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" label={loading ? 'Creating…' : 'Create listing'} disabled={loading} />
      </form>
    </div>
  );
}
