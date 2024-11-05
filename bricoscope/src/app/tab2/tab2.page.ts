import { Component } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';

const cameraPreviewOptions: CameraPreviewOptions = {
  position: 'rear',
  height: 1920,
  width: 1080
};
CameraPreview.start(cameraPreviewOptions);

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  image: string | null = null;
  cameraActive = false;
  loading = false;

  constructor() {}

  openCamera() {
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent : 'cameraPreview',
      className : 'cameraPreview',
    };
    this.loading = true;
    setTimeout(() => {
      CameraPreview.start(cameraPreviewOptions);
      this.loading = false;
    }, 1500);
    this.cameraActive = true;
  }

  async stopCamera() {
    CameraPreview.stop();
    this.cameraActive = false;
  }

  async captureImage() {
    const cameraPreviewPictureOptions = {
      quality: 90
    };

    const result = await CameraPreview.capture({ quality: 90 });
    this.image = `data:image/jpeg;base64,${result.value}`;
    this.stopCamera();
  }

  flipCamera() {
    CameraPreview.flip();
  }

  clearImage() {
    this.image = null;
  }
}
