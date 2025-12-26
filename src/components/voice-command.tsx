'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useApp } from './providers';
import { format } from 'date-fns';

export default function VoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const { toggleDailyPrayer } = useApp();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // We can try to use ur-PK but English is generally more robust for tech names
      // Let's stick with English but match phonetically or common names
      recognition.lang = 'en-US'; 

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        processCommand(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError(true);
        if (event.error === 'not-allowed') {
          setFeedback('Mic permission denied. Please enable it.');
        } else {
          setFeedback('Could not hear you properly. Try again.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser/device.');
      return;
    }
    setError(false);
    setTranscript('');
    setFeedback('Listening... Say "Fajr", "Dhuhr", etc.');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const processCommand = (text: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Mapping spoken words to prayer keys
    const mapping: { [key: string]: string[] } = {
      fajr: ['fajr', 'fajar', 'fajir', 'fazer'],
      dhuhr: ['dhuhr', 'zohar', 'zuhr', 'duhr', 'zohr', 'zuhar', 'duhar', 'noon', 'door', 'duhur'],
      asr: ['asr', 'asar', 'asir', 'usher'],
      maghrib: ['maghrib', 'magrib', 'mugrib'],
      isha: ['isha', 'esha', 'eesha'],
      witr: ['witr', 'vitar', 'vitar', 'winter', 'witter'],
      tahajjud: ['tahajjud', 'tahajud'],
      ishraq: ['ishraq', 'ishrak'],
      chasht: ['chasht', 'chasat', 'chast', 'chosht', 'chart', 'chash']
    };

    let foundKey: any = null;
    
    for (const [key, variants] of Object.entries(mapping)) {
      if (variants.some(v => text.includes(v))) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      toggleDailyPrayer(today, foundKey);
      const msg = `Done! Marked ${foundKey}.`;
      setFeedback(msg);
      speak(msg);
    } else {
      setFeedback(`You said "${text}". I didn't recognize that prayer.`);
      speak("I didn't recognize that prayer.");
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isListening || feedback ? (
        <div className={`absolute bottom-16 right-0 p-4 rounded-2xl shadow-2xl border min-w-[220px] animate-in fade-in slide-in-from-bottom-4 transition-colors ${
          error ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className={`w-4 h-4 ${isListening ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            )}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${error ? 'text-red-600' : 'text-slate-400'}`}>
              {isListening ? 'Listening...' : 'Voice Result'}
            </span>
          </div>
          
          <p className={`text-sm font-semibold ${error ? 'text-red-700' : 'text-slate-700'}`}>
            {feedback}
          </p>
          
          {transcript && !error && (
            <p className="text-[10px] text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded italic">
              "{transcript}"
            </p>
          )}

          {!isListening && (
            <button 
              onClick={() => { setFeedback(''); setTranscript(''); }}
              className="mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter hover:underline"
            >
              Dismiss
            </button>
          )}
        </div>
      ) : null}

      <button
        onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
    </div>
  );
}
