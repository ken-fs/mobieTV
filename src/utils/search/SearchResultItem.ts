/**
 * Search result item interface
 */
export interface SearchResultItem {
  /** 唯一标识 */
  id?: string | number
  /** 标题 */
  title?: string
  /** 副标题或描述 */
  subtitle?: string
  /** 封面图片URL */
  image?: string
  /** 链接地址 */
  url?: string
  /** 播放地址 */
  playUrl?: string
  /** 分类 */
  category?: string
  /** 评分 */
  rating?: number
  /** 年份 */
  year?: string
  /** 地区 */
  region?: string
  /** 类型 */
  type?: string
  /** 状态 */
  status?: string
  /** 演员 */
  actors?: string[]
  /** 导演 */
  director?: string
  /** 简介 */
  description?: string
  /** 更新时间 */
  updateTime?: string
  /** 其他扩展属性 */
  [key: string]: any
}