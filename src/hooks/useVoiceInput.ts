import { useState, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'recording' | 'error' | 'unsupported';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  continuous?: boolean;
  lang?: string;
}

interface UseVoiceInputReturn {
  voiceState: VoiceState;
  errorMsg: string;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
}

export function useVoiceInput({
  onTranscript,
  continuous = true,
  lang = 'en-US',
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check browser support — SpeechRecognition is not in TS DOM lib, access via any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = Boolean(SpeechRecognitionAPI);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceState('idle');
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setVoiceState('unsupported');
      setErrorMsg('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setErrorMsg('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceState('recording');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<SpeechRecognitionResult>)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      if (transcript) {
        onTranscript(transcript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      const err: string = event.error ?? '';
      if (err === 'not-allowed' || err === 'permission-denied') {
        setErrorMsg('Microphone access denied. Please enable microphone permissions in your browser settings.');
      } else if (err === 'no-speech') {
        setErrorMsg('No speech detected. Please try again.');
      } else if (err === 'audio-capture') {
        setErrorMsg('No microphone found. Please connect a microphone and try again.');
      } else if (err === 'network') {
        setErrorMsg('Network error during transcription. Please check your connection.');
      } else {
        setErrorMsg(`Voice recognition error: ${err}`);
      }
      setVoiceState('error');
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      // Only transition to idle if not manually stopped already
      setVoiceState((prev) => (prev === 'recording' ? 'idle' : prev));
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setErrorMsg('Failed to start voice recognition. Please try again.');
      setVoiceState('error');
      recognitionRef.current = null;
    }
  }, [isSupported, lang, continuous, onTranscript]);

  const toggleRecording = useCallback(() => {
    if (voiceState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [voiceState, startRecording, stopRecording]);

  return {
    voiceState,
    errorMsg,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
