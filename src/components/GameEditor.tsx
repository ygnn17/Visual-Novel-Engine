/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Trash2, Settings, Play, Download, Upload, RefreshCw, 
  Book, FileText, Layers, Video, Image as ImageIcon, Music, 
  Sparkles, CheckCircle2, Copy, ArrowUp, ArrowDown, HelpCircle
} from 'lucide-react';
import { GameProject, Volume, Chapter, Page, TransitionType, TextLayoutType } from '../types';
import { DEMO_PRESETS, INITIAL_DEMO_PROJECT } from '../data';
import FolderGuide from './FolderGuide';

interface GameEditorProps {
  project: GameProject;
  onChange: (updated: GameProject) => void;
  onPlay: () => void;
}

export default function GameEditor({ project, onChange, onPlay }: GameEditorProps) {
  // Navigation Trackers for active editor item
  const [selectedType, setSelectedType] = useState<'book' | 'volume' | 'chapter' | 'page'>('book');
  const [activeVolumeId, setActiveVolumeId] = useState<string>(project.volumes[0]?.id || '');
  const [activeChapterId, setActiveChapterId] = useState<string>(project.volumes[0]?.chapters[0]?.id || '');
  const [activePageId, setActivePageId] = useState<string>(project.volumes[0]?.chapters[0]?.pages[0]?.id || '');

  // Track file load statuses
  const [mediaUploadStatus, setMediaUploadStatus] = useState<string>('');

  // Helpers to fetch current active elements
  const currentVolume = project.volumes.find(v => v.id === activeVolumeId) || project.volumes[0] || null;
  const currentChapter = currentVolume?.chapters.find(c => c.id === activeChapterId) || currentVolume?.chapters[0] || null;
  const currentPage = currentChapter?.pages.find(p => p.id === activePageId) || currentChapter?.pages[0] || null;

  // Sync helpers if current parameters wander off list boundaries
  const forceSyncSelectors = (proj: GameProject) => {
    const defaultVol = proj.volumes[0];
    const defaultChap = defaultVol?.chapters[0];
    const defaultPg = defaultChap?.pages[0];

    if (defaultVol && (!proj.volumes.some(v => v.id === activeVolumeId))) {
      setActiveVolumeId(defaultVol.id);
    }
    if (defaultChap && (!defaultVol?.chapters.some(c => c.id === activeChapterId))) {
      setActiveChapterId(defaultChap.id);
    }
    if (defaultPg && (!defaultChap?.pages.some(p => p.id === activePageId))) {
      setActivePageId(defaultPg.id);
    }
  };

  // Generic Update Project helper
  const updateProject = (updated: GameProject) => {
    onChange(updated);
    forceSyncSelectors(updated);
  };

  // 1. PROJECT LEVEL MUTATORS
  const handleUpdateBook = (fields: Partial<GameProject>) => {
    updateProject({ ...project, ...fields });
  };

  // 2. VOLUME LEVEL MUTATORS
  const handleAddVolume = () => {
    const newVolId = 'vol-' + Math.random().toString(36).substring(2, 9);
    const newVol: Volume = {
      id: newVolId,
      title: `第 ${project.volumes.length + 1} 卷：新书卷规划`,
      description: '请在这里描述本卷的主要故事走向与角色宿愿。',
      chapters: []
    };
    updateProject({
      ...project,
      volumes: [...project.volumes, newVol]
    });
    setActiveVolumeId(newVolId);
    setSelectedType('volume');
  };

  const handleUpdateVolume = (volId: string, fields: Partial<Volume>) => {
    updateProject({
      ...project,
      volumes: project.volumes.map(v => v.id === volId ? { ...v, ...fields } : v)
    });
  };

  const handleDeleteVolume = (volId: string) => {
    if (project.volumes.length <= 1) {
      alert('警告：您的框架中必须至少保留一个书卷。');
      return;
    }
    if (confirm('确定要删除此书卷及其名下的所有章节与分页吗？此操作不可逆。')) {
      const remaining = project.volumes.filter(v => v.id !== volId);
      updateProject({ ...project, volumes: remaining });
    }
  };

  // 3. CHAPTER LEVEL MUTATORS
  const handleAddChapter = (volId: string) => {
    const parentVol = project.volumes.find(v => v.id === volId);
    if (!parentVol) return;

    const newChapId = 'chap-' + Math.random().toString(36).substring(2, 9);
    const newChap: Chapter = {
      id: newChapId,
      title: `新章节：第 ${parentVol.chapters.length + 1} 折`,
      description: '编辑章节介绍以帮助读者快速把握故事节奏。',
      pages: [
        {
          id: 'pg-' + Math.random().toString(36).substring(2, 9),
          text: '（这是新章节的起始页，请在此编辑叙事内容...）',
          bgType: 'image',
          bgUrl: DEMO_PRESETS.images[0].url,
          bgOpacity: 0.9,
          transition: 'fade',
          transitionDuration: 1.0,
          textLayout: 'adv',
          fontSize: 18,
          textColor: '#f8fafc'
        }
      ]
    };

    updateProject({
      ...project,
      volumes: project.volumes.map(v => v.id === volId 
        ? { ...v, chapters: [...v.chapters, newChap] } 
        : v
      )
    });
    setActiveChapterId(newChapId);
    setActivePageId(newChap.pages[0].id);
    setSelectedType('chapter');
  };

  const handleUpdateChapter = (chapId: string, fields: Partial<Chapter>) => {
    updateProject({
      ...project,
      volumes: project.volumes.map(v => ({
        ...v,
        chapters: v.chapters.map(c => c.id === chapId ? { ...c, ...fields } : c)
      }))
    });
  };

  const handleDeleteChapter = (volId: string, chapId: string) => {
    const parentVol = project.volumes.find(v => v.id === volId);
    if (!parentVol) return;
    if (parentVol.chapters.length <= 1) {
      alert('警告：当前书卷内必须至少包含一个章节，删除失败。');
      return;
    }

    if (confirm('确认删除当前章节吗？其中的分页将一并清空。')) {
      updateProject({
        ...project,
        volumes: project.volumes.map(v => v.id === volId 
          ? { ...v, chapters: v.chapters.filter(c => c.id !== chapId) }
          : v
        )
      });
    }
  };

  // 4. PAGE LEVEL MUTATORS
  const handleAddPage = (chapId: string) => {
    const newPgId = 'pg-' + Math.random().toString(36).substring(2, 9);
    const templatePage: Page = currentPage 
      // Clone previous settings as smooth inheritance
      ? { 
          ...currentPage, 
          id: newPgId, 
          text: '（新分页：点击此处开始编辑故事桥段）',
          soundEffectUrl: undefined // don't carry short SFX automatically
        }
      : {
          id: newPgId,
          text: '（新分页：开始撰写你的故事）',
          bgType: 'image',
          bgUrl: DEMO_PRESETS.images[0].url,
          bgOpacity: 0.9,
          transition: 'fade',
          transitionDuration: 0.8,
          textLayout: 'adv',
          fontSize: 18,
          textColor: '#f8fafc'
        };

    const updatedVolumes = project.volumes.map(v => ({
      ...v,
      chapters: v.chapters.map(c => {
        if (c.id === chapId) {
          const activeIdx = c.pages.findIndex(p => p.id === activePageId);
          const newPages = [...c.pages];
          if (activeIdx !== -1) {
            // Insert instantly right below the active selected page index
            newPages.splice(activeIdx + 1, 0, templatePage);
          } else {
            newPages.push(templatePage);
          }
          return { ...c, pages: newPages };
        }
        return c;
      })
    }));

    updateProject({ ...project, volumes: updatedVolumes });
    setActivePageId(newPgId);
    setSelectedType('page');
  };

  const handleUpdatePage = (pageId: string, fields: Partial<Page>) => {
    const updatedVolumes = project.volumes.map(v => ({
      ...v,
      chapters: v.chapters.map(c => ({
        ...c,
        pages: c.pages.map(p => p.id === pageId ? { ...p, ...fields } : p)
      }))
    }));
    updateProject({ ...project, volumes: updatedVolumes });
  };

  const handleCopyPage = (pageId: string) => {
    if (!currentPage) return;
    const newPgId = 'pg-' + Math.random().toString(36).substring(2, 9);
    const clone: Page = {
      ...currentPage,
      id: newPgId,
      text: `${currentPage.text} (副本)`
    };

    const updatedVolumes = project.volumes.map(v => ({
      ...v,
      chapters: v.chapters.map(c => {
        if (c.pages.some(p => p.id === pageId)) {
          const idx = c.pages.findIndex(p => p.id === pageId);
          const newPages = [...c.pages];
          newPages.splice(idx + 1, 0, clone);
          return { ...c, pages: newPages };
        }
        return c;
      })
    }));

    updateProject({ ...project, volumes: updatedVolumes });
    setActivePageId(newPgId);
  };

  const handleDeletePage = (pageId: string) => {
    if (!currentChapter) return;
    if (currentChapter.pages.length <= 1) {
      alert('错误：章节内必须保留至少一个分页，无法删除。');
      return;
    }

    const remainingPages = currentChapter.pages.filter(p => p.id !== pageId);
    const updatedVolumes = project.volumes.map(v => ({
      ...v,
      chapters: v.chapters.map(c => c.id === currentChapter.id 
        ? { ...c, pages: remainingPages } 
        : c
      )
    }));
    
    updateProject({ ...project, volumes: updatedVolumes });
    
    // Auto shift selected page index to another valid item
    const fallbackPg = remainingPages[0];
    if (fallbackPg) setActivePageId(fallbackPg.id);
  };

  const handleMovePage = (dir: 'up' | 'down') => {
    if (!currentChapter || !currentPage) return;
    const pages = currentChapter.pages;
    const idx = pages.findIndex(p => p.id === currentPage.id);
    if (idx === -1) return;

    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= pages.length) return; // out of limits

    const swapped = [...pages];
    const temp = swapped[idx];
    swapped[idx] = swapped[newIdx];
    swapped[newIdx] = temp;

    handleUpdateChapter(currentChapter.id, { pages: swapped });
  };

  // 5. BLOB STORAGE FILE UPLOAD RESUMER
  const handleMediaPick = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'bgUrl' | 'soundEffectUrl' | 'bgmUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaUploadStatus('正在解析中...');
    try {
      // Magic local blob generation so file acts and triggers music/video immediately in-browser
      const localBlobLink = URL.createObjectURL(file);
      
      if (targetField === 'bgUrl' && selectedType === 'page' && currentPage) {
        let detectedTypeByExt: 'image' | 'video' = 'image';
        if (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm')) {
          detectedTypeByExt = 'video';
        }
        handleUpdatePage(currentPage.id, { 
          bgUrl: localBlobLink,
          bgType: detectedTypeByExt
        });
      } else if (targetField === 'soundEffectUrl' && selectedType === 'page' && currentPage) {
        handleUpdatePage(currentPage.id, { soundEffectUrl: localBlobLink });
      } else if (targetField === 'bgmUrl') {
        if (selectedType === 'chapter' && currentChapter) {
          handleUpdateChapter(currentChapter.id, { bgmUrl: localBlobLink });
        } else if (selectedType === 'volume' && currentVolume) {
          handleUpdateVolume(currentVolume.id, { bgmUrl: localBlobLink });
        }
      }
      setMediaUploadStatus(`已暂载: ${file.name.substring(0, 18)}...`);
    } catch (err) {
      console.error(err);
      setMediaUploadStatus('载入失败。');
    }
  };

  // 6. GENERAL EXPORT & IMPORT JSON CONFS
  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${project.title || 'game'}-vn-config.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('导出配置文件出错，请刷新后重试。');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as GameProject;
        if (!parsed.title || !parsed.volumes) {
          throw new Error('格式不符合本框架游戏规范');
        }
        onChange(parsed);
        forceSyncSelectors(parsed);
        alert('🎉 外部游戏规则配置导入成功！');
      } catch (err) {
        alert('导入失败：该文件并不是有效的 Visual Novel 框架 JSON 配置文件。');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('此操作将重置并覆盖您当前编辑的游戏，载入官方精美玄幻故事模板，是否继续？')) {
      onChange(INITIAL_DEMO_PROJECT);
      forceSyncSelectors(INITIAL_DEMO_PROJECT);
    }
  };

  // Generate background accent colors depending on selection
  const getThemeAccentClass = () => {
    switch (project.primaryColor) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20';
      case 'cyan': return 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/20';
      case 'amber': return 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/20';
      case 'rose': return 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/20';
      case 'purple': return 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/20';
      case 'violet': return 'bg-violet-600 hover:bg-violet-500 shadow-violet-950/20';
      case 'teal':
      default: return 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/20';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-full">
      
      {/* HUD WORKSPACE BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-teal-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-teal-950/40">
            <Book className="w-6 h-6 text-slate-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              视觉小说框架 · 创作者中心
            </h1>
            <p className="text-xs text-slate-400">
              您当前正在编辑游戏书《<span className="text-teal-400 font-semibold">{project.title || '未命名作品'}</span>》，配置将自动实时保存在浏览器本地。
            </p>
          </div>
        </div>

        {/* Workspace core utility launchers */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Load Sample Demo */}
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="加载默认模板故事内容"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 载入示例
          </button>

          {/* Import file config */}
          <label className="px-3 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> 导入JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJson} 
              className="hidden" 
            />
          </label>

          {/* Export custom files config */}
          <button
            onClick={handleExportJson}
            className="px-3 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-teal-400 border border-slate-850 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="将您的创作导出保存到本地文件，分享给好友！"
          >
            <Download className="w-3.5 h-3.5" /> 导出游戏配置
          </button>

          {/* LAUNCH PREVIEW GAME FRAME */}
          <button
            onClick={onPlay}
            className={`px-5 py-2 text-sm font-semibold text-slate-100 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${getThemeAccentClass()}`}
            title="一键切换至沉浸式高帧率游戏测试框架"
          >
            <Play className="fill-white w-4 h-4" /> 运行游戏预览
          </button>
        </div>
      </div>

      {/* CORE WORK SPACE: Left Hierarchy Selector + Right Field Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* column 1: STORY TREE BLOCK (3/12 wide) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[850px]">
          
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">故事章节与分页大纲</span>
            <span className="text-[10px] bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20 font-mono">
              v1.0-Framework
            </span>
          </div>

          <div className="overflow-y-auto p-3 space-y-4 flex-1">
            
            {/* Tree Section: Book Settings */}
            <div>
              <div 
                onClick={() => setSelectedType('book')}
                className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-center gap-2.5 cursor-pointer ${
                  selectedType === 'book' 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-850 border-slate-700 text-slate-100 shadow-sm' 
                    : 'bg-slate-950/40 border-transparent hover:bg-slate-950 text-slate-400'
                }`}
              >
                <Book className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] font-mono text-slate-500 leading-none mb-0.5">BOOK METADATA</div>
                  <span className="text-xs font-medium">{project.title || '未命名书籍'}</span>
                </div>
              </div>
            </div>

            {/* Tree Section: Volumes loop */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-850 pb-1 pt-1">
                <span>书卷与章节集</span>
                <button
                  onClick={handleAddVolume}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-0.5 cursor-pointer bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700 text-[10px]"
                >
                  <Plus className="w-3 h-3" /> 新加卷
                </button>
              </div>

              {project.volumes.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">暂无书卷，点击“新加卷”开始构思构架。</p>
              ) : (
                project.volumes.map((vol) => {
                  const isVolSelected = selectedType === 'volume' && activeVolumeId === vol.id;
                  return (
                    <div key={vol.id} className="space-y-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      
                      {/* Volume Header Row */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div 
                          onClick={() => {
                            setActiveVolumeId(vol.id);
                            setSelectedType('volume');
                          }}
                          className={`flex-1 truncate p-1.5 rounded transition-colors text-left cursor-pointer flex items-center gap-1.5 ${
                            isVolSelected 
                              ? 'bg-slate-800 text-slate-100' 
                              : 'text-slate-300 hover:bg-slate-900/60'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="text-xs font-semibold truncate select-all">{vol.title}</span>
                        </div>

                        {/* Vol Delete / Add Chapter icons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddChapter(vol.id)}
                            className="p-1 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer"
                            title="在本卷内新建章节"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteVolume(vol.id)}
                            className="p-1 hover:bg-slate-800 text-rose-500 hover:text-rose-400 rounded cursor-pointer"
                            title="删除卷"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Chapters Inner Container */}
                      <div className="pl-3.5 border-l border-slate-800 space-y-1">
                        {vol.chapters.length === 0 ? (
                          <div className="text-[10px] text-slate-600 py-1">请点击 + 新建章节</div>
                        ) : (
                          vol.chapters.map((chap) => {
                            const isChapSelected = selectedType === 'chapter' && activeChapterId === chap.id;
                            const isPageParent = activeChapterId === chap.id;
                            
                            return (
                              <div key={chap.id} className="space-y-1">
                                
                                {/* Chapter Selection Strip */}
                                <div className="flex items-center justify-between gap-1">
                                  <div
                                    onClick={() => {
                                      setActiveVolumeId(vol.id);
                                      setActiveChapterId(chap.id);
                                      setSelectedType('chapter');
                                      if (chap.pages[0]) {
                                        setActivePageId(chap.pages[0].id);
                                      }
                                    }}
                                    className={`flex-1 truncate text-left cursor-pointer p-1 rounded transition-colors text-xs flex items-center gap-1 ${
                                      isChapSelected 
                                        ? 'bg-slate-800 text-teal-400' 
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    }`}
                                  >
                                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <span className="truncate">{chap.title}</span>
                                  </div>

                                  <div className="flex items-center">
                                    <button
                                      onClick={() => handleAddPage(chap.id)}
                                      className="p-0.5 hover:bg-slate-800 text-cyan-400 rounded cursor-pointer text-[10px] font-mono px-1 border border-slate-800 hover:border-slate-700"
                                      title="新建分页"
                                    >
                                      +页
                                    </button>
                                    <button
                                      onClick={() => handleDeleteChapter(vol.id, chap.id)}
                                      className="p-1 hover:bg-slate-800 text-rose-500 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Pages listing (Expand only if Chapter is active) */}
                                {isPageParent && (
                                  <div className="pl-3 border-l border-teal-500/20 space-y-0.5 pt-0.5">
                                    {chap.pages.map((pg, pgIdx) => {
                                      const isPgSelected = selectedType === 'page' && activePageId === pg.id;
                                      return (
                                        <div
                                          key={pg.id}
                                          onClick={() => {
                                            setActiveVolumeId(vol.id);
                                            setActiveChapterId(chap.id);
                                            setActivePageId(pg.id);
                                            setSelectedType('page');
                                          }}
                                          className={`group w-full p-1 rounded text-left transition-colors cursor-pointer text-xs flex items-center justify-between ${
                                            isPgSelected 
                                              ? 'bg-teal-500/10 text-teal-300 border-l border-teal-400' 
                                              : 'text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'
                                          }`}
                                        >
                                          <span className="truncate max-w-[75%] font-mono text-[11px]">
                                            第 {pgIdx + 1} 页：
                                            <span className="text-slate-400 font-sans ml-1 text-[11px] font-light">
                                              {pg.characterName ? `[${pg.characterName}]` : ''} {pg.text.substring(0, 10)}${pg.text.length > 10 ? '..' : ''}
                                            </span>
                                          </span>

                                          {/* Mini indicator badges */}
                                          <span className="text-[9px] text-slate-600 font-mono capitalize">
                                            {pg.bgType} · {pg.textLayout}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* column 2: PROPERTY CONFIGURATIONS PANE (8/12 wide) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            
            {/* Header detail */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 justify-between">
              <div className="flex items-center gap-2">
                <Settings className="text-teal-400 w-5 h-5 animate-[spin_4s_infinite_linear]" />
                <h2 className="text-base font-bold font-sans text-slate-200">
                  属性编辑中心 &gt; {
                    selectedType === 'book' ? '书本基础配置' :
                    selectedType === 'volume' ? `书卷属性: ${currentVolume?.title || ''}` :
                    selectedType === 'chapter' ? `章节属性: ${currentChapter?.title || ''}` :
                    `分页属性: (ID: ${currentPage?.id || ''})`
                  }
                </h2>
              </div>
              <div className="text-xs text-slate-500">
                本地存储就绪
              </div>
            </div>

            {/* A. BOOK LEVEL EDIT FORM */}
            {selectedType === 'book' && (
              <div className="space-y-4 font-sans text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">图书名称</label>
                    <input 
                      type="text" 
                      value={project.title}
                      onChange={(e) => handleUpdateBook({ title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                      placeholder="例如：群星之怒"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">故事著者 (作者签名)</label>
                    <input 
                      type="text" 
                      value={project.author}
                      onChange={(e) => handleUpdateBook({ author: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                      placeholder="作者/笔名"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">前言与剧本简介</label>
                  <textarea 
                    value={project.description}
                    onChange={(e) => handleUpdateBook({ description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
                    placeholder="简要概括这部视觉小说的核心矛盾与背景故事..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">默认排版排局方案</label>
                    <select
                      value={project.defaultTextLayout}
                      onChange={(e) => handleUpdateBook({ defaultTextLayout: e.target.value as TextLayoutType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-sans"
                    >
                      <option value="adv">ADV 传统底端单行对话框模式 (适合角色互动多)</option>
                      <option value="nvl">NVL 全屏高档小说文字铺设模式 (适合大篇幅叙事描述)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">UI主题风格色调</label>
                    <select
                      value={project.primaryColor}
                      onChange={(e) => handleUpdateBook({ primaryColor: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-sans"
                    >
                      <option value="teal">金石松石 (Teal)</option>
                      <option value="emerald">翠竹古玉 (Emerald)</option>
                      <option value="cyan">寒冰幻蓝 (Cyan)</option>
                      <option value="amber">秋叶琥珀 (Amber)</option>
                      <option value="rose">朱砂晚霞 (Rose)</option>
                      <option value="purple">星云幻紫 (Purple)</option>
                      <option value="violet">重彩紫罗兰 (Violet)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* B. VOLUME LEVEL EDIT FORM */}
            {selectedType === 'volume' && currentVolume && (
              <div className="space-y-4 font-sans text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">分卷期标题</label>
                  <input 
                    type="text" 
                    value={currentVolume.title}
                    onChange={(e) => handleUpdateVolume(currentVolume.id, { title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">分卷描述</label>
                  <textarea 
                    value={currentVolume.description || ''}
                    onChange={(e) => handleUpdateVolume(currentVolume.id, { description: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                {/* BGM configurator (with dropdown selector of presets) */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> 
                      整卷背景音乐 (Volume BGM Fallback)
                    </label>
                    <span className="text-[10px] text-slate-500">若章节未指定BGM，则合并默认播放此音乐</span>
                  </div>

                  <input 
                    type="text" 
                    value={currentVolume.bgmUrl || ''}
                    onChange={(e) => handleUpdateVolume(currentVolume.id, { bgmUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                    placeholder="请输入 local 音乐资源路径 (例如 /assets/bgm/track.mp3 ) 或外部 MP3 链接"
                  />

                  {/* Preset Selector panel */}
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">精美版权公有氛围 BGM 点击快速应用：</div>
                    <div className="flex flex-wrap gap-1.5">
                      {DEMO_PRESETS.bgms.map((b) => (
                        <button
                          key={b.name}
                          onClick={() => handleUpdateVolume(currentVolume.id, { bgmUrl: b.url })}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                            currentVolume.bgmUrl === b.url 
                              ? 'bg-purple-900/40 border-purple-500 text-purple-300' 
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUpdateVolume(currentVolume.id, { bgmUrl: undefined })}
                        className="px-2 py-0.5 rounded text-[10px] text-rose-400 hover:bg-rose-950/10 border border-transparent hover:border-rose-900/40"
                      >
                        清空配乐
                      </button>
                    </div>
                  </div>

                  {/* Dynamic media picker loader */}
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-500">载入您的本地音频 BGM 文件：</span>
                    <label className="px-2 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded text-[11px] cursor-pointer font-sans">
                      选择电脑音频文件...
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleMediaPick(e, 'bgmUrl')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* C. CHAPTER LEVEL EDIT FORM */}
            {selectedType === 'chapter' && currentChapter && (
              <div className="space-y-4 font-sans text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">章节称号/折扣</label>
                  <input 
                    type="text" 
                    value={currentChapter.title}
                    onChange={(e) => handleUpdateChapter(currentChapter.id, { title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">本折简引 (章节简介)</label>
                  <textarea 
                    value={currentChapter.description || ''}
                    onChange={(e) => handleUpdateChapter(currentChapter.id, { description: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                {/* Chapter-specific BGM override */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> 
                      本章专属背景音乐 (Chapter BGM Override)
                    </label>
                    <span className="text-[10px] text-blue-400">设定后将完全替换整卷的背景音乐</span>
                  </div>

                  <input 
                    type="text" 
                    value={currentChapter.bgmUrl || ''}
                    onChange={(e) => handleUpdateChapter(currentChapter.id, { bgmUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                    placeholder="例如：/assets/bgm/chapter1_wind.mp3 或公网 MP3 链接"
                  />

                  {/* Preset Selector */}
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">公有氛围 BGM 点击应用：</div>
                    <div className="flex flex-wrap gap-1.5">
                      {DEMO_PRESETS.bgms.map((b) => (
                        <button
                          key={b.name}
                          onClick={() => handleUpdateChapter(currentChapter.id, { bgmUrl: b.url })}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                            currentChapter.bgmUrl === b.url 
                              ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUpdateChapter(currentChapter.id, { bgmUrl: undefined })}
                        className="px-2 py-0.5 rounded text-[10px] text-rose-400 hover:bg-rose-950/10 border border-transparent hover:border-rose-900/40"
                      >
                        清空(继承本卷设定)
                      </button>
                    </div>
                  </div>

                  {/* Dynamic media picker loader */}
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-500">载入章节专用本地音频 BGM 文件：</span>
                    <label className="px-2 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded text-[11px] cursor-pointer font-sans">
                      选择电脑音频文件...
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleMediaPick(e, 'bgmUrl')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs text-slate-400">
                  ⚡ 章节内部包含分页：{currentChapter.pages.length} 页。使用左边列表的 “页” 的配置可以依次增补分页剧情。
                </div>
              </div>
            )}

            {/* D. PAGE LEVEL EDIT FORM (The most interactive part!) */}
            {selectedType === 'page' && currentPage && (
              <div className="space-y-4 font-sans text-left">
                
                {/* Visual Novel layout structure selection */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">分页独立文本排版配置</label>
                    <select
                      value={currentPage.textLayout}
                      onChange={(e) => handleUpdatePage(currentPage.id, { textLayout: e.target.value as TextLayoutType })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="adv">ADV (传统对话框)</option>
                      <option value="nvl">NVL (全屏小说格式)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">字型字号大小</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="range" 
                        min={12} 
                        max={32} 
                        value={currentPage.fontSize}
                        onChange={(e) => handleUpdatePage(currentPage.id, { fontSize: Number(e.target.value) })}
                        className="w-full accent-teal-400 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-400 shrink-0">{currentPage.fontSize}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">字型字体色值</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="color" 
                        value={currentPage.textColor.startsWith('#') ? currentPage.textColor : '#ffffff'}
                        onChange={(e) => handleUpdatePage(currentPage.id, { textColor: e.target.value })}
                        className="w-8 h-6 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={currentPage.textColor}
                        onChange={(e) => handleUpdatePage(currentPage.id, { textColor: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-0.5 px-1.5 text-[11px] font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Character Name & Text Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">说话角色</label>
                    <input 
                      type="text" 
                      value={currentPage.characterName || ''}
                      onChange={(e) => handleUpdatePage(currentPage.id, { characterName: e.target.value || undefined })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none font-sans"
                      placeholder="旁白 / 角色名"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">留空时自动转为旁白描叙</span>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">故事情节文字 (Page Narrative text)</label>
                    <textarea 
                      value={currentPage.text}
                      onChange={(e) => handleUpdatePage(currentPage.id, { text: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
                      placeholder="在这里填写您当前的台词、心理描写或者剧本走向。回车换行在NVL模式下可作为行段落展示..."
                    />
                  </div>
                </div>

                {/* BACKGROUND MEDIA CONFIGURATION (Requirement 2: Local media references) */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      本页多媒体背景配置 (Background Video / Image Settings)
                    </h4>
                    <span className="text-[10px] text-slate-500">支持外链图片、极速视频或本地相对引用</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Media Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">背景显示介质</label>
                      <select
                        value={currentPage.bgType}
                        onChange={(e) => handleUpdatePage(currentPage.id, { bgType: e.target.value as 'image' | 'video' | 'color' })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="image">🖼️ 静态图片背景</option>
                        <option value="video">🎥 动态循环视频背景</option>
                        <option value="color">🎨 单底斑烂色块</option>
                      </select>
                    </div>

                    {/* Media Opacity */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">画面明亮度 (不透明度)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min={0.1} 
                          max={1.0} 
                          step={0.05}
                          value={currentPage.bgOpacity}
                          onChange={(e) => handleUpdatePage(currentPage.id, { bgOpacity: Number(e.target.value) })}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400 shrink-0">{Math.round(currentPage.bgOpacity * 100)}%</span>
                      </div>
                    </div>

                    {/* Color Fallback */}
                    {currentPage.bgType === 'color' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">色盘选点</label>
                        <input 
                          type="color" 
                          value={currentPage.bgColor || '#090d16'}
                          onChange={(e) => handleUpdatePage(currentPage.id, { bgColor: e.target.value })}
                          className="w-full h-8 bg-transparent border border-slate-850 rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {currentPage.bgType !== 'color' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">主媒介资源链接/路径 (URL or Path)</label>
                        <input 
                          type="text" 
                          value={currentPage.bgUrl}
                          onChange={(e) => handleUpdatePage(currentPage.id, { bgUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="/assets/images/forest1.jpg 或者是互联网公网媒体 URL"
                        />
                      </div>

                      {/* DEMO PRESETS CORNER */}
                      <div>
                        <div className="text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>一键注入高清晰官方推荐演示场景：</span>
                        </div>
                        
                        {currentPage.bgType === 'image' ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                            {DEMO_PRESETS.images.map((img) => (
                              <button
                                key={img.name}
                                onClick={() => handleUpdatePage(currentPage.id, { bgUrl: img.url })}
                                className={`p-1 text-[10px] rounded border truncate transition-all ${
                                  currentPage.bgUrl === img.url 
                                    ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 font-medium' 
                                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                                }`}
                              >
                                {img.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                            {DEMO_PRESETS.videos.map((vid) => (
                              <button
                                key={vid.name}
                                onClick={() => handleUpdatePage(currentPage.id, { bgUrl: vid.url })}
                                className={`p-1 text-[10px] rounded border truncate transition-all ${
                                  currentPage.bgUrl === vid.url 
                                    ? 'bg-cyan-950/30 border-cyan-500 text-cyan-300 font-medium' 
                                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                                }`}
                              >
                                {vid.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* BLOB TEMPORARY UPLOADERS */}
                      <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                        <div className="text-slate-400 leading-snug">
                          <span className="text-emerald-400 font-semibold font-sans">💻 免打包测试小助手:</span>
                          <p className="text-[10px] text-slate-500">点击右侧按钮选择文件，浏览器会自动生成直接可播放连接，测试省心：</p>
                        </div>
                        
                        <label className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 rounded text-[11px] cursor-pointer inline-flex items-center gap-1 text-center font-sans tracking-wide shrink-0">
                          本地上传背景...
                          <input 
                            type="file" 
                            accept={currentPage.bgType === 'image' ? 'image/*' : 'video/*'} 
                            onChange={(e) => handleMediaPick(e, 'bgUrl')} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* TRANSITIONS & SOUND EFFECTS (Requirement 3: Page transitions) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transition Selection Component */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        分页高级切出过渡 (Transition Effects)
                      </label>
                      <span className="text-[9px] text-slate-500">本页进入时的动画姿态</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">过渡手法：</label>
                        <select
                          value={currentPage.transition}
                          onChange={(e) => handleUpdatePage(currentPage.id, { transition: e.target.value as TransitionType })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="fade">🌀 渐渐浮现 (Crossfade)</option>
                          <option value="slide-left">⬅️ 自右滑切 (Slide Left)</option>
                          <option value="slide-right">➡️ 自左滑切 (Slide Right)</option>
                          <option value="zoom-in">🔍 聚焦拉近 (Zoom In)</option>
                          <option value="zoom-out">🔭 广角拉远 (Zoom Out)</option>
                          <option value="blur-in">🌫️ 毛玻璃清晰化 (Blur In)</option>
                          <option value="flash-white">⚡ 白斑闪显 (White Flash)</option>
                          <option value="flash-black">🌃 黑底瞬凝 (Black Flash)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">过渡持续秒数 (Duration)：</label>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            min={0.1} 
                            max={5} 
                            step={0.1}
                            value={currentPage.transitionDuration}
                            onChange={(e) => handleUpdatePage(currentPage.id, { transitionDuration: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-slate-300 font-mono"
                          />
                          <span className="text-[10px] text-slate-500">s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SFX (Sound Effects) Layer */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      入页触发瞬间音效 (Sound FX on Enter)
                    </label>

                    <input 
                      type="text" 
                      value={currentPage.soundEffectUrl || ''}
                      onChange={(e) => handleUpdatePage(currentPage.id, { soundEffectUrl: e.target.value || undefined })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none"
                      placeholder="例如：/assets/se/bell.mp3 或任意短音频外链"
                    />

                    {/* SFX Presets selector */}
                    <div>
                      <div className="text-[9px] text-slate-500 mb-1">精选常用音效点击选用：</div>
                      <div className="flex flex-wrap gap-1">
                        {DEMO_PRESETS.soundEffects.map((s) => (
                          <button
                            key={s.name}
                            onClick={() => handleUpdatePage(currentPage.id, { soundEffectUrl: s.url })}
                            className={`px-1.5 py-0.5 rounded text-[9px] border transition-all ${
                              currentPage.soundEffectUrl === s.url 
                                ? 'bg-amber-900/30 border-amber-500 text-amber-300 font-medium' 
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                        <button
                          onClick={() => handleUpdatePage(currentPage.id, { soundEffectUrl: undefined })}
                          className="px-1.5 py-0.5 rounded text-[9px] text-rose-500"
                        >
                          不播音效
                        </button>
                      </div>
                    </div>

                    {/* Dynamic media picker loader */}
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-500">本地加载单发短音频：</span>
                      <label className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded text-[10px] cursor-pointer font-sans">
                        选择短音频...
                        <input 
                          type="file" 
                          accept="audio/*" 
                          onChange={(e) => handleMediaPick(e, 'soundEffectUrl')} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                  </div>
                </div>

                {/* Copy / Move Order Control keys */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 flex-wrap gap-2 text-xs">
                  <div className="text-slate-500 font-sans">页次调整操作：</div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMovePage('up')}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="向上挪动本页播放次序"
                    >
                      <ArrowUp className="w-3.5 h-3.5" /> 前移一页
                    </button>
                    <button
                      onClick={() => handleMovePage('down')}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="向下挪动本页播放次序"
                    >
                      <ArrowDown className="w-3.5 h-3.5" /> 后移一页
                    </button>
                    <button
                      onClick={() => handleCopyPage(currentPage.id)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="复制本页内容及媒体资源参数至新一页"
                    >
                      <Copy className="w-3.5 h-3.5" /> 快速复制本页
                    </button>
                    <button
                      onClick={() => handleDeletePage(currentPage.id)}
                      className="p-1.5 bg-rose-950/20 hover:bg-rose-950/40 rounded border border-rose-900/30 hover:border-rose-900/50 text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                      title="删除此页面"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 物理删除本页
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Local Folder Structure Guidelines integration */}
          <FolderGuide />

        </div>

      </div>

    </div>
  );
}
