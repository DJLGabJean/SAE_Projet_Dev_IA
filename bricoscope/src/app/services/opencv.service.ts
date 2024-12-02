// src/app/services/opencv.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OpenCVService {
  private isOpenCvReady: boolean = false;

  constructor() {
    this.loadOpenCvScript();
  }

  private loadOpenCvScript() {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).cv) {
        this.isOpenCvReady = true;
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'assets/js/opencv.js';
        script.onload = () => {
          this.isOpenCvReady = true;
          resolve();
        };
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      }
    });
  }

  async detectObjects(imageElement: HTMLImageElement, canvasId: string) {
    await this.loadOpenCvScript();
    if (this.isOpenCvReady) {
      // Charger l'image
      const src = (window as any).cv.imread(imageElement);
      const gray = new (window as any).cv.Mat();
      const blurred = new (window as any).cv.Mat();
      const contours = new (window as any).cv.MatVector();
      const hierarchy = new (window as any).cv.Mat();

      // Convertir en niveaux de gris et appliquer un flou
      (window as any).cv.cvtColor(src, gray, (window as any).cv.COLOR_RGBA2GRAY);
      (window as any).cv.GaussianBlur(gray, blurred, new (window as any).cv.Size(5, 5), 0);

      // Détecter les contours
      (window as any).cv.Canny(blurred, gray, 50, 150);
      (window as any).cv.findContours(gray, contours, hierarchy, (window as any).cv.RETR_EXTERNAL, (window as any).cv.CHAIN_APPROX_SIMPLE);

      // Dessiner des cadres autour des objets détectés
      for (let i = 0; i < contours.size(); i++) {
        const rect = (window as any).cv.boundingRect(contours.get(i));
        (window as any).cv.rectangle(
          src,
          new (window as any).cv.Point(rect.x, rect.y),
          new (window as any).cv.Point(rect.x + rect.width, rect.y + rect.height),
          new (window as any).cv.Scalar(255, 0, 0, 255), // Couleur bleue pour les cadres
          2
        );
      }

      // Afficher le résultat dans le canvas
      (window as any).cv.imshow(canvasId, src);

      // Libérer les ressources
      src.delete(); gray.delete(); blurred.delete();
      contours.delete(); hierarchy.delete();
    }
  }
}
