import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { OpenCVService } from '../services/opencv.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  selectedImage: string | undefined;

  constructor(
    private opencvService: OpenCVService,
    private platform: Platform
  ) {}

  async importFromGallery() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    this.selectedImage = image.webPath;
    console.log('Image importée:', image.webPath);

    const imgElement = new Image();
    imgElement.src = this.selectedImage!;
    imgElement.onload = () => {
      const resizedImage = this.resizeImage(imgElement);
      const resizedImageElement = new Image();
      resizedImageElement.src = resizedImage.toDataURL();
      resizedImageElement.onload = () => {
        this.opencvService.detectObjects(resizedImageElement, 'canvasOutput');
      };
    };
  }

  resizeImage(img: HTMLImageElement): HTMLCanvasElement {
    const maxWidth = this.platform.width();
    const maxHeight = this.platform.height();
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx!.drawImage(img, 0, 0, width, height);

    return canvas;
  }
}


