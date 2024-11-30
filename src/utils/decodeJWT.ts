// src/utils/decodeJWT.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

export const decodeJWT = (token: string): DecodedToken => {
  return jwtDecode<DecodedToken>(token);
};
