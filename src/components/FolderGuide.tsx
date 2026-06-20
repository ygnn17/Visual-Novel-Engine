/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FolderOpen, FileVideo, Image as ImageIcon, Music, HelpCircle, CheckCircle } from 'lucide-react';

export default function FolderGuide() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-300 shadow-xl max-w-full">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
        <FolderOpen className="text-teal-400 w-6 h-6" />
        <div>
          <h3 className="font-semibold text-slate-100 text-base">本地资源存放与引用指南</h3>
          <p className="text-xs text-slate-500">How to organize local assets for offline play</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        本框架支持基于标准 Vite 项目结构的本地资源引用。如果您在本地运行此应用，请在项目的 <code className="bg-slate-950 px-1.5 py-0.5 rounded text-teal-300 font-mono text-xs">public/</code> 根目录中创建相应的文件夹，将资源复制进去，然后在编辑器中<b>按如下相对路径填写</b>即可：
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Images */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2 rounded text-emerald-400 mt-0.5">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">背景图片文件夹</div>
            <div className="font-mono text-xs text-slate-200 font-semibold mt-0.5">public/assets/images/</div>
            <div className="text-[11px] text-slate-400 mt-1">
              例如图片为 <code className="text-emerald-300">scene1.jpg</code>，填写路径：<br />
              <code className="text-slate-300 select-all">/assets/images/scene1.jpg</code>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3">
          <div className="bg-cyan-500/10 p-2 rounded text-cyan-400 mt-0.5">
            <FileVideo className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">背景视频文件夹</div>
            <div className="font-mono text-xs text-slate-200 font-semibold mt-0.5">public/assets/videos/</div>
            <div className="text-[11px] text-slate-400 mt-1">
              例如视频为 <code className="text-cyan-300">snow.mp4</code>，填写路径：<br />
              <code className="text-slate-300 select-all">/assets/videos/snow.mp4</code>
            </div>
          </div>
        </div>

        {/* BGM */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3">
          <div className="bg-purple-500/10 p-2 rounded text-purple-400 mt-0.5">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">背景音乐 (BGM) 文件夹</div>
            <div className="font-mono text-xs text-slate-200 font-semibold mt-0.5">public/assets/bgm/</div>
            <div className="text-[11px] text-slate-400 mt-1">
              例如音乐为 <code className="text-purple-300">fantasy.mp3</code>，填写路径：<br />
              <code className="text-slate-300 select-all">/assets/bgm/fantasy.mp3</code>
            </div>
          </div>
        </div>

        {/* SFX */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3">
          <div className="bg-amber-500/10 p-2 rounded text-amber-400 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">音效 (Sound Effects) 文件夹</div>
            <div className="font-mono text-xs text-slate-200 font-semibold mt-0.5">public/assets/se/</div>
            <div className="text-[11px] text-slate-400 mt-1">
              例如音效为 <code className="text-amber-300">click.mp3</code>，填写路径：<br />
              <code className="text-slate-300 select-all">/assets/se/click.mp3</code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <CheckCircle className="text-teal-400 shrink-0 w-4 h-4 mt-0.5" />
        <div>
          <span className="text-slate-200 font-medium font-sans">💡 实时浏览器测试技巧：</span>
          <p className="mt-1 leading-relaxed">
            无需打包或手动复制文件！我们在资源编辑处提供了<b>“本地多媒体载入器”</b>，允许您从电脑中直接选择图片、视频或音频。
            浏览器会为它们生成临时的本地测试链接 (Blob URL)，并在当前的播放测试中<b>立即生效</b>。这极大方便了快速迭代预览！
          </p>
        </div>
      </div>
    </div>
  );
}
