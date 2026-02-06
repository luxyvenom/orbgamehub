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

const EAR_THRESHOLD = 0.22;
const BLINK_CONSEC_FRAMES = 2;

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

export interface EyeDetectionState {
  isReady: boolean;
  isBlinking: boolean;
  blinkCount: number;
  ear: number;
  error: string | null;
  faceDetected: boolean;
}

export function useEyeDetection(videoRef: React.RefObject<HTMLVideoElement | null>, active: boolean) {
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
  const consecFramesRef = useRef(0);
  const blinkCountRef = useRef(0);
  const lastBlinkRef = useRef(false);

  const initCamera = useCallback(async () => {
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
      setState((s) => ({ ...s, error: `Camera error: ${err}` }));
    }
  }, [videoRef]);

  const initLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
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
      landmarkerRef.current = landmarker;
      setState((s) => ({ ...s, isReady: true }));
    } catch (err) {
      setState((s) => ({ ...s, error: `Landmarker init error: ${err}` }));
    }
  }, []);

  const detect = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current || !active) return;

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
      const leftEAR = computeEAR(landmarks, LEFT_EYE_IDX);
      const rightEAR = computeEAR(landmarks, RIGHT_EYE_IDX);
      const avgEAR = (leftEAR + rightEAR) / 2;

      const eyesClosed = avgEAR < EAR_THRESHOLD;

      if (eyesClosed) {
        consecFramesRef.current++;
      } else {
        if (consecFramesRef.current >= BLINK_CONSEC_FRAMES && lastBlinkRef.current) {
          blinkCountRef.current++;
        }
        consecFramesRef.current = 0;
      }

      const isBlinking = consecFramesRef.current >= BLINK_CONSEC_FRAMES;
      lastBlinkRef.current = isBlinking;

      setState((s) => ({
        ...s,
        ear: avgEAR,
        isBlinking,
        blinkCount: blinkCountRef.current,
        faceDetected: true,
      }));
    } else {
      setState((s) => ({ ...s, faceDetected: false }));
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [active, videoRef]);

  useEffect(() => {
    if (!active) return;

    let mounted = true;

    const setup = async () => {
      await initLandmarker();
      await initCamera();
      if (mounted) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    };

    setup();

    return () => {
      mounted = false;
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
  }, [active, initCamera, initLandmarker, detect]);

  const resetBlinks = useCallback(() => {
    blinkCountRef.current = 0;
    consecFramesRef.current = 0;
    lastBlinkRef.current = false;
    setState((s) => ({ ...s, blinkCount: 0, isBlinking: false }));
  }, []);

  return { ...state, resetBlinks };
}
