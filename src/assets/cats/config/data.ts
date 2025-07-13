import type { CatPhoto } from './types'

// Import all cat images
import _1h1 from '@/assets/cats/1-h-1.jpg'
import _1h2 from '@/assets/cats/1-h-2.jpg'
import _1h3 from '@/assets/cats/1-h-3.jpg'
import _1h from '@/assets/cats/1-h.jpg'
import _1m1 from '@/assets/cats/1-m-1.jpg'
import _1m2 from '@/assets/cats/1-m-2.png'
import _1m from '@/assets/cats/1-m.jpg'
import _2111 from '@/assets/cats/2-1-1-1.jpg'
import _2112 from '@/assets/cats/2-1-1-2.jpg'
import _211 from '@/assets/cats/2-1-1.jpg'
import _221 from '@/assets/cats/2-2-1.png'
import _2231 from '@/assets/cats/2-2-3-1.jpg'
import _223 from '@/assets/cats/2-2-3.jpg'
import _2241 from '@/assets/cats/2-2-4-1.jpg'
import _2242 from '@/assets/cats/2-2-4-2.jpg'
import _2243 from '@/assets/cats/2-2-4-3.jpg'
import _224 from '@/assets/cats/2-2-4.png'
import _2261 from '@/assets/cats/2-2-6-1.jpg'
import _226 from '@/assets/cats/2-2-6.jpg'
import _31 from '@/assets/cats/3-1.png'
import _u1 from '@/assets/cats/u-1.jpg'
import _u2 from '@/assets/cats/u-2.jpg'
import _u3 from '@/assets/cats/u-3.jpg'
import _u4 from '@/assets/cats/u-4.jpg'

/**
 * Cat photo data collection
 */
export const cats: CatPhoto[] = [
  {
    name: '小花_1',
    image: _1h1,
    date: '2025-04-03',
    tag: ['花猫']
  },
  {
    name: '小花_2',
    image: _1h2,
    date: '2025-04-03',
    tag: ['花猫', '玩耳']
  },
  {
    name: '小花_3',
    image: _1h3,
    date: '2025-04-03',
    desc: '小花的第三张照片'
  },
  {
    name: '小花',
    image: _1h,
    date: '2025-04-03',
    tag: ['花猫', '主图'],
    desc: '小花的主要照片'
  },
  {
    name: '月亮_1',
    image: _1m1,
    date: '2025-04-03',
    tag: ['月亮猫']
  },
  {
    name: '月亮_2',
    image: _1m2,
    date: '2025-04-03'
  },
  {
    name: '月亮',
    image: _1m,
    date: '2025-04-03',
    desc: '月亮的主要照片'
  },
  {
    name: '大姐_1',
    image: _2111,
    date: '2025-04-03'
  },
  {
    name: '大姐_2',
    image: _2112,
    date: '2025-04-03'
  },
  {
    name: '大姐',
    image: _211,
    date: '2025-04-03',
    tag: ['大姐猫']
  },
  {
    name: '大头',
    image: _221,
    date: '2025-04-03',
    desc: '大头猫的照片'
  },
  {
    name: '老三_1',
    image: _2231,
    date: '2025-04-03'
  },
  {
    name: '老三',
    image: _223,
    date: '2025-04-03',
    tag: ['老三猫']
  },
  {
    name: '老四_1',
    image: _2241,
    date: '2025-04-03'
  },
  {
    name: '老四_2',
    image: _2242,
    date: '2025-04-03',
    desc: '老四的第二张照片'
  },
  {
    name: '老四_3',
    image: _2243,
    date: '2025-04-03'
  },
  {
    name: '老四',
    image: _224,
    date: '2025-04-03',
    tag: ['老四猫', '主图']
  },
  {
    name: '老六_1',
    image: _2261,
    date: '2025-04-03',
    tag: ['老六猫', '建筑']
  },
  {
    name: '老六',
    image: _226,
    date: '2025-04-03',
    desc: '老六的主要照片'
  },
  {
    name: '小孙子',
    image: _31,
    date: '2025-04-03',
    tag: ['小孙子猫']
  },
  {
    image: _u1,
    date: '2025-04-03',
    desc: '未命名的猫咪照片'
  },
  {
    image: _u2,
    date: '2025-04-03',
    tag: ['未命名']
  },
  {
    image: _u3,
    date: '2025-04-03'
  },
  {
    image: _u4,
    date: '2025-04-03',
    tag: ['未命名'],
    desc: '最后一张未命名的照片'
  }
]
