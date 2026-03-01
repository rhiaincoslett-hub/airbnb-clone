import styles from './Button.module.css';

/**
 * Reusable button component.
 * @param {object} props
 * @param {string} [props.label] - Button text
 * @param {() => void} [props.onClick] - Click handler
 * @param {'primary'|'secondary'|'danger'} [props.variant='primary']
 * @param {boolean} [props.disabled]
 * @param {string} [props.type='button']
 */
export function Button({ label, onClick, variant = 'primary', disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
