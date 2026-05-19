import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechLangCode = "en" | "ta" | "si";

export const SPEECH_LANG_OPTIONS: Array<{ code: SpeechLangCode; bcp47: string; label: string }> = [
  { code: "en", bcp47: "en-US", label: "English" },
  { code: "ta", bcp47: "ta-IN", label: "Tamil" },
  { code: "si", bcp47: "si-LK", label: "Sinhala" },
];

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: { transcript: string };
    };
  };
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function fullTranscriptFromEvent(event: SpeechRecognitionEventLike): string {
  let text = "";
  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    if (result?.[0]?.transcript) {
      text += result[0].transcript;
    }
  }
  return text;
}

type UseSpeechInputOptions = {
  /** When provided, the hook is controlled: the parent owns the language and
   *  receives changes via `onLanguageChange`. When omitted, the hook keeps an
   *  internal language state for backward compatibility. */
  language?: SpeechLangCode;
  onLanguageChange?: (next: SpeechLangCode) => void;
};

export function useSpeechInput(
  onTranscript: (text: string, isFinal: boolean) => void,
  options: UseSpeechInputOptions = {}
) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [internalLang, setInternalLang] = useState<SpeechLangCode>("en");
  const lang = options.language ?? internalLang;
  const setLang = useCallback(
    (next: SpeechLangCode) => {
      if (options.onLanguageChange) options.onLanguageChange(next);
      if (options.language === undefined) setInternalLang(next);
    },
    [options]
  );
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    setError(null);
    recognitionRef.current?.abort();

    const recognition = new Ctor();
    const bcp47 = SPEECH_LANG_OPTIONS.find((o) => o.code === lang)?.bcp47 ?? "en-US";
    recognition.lang = bcp47;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const chunk = fullTranscriptFromEvent(event);
      if (!chunk) return;
      const isFinal = event.results[event.results.length - 1]?.isFinal ?? false;
      onTranscriptRef.current(chunk, isFinal);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Allow mic access in browser settings.");
      } else {
        setError(event.message ?? `Speech error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start microphone");
      setListening(false);
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    supported,
    listening,
    lang,
    setLang,
    error,
    setError,
    toggle,
    stop,
  };
}
