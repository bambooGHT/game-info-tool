# 游戏信息工具API

## API 文档

### 搜索接口

#### 请求
- **方法**: GET
- **路径**: `/search`
- **查询参数**:
  - `text`: 字符串，搜索内容
  - `website`: `"2DFan"` | `"DLsite"`

#### 请求示例
```bash
GET /search?text=example&website=2DFan
```
#### 响应
``` ts
interface SearchResult {
  success: boolean;
  data: null | Array<{
    /** 游戏名 */
    name: string,
    /** 翻译名 */
    translateName: string,
    /** 封面 */
    images: string[],
    /** 品牌 */
    brand: string;
    /** 发售日期 */
    releaseDate: string;
    /** 系列名 */
    seriesName: string;
    /** 发售平台 */
    platform: string[];
    /** 游戏标签 */
    gameTypeTags: string[];
    /** 类别标签 */
    categoryTags: string[];
    /** 类别标签 */
    storyTags: string[];
    /** 语言标签 */
    langTags: string[];
    /** 年龄限制 */
    ageRestriction?: string;
    /** 来源Url */
    sourceUrl: string;
    /** 介绍 */
    introduction: string;
  }>;
  message: string;
}
```

### 图片代理

#### 请求
- **方法**: GET
- **路径**: `/imgProxy`
- **查询参数**:
  - `url`: 字符串，图片URL

#### 请求示例
```bash
GET /imgProxy?url=https://example.com/image.jpg
```