// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'superadmin' | 'contentadmin' | 'trainer' | 'student' | 'centeradmin';
//   center?: any;
//   studentDetails?: any;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Set up axios defaults
// axios.defaults.baseURL = 'http://localhost:7071/api';

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(
//     localStorage.getItem('accessToken')
//   );
//   const [refreshToken, setRefreshToken] = useState<string | null>(
//     localStorage.getItem('refreshToken')
//   );
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   if (token) {
//   //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   //     fetchUser();
//   //   } else {
//   //     setLoading(false);
//   //   }
//   // }, [token]);

//   useEffect(() => {
//   const localToken = localStorage.getItem('accessToken');

//   if (localToken) {
//     setToken(localToken); // trigger second effect below
//   } else {
//     setLoading(false);
//   }
// }, []);

//   useEffect(() => {
//   const localToken = localStorage.getItem('accessToken');
//   if (localToken) {
//     axios.defaults.headers.common['Authorization'] = `Bearer ${localToken}`;
//     if (!user) {
//       // fetchUser(localToken);
//       if (!user && token) fetchUser(localToken);

//     }
//   } else {
//     setLoading(false);
//   }
// }, [user, token]);


//   const fetchUser = async (token: string) => {
//     try {
//       console.log('TOKEN in state:', token);
// console.log('AUTH HEADER:', axios.defaults.headers.common['Authorization']);
//       const response = await axios.get('/auth/me', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         }}
//       );

//     //   if (!response.data.user) {
//     //   console.warn('No user returned from /auth/me, skipping setUser');
//     // } else {
//     //   setUser(response.data.user);
//     //   console.warn('user returned from /auth/me');

//     // }

//       setUser(response.data.user);
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await axios.post('/auth/login', { email, password });

//       const {
//         accessToken,
//         refreshToken,
//         user,
//       } = response.data;

//       console.log('Login response:', { accessToken, refreshToken, user });

//       setToken(accessToken);
//       setRefreshToken(refreshToken);
//       setUser(user);

//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

//       toast.success('Login successful!');
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     try {
//       const response = await axios.post('/auth/register', userData);
//       const { accessToken, user: newUser } = response.data;

//       setToken(accessToken);
//       setUser(newUser);
//       localStorage.setItem('accessToken', accessToken);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

//       toast.success('Registration successful!');
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     setRefreshToken(null);
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     delete axios.defaults.headers.common['Authorization'];
//     toast.success('Logged out successfully');
//   };

//   const value: AuthContextType = {
//     user,
//     token,
//     login,
//     register,
//     logout,
//     loading,
//   };

//   console.log('AuthContext value:', { user, token, loading });
  
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   console.log(context);
  
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'contentadmin' | 'trainer' | 'student' | 'centeradmin';
  center?: any;
  studentDetails?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.baseURL = 'http://localhost:7071/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refreshToken')
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      setToken(localToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!token) return;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await axios.get('/auth/me');
        const me = res.data.user;
        if (me) {
          setUser(me);
        } else {
          console.warn('Auth/me returned no user');
          // logout();
        }
      } catch (err: any) {
        console.error('Auth/me error:', err);
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    const { accessToken, user: me } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(me));
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setRefreshToken(res.data.refreshToken);
    setToken(accessToken);
    setUser(me);
    toast.success('Login successful!');
  };

  const register = async (data: any) => {
    const res = await axios.post('/auth/register', data);
    const { accessToken, user: me } = res.data;
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);
    setUser(me);
    toast.success('Registration successful!');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  console.log('AuthContext:', ctx);
  if (ctx === undefined) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};

