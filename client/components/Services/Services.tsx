import { formatPrice, services } from '../../data/services'
import styles from './Services.module.css'

type ServicesProps = {
  onSelect: (serviceId: string) => void
}

export function Services({ onSelect }: ServicesProps) {
  return (
    <section id="services" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Послуги</p>
          <h2 className={styles.title}>Послуги та ціни</h2>
          <p className={styles.subtitle}>
            Ціни вказані для легкових автомобілів. Для кросоверів і позашляховиків вартість
            уточнює адміністратор.
          </p>
        </div>

        <ul className={styles.list}>
          {services.map((service) => (
            <li key={service.id} className={`${styles.card} ${service.popular ? styles.popular : ''}`}>
              {service.popular && <span className={styles.badge}>Популярне</span>}
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.description}>{service.description}</p>
              <div className={styles.meta}>
                <span className={styles.price}>{formatPrice(service.price)}</span>
                <span className={styles.duration}>{service.duration}</span>
              </div>
              <a href="#booking" onClick={() => onSelect(service.id)} className={styles.button}>
                Записатися
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
