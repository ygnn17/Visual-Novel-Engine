/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameProject } from './types';

// High-quality public/free assets to ensure the engine works beautifully right away
export const DEMO_PRESETS = {
  images: [
    { name: '晨曦森林 (Morning Forest)', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80' },
    { name: '虚空深渊 (Aether Abyss)', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { name: '落日废墟 (Sunken Ruins)', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80' },
    { name: '寂静雪岭 (Silent Mountains)', url: 'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=1200&q=80' },
    { name: '浮空城堡 (Floating Sanctuary)', url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80' }
  ],
  videos: [
    // Free sample videos from Pexels (using direct CDN fallbacks)
    { name: '梦幻星空 (Cosmic Particles)', url: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-outer-space-40003-large.mp4' },
    { name: '雨落池塘 (Ambient Raindrops)', url: 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-surface-of-water-34446-large.mp4' },
    { name: '炉火微茫 (Cozy Fireplace)', url: 'https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-a-fireplace-close-up-42790-large.mp4' }
  ],
  bgms: [
    { name: '幽光钢琴 (Moonlight Piano)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: '远古低吟 (Ancient Ambient)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { name: '风起旅程 (Winds of Journey)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
  ],
  soundEffects: [
    { name: '微风拂面 (Wind Pass)', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
    { name: '清脆铃声 (Magic Chime)', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
    { name: '深沉开门 (Heavy Gate Opening)', url: 'https://actions.google.com/sounds/v1/doors/wood_door_creak_close.ogg' }
  ]
};

export const INITIAL_DEMO_PROJECT: GameProject = {
  id: 'demo-eldoria-secret',
  title: '艾尔德里亚之谜',
  author: '夜巡隐士',
  description: '一部关于失落魔法与时光旅者的沉浸式互动视觉小说。你将穿梭于碎裂的时空，寻找古老圣域的守护钟声。',
  defaultTextLayout: 'adv',
  primaryColor: 'teal',
  volumes: [
    {
      id: 'vol-1',
      title: '第一卷：碎星与低语',
      description: '当你醒来时，身处名为“晨光星盘”的巨木森岭，耳畔隐约传来悠扬的笛声。',
      bgmUrl: DEMO_PRESETS.bgms[0].url, // Volume level BGM (Song-1)
      chapters: [
        {
          id: 'chap-1-1',
          title: '第一章：晨曦古木之觉醒',
          description: '唤醒尘封的远古意识，踏上探索荒芜星盘的道路。',
          pages: [
            {
              id: 'p1',
              characterName: '？？？',
              text: '（在你耳边缭绕的多声部风笛声中，你的眼皮动了动……晨光透过参天巨木的叶隙洒落，带着森林独有的湿泥气味。）',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[0].url,
              bgOpacity: 0.9,
              transition: 'blur-in',
              transitionDuration: 1.2,
              textLayout: 'adv',
              fontSize: 18,
              textColor: '#f8fafc'
            },
            {
              id: 'p2',
              characterName: '艾莉雅',
              text: '“你终于醒了，旅人。这里已荒废了整整三个纪元。我还以为群星的低语已经让你迷失在了溯流之中。”',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[0].url,
              bgOpacity: 0.95,
              transition: 'slide-left',
              transitionDuration: 0.8,
              textLayout: 'adv',
              fontSize: 18,
              textColor: '#f8fafc'
            },
            {
              id: 'p3',
              characterName: '我',
              text: '“我是谁……？这里是……晨曦星盘吗？我只记得漫天的火焰，和一道黑色的裂缝。”',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[0].url,
              bgOpacity: 0.95,
              transition: 'fade',
              transitionDuration: 0.5,
              textLayout: 'adv',
              fontSize: 18,
              textColor: '#f8fafc'
            },
            {
              id: 'p4',
              characterName: '艾莉雅',
              text: '“裂缝？原来宿命之钟早已停摆。没时间解释了，星盘的灵力已经濒临失控，我们需要去圣域废墟，修补碎裂的核心！”',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[4].url, // Floating sanctuary
              bgOpacity: 0.8,
              transition: 'zoom-in',
              transitionDuration: 1.5,
              textLayout: 'adv',
              fontSize: 18,
              textColor: '#38bdf8'
            }
          ]
        },
        {
          id: 'chap-1-2',
          title: '第二章：深渊呓语与黑烛',
          description: '遭遇深谷下的阴影意志，这里曾是一切法术纪元的终点。',
          bgmUrl: DEMO_PRESETS.bgms[1].url, // Chapter-specific BGM (Song-2) overriding Volume BGM
          pages: [
            {
              id: 'p5',
              text: '【编年史·卷二】\n\n法师们在最后的圣所构筑了名为“黑星”的阵列。他们点燃油脂混合的灯芯，试图在古老虚无中寻觅造物主的轮廓。然而当灵流交织，高耸的石塔于刹那间湮灭不见。这里逐渐沦为了无人涉足的“废墟深处”。',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[2].url, // Sunken ruins
              bgOpacity: 0.7,
              transition: 'flash-black',
              transitionDuration: 1.0,
              textLayout: 'nvl', // Elegant full-screen novel layout!
              fontSize: 16,
              textColor: '#e2e8f0'
            },
            {
              id: 'p6',
              text: '虚空中传来细密又无序的摩擦音，重叠着不属于任何活物的语调：\n\n“回首，或是臣服。这里的土层堆叠了十二万名占星者的白骨，他们也曾如你这般坚信：群星能赋予凡人对抗虚无的权杖。”\n\n空气的温度陡然跌落，你的呼吸在惨淡的光束中凝结成阵阵白霜。',
              bgType: 'video',
              bgUrl: DEMO_PRESETS.videos[0].url, // Starfall loop background video
              bgOpacity: 0.6,
              transition: 'zoom-out',
              transitionDuration: 1.2,
              textLayout: 'nvl',
              fontSize: 16,
              textColor: '#e2e8f0'
            }
          ]
        }
      ]
    },
    {
      id: 'vol-2',
      title: '第二卷：风起寂静雪峰',
      description: '登上终年积雪的山岭，寻找冰封的远古时光之钥。',
      bgmUrl: DEMO_PRESETS.bgms[2].url, // Volume BGM (Song-3)
      chapters: [
        {
          id: 'chap-2-1',
          title: '第一章：冰封的时轨',
          description: '跨越暴风雪，进入时间静止的霜寒结界。',
          pages: [
            {
              id: 'p7',
              characterName: '守护冰雕',
              text: '“止步，擅闯之人。前面是霜神与星辰共筑的静止时界。在这里，你的血液、心跳，乃至飞快消逝的思绪，都将化作圣山不朽的冰晶。”',
              bgType: 'image',
              bgUrl: DEMO_PRESETS.images[3].url, // Ice peak
              bgOpacity: 0.9,
              transition: 'zoom-in',
              transitionDuration: 1.0,
              textLayout: 'adv',
              fontSize: 18,
              textColor: '#e0f2fe'
            },
            {
              id: 'p8',
              text: '（刺骨的一股寒流刮过。冰雕的话音在山谷里荡回，你伸手触摸那道透明的壁障。风雪的粒子停滞在半空，宛如千万颗剔透的锆石。你决定咬紧牙关，踏入那片诡异的时空凝固领域……）',
              bgType: 'video',
              bgUrl: DEMO_PRESETS.videos[1].url, // Ambient water loop, mimicking flowing magic
              bgOpacity: 0.8,
              transition: 'flash-white',
              transitionDuration: 0.6,
              textLayout: 'nvl',
              fontSize: 17,
              textColor: '#ffffff'
            }
          ]
        }
      ]
    }
  ]
};
