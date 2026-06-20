/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, 
  BookOpen, List, History, ChevronRight, X, ArrowLeft, ArrowRight, Gauge
} from 'lucide-react';
import { GameProject, Page, Chapter, Volume, PlayHistoryLog } from '../types';

interface GamePlayerProps {
  project: GameProject;
  onExit: () => void;
}

export default function GamePlayer({ project, onExit }: GamePlayerProps) {
  // Navigation State
  const [currentVolIdx, setCurrentVolIdx] = useState(0);
  const [currentChapIdx, setCurrentChapIdx] = useState(0);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingBgm, setIsPlayingBgm] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.5);

  // Text Animation & Play state
  const [visibleText, setVisibleText] = useState('');
  const [isTypingCompleted, setIsTypingCompleted] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(4); // seconds

  // Controls overlay state
  const [showLogs, setShowLogs] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [logs, setLogs] = useState<PlayHistoryLog[]>([]);

  // Refs for audio elements
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const seRef = useRef<HTMLAudioElement | null>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Objects Helpers
  const currentVolume = project.volumes[currentVolIdx] || null;
  const currentChapter = currentVolume?.chapters[currentChapIdx] || null;
  const currentPage = currentChapter?.pages[currentPageIdx] || null;

  // Track active BGM url to verify changes
  const [activeBgmUrl, setActiveBgmUrl] = useState<string>('');

  // Determine current active BGM based on hierarchy: Chapter BGM -> Volume BGM -> None
  useEffect(() => {
    if (!currentVolume || !currentChapter) return;
    const targetBgm = currentChapter.bgmUrl || currentVolume.bgmUrl || '';
    if (targetBgm !== activeBgmUrl) {
      setActiveBgmUrl(targetBgm);
    }
  }, [currentVolIdx, currentChapIdx, currentChapter, currentVolume, activeBgmUrl]);

  // Handle BGM Play/Pause, Muting & Source Changes
  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio();
      bgmRef.current.loop = true;
    }

    const audio = bgmRef.current;
    audio.volume = isMuted ? 0 : bgmVolume;

    if (!audioStarted) {
      audio.pause();
      return;
    }

    if (activeBgmUrl) {
      // Elegant fade-out and fade-in source swap
      let fadeOutInterval: NodeJS.Timeout;
      const swapSource = () => {
        try {
          audio.src = activeBgmUrl;
          if (isPlayingBgm) {
            audio.play().catch(err => {
              console.log('Audio playback delayed or blocked by browser policy:', err);
            });
            // Fade block
            let currentVol = 0;
            audio.volume = 0;
            const fadeInInterval = setInterval(() => {
              currentVol = Math.min(bgmVolume, currentVol + 0.1);
              audio.volume = isMuted ? 0 : currentVol;
              if (currentVol >= bgmVolume) {
                clearInterval(fadeInInterval);
              }
            }, 50);
          }
        } catch (e) {
          console.error('BGM load error:', e);
        }
      };

      if (audio.src && audio.src !== activeBgmUrl && !audio.paused) {
        let currentVol = bgmVolume;
        fadeOutInterval = setInterval(() => {
          currentVol = Math.max(0, currentVol - 0.1);
          audio.volume = isMuted ? 0 : currentVol;
          if (currentVol <= 0) {
            clearInterval(fadeOutInterval);
            swapSource();
          }
        }, 50);
      } else {
        swapSource();
      }
    } else {
      audio.pause();
    }

    return () => {
      // cleanup is handled gracefully
    };
  }, [activeBgmUrl, audioStarted, isPlayingBgm, isMuted, bgmVolume]);

  // Respond to Vol/Mute changes instantly
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  // Log reader and Sound effect triggering on Page transition
  useEffect(() => {
    if (!currentPage || !currentChapter) return;

    // Trigger Sound Effect (SE) if available
    if (currentPage.soundEffectUrl && audioStarted) {
      if (!seRef.current) {
        seRef.current = new Audio();
      }
      try {
        seRef.current.src = currentPage.soundEffectUrl;
        seRef.current.volume = isMuted ? 0 : 0.8;
        seRef.current.play().catch(e => console.log('SE play blocked: ', e));
      } catch (e) {
        console.error('SE trigger error: ', e);
      }
    }

    // Add playing record to history logs
    const newLog: PlayHistoryLog = {
      id: Math.random().toString(36).substring(2, 9),
      characterName: currentPage.characterName || '旁白 (Narrator)',
      text: currentPage.text,
      chapterTitle: `${currentVolume?.title || ''} > ${currentChapter.title}`
    };
    setLogs(prev => {
      // Prevent duplicates of the last logged action
      if (prev.length > 0 && prev[prev.length - 1].text === currentPage.text) {
        return prev;
      }
      return [...prev, newLog].slice(-50); // Keep last 50 entries
    });

    // Start typewriter reveal for text
    setIsTypingCompleted(false);
    setVisibleText('');
    let currentCharIndex = 0;
    const textTarget = currentPage.text;

    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    typewriterTimerRef.current = setInterval(() => {
      if (currentCharIndex < textTarget.length) {
        setVisibleText(textTarget.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      } else {
        setIsTypingCompleted(true);
        if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      }
    }, 45); // elegant typewriter pace

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [currentVolIdx, currentChapIdx, currentPageIdx, currentPage, currentChapter, audioStarted, isMuted]);

  // Autoplay handler
  useEffect(() => {
    if (isAutoPlaying && isTypingCompleted) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setTimeout(() => {
        handleAdvance();
      }, autoPlayDelay * 1000);
    } else {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, isTypingCompleted, currentVolIdx, currentChapIdx, currentPageIdx, autoPlayDelay]);

  // Standard advancing mechanism
  const handleAdvance = () => {
    if (!currentPage || !currentChapter || !currentVolume) return;

    if (!isTypingCompleted) {
      // Skip typewriter to show full text instantly
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      setVisibleText(currentPage.text);
      setIsTypingCompleted(true);
      return;
    }

    // Attempt next page
    if (currentPageIdx < currentChapter.pages.length - 1) {
      setCurrentPageIdx(prev => prev + 1);
    } else {
      // Attempt next chapter in current volume
      if (currentChapIdx < currentVolume.chapters.length - 1) {
        setCurrentChapIdx(prev => prev + 1);
        setCurrentPageIdx(0);
      } else {
        // Attempt next Volume
        if (currentVolIdx < project.volumes.length - 1) {
          setCurrentVolIdx(prev => prev + 1);
          setCurrentChapIdx(0);
          setCurrentPageIdx(0);
        } else {
          // Finished entire book! Stop autoplay
          setIsAutoPlaying(false);
          alert('恭喜！您已读完本书的所有章节。🎉');
        }
      }
    }
  };

  // Backward navigation
  const handleRegress = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(prev => prev - 1);
    } else {
      if (currentChapIdx > 0) {
        const prevChap = currentVolume.chapters[currentChapIdx - 1];
        setCurrentChapIdx(prev => prev - 1);
        setCurrentPageIdx(prevChap.pages.length - 1);
      } else {
        if (currentVolIdx > 0) {
          const prevVol = project.volumes[currentVolIdx - 1];
          const lastChapIdx = prevVol.chapters.length - 1;
          const lastChap = prevVol.chapters[lastChapIdx];
          setCurrentVolIdx(prev => prev - 1);
          setCurrentChapIdx(lastChapIdx);
          setCurrentPageIdx(lastChap.pages.length - 1);
        } else {
          // Already on the very first page
        }
      }
    }
  };

  // Skip mechanism (Jump pages)
  const handleWarp = (volIdx: number, chapIdx: number) => {
    setCurrentVolIdx(volIdx);
    setCurrentChapIdx(chapIdx);
    setCurrentPageIdx(0);
    setShowChapters(false);
  };

  const handleStartWithAudio = () => {
    setAudioStarted(true);
    setIsPlayingBgm(true);
    // Trigger audio resume
    if (bgmRef.current) {
      bgmRef.current.play().catch(e => console.log('Audio init resume deferred: ', e));
    }
  };

  // Transition variants builder
  const getFramerVariants = (type: string) => {
    switch (type) {
      case 'slide-left':
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 }
        };
      case 'slide-right':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 100, opacity: 0 }
        };
      case 'zoom-in':
        return {
          initial: { scale: 0.94, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.06, opacity: 0 }
        };
      case 'zoom-out':
        return {
          initial: { scale: 1.06, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.94, opacity: 0 }
        };
      case 'blur-in':
        return {
          initial: { filter: 'blur(16px)', opacity: 0 },
          animate: { filter: 'blur(0px)', opacity: 1 },
          exit: { filter: 'blur(16px)', opacity: 0 }
        };
      case 'flash-white':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'flash-black':
        return {
          initial: { filter: 'brightness(0)', opacity: 0 },
          animate: { filter: 'brightness(1)', opacity: 1 },
          exit: { filter: 'brightness(0)', opacity: 0 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  // Generate color mapping
  const getPrimaryColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 ring-emerald-500/20';
      case 'cyan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 ring-cyan-500/20';
      case 'amber': return 'text-amber-400 bg-amber-500/10 border-amber-500/30 ring-amber-500/20';
      case 'rose': return 'text-rose-400 bg-rose-500/10 border-rose-500/30 ring-rose-500/20';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/30 ring-purple-500/20';
      case 'violet': return 'text-violet-400 bg-violet-500/10 border-violet-500/30 ring-violet-500/20';
      case 'teal':
      default: return 'text-teal-400 bg-teal-500/10 border-teal-500/30 ring-teal-500/20';
    }
  };

  // Clean Audio on unmount
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.src = '';
        bgmRef.current = null;
      }
      if (seRef.current) {
        seRef.current.pause();
        seRef.current.src = '';
        seRef.current = null;
      }
    };
  }, []);

  if (!currentVolume || !currentChapter || !currentPage) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-950 text-slate-100 min-h-[500px]">
        <p className="text-lg text-slate-400">目前的游戏框架项目没有建立可播放的书卷或章节。</p>
        <button 
          onClick={onExit}
          className="mt-6 font-medium px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
        >
          返回编辑器
        </button>
      </div>
    );
  }

  const animVariants = getFramerVariants(currentPage.transition);

  return (
    <div className="relative w-full max-w-5xl mx-auto border-4 border-slate-800 bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none aspect-video">
      
      {/* 1. INITIAL AUDIO SPLASH GUARD */}
      {!audioStarted && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center text-center p-8 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-2xl"
          >
            <BookOpen className="w-16 h-16 text-teal-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold font-sans text-slate-100 mb-2">{project.title}</h2>
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
              作者：{project.author || '未知作者'} <br />
              一曲未完的宿命交响正在等待您的步入，请开启浏览器声音和音效享受最佳视听体验。
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartWithAudio}
                className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-base shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="fill-black w-5 h-5" /> 开启声效播放
              </button>
              <button
                onClick={() => { setAudioStarted(true); setIsPlayingBgm(false); }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium rounded-lg text-sm transition-colors cursor-pointer"
              >
                静音直接游玩
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. MAIN ACTIVE GAME INNER CONTAINER */}
      <div className="relative flex-1 overflow-hidden" id="interactive-stage">
        
        {/* Dynamic Media Background Frame via Framer Motion AnimatePresence */}
        <div className="absolute inset-0 bg-slate-950" onClick={handleAdvance}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentPage.id}
              variants={animVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: currentPage.transitionDuration }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ mixBlendMode: currentPage.transition === 'flash-white' ? 'difference' : 'normal' }}
            >
              {/* Media Renderer */}
              {currentPage.bgType === 'image' && (
                <img 
                  src={currentPage.bgUrl || 'https://images.unsplash.com/photo-1511497584788-876760111969'} 
                  alt="Story Background" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{ opacity: currentPage.bgOpacity }}
                  referrerPolicy="no-referrer"
                />
              )}

              {currentPage.bgType === 'video' && (
                <video 
                  key={currentPage.bgUrl}
                  src={currentPage.bgUrl} 
                  autoPlay 
                  loop 
                  muted={true} // Must be muted on loop backgrounds to maintain player health
                  playsInline
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{ opacity: currentPage.bgOpacity }}
                />
              )}

              {currentPage.bgType === 'color' && (
                <div 
                  className="w-full h-full transition-colors duration-1000"
                  style={{ 
                    backgroundColor: currentPage.bgColor || '#090d16',
                    opacity: currentPage.bgOpacity 
                  }}
                />
              )}

              {/* Ambient overlay color cast */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Flash Whites / Blacks Keyframes Trigger Layer */}
          {currentPage.transition === 'flash-white' && (
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-white pointer-events-none z-30"
            />
          )}
        </div>

        {/* HUD Game Menu Corner Header Bar */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between z-40 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={onExit}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="退出并返回编辑模式"
            >
              <X className="w-3.5 h-3.5" /> 退出
            </button>
            <div className="px-2.5 py-1 rounded bg-black/60 border border-slate-800 text-[11px] font-mono font-medium text-slate-400">
              {currentVolume.title} &gt; <span className="text-slate-200">{currentChapter.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Indicator with simulated visual spectrum bars! */}
            {isPlayingBgm && audioStarted && !isMuted && (
              <div className="flex items-center gap-0.5 px-2 py-1 bg-black/60 rounded border border-slate-850 h-5" title="音频可视化动态">
                <div className="w-[2px] bg-teal-400 animate-[bounce_0.8s_infinite_0s] h-2.5" />
                <div className="w-[2px] bg-teal-400 animate-[bounce_1.4s_infinite_0.3s] h-3.5" />
                <div className="w-[2px] bg-teal-400 animate-[bounce_1.0s_infinite_0.1s] h-1.5" />
                <div className="w-[2px] bg-teal-400 animate-[bounce_1.2s_infinite_0.5s] h-3.0" />
              </div>
            )}
            
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-1.5 rounded bg-black/60 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isMuted ? "取消静音" : "静音所有音频"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className="p-1.5 rounded bg-black/60 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="阅读日志回溯"
            >
              <History className="w-3.5 h-3.5" /> 日志
            </button>
            <button
              onClick={() => setShowChapters(true)}
              className="p-1.5 rounded bg-black/60 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="章节跳跃选择"
            >
              <List className="w-3.5 h-3.5" /> 选章
            </button>
          </div>
        </div>

        {/* 3. DUAL-LAYOUT STORY DESIGNS: ADV (Bottom Dialogue Frame) and NVL (Novel Screen) */}
        
        {/* Layout Style A: ADV - Adventure Narrative Box at bottom */}
        {currentPage.textLayout === 'adv' && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent pb-10 pt-24 px-8 flex flex-col justify-end pointer-events-none z-10 select-all">
            <div className="max-w-4xl mx-auto w-full pointer-events-auto">
              {/* Speaker character bubble name */}
              {currentPage.characterName && (
                <motion.div 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-block px-4 py-1.5 rounded-t-xl bg-slate-900/90 border-t border-x border-slate-700/60 text-sm font-semibold tracking-wide"
                  style={{ color: currentPage.textColor || '#ffffff' }}
                >
                  {currentPage.characterName}
                </motion.div>
              )}

              {/* Text Area */}
              <div 
                onClick={handleAdvance}
                className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-tr-2xl rounded-b-2xl shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:bg-slate-950/90 active:border-teal-500/30 group"
              >
                <div 
                  className="font-light tracking-wide leading-relaxed font-sans text-slate-200"
                  style={{ 
                    fontSize: `${currentPage.fontSize}px`,
                    color: currentPage.textColor 
                  }}
                >
                  {visibleText}
                  {!isTypingCompleted && <span className="inline-block w-1.5 h-4 bg-teal-400 ml-1 animate-[pulse_0.6s_infinite]" />}
                </div>

                {/* Advance indicator */}
                <div className="flex justify-end mt-3 items-center gap-1.5 text-xs text-slate-500 group-hover:text-teal-400 transition-colors">
                  <span>{isTypingCompleted ? '点击继续' : '点击加速'}</span>
                  <ChevronRight className="w-3 h-3 animate-[ping_1.5s_infinite]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout Style B: NVL - Center Full Screen Editorial Backing */}
        {currentPage.textLayout === 'nvl' && (
          <div 
            onClick={handleAdvance}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-8 md:p-12 z-10 cursor-pointer overflow-y-auto"
          >
            <div className="max-w-xl w-full text-center py-6">
              <motion.div
                key={currentPage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-sans antialiased text-slate-200 tracking-wider whitespace-pre-wrap leading-loose"
                style={{ 
                  fontSize: `${currentPage.fontSize}px`, 
                  color: currentPage.textColor 
                }}
              >
                {visibleText}
                {!isTypingCompleted && <span className="inline-block w-2 h-4 bg-teal-400 ml-1 animate-pulse" />}
              </motion.div>

              {isTypingCompleted && (
                <div className="mt-8 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
                  <span>长卷继续 · 点击屏幕任意处继续</span>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 4. FOOTER CONTROLLER TOOLBAR BAR (Play HUD Panel) */}
      <div className="bg-slate-950 border-t border-slate-900 p-3 flex flex-wrap items-center justify-between text-slate-400 gap-2 z-40 select-none">
        
        {/* Play history stepper controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRegress}
            className="p-1 px-2.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 disabled:opacity-30 disabled:text-slate-600 font-sans text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="回退到前一个分页"
          >
            <ArrowLeft className="w-3 h-3" /> 上一步
          </button>
          
          <div className="px-3 py-1 bg-slate-950 rounded text-xs font-mono font-medium text-slate-500 border border-slate-900">
            P.{currentPageIdx + 1} / {currentChapter.pages.length}
          </div>

          <button
            onClick={handleAdvance}
            className="p-1 px-2.5 rounded bg-slate-900 hover:bg-slate-805 hover:text-white border border-slate-800 font-sans text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="继续阅读/加速当前动画"
          >
            下一步 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Autoplay controllers */}
        <div className="flex items-center gap-2">
          {/* Autoplay delay speed selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">
            <Gauge className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">间隔:</span>
            <select
              value={autoPlayDelay}
              onChange={(e) => setAutoPlayDelay(Number(e.target.value))}
              className="bg-transparent text-slate-300 font-mono text-xs focus:outline-none border-none py-0 cursor-pointer"
            >
              <option value="2" className="bg-slate-950 text-slate-200">2s</option>
              <option value="3" className="bg-slate-950 text-slate-200">3s</option>
              <option value="4" className="bg-slate-950 text-slate-200">4s</option>
              <option value="6" className="bg-slate-950 text-slate-200">6s</option>
              <option value="8" className="bg-slate-950 text-slate-200">8s</option>
            </select>
          </div>

          <button
            onClick={() => setIsAutoPlaying(prev => !prev)}
            className={`p-1 px-3 rounded flex items-center gap-1.5 font-sans font-medium text-xs transition-colors cursor-pointer ${
              isAutoPlaying 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> 自动播放中
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> 自动播放
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. HISTORY DIALOGUE LOG DRAWER OVERLAY */}
      <AnimatePresence>
        {showLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 z-50 flex justify-end backdrop-blur-xs select-text"
          >
            <motion.div 
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-2 text-slate-200 font-semibold font-sans">
                  <History className="w-4 h-4 text-teal-400" />
                  <span>故事历史回溯 (Logs)</span>
                </div>
                <button
                  onClick={() => setShowLogs(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Text List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10 font-sans">暂无播放记录，点击“下一步”推动剧情。</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-850/80 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-teal-400">{log.characterName}</span>
                        <span className="text-[9px] font-mono text-slate-600">{log.chapterTitle}</span>
                      </div>
                      <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">{log.text}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. ADVANCED CHAPTER WARPING SECTOR OVERLAY */}
      <AnimatePresence>
        {showChapters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6 backdrop-blur-xs select-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85%] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold font-sans text-slate-200">
                  <List className="w-4 h-4 text-teal-400" />
                  <span>章节跳跃跳转目录</span>
                </div>
                <button
                  onClick={() => setShowChapters(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chapters Tree List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {project.volumes.map((vol, vIdx) => (
                  <div key={vol.id} className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>{vol.title}</span>
                      {vol.bgmUrl && <span className="text-[10px] font-mono text-purple-400 font-normal">🔊 卷 BGM已配置</span>}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vol.chapters.map((chap, cIdx) => {
                        const isActive = currentVolIdx === vIdx && currentChapIdx === cIdx;
                        return (
                          <div
                            key={chap.id}
                            onClick={() => handleWarp(vIdx, cIdx)}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                              isActive
                                ? 'bg-teal-500/10 border-teal-500/50 hover:bg-teal-500/15'
                                : 'bg-slate-950 hover:bg-slate-850 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="font-semibold text-xs text-slate-200">{chap.title}</div>
                            {chap.description && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{chap.description}</p>
                            )}
                            <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
                              <span>分页面数: {chap.pages.length} 页</span>
                              {chap.bgmUrl && <span className="text-purple-400">🔊 独立BGM</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
