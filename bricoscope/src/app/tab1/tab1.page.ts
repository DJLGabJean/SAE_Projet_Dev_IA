import { Component } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { TensorflowjsService } from '../services/tensorflowjs.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  selectedImage: string | undefined;
  canvasOutput!: HTMLCanvasElement;

  constructor(
    private tensorflowService: TensorflowjsService,
    private platform: Platform,
  ) {}

  ngAfterViewInit() {
    this.canvasOutput = document.getElementById("canvasOutput") as HTMLCanvasElement;
    if (!this.canvasOutput) {
      console.error("❌ Le canvasOutput n'a pas été trouvé !");
    } else {
      console.log("✅ Canvas bien récupéré :", this.canvasOutput);
    }
  }

  async importFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      this.selectedImage = image.webPath;
      console.log("📷 Image importée :", image.webPath);

      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous"; // Important pour éviter les erreurs CORS
      imgElement.src = this.selectedImage!;

      imgElement.onload = () => {
        console.log("🔄 Image chargée, redimensionnement en cours...");
        const resizedImage = this.resizeImage(imgElement);

        setTimeout(() => {
          // Affichage de l'image redimensionnée sur le canvas
          const ctx = this.canvasOutput.getContext("2d");
          if (!ctx) {
            console.error("❌ Impossible d'obtenir le contexte 2D du canvas !");
            return;
          }

          this.canvasOutput.width = resizedImage.width;
          this.canvasOutput.height = resizedImage.height;
          ctx.clearRect(0, 0, this.canvasOutput.width, this.canvasOutput.height);
          ctx.drawImage(resizedImage, 0, 0, this.canvasOutput.width, this.canvasOutput.height);
          console.log("✅ Image affichée sur le canvas !");

          // Maintenant, on passe à la détection avec TensorFlow
          const dataUrl = this.canvasOutput.toDataURL();
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            this.tensorflowService.detect(img, this.canvasOutput);
          };
        }, 200); // Timer pour éviter tout souci de chargement
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'importation de l'image:", error);
    }
  }

  resizeImage(img: HTMLImageElement): HTMLCanvasElement {
    const maxWidth = this.platform.width();
    const maxHeight = this.platform.height();

    let width = img.width;
    let height = img.height;

    // Garde les proportions en fonction du plus grand côté
    const scale = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    // Création du canvas avec les nouvelles dimensions
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Vérification du contexte 2D
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Impossible d'obtenir le contexte du canvas !");
        return canvas;
    }

    // Dessine l'image avec la bonne échelle
    ctx.drawImage(img, 0, 0, width, height);

    console.log(`✅ Image redimensionnée : ${width}x${height}`);
    return canvas;
  }
}