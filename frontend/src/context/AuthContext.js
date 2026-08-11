import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  updateProfile as updateFirebaseProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { authService } from '../services/api';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('sc_token', token);
        localStorage.setItem('sc_uid', firebaseUser.uid);
        localStorage.setItem('sc_displayName', firebaseUser.displayName || '');
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        });
        setLoading(false);
      } else {
        const token = localStorage.getItem('sc_token');
        if (token) {
          authService.getProfile()
            .then(res => setUser(res.data))
            .catch(() => {
              localStorage.removeItem('sc_token');
              localStorage.removeItem('sc_uid');
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      localStorage.setItem('sc_token', res.data.idToken);
      localStorage.setItem('sc_uid', res.data.uid);
      localStorage.setItem('sc_displayName', res.data.displayName || '');
      setUser({ uid: res.data.uid, email: res.data.email, displayName: res.data.displayName });
      return res.data;
    } catch (err) {
      console.warn('API login unavailable, falling back to Firebase Web SDK:', err.message);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const displayName = userCredential.user.displayName || email.split('@')[0];
      
      localStorage.setItem('sc_token', token);
      localStorage.setItem('sc_uid', userCredential.user.uid);
      localStorage.setItem('sc_displayName', displayName);
      
      const userData = { uid: userCredential.user.uid, email: userCredential.user.email, displayName };
      setUser(userData);
      return userData;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      return res.data;
    } catch (err) {
      console.warn('API register unavailable, falling back to Firebase Web SDK:', err.message);
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      if (formData.displayName) {
        await updateFirebaseProfile(userCredential.user, { displayName: formData.displayName });
      }
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('sc_token', token);
      localStorage.setItem('sc_uid', userCredential.user.uid);
      localStorage.setItem('sc_displayName', formData.displayName || '');
      
      const userData = { uid: userCredential.user.uid, email: userCredential.user.email, displayName: formData.displayName };
      setUser(userData);
      return userData;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_uid');
    localStorage.removeItem('sc_displayName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
