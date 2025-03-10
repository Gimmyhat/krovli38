/** @jsxImportSource react */
import { useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Info from './components/sections/Info';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Benefits from './components/sections/Benefits';
import WorkTypes from './components/sections/WorkTypes';
import ContactForm from './components/sections/ContactForm';
import MetaTags from './components/MetaTags';
import { Phone, Mail, Clock } from 'lucide-react';
import { CONTACT_INFO } from './constants/navigation';
import { FormProvider } from './context/FormContext';
import { useSettings } from './context/SettingsContext';

function App() {
  const { settings, isLoading } = useSettings();

  // Применяем динамическую цветовую тему на основе настроек
  useEffect(() => {
    if (isLoading) return;

    // Создаем стилевую переменную
    const style = document.createElement('style');
    const colorVars = `
      :root {
        --primary-color: ${settings.primary_color || '#3B82F6'};
        --secondary-color: ${settings.secondary_color || '#1E3A8A'};
        --text-color: ${settings.text_color || '#111827'};
        --background-color: ${settings.background_color || '#F9FAFB'};
      }
      
      .bg-primary { background-color: var(--primary-color) !important; }
      .text-primary { color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      
      .bg-secondary { background-color: var(--secondary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .border-secondary { border-color: var(--secondary-color) !important; }
    `;
    
    style.textContent = colorVars;
    document.head.appendChild(style);
    
    // Удаляем стиль при размонтировании компонента
    return () => {
      document.head.removeChild(style);
    };
  }, [settings, isLoading]);

  return (
    <FormProvider>
      <div className="min-h-screen bg-white">
        {/* MetaTags для динамических метаданных страницы */}
        <MetaTags />
        
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
    </FormProvider>
  );
}

export default App;