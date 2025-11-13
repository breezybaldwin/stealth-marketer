'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, ProfileManagerProps, ContextType } from '@/types';

export default function ProfileManager({ onBack }: ProfileManagerProps = {}) {
  const [activeTab, setActiveTab] = useState<ContextType>('personal');
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      alert('Profile updated successfully!');
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
        ...prev.personal,
        user: {
          ...prev.personal?.user,
          [field]: value
        }
      }
    }));
  };

  const updateCompanyProfile = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        user: {
          ...prev.company?.user,
          [field]: value
        }
      }
    }));
  };

  const updateCompanyBusiness = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        business: {
          ...prev.company?.business,
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-zinc-800 shadow rounded-lg border border-zinc-700">
          <div className="px-6 py-4 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-sm text-zinc-400">Manage your marketing profiles and preferences</p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-sm text-zinc-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Chat</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-zinc-700">
            <nav className="-mb-px flex">
              {profile.personal && (
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'personal'
                      ? 'border-zinc-400 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                  }`}
                >
                  👤 Personal Branding
                </button>
              )}
              {profile.company && (
                <button
                  onClick={() => setActiveTab('company')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'company'
                      ? 'border-zinc-400 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                  }`}
                >
                  🏢 Company Marketing
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'personal' && profile.personal && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Personal Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Name</label>
                    <input
                      type="text"
                      value={profile.personal.user?.name || ''}
                      onChange={(e) => updatePersonalProfile('name', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Profession</label>
                    <input
                      type="text"
                      value={profile.personal.user?.profession || ''}
                      onChange={(e) => updatePersonalProfile('profession', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Industry</label>
                    <input
                      type="text"
                      value={profile.personal.user?.industry || ''}
                      onChange={(e) => updatePersonalProfile('industry', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Target Audience</label>
                    <input
                      type="text"
                      value={profile.personal.user?.target_audience || ''}
                      onChange={(e) => updatePersonalProfile('target_audience', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200">Goals</label>
                  <textarea
                    value={profile.personal.user?.goals || ''}
                    onChange={(e) => updatePersonalProfile('goals', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200">Expertise (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(profile.personal.user?.expertise) ? profile.personal.user.expertise.join(', ') : ''}
                    onChange={(e) => updatePersonalProfile('expertise', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="AI, Marketing, Leadership"
                  />
                </div>
              </div>
            )}

            {activeTab === 'company' && profile.company && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Company Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Company Name</label>
                    <input
                      type="text"
                      value={profile.company.user?.company || ''}
                      onChange={(e) => updateCompanyProfile('company', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Your Role</label>
                    <input
                      type="text"
                      value={profile.company.user?.profession || ''}
                      onChange={(e) => updateCompanyProfile('profession', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Industry</label>
                    <input
                      type="text"
                      value={profile.company.user?.industry || ''}
                      onChange={(e) => updateCompanyProfile('industry', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200">Target Customers</label>
                    <input
                      type="text"
                      value={profile.company.user?.target_audience || ''}
                      onChange={(e) => updateCompanyProfile('target_audience', e.target.value)}
                      className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200">Business Goals</label>
                  <textarea
                    value={profile.company.user?.goals || ''}
                    onChange={(e) => updateCompanyProfile('goals', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200">Products/Services (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(profile.company.business?.products) ? profile.company.business.products.join(', ') : ''}
                    onChange={(e) => updateCompanyBusiness('products', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="SaaS Platform, Consulting, Mobile App"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200">Unique Value Proposition</label>
                  <textarea
                    value={profile.company.business?.unique_value_prop || ''}
                    onChange={(e) => updateCompanyBusiness('unique_value_prop', e.target.value)}
                    rows={2}
                    className="mt-1 block w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="What makes your company unique?"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50"
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
