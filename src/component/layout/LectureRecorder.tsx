// src/component/layout/LectureRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LectureRecorderProps {
  onNoteCreated?: (newNote: any) => void;
  token?: string | null;
}

export const LectureRecorder: React.FC<LectureRecorderProps> = ({ onNoteCreated, token: propToken }) => {
  const auth = useAuth ? useAuth() : { token: null };
  const token = propToken || auth?.token || localStorage.getItem('token') || localStorage.getItem('studentos_token');

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [courseName, setCourseName] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Mic Recording & Web Speech Recognition
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start Browser Web Speech Recognition (Free Real-Time Speech-to-Text)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        let capturedText = "";
        recognitionRef.current.onresult = (event: any) => {
          let currentText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          capturedText = currentText;
          setLiveTranscript(currentText);
        };

        recognitionRef.current.start();
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setLiveTranscript('');
      setStatusText('🔴 Live Recording Teacher Speech...');
    } catch (err) {
      alert('Microphone permission denied or microphone not found!');
      console.error('Mic Access Error:', err);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setStatusText('🔴 Live Recording Teacher Speech...');
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setStatusText('⏸️ Recording Paused');
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!mediaRecorderRef.current) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);
    setStatusText('⚡ Processing Audio & Generating AI Notes...');

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());

      const formData = new FormData();
      formData.append('audio', audioBlob, 'lecture_recording.webm');
      formData.append('courseName', courseName || 'General');
      formData.append('lectureTitle', lectureTitle || 'Live Lecture Recording');
      if (liveTranscript) {
        formData.append('spokenTranscript', liveTranscript);
      }

      try {
        const response = await fetch('http://192.168.10.180:4000/api/v1/ai/lecture-transcribe', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: formData
        });

        const data = await response.json();
        setIsProcessing(false);

        if (response.ok && data.success) {
          setStatusText('🎉 Lecture Transcribed & Saved to Workspace!');
          if (onNoteCreated) onNoteCreated(data.note);
          alert('Success! 🎉 Lecture Transcript & AI Summary saved to your Notes Workspace!');
        } else {
          setStatusText(`Failed: ${data.error || 'Access Denied'}`);
          alert(`Transcription Failed: ${data.error || 'Access Denied'}`);
        }
      } catch (err) {
        setIsProcessing(false);
        setStatusText('❌ Error connecting to Express backend on Port 4000.');
        alert('Server Connection Error!');
      }
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl max-w-2xl mx-auto my-4 text-left">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
          🎙️ Live Lecture Audio Transcriber
        </h2>
        {isRecording && (
          <span className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            REC {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Course Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. CS-201 Data Structures"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            disabled={isRecording || isProcessing}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Lecture Topic / Title</label>
          <input
            type="text"
            placeholder="e.g. Binary Search Trees & Rotations"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            disabled={isRecording || isProcessing}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Real-time Spoken Text Box */}
      {isRecording && liveTranscript ? (
        <div className="bg-slate-950 border border-sky-500/30 p-3 rounded-lg mb-4 text-xs text-sky-300 font-mono italic">
          <span className="font-bold text-sky-400 not-italic">🗣️ Live Speech Stream: </span>
          "{liveTranscript}"
        </div>
      ) : null}

      {/* Visual Waveform Bar Animation */}
      {isRecording && !isPaused && (
        <div className="flex items-center justify-center gap-1 my-4 h-10 bg-slate-950 rounded-lg border border-slate-800 px-4">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-sky-500 rounded-full animate-bounce"
              style={{
                height: `${Math.floor(Math.random() * 20) + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Status Bar */}
      {statusText ? (
        <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg mb-4 text-center text-xs font-medium text-sky-400">
          {statusText}
        </div>
      ) : null}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
          >
            🔴 Start Recording Class
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={togglePause}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>

            <button
              type="button"
              onClick={stopRecordingAndTranscribe}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              ⏹️ Stop & Transcribe with AI
            </button>
          </>
        )}
      </div>

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="inline-block w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-1"></div>
          <p className="text-[11px] text-slate-400">AI is generating structured lecture notes & definitions...</p>
        </div>
      )}
    </div>
  );
};