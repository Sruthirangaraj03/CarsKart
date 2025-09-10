import React, { useState } from 'react';
import { 
  Car, 
  CreditCard, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Shield, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Truck,
  Smartphone,
  Key,
  Heart
} from 'lucide-react';

const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState('host');

  const hostSteps = [
    {
      id: 1,
      icon: <Smartphone className="w-8 h-8" />,
      title: "List your car",
      subtitle: "It's free and easy",
      description: "Share some basic info about your car, upload photos, and set your price. Get an instant estimate of your earning potential."
    },
    {
      id: 2,
      icon: <Calendar className="w-8 h-8" />,
      title: "Meet your guest & go",
      subtitle: "Or use a lockbox for contactless handoff",
      description: "Meet your guest at a convenient location or use our contactless technology for a seamless handoff experience."
    },
    {
      id: 3,
      icon: <CreditCard className="w-8 h-8" />,
      title: "Earn money",
      subtitle: "Get paid within 5 days",
      description: "Relax while you earn. You're covered by comprehensive insurance and 24/7 customer support throughout the trip."
    }
  ];

  const renterSteps = [
    {
      id: 1,
      icon: <MapPin className="w-8 h-8" />,
      title: "Find the perfect car",
      subtitle: "Choose from hundreds of models",
      description: "From daily errands to cross-country road trips, find a car that fits your needs and budget from local hosts."
    },
    {
      id: 2,
      icon: <Key className="w-8 h-8" />,
      title: "Book and unlock",
      subtitle: "All through the app",
      description: "Book instantly, communicate with your host, and use our contactless technology to unlock your car when you arrive."
    },
    {
      id: 3,
      icon: <Heart className="w-8 h-8" />,
      title: "Drive and enjoy",
      subtitle: "You're covered by insurance",
      description: "Hit the road with confidence. You're covered by insurance and 24/7 roadside assistance on every trip."
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "You're covered",
      description: "Every car comes with comprehensive insurance coverage and 24/7 roadside assistance."
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Book instantly",
      description: "Most trips are booked instantly. No waiting around for approval from the host."
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Support when you need it",
      description: "Our support team is available 24/7 to help with any questions or issues during your trip."
    }
  ];

  const StepCard = ({ step, index, isLast = false }) => (
    <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center text-white shadow-xl">
          {step.icon}
        </div>
      </div>
      
      <div className="flex-1 pt-2">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
            Step {step.id}
          </span>
          {!isLast && (
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent"></div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-orange-700 font-medium mb-3">{step.subtitle}</p>
        <p className="text-gray-600 leading-relaxed max-w-lg">{step.description}</p>
      </div>
      
      {!isLast && (
        <div className="md:hidden w-full flex justify-center my-8">
          <div className="w-px h-12 bg-gradient-to-b from-orange-300 to-transparent"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            How CarsKart works
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Whether you're looking to earn extra income by sharing your car or need the perfect ride for your next adventure, we make it simple and safe.
          </p>
          
          {/* Tab Switcher */}
          <div className="inline-flex bg-white rounded-full p-2 shadow-lg border border-orange-100">
            <button
              onClick={() => setActiveTab('host')}
              className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'host'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Earn as a host
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'rent'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Rent a car
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {activeTab === 'host' ? (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Start earning with your car
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Turn your car into a business. Share your car when you're not using it and earn money automatically.
                </p>
              </div>
              
              <div className="space-y-0">
                {hostSteps.map((step, index) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isLast={index === hostSteps.length - 1}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Find your drive
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Choose from unique cars in your neighborhood. Book instantly and drive in minutes.
                </p>
              </div>
              
              <div className="space-y-0">
                {renterSteps.map((step, index) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isLast={index === renterSteps.length - 1}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose CarsKart?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to making car sharing safe, convenient, and reliable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Peace of mind, built in
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Comprehensive insurance</h3>
                    <p className="text-gray-600">Every trip includes liability insurance and physical damage protection.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">24/7 roadside assistance</h3>
                    <p className="text-gray-600">Get help whenever you need it, wherever you are.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Host verification</h3>
                    <p className="text-gray-600">All hosts are screened and verified before they can share their cars.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contactless technology</h3>
                  <p className="text-gray-600">Use our app to locate and unlock cars near you for a seamless experience.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality assurance</h3>
                  <p className="text-gray-600">Every car is inspected and maintained to ensure your safety and comfort.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;