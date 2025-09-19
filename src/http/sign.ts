import md5 from './md5';
import Base64 from './base64';

// 定义接口类型
interface SignParams {
  [key: string]: any;
}

class SignTool {
  private params: SignParams = {};
  private videoParams: SignParams = {};
  private signRes: string = "";
  private videoSign: string = "";
  private readonly videoKey: string = "vdbo.yunstudy";
  private readonly apiKey: string = "bLsBMeMaN10pN8z64TQ0fC3fztDlRsPn";
  // 备用 API 密钥: "C7t6hJz8F1dqVWJ8R9BeHbaZEzAvWMZS"

  // 设置参数字典
  setParams(params: SignParams): void {
    this.params = { ...params };
  }

  // 设置单个参数
  setParam(key: string, value: any): void {
    this.params[key] = value;
  }

  // 获取签名结果
  getSignRes(): string {
    return this.signRes;
  }

  // 接口签名生成
  createSign(): string {
    // 创建一个新的对象，用于存放排好序的键值对
    const sortedParams: SignParams = {};
    Object.keys(this.params)
      .sort()
      .forEach(key => {
        sortedParams[key] = this.params[key];
      });
      
    let paramString = this.implode(",", sortedParams);
    paramString = paramString + this.apiKey;
    paramString = Base64.Base64._utf8_encode(paramString);
    this.signRes = md5.hex_md5(paramString);
    return this.signRes;
  }

  // 创建data数据
  createData(): string {
    // 简单深克隆
    const clonedParams = JSON.parse(JSON.stringify(this.params));
    
    // 可以在这里添加公共参数
    // clonedParams.AAPICOM_NAME = 'waiyutong';
    // clonedParams.AAPICOM_KEY = '2hcwiwgr05y2jy0r9bn15bzdtl';
    
    return Base64.Base64.encode(JSON.stringify(clonedParams));
  }

  // 实现PHP的implode功能
  private implode(glue: string = ',', data: any): string {
    if (!data || typeof data !== 'object') {
      return data !== undefined ? String(data) : '';
    }
    
    if (Array.isArray(data)) {
      return data
        .map(val => {
          if (!val && val !== 0 && val !== false) return '';
          if (typeof val === 'object') return this.implode(glue, val);
          return val;
        })
        .filter(e => e !== '')
        .join(glue);
    }
    
    return Object.values(data)
      .map(val => {
        if (!val && val !== 0 && val !== false) return '';
        if (typeof val === 'object') return this.implode(glue, val);
        return val;
      })
      .filter(e => e !== '')
      .join(glue);
  }

  /**
   * base64编码
   * @param str 要编码的字符串
   */
  base64Encode(str: string): string {
    return Base64.Base64.encode(str);
  }

  /**
   * base64解码
   * @param str 要解码的字符串
   */
  base64Decode(str: string): string {
    return Base64.Base64.decode(str);
  }

  // 生成请求组合参数
  encodePost(): string {
    return JSON.stringify({
      data: this.createData(),
      sign: this.createSign(),
    });
  }

  // 解密数据
  decodePost(data: { data: string; sign?: string }): any {
    const param = data.data;
    // const sign = data.sign;
    return JSON.parse(this.base64Decode(param));
  }
}

// 创建单例实例
const signInstance = new SignTool();

// 导出工具对象
export default {
  ...signInstance,
  sign: signInstance,
  createSign: signInstance.createSign.bind(signInstance),
  createData: signInstance.createData.bind(signInstance),
  base64Encode: signInstance.base64Encode.bind(signInstance),
  base64Decode: signInstance.base64Decode.bind(signInstance),
  encodePost: signInstance.encodePost.bind(signInstance),
  decodePost: signInstance.decodePost.bind(signInstance),
  setParams: signInstance.setParams.bind(signInstance),
  setParam: signInstance.setParam.bind(signInstance),
  getSignRes: signInstance.getSignRes.bind(signInstance),
};