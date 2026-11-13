import type { Session } from '../../../features/auth/authSlice';
import type { LoginDto } from '../dto';
import { text } from './common';

/**
 * The backend returns one display name; the app's profile shows a first and
 * last name, so the name is split on the first space and never guessed at.
 */
const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: 'Guest', lastName: '' };
  }
  const separator = trimmed.indexOf(' ');
  return separator === -1
    ? { firstName: trimmed, lastName: '' }
    : { firstName: trimmed.slice(0, separator), lastName: trimmed.slice(separator + 1) };
};

export function mapLoginToSession(dto: LoginDto, fallbackEmail: string): Session {
  const { firstName, lastName } = splitName(text(dto.userName));

  return {
    accessToken: text(dto.token),
    user: {
      id: String(dto.userID ?? ''),
      firstName,
      lastName,
      email: text(dto.userEmail, fallbackEmail),
    },
  };
}
