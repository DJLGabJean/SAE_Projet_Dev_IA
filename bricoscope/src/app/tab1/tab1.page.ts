import { Component, ViewChild, type ElementRef } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { TensorflowjsService } from '../services/tensorflowjs.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild("canvasOutput", { static: true }) canvasOutput!: ElementRef<HTMLCanvasElement>

  selectedImage: string | undefined

  constructor(
    private tensorflowService: TensorflowjsService,
    private platform: Platform,
  ) {}

  async importFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      })

      this.selectedImage = image.webPath
      console.log("Image importée:", image.webPath)

      const imgElement = new Image()
      imgElement.crossOrigin = "anonymous" // Important pour éviter les erreurs CORS
      imgElement.src = this.selectedImage!

      imgElement.onload = () => {
        const resizedImage = this.resizeImage(imgElement)
        const resizedImageElement = new Image()
        resizedImageElement.crossOrigin = "anonymous"
        resizedImageElement.src = resizedImage.toDataURL()

        resizedImageElement.onload = () => {
          // Utiliser le service TensorflowJS pour la détection
          this.tensorflowService.detect(resizedImageElement, this.canvasOutput.nativeElement)
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'importation de l'image:", error)
    }
  }

  resizeImage(img: HTMLImageElement): HTMLCanvasElement {
    const maxWidth = this.platform.width()
    const maxHeight = this.platform.height()
    let width = img.width
    let height = img.height

    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    ctx!.drawImage(img, 0, 0, width, height)

    return canvas
  }
}