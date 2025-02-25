import React from 'react';

const Hero: React.FC = () => {
  return (
    <header className="relative h-[600px] pt-[72px]">
      <div className="absolute inset-0 top-[72px]">
        <img
          src="https://images.unsplash.com/photo-1525438160292-a4a860951216?auto=format&fit=crop&q=80&w=2069"
          alt="Flat roof repair"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 pt-32">
        <h1 className="text-5xl font-bold text-white mb-6">
          Профессиональный ремонт<br />плоской кровли
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl">
          Выполняем полный комплекс работ по ремонту и обслуживанию плоских кровель МКД. 
          Гарантируем качество и надежность на долгие годы.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          Получить консультацию
        </button>
      </div>
    </header>
  );
};

export default Hero; 