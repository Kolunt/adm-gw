import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Библиотека предустановленных аватарок (та же, что в Profile/index.js)
const AVATAR_LIBRARY = [
  { value: 'adventurer', label: 'Искатель приключений', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' },
  { value: 'avataaars', label: 'Avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' },
  { value: 'big-ears', label: 'Большие уши', url: 'https://api.dicebear.com/7.x/big-ears/svg?seed=' },
  { value: 'big-smile', label: 'Большая улыбка', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=' },
  { value: 'bottts', label: 'Боты', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' },
  { value: 'croodles', label: 'Крудлы', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=' },
  { value: 'fun-emoji', label: 'Веселые эмодзи', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=' },
  { value: 'icons', label: 'Иконки', url: 'https://api.dicebear.com/7.x/icons/svg?seed=' },
  { value: 'identicon', label: 'Идентикон', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' },
  { value: 'lorelei', label: 'Лорелей', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=' },
  { value: 'micah', label: 'Майка', url: 'https://api.dicebear.com/7.x/micah/svg?seed=' },
  { value: 'miniavs', label: 'Мини-аватары', url: 'https://api.dicebear.com/7.x/miniavs/svg?seed=' },
  { value: 'open-peeps', label: 'Открытые люди', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=' },
  { value: 'personas', label: 'Персоны', url: 'https://api.dicebear.com/7.x/personas/svg?seed=' },
  { value: 'pixel-art', label: 'Пиксель-арт', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' },
  { value: 'rings', label: 'Кольца', url: 'https://api.dicebear.com/7.x/rings/svg?seed=' },
  { value: 'shapes', label: 'Фигуры', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=' },
  { value: 'thumbs', label: 'Большие пальцы', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=' },
];

/**
 * Генерирует URL аватарки на основе seed
 * @param {string} seed - Уникальный seed для генерации аватарки
 * @param {number} size - Размер аватарки (по умолчанию 64)
 * @returns {string} - Data URL аватарки
 */
export const generateAvatar = (seed, size = 64) => {
  if (!seed) {
    // Если нет seed, генерируем случайную аватарку
    seed = `random_${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    const avatar = createAvatar(avataaars, {
      seed: seed,
      size: size,
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      // Дополнительные опции для разнообразия
      skinColor: ['fdbcb4', 'fd9841', 'f8d25c', 'e0a899', '9b5523', '8d5524'],
      hairColor: ['auburn', 'black', 'blonde', 'blondeGolden', 'brown', 'brownDark', 'pastelPink', 'red'],
      eyeColor: ['amber', 'green', 'brown', 'gray', 'green', 'hazel'],
      eyebrowType: ['angry', 'angryNatural', 'default', 'defaultNatural', 'flatNatural', 'frownNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'],
      mouthType: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
      topType: ['hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'longHairBigHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairCurvy', 'longHairDreads', 'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairNotTooLong', 'longHairShavedSides', 'longHairMiaWallace', 'longHairStraight', 'longHairStraight2', 'longHairStraightStrand', 'shortHairDreads01', 'shortHairDreads02', 'shortHairFrizzle', 'shortHairShaggyMullet', 'shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortRound', 'shortHairShortWaved', 'shortHairSides', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart', 'noHair']
    });

    return avatar.toDataUri();
  } catch (error) {
    console.error('Error generating avatar:', error);
    // Возвращаем дефолтную аватарку в случае ошибки
    return generateDefaultAvatar(size);
  }
};

/**
 * Генерирует дефолтную аватарку
 * @param {number} size - Размер аватарки
 * @returns {string} - Data URL дефолтной аватарки
 */
export const generateDefaultAvatar = (size = 64) => {
  const avatar = createAvatar(avataaars, {
    seed: 'default',
    size: size,
    backgroundColor: ['b6e3f4'],
    skinColor: ['fdbcb4'],
    hairColor: ['brown'],
    eyeColor: ['brown'],
    eyebrowType: ['default'],
    mouthType: ['smile'],
    topType: ['shortHairShortFlat']
  });

  return avatar.toDataUri();
};

/**
 * Генерирует аватарку для пользователя
 * Поддерживает новую логику с avatar_type и библиотекой DiceBear
 * @param {Object} user - Объект пользователя
 * @param {number} size - Размер аватарки
 * @returns {string} - URL или Data URL аватарки
 */
export const getUserAvatar = (user, size = 64) => {
  if (!user) {
    return generateDefaultAvatar(size);
  }

  // Если у пользователя указан avatar_type из библиотеки, используем его
  if (user.avatar_type && AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type)) {
    const avatarConfig = AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type);
    // Используем сохраненный avatar_seed, если он есть, иначе email или id
    const seed = user.avatar_seed || user.email || user.id || 'default';
    return `${avatarConfig.url}${seed}`;
  }

  // Старая логика: если avatar_type не указан, используем generateAvatar
  const seed = user.avatar_seed || `${user.email || ''}_${user.id || ''}` || 'default';
  return generateAvatar(seed, size);
};
