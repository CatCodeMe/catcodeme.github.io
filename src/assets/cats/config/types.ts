import type { ImageMetadata } from 'astro';

// 猫咪的基础信息 (您现有的 info 结构)
export interface CatInfo {
  id: string;
  gender: '男' | '女';
  birthday: string;
  deathday?: string;
  tags: string[];
  desc?: string;
}

// 单张照片的信息
export interface Photo {
  image: ImageMetadata; // Astro 优化的图片类型
  subjects?: string[];   // 照片中的主角们, 对应 info 的 key
  capturedAt?: string;   // 拍摄日期
  caption?: string;      // 照片的一句话描述
  tags?: string[];       // 照片本身的标签, 比如 "户外", "搞怪"
}
