import React, { useState, useEffect } from 'react';
import { Tv, Bell, Star, Search } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { api } from '../App';

const LandingPage = () => {
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    console.log('LandingPage - Platform:', Capacitor.getPlatform(), 'isNative:', Capacitor.isNativePlatform());
  }, []);

  const handleAppleSignIn = async () => {
    if (isAppleLoading) return;
    setIsAppleLoading(true);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    
    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      
      // For native iOS, only scopes are needed - clientId is for web only
      const options = {
        scopes: 'email name'
      };
      
      console.log('Calling SignInWithApple.authorize with options:', options);
      const result = await SignInWithApple.authorize(options);
      
      console.log('Apple Sign In result:', result);
      
      if (result.response?.identityToken) {
        // Send to backend for verification and user creation
        const response = await api.post('/auth/apple', { 
          identityToken: result.response.identityToken, 
          user: result.response.user || null, 
          email: result.response.email || null, 
          givenName: result.response.givenName || null,
          familyName: result.response.familyName || null
        });
        
        console.log('Backend response:', response.data);
        
        if (response.data.session_token) {
          localStorage.setItem('session_token', response.data.session_token);
          window.location.href = '/dashboard';
        }
      }
    } catch (error) { 
      console.error('Apple Sign In error:', error);
      if (!error.message?.includes('canceled') && !error.message?.includes('cancelled')) {
        alert('Apple Sign In failed. Please try again or use Demo Account.'); 
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    try { 
      console.log('Demo login attempt...');
      const response = await api.post('/auth/demo'); 
      console.log('Demo response:', response.data);
      if (response.data.session_token) {
        localStorage.setItem('session_token', response.data.session_token);
      }
      if (response.data.user) {
        window.location.href = '/dashboard'; 
      }
    }
    catch (error) { 
      console.error('Demo error:', error);
      alert('Demo login failed: ' + (error.message || 'Network error')); 
    }
    finally { setIsDemoLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a'}}>
      <div style={{minHeight:'100vh',padding:'0 24px',display:'flex',flexDirection:'column',backgroundImage:"url('https://images.unsplash.com/photo-1643553517154-24eb7fd86437?q=80&w=2000')",backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.7) 100%)',zIndex:1}}></div>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 0',maxWidth:'1200px',width:'100%',margin:'0 auto',position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'24px',fontWeight:700}}>
            <Tv size={32} color="#ef4444" />
            <span>WatchWhistle</span>
          </div>
        </nav>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',maxWidth:'900px',margin:'0 auto',position:'relative',zIndex:2}}>
          <div style={{background:'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)',border:'8px solid #333',borderRadius:'8px',padding:'40px 20px',marginBottom:'40px',boxShadow:'0 20px 60px rgba(0,0,0,0.9)',position:'relative',width:'100%',maxWidth:'800px'}}>
            <div style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)',width:'40px',height:'40px',background:'#ef4444',borderRadius:'50%',boxShadow:'0 0 20px rgba(239,68,68,0.6)'}}></div>
            <h1 style={{fontSize:'clamp(36px,10vw,64px)',fontWeight:700,color:'#ef4444',margin:0,textShadow:'0 0 30px rgba(239,68,68,0.5)'}}>WatchWhistle</h1>
          </div>
          <h2 style={{fontSize:'clamp(28px,5vw,42px)',fontWeight:700,color:'white',marginBottom:'16px'}}>Never Miss Your Favorite Shows</h2>
          <p style={{fontSize:'clamp(16px,3vw,20px)',color:'rgba(255,255,255,0.9)',marginBottom:'32px',maxWidth:'600px'}}>Track your favorite TV shows and get notified when new episodes air</p>
          <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%',maxWidth:'400px'}}>
            <button 
              onClick={handleAppleSignIn} 
              disabled={isAppleLoading}
              data-testid="apple-login-btn"
              style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'#000',color:'white',border:'none',cursor:'pointer'}}
            >
              <svg style={{marginRight:'8px'}} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {isAppleLoading ? 'Signing in...' : 'Sign in with Apple'}
            </button>
            
            <button 
              onClick={handleDemoLogin} 
              disabled={isDemoLoading} 
              data-testid="demo-login-btn"
              style={{padding:'16px 32px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',borderRadius:'50px',fontWeight:600,background:'#22c55e',color:'white',border:'none',cursor:'pointer'}}
            >
              <svg style={{marginRight:'8px'}} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {isDemoLoading ? 'Loading...' : 'Try Demo Account'}
            </button>
          </div>
        </div>
      </div>
      <div style={{padding:'100px 24px',background:'white'}}>
        <h2 style={{textAlign:'center',fontSize:'clamp(32px,6vw,44px)',fontWeight:700,marginBottom:'56px',color:'#1a1a1a'}}>Everything You Need</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'32px',maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}>
            <div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}>
              <Search size={32} color="#ef4444" />
            </div>
            <h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Search and Add Shows</h3>
            <p style={{color:'#6b7280',lineHeight:1.6}}>Easily find and add your favorite TV shows</p>
          </div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}>
            <div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}>
              <Bell size={32} color="#ef4444" />
            </div>
            <h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Smart Notifications</h3>
            <p style={{color:'#6b7280',lineHeight:1.6}}>Get notified when new episodes air</p>
          </div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}>
            <div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}>
              <Tv size={32} color="#ef4444" />
            </div>
            <h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Track Episodes</h3>
            <p style={{color:'#6b7280',lineHeight:1.6}}>Mark episodes as watched</p>
          </div>
          <div style={{background:'white',padding:'32px',borderRadius:'16px',boxShadow:'0 4px 6px rgba(0,0,0,0.05)',border:'1px solid #f3f4f6'}}>
            <div style={{width:'64px',height:'64px',background:'rgba(239,68,68,0.1)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px'}}>
              <Star size={32} color="#ef4444" />
            </div>
            <h3 style={{fontSize:'22px',fontWeight:600,marginBottom:'12px',color:'#1a1a1a'}}>Rate Shows</h3>
            <p style={{color:'#6b7280',lineHeight:1.6}}>Rate your favorite shows</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
