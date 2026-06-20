/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'blur-in' | 'flash-white' | 'flash-black';

export type TextLayoutType = 'adv' | 'nvl';

export interface Page {
  id: string;
  characterName?: string; // Optional character name for Dialogue Box style
  text: string;
  bgType: 'image' | 'video' | 'color';
  bgUrl: string; // File name (e.g., bg1.jpg) or full URL. Local assets should put in corresponding directory.
  bgVideoMutated?: boolean; // Web video attribute
  bgOpacity: number; // 0 to 1
  bgColor?: string; // Hex color fallback if bgType is 'color'
  transition: TransitionType;
  transitionDuration: number; // in seconds
  soundEffectUrl?: string; // Short sound effects triggered on entering this page
  textLayout: TextLayoutType; // Page-specific override, or defaults to game config
  fontSize: number; // custom font size for this page text
  textColor: string; // custom hex color or tailwind text class
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  bgmUrl?: string; // Chapter BGM path or URL (e.g., bgm1.mp3)
  pages: Page[];
}

export interface Volume {
  id: string;
  title: string;
  description?: string;
  bgmUrl?: string; // Volume fallback BGM path or URL (e.g., vol_bgm.mp3)
  chapters: Chapter[];
}

export interface GameProject {
  id: string;
  title: string;
  author: string;
  description: string;
  defaultTextLayout: TextLayoutType;
  primaryColor: string; // Hex or style name (e.g., 'indigo', 'amber', 'rose')
  volumes: Volume[];
}

export interface PlayHistoryLog {
  id: string;
  characterName?: string;
  text: string;
  chapterTitle: string;
}

export interface LocalAssetInfo {
  name: string;
  path: string;
  type: 'image' | 'video' | 'audio';
  category: 'background' | 'bgm' | 'se';
  previewUrl?: string; // Generated object URL if loaded dynamically
}
