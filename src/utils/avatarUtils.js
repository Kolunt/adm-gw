import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

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
 * @param {Object} user - Объект пользователя
 * @param {number} size - Размер аватарки
 * @returns {string} - Data URL аватарки
 */
export const getUserAvatar = (user, size = 64) => {
  if (!user) {
    return generateDefaultAvatar(size);
  }

  // Используем avatar_seed если есть, иначе генерируем на основе данных пользователя
  const seed = user.avatar_seed || `${user.username}_${user.email}_${user.id}`;
  return generateAvatar(seed, size);
};
