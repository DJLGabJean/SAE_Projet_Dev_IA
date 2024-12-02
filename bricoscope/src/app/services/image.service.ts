import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from '../../environments/environment';
import { readAndCompressImage } from 'browser-image-resizer';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private storage: AngularFireStorage) {}

  // Options de redimensionnement (recommandé pour YOLOv8 : 640x640)
  private resizeOptions = {
    quality: 0.9,
    maxWidth: 640,
    maxHeight: 640,
    autoRotate: true,
    debug: true,
  };

  // Redimensionner et télécharger une image
  async uploadImage(file: File): Promise<string> {
    try {
      // Redimensionner l'image
      const resizedImage = await readAndCompressImage(file, this.resizeOptions);

      // Convertir en Blob
      const resizedBlob = new Blob([resizedImage], { type: file.type });

      // Chemin dans Firebase Storage
      const filePath = `images/${Date.now()}_${file.name}`;

      // Télécharger vers Firebase
      const storageRef = this.storage.ref(filePath);
      const uploadTask = await storageRef.put(resizedBlob);

      // Obtenir l'URL de téléchargement
      const downloadURL = await storageRef.getDownloadURL().toPromise();
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l’image :', error);
      throw error;
    }
  }
}
