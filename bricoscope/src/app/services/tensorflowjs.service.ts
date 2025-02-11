import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

@Injectable({
  providedIn: 'root'
})
export class TensorflowjsService {
  constructor() { }
  
  private model: tf.GraphModel | null = null;

  async loadModel(modelPath: string): Promise<void> {
    try {
      this.model = await tf.loadGraphModel(modelPath);
      console.log("YOLOv8 Model Loaded Successfully");
    } catch (error) {
      console.error("Error loading YOLOv8 model", error);
    }
  }

  async detect(image: HTMLImageElement | HTMLVideoElement): Promise<any[]> {
    if (!this.model) {
      throw new Error("Model is not loaded yet");
    }

    const inputTensor = tf.browser.fromPixels(image).expandDims(0).toFloat().div(255.0); // Normalisation
    const predictions = await this.model.executeAsync(inputTensor) as tf.Tensor[];
    inputTensor.dispose(); // Libération mémoire

    return predictions.map(pred => pred.arraySync());
  }
}
