import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    userId: string;
    // Add other properties that are in your JWT payload
  }

export function decodeToken(): string | null {
  const token = localStorage.getItem('token');
  console.log("getItem-token"+ token)
  if (!token) {
    console.error('No token found in localStorage');
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    console.log("decoded.userId"+decoded.userId)
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}