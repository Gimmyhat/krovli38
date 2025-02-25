import React from 'react';
import Navigation from './components/layout/Navigation';
import Hero from './components/sections/Hero';
import { Phone, Mail, Clock, Shield, PenTool as Tool, CheckCircle, Building2, Hammer, Users, Camera, AlertTriangle, Wrench, ClipboardList } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">О плоских кровлях МКД</h2>
            <div className="prose lg:prose-lg">
              <p className="text-gray-700 mb-6">
                Плоские кровли являются наиболее распространенным решением для многоквартирных домов, 
                построенных в советское и постсоветское время. Их особенность заключается в минимальном 
                уклоне (1.5-2%), что требует особого подхода к ремонту и обслуживанию.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Основные проблемы</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Нарушение гидроизоляции</span>
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Застой воды</span>
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Разрушение примыканий</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Наши решения</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Современные материалы</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Профессиональный монтаж</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Долгосрочная гарантия</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Work Section */}
      <section id="types" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Виды выполняемых работ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <ClipboardList className="h-12 w-12 text-blue-600" />,
                title: 'Обследование кровли',
                description: 'Детальная диагностика состояния, выявление дефектов, составление плана работ',
                details: ['Тепловизионное обследование', 'Проверка несущих конструкций', 'Анализ состояния покрытия']
              },
              {
                icon: <Wrench className="h-12 w-12 text-blue-600" />,
                title: 'Текущий ремонт',
                description: 'Устранение локальных повреждений и дефектов кровельного покрытия',
                details: ['Ремонт протечек', 'Восстановление примыканий', 'Очистка водостоков']
              },
              {
                icon: <Tool className="h-12 w-12 text-blue-600" />,
                title: 'Капитальный ремонт',
                description: 'Полная замена кровельного пирога с использованием современных материалов',
                details: ['Демонтаж старого покрытия', 'Устройство пароизоляции', 'Монтаж утеплителя']
              }
            ].map((work, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {work.icon}
                  <h3 className="text-xl font-semibold ml-3">{work.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{work.description}</p>
                <ul className="space-y-2">
                  {work.details.map((detail, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Images */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Наши услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-blue-600" />,
                title: 'Диагностика кровли',
                description: 'Профессиональное обследование и выявление проблем',
                image: 'https://images.unsplash.com/photo-1632153575100-70e16fec8af8?auto=format&fit=crop&q=80'
              },
              {
                icon: <Tool className="h-12 w-12 text-blue-600" />,
                title: 'Ремонт кровли',
                description: 'Качественный ремонт с использованием современных материалов',
                image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80'
              },
              {
                icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
                title: 'Обслуживание',
                description: 'Регулярное обслуживание и профилактика протечек',
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80'
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 relative">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {service.icon}
                    <h3 className="text-xl font-semibold ml-3">{service.title}</h3>
                  </div>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center mb-12">
            <Camera className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold">Наши работы</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80',
                title: 'Ремонт кровли жилого дома'
              },
              {
                image: 'https://images.unsplash.com/photo-1632153575100-70e16fec8af8?auto=format&fit=crop&q=80',
                title: 'Диагностика протечек'
              },
              {
                image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80',
                title: 'Укладка гидроизоляции'
              },
              {
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80',
                title: 'Ремонт примыканий'
              },
              {
                image: 'https://images.unsplash.com/photo-1635424040602-67f2a1a78e3a?auto=format&fit=crop&q=80',
                title: 'Устройство водостока'
              },
              {
                image: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&q=80',
                title: 'Комплексный ремонт'
              }
            ].map((item, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <p className="text-white p-6 font-semibold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-blue-600" />,
                title: 'Опытные специалисты',
                description: 'Команда профессионалов с многолетним опытом'
              },
              {
                icon: <Clock className="h-8 w-8 text-blue-600" />,
                title: 'Быстрое реагирование',
                description: 'Выезд специалиста в течение 24 часов'
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-600" />,
                title: 'Гарантия качества',
                description: 'Предоставляем гарантию на все виды работ'
              },
              {
                icon: <Hammer className="h-8 w-8 text-blue-600" />,
                title: 'Современные технологии',
                description: 'Используем передовые материалы и оборудование'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <span>+7 (XXX) XXX-XX-XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6" />
                  <span>info@remont-krovli.ru</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6" />
                  <span>Пн-Пт: 8:00 - 20:00</span>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
              />
              <input
                type="tel"
                placeholder="Телефон"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
              />
              <textarea
                placeholder="Сообщение"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
              ></textarea>
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>© 2024 РемонтКровли. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;