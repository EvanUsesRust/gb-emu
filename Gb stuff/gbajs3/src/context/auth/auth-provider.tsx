import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useInterval } from 'usehooks-ts';

import {
  AuthContext,
  type AuthContextProps,
  type AccessTokenSource
} from './auth-context.tsx';
import { useRefreshAccessToken } from '../../hooks/use-refresh.tsx';

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const fourMinutesInMS = 240 * 1000;
  const hasApiLocation = !!import.meta.env.VITE_GBA_SERVER_LOCATION;
  const [accessToken, setAccessToken] =
    useState<AuthContextProps['accessToken']>(null);
  const [accessTokenSource, setAccessTokenSource] =
    useState<AccessTokenSource>(null);

  // generate initial access token
  const {
    data: accessTokenResp,
    isLoading: refreshLoading,
    execute: executeRefresh,
    error: refreshTokenError,
    clearError: refreshClearError
  } = useRefreshAccessToken({ loadOnMount: hasApiLocation });

  const shouldSetAccessToken = !refreshLoading && !!accessTokenResp;

  // assign token to context
  useEffect(() => {
    if (shouldSetAccessToken) {
      setAccessToken(accessTokenResp);
      setAccessTokenSource('refresh');
    }
  }, [shouldSetAccessToken, accessTokenResp]);

  // convenience callback to determine if token is expired
  const isAuthenticated = useCallback(() => {
    if (accessToken) {
      const { exp } = jwtDecode<JwtPayload>(accessToken);

      if (exp && Date.now() <= exp * 1000) {
        return true;
      }
    }

    return false;
  }, [accessToken]);

  const shouldClearRefreshTokenError =
    isAuthenticated() && !accessTokenResp && accessTokenSource !== 'refresh';

  useEffect(() => {
    // if access token has changed from login, clear refresh errors.
    // resume attempts to periodically refresh the token
    if (shouldClearRefreshTokenError) {
      refreshClearError();
    }
  }, [shouldClearRefreshTokenError, refreshClearError]);

  // refresh access token every 4 minutes
  useInterval(
    async () => {
      await executeRefresh();
    },
    // TODO: re-evaluate whether or not auth check is desired
    isAuthenticated() && !refreshTokenError ? fourMinutesInMS : null
  );

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        setAccessTokenSource,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
