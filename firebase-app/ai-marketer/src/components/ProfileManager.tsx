'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, ProfileManagerProps } from '@/types';

type Section = 'personal' | 'company' | 'account';

export default function ProfileManager({ onBack }: ProfileManagerProps = {}) {
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user || !db) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile(userData.contexts || {});
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !db) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        contexts: profile,
        updatedAt: new Date()
      });
      if (onBack) onBack();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalProfile = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      personal: {
        user: {
          ...prev.personal?.user,
          [field]: value
        },
        business: prev.personal?.business || {}
      }
    }));
  };

  const updateCompanyProfile = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      company: {
        user: {
          ...prev.company?.user,
          [field]: value
        },
        business: prev.company?.business || {}
      }
    }));
  };

  const updateCompanyBusiness = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      company: {
        user: prev.company?.user || {},
        business: {
          ...prev.company?.business,
          [field]: value
        }
      }
    }));
  };

  const addExpertise = (expertise: string) => {
    if (!expertise.trim()) return;
    const currentExpertise = Array.isArray(profile.personal?.user?.expertise) 
      ? profile.personal.user.expertise 
      : [];
    if (!currentExpertise.includes(expertise.trim())) {
      updatePersonalProfile('expertise', [...currentExpertise, expertise.trim()]);
    }
  };

  const removeExpertise = (expertise: string) => {
    const currentExpertise = Array.isArray(profile.personal?.user?.expertise) 
      ? profile.personal.user.expertise 
      : [];
    updatePersonalProfile('expertise', currentExpertise.filter(e => e !== expertise));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-400"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-zinc-800/50 border-r border-zinc-700 p-3 flex flex-col">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white px-3 mb-1">Personalization</h2>
            <p className="text-xs text-zinc-400 px-3">Customize your profile</p>
          </div>

          <nav className="space-y-1 flex-1">
            {profile.personal && (
              <button
                onClick={() => setActiveSection('personal')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'personal'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Personal</span>
              </button>
            )}
            
            {profile.company && (
              <button
                onClick={() => setActiveSection('company')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'company'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Company</span>
              </button>
            )}

            <div className="pt-2 border-t border-zinc-700 mt-2">
              <button
                onClick={() => setActiveSection('account')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'account'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pl-6 py-6 pr-2">
            {activeSection === 'personal' && profile.personal && (
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Personal Profile</h3>
                  <p className="text-sm text-zinc-400">Manage your personal branding information</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={profile.personal.user?.name || ''}
                      onChange={(e) => updatePersonalProfile('name', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Profession</label>
                      <input
                        type="text"
                        value={profile.personal.user?.profession || ''}
                        onChange={(e) => updatePersonalProfile('profession', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Industry</label>
                      <input
                        type="text"
                        value={profile.personal.user?.industry || ''}
                        onChange={(e) => updatePersonalProfile('industry', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={profile.personal.user?.target_audience || ''}
                      onChange={(e) => updatePersonalProfile('target_audience', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Goals</label>
                    <textarea
                      value={profile.personal.user?.goals || ''}
                      onChange={(e) => updatePersonalProfile('goals', e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Expertise</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(profile.personal.user?.expertise) && profile.personal.user.expertise.map((exp, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-700 text-zinc-200">
                          {exp}
                          <button
                            type="button"
                            onClick={() => removeExpertise(exp)}
                            className="ml-2 text-zinc-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && expertiseInput.trim()) {
                          e.preventDefault();
                          addExpertise(expertiseInput);
                          setExpertiseInput('');
                        }
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      placeholder="Type and press Enter (e.g., Digital Marketing, AI Strategy)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Resume / Job History</label>
                    <textarea
                      value={profile.personal.user?.job_history_text || ''}
                      onChange={(e) => updatePersonalProfile('job_history_text', e.target.value)}
                      rows={12}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 font-mono text-sm"
                      placeholder="Paste your resume or work history here..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'company' && profile.company && (
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Company Profile</h3>
                  <p className="text-sm text-zinc-400">Manage your company marketing information</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={profile.company.user?.company || ''}
                        onChange={(e) => updateCompanyProfile('company', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Your Role</label>
                      <input
                        type="text"
                        value={profile.company.user?.profession || ''}
                        onChange={(e) => updateCompanyProfile('profession', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Industry</label>
                      <input
                        type="text"
                        value={profile.company.user?.industry || ''}
                        onChange={(e) => updateCompanyProfile('industry', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Target Customers</label>
                      <input
                        type="text"
                        value={profile.company.user?.target_audience || ''}
                        onChange={(e) => updateCompanyProfile('target_audience', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Business Goals</label>
                    <textarea
                      value={profile.company.user?.goals || ''}
                      onChange={(e) => updateCompanyProfile('goals', e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Products/Services</label>
                    <input
                      type="text"
                      value={Array.isArray(profile.company.business?.products) ? profile.company.business.products.join(', ') : ''}
                      onChange={(e) => updateCompanyBusiness('products', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      placeholder="SaaS Platform, Consulting, Mobile App"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Unique Value Proposition</label>
                    <textarea
                      value={profile.company.business?.unique_value_prop || ''}
                      onChange={(e) => updateCompanyBusiness('unique_value_prop', e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      placeholder="What makes your company unique?"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Account Settings</h3>
                  <p className="text-sm text-zinc-400">Manage your account information</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Email cannot be changed</p>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-4">Password management and other account settings coming soon.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with save button */}
          <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
