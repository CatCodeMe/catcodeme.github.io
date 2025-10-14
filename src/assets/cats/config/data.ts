// Import all cat images
import _1h1 from '@/assets/cats/1-h-1.jpg';
import _1h2 from '@/assets/cats/1-h-2.jpg';
import _1h3 from '@/assets/cats/1-h-3.jpg';
import _1h from '@/assets/cats/1-h.jpg';
import _1m1 from '@/assets/cats/1-m-1.jpg';
import _1m2 from '@/assets/cats/1-m-2.png';
import _1m from '@/assets/cats/1-m.jpg';
import _2111 from '@/assets/cats/2-1-1-1.jpg';
import _2112 from '@/assets/cats/2-1-1-2.jpg';
import _211 from '@/assets/cats/2-1-1.jpg';
import _221 from '@/assets/cats/2-2-1.png';
import _2231 from '@/assets/cats/2-2-3-1.jpg';
import _223 from '@/assets/cats/2-2-3.jpg';
import _2241 from '@/assets/cats/2-2-4-1.jpg';
import _2242 from '@/assets/cats/2-2-4-2.jpg';
import _2243 from '@/assets/cats/2-2-4-3.jpg';
import _224 from '@/assets/cats/2-2-4.png';
import _2261 from '@/assets/cats/2-2-6-1.jpg';
import _226 from '@/assets/cats/2-2-6.jpg';
import _31 from '@/assets/cats/3-1.png';
import _u1 from '@/assets/cats/u-1.jpg';
import _u2 from '@/assets/cats/u-2.jpg';
import _u3 from '@/assets/cats/u-3.jpg';
import _u4 from '@/assets/cats/u-4.jpg';

import type { CatInfo, Photo } from './types';

export const info: Record<string, CatInfo> = {
  小花: {
    id: 'xiaohua',
    gender: '女',
    birthday: '2016-10-19',
    deathday: '2024-10-29',
    tags: ['三花', '田园猫', '可爱', 'Queen']
  },
  月亮: {
    id: 'yueliang',
    gender: '男',
    birthday: '2017-05-06',
    tags: ['金吉拉', '可爱', '傻萌', '馋', '长毛'],
    desc: '拉💩后爱跑酷的笨蛋粘人大脸猫'
  },
  大姐: {
    id: 'dajie',
    gender: '女',
    birthday: '2018-03-11',
    tags: ['三花', '田园猫', '可爱', '胖墩'],
    desc: '小花的大女儿, 真的该减肥了'
  },
  大头: {
    id: 'datou',
    gender: '男',
    birthday: '2018-08-11',
    tags: ['黑白', '田园猫', '头大', '呆呆的'],
    desc: '大块头有小胆子'
  },
  老三: {
    id: 'laosan',
    gender: '女',
    birthday: '2018-08-11',
    tags: ['黑白', '田园猫', '萌萌', '被老四欺负'],
    desc: '住单间的爱我的小可爱'
  },
  老四: {
    id: 'laosi',
    gender: '男',
    birthday: '2018-08-11',
    tags: ['橘白', '田园猫', '调皮', '撒娇', '可爱'],
    desc: '爱说话的颜值高的大橘'
  },
  老六: {
    id: 'laoliu',
    gender: '女',
    birthday: '2018-08-11',
    tags: ['黑白', '田园猫', '胆小', '妈宝'],
    desc: '小花最小的女儿, 胆子小还怕人'
  },
  小六: {
    id: 'xiaoliu',
    gender: '男',
    birthday: '2019-07-05',
    deathday: '2025-10-10',
    tags: ['黑白', '田园猫', '胆小', '害怕', '可怜'],
    desc: '大头和老六的大儿子, 胆子更小, 见人就跑'
  }
}

/**
 * Cat photo data collection
 */
export const photos: Photo[] = [
  {
    subjects: ['小花'],
    image: _1h1,
    tags: ['三花', '田园猫', '可爱', 'Queen'],
  },
  {
    subjects: ['小花'],
    image: _1h2,
    capturedAt: '2025-04-03',
    tags: ['三花', '田园猫', '可爱', 'Queen'],
  },
  {
    subjects: ['小花'],
    image: _1h3,
    capturedAt: '2025-04-03',
    caption: '小花的第三张照片'
  },
  {
    subjects: ['小花'],
    image: _1h,
    capturedAt: '2025-04-03',
    tags: ['花猫'],
  },
  {
    subjects: ['月亮'],
    image: _1m1,
    capturedAt: '2025-04-03',
    tags: ['金吉拉','可爱']
  },
  {
    subjects: ['月亮'],
    image: _1m2,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['月亮'],
    image: _1m,
  },
  {
    subjects: ['大姐'],
    image: _2111,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['大姐'],
    image: _2112,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['大姐'],
    image: _211,
    capturedAt: '2025-04-03',
    tags: ['大姐猫']
  },
  {
    subjects: ['大头'],
    image: _221,
    capturedAt: '2025-04-03',
    caption: '大头猫的照片'
  },
  {
    subjects: ['老三'],
    image: _2231,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['老三'],
    image: _223,
    capturedAt: '2025-04-03',
    tags: ['老三猫']
  },
  {
    subjects: ['老四'],
    image: _2241,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['老四'],
    image: _2242,
    capturedAt: '2025-04-03',
    caption: '老四的第二张照片'
  },
  {
    subjects: ['老四'],
    image: _2243,
    capturedAt: '2025-04-03'
  },
  {
    subjects: ['老四'],
    image: _224,
    capturedAt: '2025-04-03',
    tags: ['老四猫', '主图']
  },
  {
    subjects: ['老六'],
    image: _2261,
    capturedAt: '2025-04-03',
    tags: ['老六猫', '建筑']
  },
  {
    subjects: ['老六'],
    image: _226,
    capturedAt: '2025-04-03',
    caption: '老六的主要照片'
  },
  {
    subjects: ['小六'],
    image: _31,
    capturedAt: '2025-04-03',
  },
  {
    image: _u1,
    capturedAt: '2025-04-03',
    caption: '全家福'
  },
  {
    image: _u2,
    capturedAt: '2025-04-03',
    caption: '排排坐'
  },
  {
    image: _u3,
    capturedAt: '2025-04-03'
  },
  {
    image: _u4,
    capturedAt: '2025-04-03',
  }
]