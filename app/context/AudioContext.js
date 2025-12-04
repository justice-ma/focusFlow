"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const [mainVolume, setMainVolume] = useState(50);

  const [windVolume, setWindVolume] = useState(0);
  const [fireVolume, setFireVolume] = useState(0);
  const [rainVolume, setRainVolume] = useState(0);
  const [waveVolume, setWaveVolume] = useState(0);

  // Store previous volumes before muting
  const [prevWindVolume, setPrevWindVolume] = useState(0);
  const [prevFireVolume, setPrevFireVolume] = useState(0);
  const [prevRainVolume, setPrevRainVolume] = useState(0);
  const [prevWaveVolume, setPrevWaveVolume] = useState(0);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(3000); // in seconds
  const [timerStartTime, setTimerStartTime] = useState(null); // when timer started (timestamp)
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3000);

  // Store Howl instances globally
  const soundsRef = useRef({});
  const timerIntervalRef = useRef(null);

  // Initialize Howler settings
  useEffect(() => {
    Howler.autoSuspend = false;
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      if (timerStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
        const remaining = Math.max(0, timerDuration - elapsedSeconds);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsTimerActive(false);
          clearInterval(timerIntervalRef.current);
          if (timerIntervalRef.onComplete) {
            timerIntervalRef.onComplete();
          }
        }
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, timerStartTime, timerDuration]);

  // Create or get Howl instance for a sound
  const getOrCreateSound = (name, src) => {
    if (!soundsRef.current[name]) {
      soundsRef.current[name] = new Howl({
        src: [src],
        loop: true,
        html5: true,
        volume: 0,
      });
    }
    return soundsRef.current[name];
  };

  // Update volume for a sound
  const updateSoundVolume = (name, src, volume, globalVolume) => {
    const sound = getOrCreateSound(name, src);
    const finalVolume = (volume * globalVolume) / 10000;

    if (finalVolume > 0 && !sound.playing()) {
      sound.volume(finalVolume);
      sound.play();
      if (muted) 
      {
        setMuted(false);
      }
      if (prevWindVolume !== 0)
      {
        setWindVolume(prevWindVolume);
      }
      if (prevFireVolume !== 0)
      {
        setFireVolume(prevFireVolume);
      }
      if (prevRainVolume !== 0)
      {
        setRainVolume(prevRainVolume);
      }
      if (prevWaveVolume !== 0)
      {
        setWaveVolume(prevWaveVolume);
      }
    } else if (finalVolume === 0) {
      sound.stop();
    } else {
      sound.volume(finalVolume);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (muted) {
      // Unmute - restore previous volumes
      setWindVolume(prevWindVolume);
      setFireVolume(prevFireVolume);
      setRainVolume(prevRainVolume);
      setWaveVolume(prevWaveVolume);
      setMuted(false);
    } else {
      // Mute - save current volumes and set to 0
      setPrevWindVolume(windVolume);
      setPrevFireVolume(fireVolume);
      setPrevRainVolume(rainVolume);
      setPrevWaveVolume(waveVolume);
      setWindVolume(0);
      setFireVolume(0);
      setRainVolume(0);
      setWaveVolume(0);
      setMuted(true);
    }
  };

  // Update all sound volumes
  useEffect(() => {
    if (soundsRef.current.Wind) {
      updateSoundVolume("Wind", "/sounds/wind.mp3", windVolume, mainVolume);
    }
  }, [windVolume, mainVolume]);

  // Update Fire volume AFTER it's created
  useEffect(() => {
      if (soundsRef.current.Fire) {
        updateSoundVolume("Fire", "/sounds/fire.mp3", fireVolume, mainVolume);
      }
  }, [fireVolume, mainVolume]);

  useEffect(() => {
    if (soundsRef.current.Rain) {
      updateSoundVolume("Rain", "/sounds/rain.mp3", rainVolume, mainVolume);
    }
  }, [rainVolume, mainVolume]);

  useEffect(() => {
    if (soundsRef.current.Waves) {
      updateSoundVolume("Waves", "/sounds/wave.mp3", waveVolume, mainVolume);
    }
  }, [waveVolume, mainVolume]);

  // Initialize sounds on mount (moved to top)
  useEffect(() => {
    getOrCreateSound("Wind", "/sounds/wind.mp3");
    getOrCreateSound("Fire", "/sounds/fire.mp3");
    getOrCreateSound("Rain", "/sounds/rain.mp3");
    getOrCreateSound("Waves", "/sounds/wave.mp3");
  }, []);

  // Start timer
  const startTimer = (duration) => {
    setTimerDuration(duration);
    setTimerStartTime(Date.now());
    setTimeRemaining(duration);
    setIsTimerActive(true);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  // Resume timer
  const resumeTimer = () => {
    setTimerStartTime(Date.now() - (timerDuration - timeRemaining) * 1000);
    setIsTimerActive(true);
  };

  // Stop timer
  const stopTimer = () => {
    setIsTimerActive(false);
    setTimerStartTime(null);
  };

  // Reset timer
  const resetTimer = (newDuration = 3000) => {
    setIsTimerActive(false);
    setTimerStartTime(null);
    setTimerDuration(newDuration);
    setTimeRemaining(newDuration);
  };

  // Set completion callback
  const setTimerCompleteCallback = (callback) => {
    timerIntervalRef.onComplete = callback;
  };

  return (
    <AudioContext.Provider
      value={{
        // Audio
        muted,
        setMuted,
        toggleMute,
        mainVolume,
        setMainVolume,
        windVolume,
        setWindVolume,
        fireVolume,
        setFireVolume,
        rainVolume,
        setRainVolume,
        waveVolume,
        setWaveVolume,
        getOrCreateSound,
        updateSoundVolume,
        // Timer
        timerDuration,
        setTimerDuration,
        timerStartTime,
        isTimerActive,
        timeRemaining,
        setTimeRemaining,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        setTimerCompleteCallback,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
