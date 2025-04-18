// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/authService';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is stored in session storage on load
  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    const roleData = sessionStorage.getItem('role');
    
    if (userData && roleData) {
      setCurrentUser(JSON.parse(userData));
      setUserRole(roleData);
    }
    
    setLoading(false);
  }, []);

  // Custom login function
  const login = async (id, password) => {
    // Check if admin
    const adminDocRef = doc(db, 'Admin', 'Admin');
    const adminDocSnap = await getDoc(adminDocRef);

    if (adminDocSnap.exists() && adminDocSnap.data().ID === parseInt(id) && adminDocSnap.data().Password === password) {
      const user = {
        id: adminDocSnap.data().ID,
        displayName: 'Admin'
      };
      
      setCurrentUser(user);
      setUserRole('admin');
      
      // Store in session storage
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', 'admin');
      
      return { success: true, role: 'admin' };
    }

    // Check if evaluator
    const evaluatorQuery = query(
      collection(db, 'Evaluator'),
      where('ID', '==', parseInt(id))
    );
    const evaluatorSnapshot = await getDocs(evaluatorQuery);

    if (!evaluatorSnapshot.empty) {
      const evaluatorData = evaluatorSnapshot.docs[0].data();
      
      if (evaluatorData.Password === password) {
        if (!evaluatorData.Active) {
          return { 
            success: false, 
            error: 'Account is inactive. Please contact the admin.'
          };
        }
        
        const user = {
          id: evaluatorData.ID,
          displayName: evaluatorData.Name || 'Evaluator',
          docId: evaluatorSnapshot.docs[0].id,
          active: evaluatorData.Active
        };
        
        setCurrentUser(user);
        setUserRole('evaluator');
        
        // Store in session storage
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('role', 'evaluator');
        
        return { success: true, role: 'evaluator' };
      }
    }
    
    return { 
      success: false, 
      error: 'Invalid credentials. Please try again.'
    };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
  };

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}