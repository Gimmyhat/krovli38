/** @jsxImportSource react */
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Info from './components/sections/Info';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Benefits from './components/sections/Benefits';
import WorkTypes from './components/sections/WorkTypes';
import ContactForm from './components/sections/ContactForm';
import { Phone, Mail, Clock } from 'lucide-react';
import { CONTACT_INFO } from './constants/navigation';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Info />
      <Services />
      <WorkTypes />
      <Gallery />
      <Benefits />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Свяжитесь с нами</h2>
              <p className="mb-8">
                Оставьте заявку на бесплатную консультацию или позвоните нам напрямую
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-6 w-6" />
                  <span>{CONTACT_INFO.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6" />
                  <span>{CONTACT_INFO.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6" />
                  <span>{CONTACT_INFO.workHours}</span>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;