'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

// MediaPipe Face Mesh eye landmark indices
const LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144];

// All eye contour landmarks for drawing
const LEFT_EYE_CONTOUR = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const RIGHT_EYE_CONTOUR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const LEFT_IRIS = [474, 475, 476, 477];
const RIGHT_IRIS = [469, 470, 471, 472];

// Catches squinting (실눈). Normal open eyes ~0.28-0.40. Instant detection.
const EAR_THRESHOLD = 0.25;

function computeEAR(landmarks: { x: number; y: number; z: number }[], indices: number[]): number {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const vertical1 = Math.sqrt((p2.x - p6.x) ** 2 + (p2.y - p6.y) ** 2);
  const vertical2 = Math.sqrt((p3.x - p5.x) ** 2 + (p3.y - p5.y) ** 2);
  const horizontal = Math.sqrt((p1.x - p4.x) ** 2 + (p1.y - p4.y) ** 2);

  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

function drawEyeTracking(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: { x: number; y: number; z: number }[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  const drawContour = (indices: number[], color: string) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < indices.length; i++) {
      const pt = landmarks[indices[i]];
      const x = pt.x * w;
      const y = pt.y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawIris = (indices: number[], color: string) => {
    for (const idx of indices) {
      const pt = landmarks[idx];
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(pt.x * w, pt.y * h, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawKeyPoints = (indices: number[], color: string) => {
    for (const idx of indices) {
      const pt = landmarks[idx];
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(pt.x * w, pt.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  drawContour(LEFT_EYE_CONTOUR, '#00ff88');
  drawContour(RIGHT_EYE_CONTOUR, '#00ff88');
  drawIris(LEFT_IRIS, '#00ffff');
  drawIris(RIGHT_IRIS, '#00ffff');
  drawKeyPoints(LEFT_EYE_IDX, '#44ff44');
  drawKeyPoints(RIGHT_EYE_IDX, '#44ff44');
}

export interface EyeDetectionState {
  isReady: boolean;
  isBlinking: boolean;
  blinkCount: number;
  ear: number;
  error: string | null;
  faceDetected: boolean;
}

export function useEyeDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean,
  onBlinkDetected?: () => void
) {
  const onBlinkRef = useRef(onBlinkDetected);
  onBlinkRef.current = onBlinkDetected;

  // Use ref for active so detect() doesn't recreate on phase changes
  const activeRef = useRef(active);
  activeRef.current = active;

  const [state, setState] = useState<EyeDetectionState>({
    isReady: false,
    isBlinking: false,
    blinkCount: 0,
    ear: 0,
    error: null,
    faceDetected: false,
  });

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const blinkFiredRef = useRef(false);
  const blinkCountRef = useRef(0);
  const initedRef = useRef(false);

  const initCamera = useCallback(async () => {
    if (streamRef.current) return; // Already initialized
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setState((s) => ({ ...s, error: `Camera access denied. Please allow camera permission. (${err})` }));
    }
  }, [videoRef]);

  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return; // Already initialized
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      let landmarker: FaceLandmarker;
      try {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      }

      landmarkerRef.current = landmarker;
      setState((s) => ({ ...s, isReady: true }));
    } catch (err) {
      setState((s) => ({ ...s, error: `Failed to load face detection model: ${err}` }));
    }
  }, []);

  // Stable detect function - uses refs instead of state to avoid recreating
  const detect = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current || !activeRef.current) {
      // Keep looping even if not active, so we resume instantly on phase change
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const result: FaceLandmarkerResult = landmarkerRef.current.detectForVideo(
      video,
      performance.now()
    );

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      const landmarks = result.faceLandmarks[0];

      if (canvasRef.current && video) {
        drawEyeTracking(canvasRef.current, video, landmarks);
      }

      const leftEAR = computeEAR(landmarks, LEFT_EYE_IDX);
      const rightEAR = computeEAR(landmarks, RIGHT_EYE_IDX);
      const avgEAR = (leftEAR + rightEAR) / 2;

      const eyesClosed = avgEAR < EAR_THRESHOLD;

      // Instant detection: fire on the FIRST frame eyes drop below threshold
      if (eyesClosed && !blinkFiredRef.current) {
        blinkFiredRef.current = true;
        blinkCountRef.current++;
        if (onBlinkRef.current) {
          onBlinkRef.current();
        }
      }
      if (!eyesClosed) {
        blinkFiredRef.current = false;
      }

      const isBlinking = eyesClosed;

      setState((s) => ({
        ...s,
        ear: avgEAR,
        isBlinking,
        blinkCount: blinkCountRef.current,
        faceDetected: true,
      }));
    } else {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setState((s) => ({ ...s, faceDetected: false }));
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, canvasRef]);

  // Initialize once when active becomes true, never re-init on phase changes
  useEffect(() => {
    if (!active) return;
    if (initedRef.current) return; // Already initialized
    initedRef.current = true;

    const setup = async () => {
      await initLandmarker();
      await initCamera();
      animFrameRef.current = requestAnimationFrame(detect);
    };

    setup();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  const resetBlinks = useCallback(() => {
    blinkCountRef.current = 0;
    blinkFiredRef.current = false;
    setState((s) => ({ ...s, blinkCount: 0, isBlinking: false }));
  }, []);

  return { ...state, resetBlinks };
}
