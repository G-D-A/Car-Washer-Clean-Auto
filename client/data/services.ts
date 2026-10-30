export type Service = {
  id: string
  title: string
  description: string
  price: number
  duration: string
  popular?: boolean
}

export const services: Service[] = [
  {
    id: 'express',
    title: 'Експрес-мийка',
    description: 'Безконтактна мийка кузова активною піною, ополіскування та сушіння.',
    price: 250,
    duration: '20 хв',
  },
  {
    id: 'complex',
    title: 'Комплексна мийка',
    description: 'Кузов, килимки, пилосос салону, протирання пластику та скла зсередини.',
    price: 600,
    duration: '50 хв',
    popular: true,
  },
  {
    id: 'interior',
    title: 'Хімчистка салону',
    description: 'Глибоке чищення сидінь, стелі, ковроліну та пластику з виведенням плям.',
    price: 3000,
    duration: '4–5 год',
  },
  {
    id: 'polish',
    title: 'Полірування кузова',
    description: 'Видалення дрібних подряпин, відновлення блиску та захисне покриття воском.',
    price: 4500,
    duration: '5–6 год',
  },
]

export const formatPrice = (price: number) => `від ${price.toLocaleString('uk-UA')} грн`
