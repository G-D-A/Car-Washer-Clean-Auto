import heroCar from '../../assets/hero-car.jpg'
import styles from './Hero.module.css'

const highlights = [
  { value: '30 хв', label: 'середня мийка' },
  { value: '5000+', label: 'задоволених клієнтів' },
  { value: '7 днів', label: 'на тиждень' },
]

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <img src={heroCar} alt="Чистий блискучий автомобіль Tesla після мийки" className={styles.image} />
      <div className={styles.overlay} />
      <div className={styles.bottomFade} />

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.badge}>Автомийка та детейлінг</p>
          <h1 className={styles.title}>
            Ваше авто <span className={styles.accent}>сяє</span> як нове
          </h1>
          <p className={styles.text}>
            Дбайлива мийка, хімчистка та полірування. Професійна хімія, досвідчені майстри та
            запис на зручний час без черг.
          </p>
          <div className={styles.actions}>
            <a href="#booking" className={`${styles.button} ${styles.primary}`}>
              Записатися
            </a>
            <a href="#services" className={`${styles.button} ${styles.secondary}`}>
              Послуги та ціни
            </a>
          </div>

          <dl className={styles.stats}>
            {highlights.map((item) => (
              <div key={item.label}>
                <dt className={styles.visuallyHidden}>{item.label}</dt>
                <dd className={styles.statValue}>{item.value}</dd>
                <dd className={styles.statLabel}>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
