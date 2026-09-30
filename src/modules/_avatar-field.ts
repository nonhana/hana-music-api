import type { UnknownJson } from '../types/index.ts';

export const renameAvatarField = (value: UnknownJson): UnknownJson => {
  if (typeof value === 'string') {
    return value.replaceAll('avatarImgId_str', 'avatarImgIdStr');
  }
  if (Array.isArray(value)) {
    return value.map(renameAvatarField);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key.replaceAll('avatarImgId_str', 'avatarImgIdStr'),
        renameAvatarField(entry),
      ]),
    );
  }
  return value;
};
