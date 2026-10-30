import { contacts } from '../../data/contacts'
import styles from './Footer.module.css'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer id="contacts" className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>
            <img src="/favicon.svg" alt="" className={styles.logoIcon} />
            <span className={styles.logoText}>{contacts.brand}</span>
          </div>
          <p className={styles.about}>
            Автомийка та детейлінг-центр. Повертаємо автомобілям блиск із турботою про кожну деталь.
          </p>
        </div>

        <div>
          <h3 className={styles.columnTitle}>Контакти</h3>
          <ul className={styles.list}>
            <li>{contacts.address}</li>
            <li>
              <a
                href={contacts.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {contacts.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contacts.email}`} className={styles.link}>
                {contacts.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={styles.columnTitle}>Графік роботи</h3>
          <ul className={styles.list}>
            {contacts.hours.map((item) => (
              <li key={item.days} className={styles.hoursRow}>
                <span>{item.days}</span>
                <span className={styles.hoursTime}>{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        © {year} Автомийка «{contacts.brand}». Усі права захищені.
      </div>
    </footer>
  )
}
