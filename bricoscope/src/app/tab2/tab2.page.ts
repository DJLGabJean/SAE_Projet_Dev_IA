import { Component } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

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

  async checkCameraPermission(): Promise<boolean> {
    // Vérifie si la plateforme est mobile
    const platform = Capacitor.getPlatform();
    if (platform !== 'ios' && platform !== 'android') {
      console.log('Pas de gestion des permissions sur cette plateforme');
      return true; // Retourne "true" pour ignorer la demande de permission sur le web
    }

    // Demande la permission pour la caméra
    const permissions = await Camera.requestPermissions({ permissions: ['camera'] });
    return permissions.camera === 'granted';
  }

  async openCamera() {
    if (this.cameraActive) {
      console.log('Caméra déjà active');
      return;
    }

    const hasPermission = await this.checkCameraPermission();
    if (!hasPermission) {
      console.log('Permission refusée');
      return;
    }

    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent: 'cameraPreview',
      className: 'cameraPreview',
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

  ionViewWillLeave() {
    if (this.cameraActive) {
      this.stopCamera();
    }
  }
}
