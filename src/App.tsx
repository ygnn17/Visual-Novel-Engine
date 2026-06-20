/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameProject } from './types';
import { INITIAL_DEMO_PROJECT } from './data';
import GameEditor from './components/GameEditor';
import GamePlayer from './components/GamePlayer';
import { BookOpen, HelpCircle } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'edit' | 'play'>('edit');
  const [project, setProject] = useState<GameProject>(() => {
    try {
      // Restore previous user creation config from caching tier
      const saved = localStorage.getItem('vn_story_engine_project_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.title && parsed.volumes) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage restore failed. Falling back to default demo.', e);
    }
    return INITIAL_DEMO_PROJECT;
  });

  // Automatically save project modifications to browser state
  useEffect(() => {
    try {
      localStorage.setItem('vn_story_engine_project_v1', JSON.stringify(project));
    } catch (e) {
      console.error('Failed to persist story config to localStorage:', e);
    }
  }, [project]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* GLOBAL HEADER BAR */}
      <header className="bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-black font-sans">
            VN
          </div>
          <div>
            <span className="font-bold text-sm tracking-widest uppercase text-teal-400 font-mono">
              Visual Novel Engine
            </span>
            <h1 className="text-xs text-slate-500 font-light font-mono leading-none">
              Web Browser Game Runtime v1.0
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>模式: <strong className="text-slate-300 font-sans uppercase font-medium">{viewMode === 'edit' ? '编辑工作台' : '游戏测试中'}</strong></span>
          <span className="hidden md:inline border-l border-slate-800 h-4" />
          <span className="hidden md:inline">保存状态: <span className="text-emerald-400 font-semibold font-sans">● 自动同步</span></span>
        </div>
      </header>

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {viewMode === 'edit' ? (
          <GameEditor 
            project={project}
            onChange={setProject}
            onPlay={() => setViewMode('play')}
          />
        ) : (
          <div className="py-2">
            <GamePlayer 
              project={project}
              onExit={() => setViewMode('edit')}
            />
          </div>
        )}
      </main>

      {/* SOFT FOOTER BANNER */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950/60 text-center text-xs text-slate-500 shrink-0 font-mono">
        <p>© 2026 浏览器交互型视觉故事小说设计框架 | 支持高效转场过渡 · 双排版引擎 · BGM逻辑整合</p>
      </footer>
    </div>
  );
}
