// Utilitaires de manipulation de texte

/**
 * Supprime les accents d'un texte via normalisation Unicode
 */
export function removeAccents(text: string): string {
  return text
    .normalize('NFD')              // Décompose les caractères : "é" → "e" + "◌́"
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
}

/**
 * Vérifie si le texte contient des accents
 */
export function hasAccents(text: string): boolean {
  return text !== removeAccents(text);
}

/**
 * Vérifie si le texte contient des chiffres
 */
export function hasDigits(text: string): boolean {
  return /\d/.test(text);
}

/**
 * Convertit en majuscules
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/**
 * Convertit en minuscules
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

// ============================================
// Conversion des nombres en lettres (français)
// ============================================

const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

/**
 * Convertit un nombre entre 0 et 99 en lettres
 */
function convertTwoDigits(n: number): string {
  if (n === 0) return 'zero';
  if (n < 10) return UNITS[n];
  if (n >= 10 && n < 20) return TEENS[n - 10];

  const tens = Math.floor(n / 10);
  const units = n % 10;

  // Cas spéciaux pour 70-79 et 90-99
  if (tens === 7) {
    return units === 1 ? 'soixante et onze' : TEENS[units] === 'dix' ? 'soixante-dix' : 'soixante-' + TEENS[units];
  }
  if (tens === 9) {
    return units === 1 ? 'quatre-vingt-onze' : TEENS[units] === 'dix' ? 'quatre-vingt-dix' : 'quatre-vingt-' + TEENS[units];
  }

  // 80 prend un 's'
  if (n === 80) return 'quatre-vingts';

  // "et" entre dizaines et 1 (sauf 81, 91)
  if (units === 1 && tens !== 8 && tens !== 9) {
    return TENS[tens] + ' et un';
  }

  // Autres cas
  if (units === 0) {
    return TENS[tens];
  }

  return TENS[tens] + '-' + UNITS[units];
}

/**
 * Convertit un nombre entre 0 et 999 en lettres
 */
function convertThreeDigits(n: number): string {
  if (n === 0) return '';
  if (n < 100) return convertTwoDigits(n);

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  let result = '';

  // "cent" ou "cents"
  if (hundreds === 1) {
    result = 'cent';
  } else {
    result = UNITS[hundreds] + ' cent';
    if (remainder === 0) {
      result += 's'; // "deux cents" mais "deux cent un"
    }
  }

  if (remainder > 0) {
    result += ' ' + convertTwoDigits(remainder);
  }

  return result;
}

/**
 * Convertit un nombre entier en lettres (français)
 * Gère les nombres de 0 à 999 999 999 999 (milliards)
 */
export function numberToWords(n: number): string {
  if (n === 0) return 'zero';

  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const units = n % 1000;

  let result = '';

  if (billions > 0) {
    result += (billions === 1 ? 'un milliard' : convertThreeDigits(billions) + ' milliards');
  }

  if (millions > 0) {
    if (result) result += ' ';
    result += (millions === 1 ? 'un million' : convertThreeDigits(millions) + ' millions');
  }

  if (thousands > 0) {
    if (result) result += ' ';
    result += (thousands === 1 ? 'mille' : convertThreeDigits(thousands) + ' mille');
  }

  if (units > 0) {
    if (result) result += ' ';
    result += convertThreeDigits(units);
  }

  return result.trim();
}

/**
 * Remplace les nombres d'une chaîne par leur équivalent en lettres
 * Ex: "J'ai 123 pommes" → "J'ai cent vingt-trois pommes"
 */
export function replaceNumbers(text: string): string {
  let result = '';
  let currentNumber = '';
  let needsSeparator = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (/[0-9]/.test(char)) {
      // Accumule les chiffres pour former un nombre
      currentNumber += char;
    } else {
      // Fin d'un nombre
      if (currentNumber) {
        const num = parseInt(currentNumber, 10);
        const word = numberToWords(num);

        if (needsSeparator) {
          result += ' ' + word;
        } else {
          result += word;
        }
        currentNumber = '';
        needsSeparator = true;
      }

      // Ajoute le caractère actuel
      if (/[a-zA-Z]/.test(char)) {
        result += char;
        needsSeparator = true;
      } else {
        result += char;
        needsSeparator = false;
      }
    }
  }

  // Traite le dernier nombre si la chaîne se termine par un nombre
  if (currentNumber) {
    const num = parseInt(currentNumber, 10);
    const word = numberToWords(num);
    if (needsSeparator) {
      result += ' ' + word;
    } else {
      result += word;
    }
  }

  return result;
}
