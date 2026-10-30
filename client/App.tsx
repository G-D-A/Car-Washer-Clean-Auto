import { useState } from 'react'
import { BookingForm } from './components/BookingForm'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Services } from './components/Services'

function App() {
  const [selectedServiceId, setSelectedServiceId] = useState('')

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services onSelect={setSelectedServiceId} />
        <BookingForm serviceId={selectedServiceId} onServiceChange={setSelectedServiceId} />
      </main>
      <Footer />
    </>
  )
}

export default App
