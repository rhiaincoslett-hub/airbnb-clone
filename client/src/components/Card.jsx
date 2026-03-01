import { Link } from 'react-router-dom';
import styles from './Card.module.css';

/**
 * Reusable accommodation card. Image left, details right.
 * @param {object} props
 * @param {string} [props.image] - Image URL
 * @param {string} [props.type] - Accommodation type
 * @param {string} [props.location] - Location text
 * @param {string} [props.amenities] - Amenities summary
 * @param {number|string} [props.rating] - Star rating
 * @param {number|string} [props.reviews] - Review count
 * @param {number|string} [props.price] - Price per night
 * @param {string} [props.id] - Accommodation id for link
 */
export function Card({
  image,
  type,
  location,
  amenities,
  rating,
  reviews,
  price,
  id,
}) {
  const content = (
    <>
      <div className={styles.imageWrap}>
        {image ? (
          <img src={image} alt="" className={styles.image} />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
      </div>
      <div className={styles.details}>
        {type && <div className={styles.type}>{type}</div>}
        {location && <div className={styles.location}>{location}</div>}
        {amenities && <div className={styles.amenities}>{amenities}</div>}
        {(rating != null || reviews != null) && (
          <div className={styles.rating}>
            {rating != null && `★ ${rating}`}
            {reviews != null && ` · ${reviews} reviews`}
          </div>
        )}
        {price != null && (
          <div className={styles.price}>
            ${price}
            <span> / night</span>
          </div>
        )}
      </div>
    </>
  );

  if (id) {
    return (
      <Link to={`/locations/${id}`} className={styles.card}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
