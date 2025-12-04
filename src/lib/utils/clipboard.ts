/**
 * Utilitaires pour le presse-papier
 */

/**
 * Copie du texte dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
}

/**
 * Lit le contenu du presse-papier
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error('Erreur lors de la lecture du presse-papier:', error);
    return null;
  }
}

/**
 * Convertit une image en base64
 */
async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Copie du HTML avec images embarquées en base64 dans le presse-papier
 * Utilise le DOM rendu pour conserver les tailles CSS
 */
export async function copyHtmlWithImagesToClipboard(htmlElement: HTMLElement): Promise<boolean> {
  try {
    // Clone l'élément pour ne pas modifier l'original
    const clone = htmlElement.cloneNode(true) as HTMLElement;

    // Trouve toutes les images dans le clone et l'original
    const cloneImages = clone.querySelectorAll('img');
    const originalImages = htmlElement.querySelectorAll('img');

    // Convertit toutes les images en base64 et applique les tailles rendues
    const promises = Array.from(cloneImages).map(async (img, index) => {
      try {
        // Convertir SVG en PNG via le chemin .png
        let imgUrl = img.src;
        if (imgUrl.endsWith('.svg')) {
          imgUrl = imgUrl.replace('.svg', '.png');
        }

        const base64 = await imageToBase64(imgUrl);
        img.src = base64;

        // Appliquer la taille rendue de l'image originale
        const original = originalImages[index];
        if (original) {
          const rect = original.getBoundingClientRect();
          img.style.width = `${Math.round(rect.width)}px`;
          img.style.height = `${Math.round(rect.height)}px`;
        }
      } catch (error) {
        console.error('Erreur lors de la conversion de l\'image:', error);
      }
    });

    await Promise.all(promises);

    // Récupère le HTML avec les images en base64
    let htmlContent = clone.innerHTML;

    // Crée un ClipboardItem avec le HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const plainText = clone.textContent || '';
    const textBlob = new Blob([plainText], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': textBlob
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie HTML:', error);
    return false;
  }
}
