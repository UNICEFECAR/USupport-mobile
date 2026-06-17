import { useCallback, useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";

// expo-av reports dB in roughly [-160, 0]. Ambient noise is often ~-50 to -35 dB,
// so mapping the full range makes silence look like 50%+.
const METER_MIN_DB = -50;
const METER_MAX_DB = -10;

const meteringToPercent = (metering) => {
  if (metering <= METER_MIN_DB) return 0;
  if (metering >= METER_MAX_DB) return 100;
  return Math.round(
    ((metering - METER_MIN_DB) / (METER_MAX_DB - METER_MIN_DB)) * 100
  );
};

/**
 * Mobile equivalent of client-ui `useMediaPreview`.
 * - Video preview uses `expo-camera`
 * - Mic level uses `expo-av` metering (best-effort; platform-dependent)
 */
export function useMediaPreview(isActive) {
  const recordingRef = useRef(null);
  const audioEnabledRef = useRef(true);
  const smoothedMicLevelRef = useRef(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const stopStream = useCallback(async () => {
    setHasStream(false);
    setMicLevel(0);
    smoothedMicLevelRef.current = 0;
    if (recordingRef.current) {
      try {
        const rec = recordingRef.current;
        recordingRef.current = null;
        rec.setOnRecordingStatusUpdate(null);
        await rec.stopAndUnloadAsync();
      } catch {
        // no-op: stopping a recording can throw if already stopped
      }
    }
  }, []);

  const startPreview = useCallback(async () => {
    if (!isActive) return;
    setIsLoading(true);
    setError(null);
    await stopStream();

    try {
      const cameraRes = await Camera.requestCameraPermissionsAsync();
      const micRes = await Camera.requestMicrophonePermissionsAsync();

      if (!cameraRes.granted || !micRes.granted) {
        setError(new Error("permissions_denied"));
        setHasStream(false);
        return;
      }

      setHasStream(true);

      const recording = new Audio.Recording();
      const options = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          audioQuality: Audio.IOSAudioQuality.MIN,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: true,
      };

      recording.setOnRecordingStatusUpdate((status) => {
        if (!isActive || !audioEnabledRef.current) return;
        const metering =
          typeof status.metering === "number" ? status.metering : METER_MIN_DB;
        const target = meteringToPercent(metering);
        smoothedMicLevelRef.current =
          smoothedMicLevelRef.current * 0.65 + target * 0.35;
        setMicLevel(Math.round(smoothedMicLevelRef.current));
      });

      recordingRef.current = recording;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      await recording.prepareToRecordAsync(options);
      await recording.startAsync();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("unknown_error"));
      setHasStream(false);
      setMicLevel(0);
      smoothedMicLevelRef.current = 0;
    } finally {
      setIsLoading(false);
    }
  }, [isActive, stopStream]);

  useEffect(() => {
    if (!isActive) {
      stopStream();
      setVideoEnabled(true);
      setAudioEnabled(true);
      setError(null);
      return;
    }
  }, [isActive, stopStream]);

  useEffect(() => {
    if (!isActive || !hasStream || !audioEnabled) {
      setMicLevel(0);
      smoothedMicLevelRef.current = 0;
    }
  }, [isActive, hasStream, audioEnabled]);

  const toggleVideo = useCallback(() => {
    setVideoEnabled((v) => !v);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((a) => !a);
  }, []);

  return {
    videoEnabled,
    audioEnabled,
    micLevel,
    isLoading,
    hasStream,
    error,
    startPreview,
    stopStream,
    toggleVideo,
    toggleAudio,
  };
}

