// Utilitaires pour la résolution des chemins d'assets (images des codes)

const ASSETS_BASE = './assets/codes';

export type ImageFormat = 'svg' | 'png';

/**
 * Retourne le chemin d'une image de code
 */
export function getCodeImagePath(
  folder: string,
  name: string,
  format: ImageFormat = 'svg'
): string {
  return `${ASSETS_BASE}/${folder}/${name}.${format}`;
}

/**
 * Chemin pour l'affichage web (SVG)
 */
export function getDisplayImagePath(folder: string, name: string): string {
  return getCodeImagePath(folder, name, 'svg');
}

/**
 * Chemin pour la copie presse-papier (PNG)
 */
export function getCopyImagePath(folder: string, name: string): string {
  return getCodeImagePath(folder, name, 'png');
}

/**
 * Génère une balise <img> pour l'affichage
 */
export function renderImageTag(
  folder: string,
  name: string,
  format: ImageFormat = 'svg'
): string {
  const src = getCodeImagePath(folder, name, format);
  return `<img src="${src}" alt="${name}" class="code-symbol" />`;
}
