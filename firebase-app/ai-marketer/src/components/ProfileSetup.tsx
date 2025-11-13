'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface ProfileSetupProps {
  onComplete: () => void;
}

interface PersonalProfile {
  name: string;
  profession: string;
  industry: string;
  expertise: string[];
  goals: string;
  target_audience: string;
}

interface CompanyProfile {
  company_name: string;
  role: string;
  industry: string;
  products: string[];
  target_customers: string;
  business_goals: string;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState<'personal' | 'company' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  
  const [personalProfile, setPersonalProfile] = useState<PersonalProfile>({
    name: '',
    profession: '',
    industry: '',
    expertise: [],
    goals: '',
    target_audience: ''
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    company_name: '',
    role: '',
    industry: '',
    products: [],
    target_customers: '',
    business_goals: ''
  });

  const handleSubmit = async () => {
    if (!functions) return;
    
    setLoading(true);
    try {
      const initializeUserContext = httpsCallable(functions, 'initializeUserContext');
      
      const contextData: any = {};
      
      if (profileType === 'personal' || profileType === 'both') {
        contextData.personalContext = {
          name: personalProfile.name,
          profession: personalProfile.profession,
          industry: personalProfile.industry,
          voice: 'Authentic and strategic',
          goals: personalProfile.goals,
          preferences: 'Authentic storytelling, strategic networking',
          expertise: personalProfile.expertise,
          target_audience: personalProfile.target_audience,
          brand_values: 'Authenticity, creativity, and innovation'
        };
      }
      
      if (profileType === 'company' || profileType === 'both') {
        contextData.companyContext = {
          name: personalProfile.name,
          profession: companyProfile.role,
          company: companyProfile.company_name,
          industry: companyProfile.industry,
          voice: 'Professional, helpful, and strategic',
          goals: companyProfile.business_goals,
          preferences: 'Data-driven decisions, creative solutions',
          expertise: ['Digital marketing', 'Content strategy'],
          target_audience: companyProfile.target_customers,
          brand_values: 'Innovation and strategic growth',
          products: companyProfile.products,
          services: ['Marketing', 'Consulting'],
          unique_value_prop: `Helping ${companyProfile.target_customers} achieve their goals`
        };
      }
      
      await initializeUserContext(contextData);
      onComplete();
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addExpertise = (expertise: string) => {
    if (expertise.trim() && !personalProfile.expertise.includes(expertise.trim())) {
      setPersonalProfile(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertise.trim()]
      }));
    }
  };

  const removeExpertise = (expertise: string) => {
    setPersonalProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  const addProduct = (product: string) => {
    if (product.trim() && !companyProfile.products.includes(product.trim())) {
      setCompanyProfile(prev => ({
        ...prev,
        products: [...prev.products, product.trim()]
      }));
    }
  };

  const removeProduct = (product: string) => {
    setCompanyProfile(prev => ({
      ...prev,
      products: prev.products.filter(p => p !== product)
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              🤖 Welcome to AI Marketing Assistant
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Let's set up your marketing profile
            </p>
          </div>
          
          <div className="space-y-4 bg-zinc-800 p-8 rounded-lg border border-zinc-700 shadow-lg">
            <div className="text-lg font-medium text-white">
              What would you like help with?
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-700">
                <input
                  type="radio"
                  name="profileType"
                  value="personal"
                  checked={profileType === 'personal'}
                  onChange={(e) => setProfileType(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">👤 Personal Branding</div>
                  <div className="text-sm text-zinc-400">Build your personal brand and thought leadership</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-700">
                <input
                  type="radio"
                  name="profileType"
                  value="company"
                  checked={profileType === 'company'}
                  onChange={(e) => setProfileType(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">🏢 Company Marketing</div>
                  <div className="text-sm text-zinc-400">Grow your business and acquire customers</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-700">
                <input
                  type="radio"
                  name="profileType"
                  value="both"
                  checked={profileType === 'both'}
                  onChange={(e) => setProfileType(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">🚀 Both</div>
                  <div className="text-sm text-zinc-400">Personal branding and company marketing</div>
                </div>
              </label>
            </div>
            
            <button
              onClick={() => setStep(2)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2 && (profileType === 'personal' || profileType === 'both')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 py-12 px-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              👤 Personal Profile
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Tell us about yourself for personalized branding advice
            </p>
          </div>
          
          <div className="space-y-6 bg-zinc-800 p-8 rounded-lg border border-zinc-700 shadow-lg">
            <div>
              <label className="block text-sm font-medium text-zinc-200">Full Name</label>
              <input
                type="text"
                value={personalProfile.name}
                onChange={(e) => setPersonalProfile(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Profession/Title</label>
              <input
                type="text"
                value={personalProfile.profession}
                onChange={(e) => setPersonalProfile(prev => ({ ...prev, profession: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="e.g., Software Engineer, Marketing Director, Entrepreneur"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Industry</label>
              <input
                type="text"
                value={personalProfile.industry}
                onChange={(e) => setPersonalProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Areas of Expertise</label>
              <div className="mt-1 flex flex-wrap gap-2 mb-2">
                {personalProfile.expertise.map((exp, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-700 text-zinc-200">
                    {exp}
                    <button
                      onClick={() => removeExpertise(exp)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addExpertise(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Type expertise and press Enter (e.g., AI, Marketing, Leadership)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Personal Branding Goals</label>
              <textarea
                value={personalProfile.goals}
                onChange={(e) => setPersonalProfile(prev => ({ ...prev, goals: e.target.value }))}
                rows={3}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="What do you want to achieve with your personal brand?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Target Audience</label>
              <input
                type="text"
                value={personalProfile.target_audience}
                onChange={(e) => setPersonalProfile(prev => ({ ...prev, target_audience: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Who do you want to reach? (e.g., Tech professionals, Entrepreneurs)"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-zinc-600 rounded-md shadow-sm text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Back
              </button>
              <button
                onClick={() => profileType === 'both' ? setStep(3) : handleSubmit()}
                disabled={!personalProfile.name || !personalProfile.profession}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50"
              >
                {profileType === 'both' ? 'Continue' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 || (step === 2 && profileType === 'company')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 py-12 px-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              🏢 Company Profile
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Tell us about your business for targeted marketing strategies
            </p>
          </div>
          
          <div className="space-y-6 bg-zinc-800 p-8 rounded-lg border border-zinc-700 shadow-lg">
            <div>
              <label className="block text-sm font-medium text-zinc-200">Company Name</label>
              <input
                type="text"
                value={companyProfile.company_name}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, company_name: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Your company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Your Role</label>
              <input
                type="text"
                value={companyProfile.role}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="e.g., CEO, Marketing Manager, Founder"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Industry</label>
              <input
                type="text"
                value={companyProfile.industry}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="e.g., SaaS, E-commerce, Consulting"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Products/Services</label>
              <div className="mt-1 flex flex-wrap gap-2 mb-2">
                {companyProfile.products.map((product, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {product}
                    <button
                      onClick={() => removeProduct(product)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addProduct(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Type product/service and press Enter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Target Customers</label>
              <input
                type="text"
                value={companyProfile.target_customers}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, target_customers: e.target.value }))}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="Who are your ideal customers?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-200">Business Goals</label>
              <textarea
                value={companyProfile.business_goals}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, business_goals: e.target.value }))}
                rows={3}
                className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                placeholder="What are your main business objectives?"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(profileType === 'both' ? 2 : 1)}
                className="flex-1 py-2 px-4 border border-zinc-600 rounded-md shadow-sm text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !companyProfile.company_name || !companyProfile.role}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
