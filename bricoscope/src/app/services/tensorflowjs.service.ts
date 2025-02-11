import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import labels from '../../assets/json/labels.json';

@Injectable({
  providedIn: 'root'
})
export class TensorflowjsService {
  private model: tf.GraphModel | null = null;
  private labels: string[] = labels;
  private colors: Colors;

  constructor() {
    this.loadModel();
    this.colors = new Colors();
  }

  private async loadModel() {
    // Charge le modèle pré-entraîné Yolov8
    this.model = await tf.loadGraphModel('assets/model/model.json');
  }

  private preprocess(source: HTMLVideoElement | HTMLImageElement, modelWidth: number, modelHeight: number): [tf.Tensor, number, number] {
    return tf.tidy(() => {
      const img = tf.browser.fromPixels(source);
      const [h, w] = img.shape.slice(0, 2);
      const maxSize = Math.max(w, h);
      const imgPadded = img.pad([
        [0, maxSize - h],
        [0, maxSize - w],
        [0, 0],
      ]);

      const xRatio = maxSize / w;
      const yRatio = maxSize / h;

      const input = tf.image
        .resizeBilinear(imgPadded as tf.Tensor3D, [modelWidth, modelHeight])
        .div(255.0)
        .expandDims(0);

      return [input, xRatio, yRatio];
    });
  }

  public async detect(source: HTMLImageElement | HTMLVideoElement, canvasRef: HTMLCanvasElement): Promise<void> {
    if (!this.model) {
      console.error("Le modèle n'est pas encore chargé")
      return
    }

    const [modelWidth, modelHeight] =
      this.model && this.model.inputs[0].shape ? this.model.inputs[0].shape.slice(1, 3) : [0, 0]

    tf.engine().startScope()
    const [input, xRatio, yRatio] = this.preprocess(source, modelWidth, modelHeight)

    const res = this.model.execute(input) as tf.Tensor
    const transRes = res.transpose([0, 2, 1])
    const boxes = tf.tidy(() => {
      const w = transRes.slice([0, 0, 2], [-1, -1, 1])
      const h = transRes.slice([0, 0, 3], [-1, -1, 1])
      const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2))
      const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2))
      return tf.concat([y1, x1, tf.add(y1, h), tf.add(x1, w)], 2).squeeze()
    })

    const [scores, classes] = tf.tidy(() => {
      // Correction du slice pour utiliser un array pour les dimensions
      const rawScores = transRes.slice([0, 0, 4], [-1, -1, this.labels.length]).squeeze([0])
      // Utilisation de la méthode as() pour assurer le type correct
      return [rawScores.max(1), rawScores.argMax(1)] as [tf.Tensor1D, tf.Tensor1D]
    })

    // Assurez-vous que boxes est un Tensor2D avant nonMaxSuppression
    const reshapedBoxes = boxes.reshape([-1, 4])
    const nms = await tf.image.nonMaxSuppressionAsync(
      reshapedBoxes as tf.Tensor2D,
      scores as tf.Tensor1D,
      500,
      0.45,
      0.2,
    )

    // Conversion explicite des données en Float32Array
    const boxes_data = new Float32Array(boxes.gather(nms, 0).dataSync())
    const scores_data = new Float32Array(scores.gather(nms, 0).dataSync())
    const classes_data = new Float32Array(classes.gather(nms, 0).dataSync())

    this.renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [xRatio, yRatio])

    // Nettoyage des tenseurs
    tf.dispose([res, transRes, boxes, scores, classes, nms, reshapedBoxes])

    tf.engine().endScope()
  }

  public detectVideo(vidSource: HTMLVideoElement, canvasRef: HTMLCanvasElement): void {
    const detectFrame = async () => {
      if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
        const ctx = canvasRef.getContext('2d');
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
      }

      await this.detect(vidSource, canvasRef);
      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }

  private renderBoxes(
    canvasRef: HTMLCanvasElement,
    boxes_data: Float32Array,
    scores_data: Float32Array,
    classes_data: Float32Array,
    ratios: number[]
  ): void {
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

    // font configs
    const font = `${Math.max(
      Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
      14
    )}px Arial`;
    ctx.font = font;
    ctx.textBaseline = 'top';

    for (let i = 0; i < scores_data.length; ++i) {
      const klass = this.labels[classes_data[i]];
      const color = this.colors.get(classes_data[i]);
      const score = (scores_data[i] * 100).toFixed(1);

      let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= ratios[0];
      x2 *= ratios[0];
      y1 *= ratios[1];
      y2 *= ratios[1];
      const width = x2 - x1;
      const height = y2 - y1;

      // draw box.
      ctx.fillStyle = Colors.hexToRgba(color, 0.2);
      ctx.fillRect(x1, y1, width, height);

      // draw border box.
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
      ctx.strokeRect(x1, y1, width, height);

      // Draw the label background.
      ctx.fillStyle = color;
      const textWidth = ctx.measureText(klass + ' - ' + score + '%').width;
      const textHeight = parseInt(font, 10); // base 10
      const yText = y1 - (textHeight + ctx.lineWidth);
      ctx.fillRect(
        x1 - 1,
        yText < 0 ? 0 : yText,
        textWidth + ctx.lineWidth,
        textHeight + ctx.lineWidth
      );

      // Draw labels
      ctx.fillStyle = '#ffffff';
      ctx.fillText(klass + ' - ' + score + '%', x1 - 1, yText < 0 ? 0 : yText);
    }
  }
}

class Colors {
  private palette: string[];
  private n: number;

  constructor() {
    this.palette = [
      '#FF3838', '#FF9D97', '#FF701F', '#FFB21D', '#CFD231', '#48F90A', '#92CC17', '#3DDB86',
      '#1A9334', '#00D4BB', '#2C99A8', '#00C2FF', '#344593', '#6473FF', '#0018EC', '#8438FF',
      '#520085', '#CB38FF', '#FF95C8', '#FF37C7'
    ];
    this.n = this.palette.length;
  }

  public get(i: number): string {
    return this.palette[Math.floor(i) % this.n];
  }

  public static hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
      : '';
  }
}
