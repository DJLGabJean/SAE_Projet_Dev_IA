import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { OpenCVService } from '../opencv.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  selectedImage: string | undefined;

  constructor(private opencvService: OpenCVService) {}

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
      this.opencvService.detectObjects(imgElement, 'canvasOutput');
    };
  }
}



