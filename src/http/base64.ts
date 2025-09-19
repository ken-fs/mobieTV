/**
 * Base64 编码解码工具
 */
class Base64Encoder {
    // 私有属性
    private readonly _keyStr: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  
    /**
     * 编码方法
     * @param input 要编码的字符串
     * @returns Base64编码后的字符串
     */
    public encode(input: string): string {
      let output = "";
      let chr1: number, chr2: number, chr3: number;
      let enc1: number, enc2: number, enc3: number, enc4: number;
      let i = 0;
      
      input = this._utf8_encode(input);
      
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = i < input.length ? input.charCodeAt(i++) : NaN;
        chr3 = i < input.length ? input.charCodeAt(i++) : NaN;
        
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        
        output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      
      return output;
    }
  
    /**
     * 解码方法
     * @param input Base64编码的字符串
     * @returns 解码后的原始字符串
     */
    public decode(input: string): string {
      let output = "";
      let chr1: number, chr2: number, chr3: number;
      let enc1: number, enc2: number, enc3: number, enc4: number;
      let i = 0;
      
      // 移除非法字符
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        
        output = output + String.fromCharCode(chr1);
        
        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      
      output = this._utf8_decode(output);
      return output;
    }
  
    /**
     * UTF-8 编码
     * @param string 要编码的字符串
     * @returns UTF-8编码后的字符串
     */
    private _utf8_encode(string: string): string {
      string = string.replace(/\r\n/g, "\n");
      let utftext = "";
      
      for (let n = 0; n < string.length; n++) {
        const c = string.charCodeAt(n);
        
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      
      return utftext;
    }
  
    /**
     * UTF-8 解码
     * @param utftext UTF-8编码的字符串
     * @returns 解码后的原始字符串
     */
    private _utf8_decode(utftext: string): string {
      let string = "";
      let i = 0;
      let c: number = 0;
      let c1: number = 0;
      let c2: number = 0;
      let c3: number = 0;
      
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      
      return string;
    }
  }
  
  // 创建单例实例
  const Base64 = new Base64Encoder();
  
  // 导出与原JS相同的结构
  export default {
    Base64
  };