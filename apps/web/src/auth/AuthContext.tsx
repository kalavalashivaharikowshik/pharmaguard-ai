import {
  createContext,
  useContext,
  useState,
} from 'react';

import { socket } from '../socket';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(() => {

      const savedToken =
        localStorage.getItem(
          'token',
        );

      if (savedToken) {

        socket.auth = {

          token: savedToken,

        };

        socket.connect();

      }

      return savedToken;

    });


  const login = (
    token: string,
  ) => {

    localStorage.setItem(
      'token',
      token,
    );

    socket.auth = {
      token,
    };

    if (!socket.connected) {
      socket.connect();
    }

    setToken(
      token,
    );

  };

  const logout = () => {

    socket.disconnect();

    localStorage.removeItem(
      'token',
    );

    localStorage.removeItem(
      'role',
    );

    localStorage.removeItem(
      'user',
    );

    setToken(
      null,
    );

  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);