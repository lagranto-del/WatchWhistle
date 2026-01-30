import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Bell, Star, Search, Eye } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { api } from '../App';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);

  useEffect(() => {
    setShowAppleSignIn(Capacitor.getPlatform() === 'ios');
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    window.location.href = 'https://auth.emergentagent.com/?redirect=' + encodeURIComponent(window.location.origin + '/dashboard');
  };

  const handleAppleSignIn = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
    try {
      const result = await SignInWithApple.authorize({ clientId: 'com.tillywatchwhistle', redirectURI: API_URL + '/api/auth/apple-callback', scopes: 'email name', state: Math.random().toString(36).substring(7), nonce: Math.random().toString(36).substring(7) });
      if (result.response?.identityToken) {
        const response = await axios.post(API_URL + '/api/auth/apple-signin', { identityToken: result.response.identityToken, user: result.response.user, email: result.response.email, fullName: result.response.fullName });
        if (response.data.token) { localStorage.setItem('authToken', response.data.token); window.location.href = '/dashboard'; }
      }
    } catch (error) { if (!error.message?.includes('canceled')) alert('Sign in failed. Try Demo Account.'); }
  };

  const handlePreviewApp = () => { try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {} navigate('/marketing'); };

  const handleDemoLogin = async () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    try { const response = await axios.post(API_URL + '/api/auth/demo'); if (response.data.user) window.location.href = '/dashboard'; }
    catch (error) { alert('Demo login failed.'); }
    finally { setIsDemoLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a'}}>
      <div style={{minHeight:'100vh',padding:'0 24px',display:'flex',flexDirection:'column',backgroundImage:"url('https://images.unsplash.com/photo-1643553517154-24eb7fd86437?q=80&w=2000')",backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.7) 100%)',zIndex:1}}></div>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 0',maxWidth:'1200px',width:'100%',margin:'0 auto',position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'24px',fontWeight:700}}><Tv size={32} color="#ef4444" /><span>WatchWhistle</span></div>
        </nav>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',maxWidth:'900px',margin:'0 auto',position:'relative',zIndex:2}}>
          <div style={{background:'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)',border:'8px solid #333',borderRadius:'8px',padding:'40px 20px',marginBottom:'40px',boxShadow:'0 20px 60px rgba(0,0,0,0.9)',position:'relative',width:'100%',maxWidth:'800px'}}>
            <div style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)',width:'40px',height:'40px',background:'#ef4444',borderRadius:'50%',boxShadow:'0 0 20px rgba(239,68,68,0.6)'}}></div>
            <h1 style={{fontSize:'clamp(36px,10vw,64px)',fontWeight:700,color:'#ef4444',margin:0,textShadow:'0 0 30px rgba(239,68,68,0.5)'}}>WatchWhistle</h1>
          </div>
          <h2 style={{fontSize:'clamp(28px,5vw,42px)',fontWeight:700,color:'white',marginBottom:'16px'}}>Never Miss Your Favorite Shows</h2>
          <p style={{fontSize:'clamp(16px,3vw,20px)',color:'rgba(255,255,255,0.9)',marginBottom:'32px',maxWidth:'600px'}}>Track your favorite TV shows and get notified when new episodes air</p>
          <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%',maxWidth:'400px'}}>
            <button onClick={handleGoogleLogin} disabled={isLoading} style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'#ef4444',color:'white',border:'none',cursor:'pointer'}}>
              <svg style={{marginRight:'8px'}} viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            {showAppleSignIn && (
              <button onClick={handleAppleSignIn} style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'#000',color:'white',border:'none',cursor:'pointer'}}>
                <svg style={{marginRight:'8px'}} viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Continue with Apple
              </button>
            )}
            <button onClick={handlePreviewApp} style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'transparent',color:'white',border:'2px solid rgba(255,255,255,0.5)',cursor:'pointer'}}>
              <Eye size={20} style={{marginRight:'8px'}} />Preview App
            </button>
            <button onClick={handleDemoLogin} disabled={isDemoLoading} style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'#22c55e',color:'white',border:'none',cursor:'pointer'}}>
              <svg style={{marginRight:'8px'}} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {isDemoLoading ? 'Loading...' : 'Try Demo Account'}
            </button>
          </div>
        </div>
      </div>
      <div style={{padding:'100px 24px',background:'white'}}>
        <h2 style={{textAlign:'center',fontSize:'clamp(32px,6vw,44px)',fontWeight:700,marginBottom:'56px',color:'#1a1a1a'}}>Everything You Need</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'32px',maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}><div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}><Search size={32} color="#ef4444" /></div><h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Search and Add Shows</h3><p style={{color:'#6b7280',lineHeight:1.6}}>Easily find and add your favorite TV shows</p></div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}><div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}><Bell size={32} color="#ef4444" /></div><h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Smart Notifications</h3><p style={{color:'#6b7280',lineHeight:1.6}}>Get notified when new episodes air</p></div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}><div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}><Tv size={32} color="#ef4444" /></div><h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Track Episodes</h3><p style={{color:'#6b7280',lineHeight:1.6}}>Mark episodes as watched</p></div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}><div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}><Star size={32} color="#ef4444" /></div><h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Rate Shows</h3><p style={{color:'#6b7280',lineHeight:1.6}}>Rate your favorite shows</p></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
