import styles from './Input.module.css';

/**
 * Reusable text input with optional label and error.
 * @param {object} props - Standard input props plus label, error
 */
export function Input({ label, error, id, className = '', ...rest }) {
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={`${styles.wrap} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input id={inputId} className={`${styles.input} ${error ? styles.errorInput : ''}`} {...rest} />
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
