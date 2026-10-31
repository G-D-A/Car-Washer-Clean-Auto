import { useState } from 'react'
import { AuthModal } from '../../components/AuthModal'
import { BookingForm } from '../../components/BookingForm'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Hero } from '../../components/Hero'
import { MyBookings } from '../../components/MyBookings'
import { Services } from '../../components/Services'

type OpenModal = 'auth' | 'myBookings' | null

export function HomePage() {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [openModal, setOpenModal] = useState<OpenModal>(null)

  const closeModal = () => setOpenModal(null)

  return (
    <>
      <Header
        onLoginClick={() => setOpenModal('auth')}
        onMyBookingsClick={() => setOpenModal('myBookings')}
      />
      <main>
        <Hero />
        <Services onSelect={setSelectedServiceId} />
        <BookingForm serviceId={selectedServiceId} onServiceChange={setSelectedServiceId} />
      </main>
      <Footer />

      {openModal === 'auth' && <AuthModal onClose={closeModal} />}
      {openModal === 'myBookings' && <MyBookings onClose={closeModal} />}
    </>
  )
}
