import { useEffect, useRef } from 'react';
import useGame from '../../stores/store';
import './style.css';

const SOUNDTRACK_URL = 'music/soundtrack.mp3';

type EffectSoundConfig = {
  source: 'synth' | 'file';
  fileUrl: string;
  volume: number;
};

const EFFECT_SOUNDS: Record<'win', EffectSoundConfig> = {
  // To switch to MP3 effects later, set source to 'file' and add the fileUrl.
  win: {
    source: 'synth',
    fileUrl: 'music/win.mp3',
    volume: 0.45,
  },
};

type BrowserWindowWithAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const SoundToggle = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeEffectNodesRef = useRef<AudioScheduledSourceNode[]>([]);
  const activeEffectAudioRefs = useRef<HTMLAudioElement[]>([]);
  const soundOn = useGame((state) => state.soundOn);
  const toggleSound = useGame((state) => state.toggleSound);
  const win = useGame((state) => state.win);

  const getAudioContext = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as BrowserWindowWithAudio).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  };

  const playSoundtrack = () => {
    const audio = audioRef.current;
    if (!audio || !useGame.getState().soundOn) return;
    audio.muted = false;
    audio.volume = 0.22;
    void audio.play().catch(() => undefined);
  };

  const stopOneShotEffects = () => {
    activeEffectNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Already stopped by its own schedule.
      }
      node.disconnect();
    });
    activeEffectNodesRef.current = [];

    activeEffectAudioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeEffectAudioRefs.current = [];
  };

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current.volume = 0;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopOneShotEffects();
    void audioContextRef.current?.suspend();
  };

  const playWinSound = () => {
    if (!soundOn || win <= 0) return;
    const effect = EFFECT_SOUNDS.win;

    if (effect.source === 'file') {
      const audio = new Audio(effect.fileUrl);
      audio.volume = effect.volume;
      activeEffectAudioRefs.current.push(audio);
      audio.addEventListener(
        'ended',
        () => {
          activeEffectAudioRefs.current = activeEffectAudioRefs.current.filter(
            (effectAudio) => effectAudio !== audio,
          );
        },
        { once: true },
      );
      void audio.play().catch(() => undefined);
      return;
    }

    const context = getAudioContext();
    void context?.resume();
    if (!context) return;

    const gainBoost = Math.min(0.12, 0.05 + Math.log10(win + 1) * 0.018);
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = context.currentTime + index * 0.075;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 1.012,
        startTime + 0.18,
      );
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainBoost, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.34);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.38);
      activeEffectNodesRef.current.push(oscillator);
    });
  };

  useEffect(() => {
    const audio = new Audio(SOUNDTRACK_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.22;
    audioRef.current = audio;

    return () => {
      stopAllSounds();
      audioContextRef.current?.close();
      audioContextRef.current = null;
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!soundOn) {
      stopAllSounds();
      return;
    }

    audio.muted = false;
    audio.volume = 0.22;

    const unlockAudio = () => {
      if (!useGame.getState().soundOn) return;
      void getAudioContext()?.resume();
      void audio.play().catch(() => {
        if (!useGame.getState().soundOn) return;
        window.addEventListener('pointerdown', unlockAudio, { once: true });
        window.addEventListener('keydown', unlockAudio, { once: true });
      });
    };

    unlockAudio();

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  useEffect(() => {
    playWinSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win, soundOn]);

  const handleToggleSound = () => {
    const nextSoundOn = !useGame.getState().soundOn;
    toggleSound();
    if (nextSoundOn) {
      void getAudioContext()?.resume();
      window.setTimeout(playSoundtrack, 0);
      return;
    }

    stopAllSounds();
  };

  return (
    <button
      aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      title={soundOn ? 'Sound on' : 'Sound off'}
      onClick={handleToggleSound}
      className={`utility-button sound-button ${soundOn ? 'sound-on' : 'sound-off'}`}
      style={{
        backgroundImage: `url('${
          soundOn ? 'images/sound-on.svg' : 'images/sound-off.svg'
        }')`,
      }}
      type="button"
    />
  );
};

export default SoundToggle;
