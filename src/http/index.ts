import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestConfig,
} from "axios";
import rsa from "./rsa";
import Sign from './sign';
import { tokenCookies } from "@/utils/cookies";

interface HttpConfig extends AxiosRequestConfig {
  isRsaEncrypt?: boolean;
  loading?: boolean;
  resDataKey?: string;
}

interface ApiResponse<T = any> {
  code: number;
  data?: T;
  msg?: string;
  message?: string;
}

const axiosConfig: AxiosRequestConfig = {
  timeout: 50000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

class HttpService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || ""),
      timeout: 50000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 从 cookie 中获取 token，使用 x-token 头避免 CORS 预检请求
        const token = tokenCookies.getAccessToken();
        if (token) {
          config.headers['x-token'] = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;

        // 统一处理成功响应
        if (data.code === 200 || data.code === 0) {
          return data;
        }

        // 处理业务错误 - 返回完整响应数据，让业务层决定如何处理
        return data;
      },
      (error) => {
        // 处理HTTP错误
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              // 未授权，清除所有认证信息并跳转到登录页
              tokenCookies.clearTokens();
              localStorage.removeItem("user_info");
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
              return Promise.reject(new Error("登录已过期，请重新登录"));
            case 403:
              return Promise.reject(new Error("没有权限访问"));
            case 404:
              return Promise.reject(new Error("请求的资源不存在"));
            case 500:
              return Promise.reject(new Error("服务器内部错误"));
            default: {
              const errorMessage = data?.message || data?.msg || "网络错误";
              return Promise.reject(new Error(errorMessage));
            }
          }
        }

        if (error.code === "ECONNABORTED") {
          return Promise.reject(new Error("请求超时"));
        }

        return Promise.reject(new Error("网络连接失败"));
      }
    );
  }

  private initData(data: Record<string, any>): Record<string, any> {
    const out = Object.assign(
      {
        is_https: +(location.protocol === "https:") || "",
      },
      data
    );

    Object.keys(out).forEach((k) => {
      if (!out[k] && out[k] !== 0) delete out[k];
    });

    return out;
  }

  private initConfig(config: HttpConfig): AxiosRequestConfig & HttpConfig {
    const out = Object.assign(
      {
        isRsaEncrypt: false,
        loading: true,
        resDataKey: "data",
      },
      axiosConfig,
      config
    );

    out.headers = Object.assign(
      {
        ...axiosConfig.headers,
      },
      out.headers
    );

    return out;
  }

  private isSuccessRes(res: ApiResponse): boolean {
    return res.code * 1 === 200;
  }

  private showLoading() {
    console.log("Loading...");
  }

  private hideLoading() {
    console.log("Loading complete");
  }

  async http<T = any>(
    url: string,
    data: Record<string, any> = {},
    config: HttpConfig = {},
    method: "get" | "post" = "post"
  ): Promise<T> {
    let params = this.initData(data);
    const finalConfig = this.initConfig(config);
    const { isRsaEncrypt, loading, resDataKey } = finalConfig;

    delete finalConfig.isRsaEncrypt;
    delete finalConfig.loading;
    delete finalConfig.resDataKey;

    const oldData = { ...params };

    if (isRsaEncrypt && method === "post") {
      rsa.setParams(params);
      params = { params: rsa.createDataRsa() };
    }

    if (loading) {
      this.showLoading();
    }

    try {
      let requestData = params;
      
      // 如果是JSON格式请求，将数据转换为JSON字符串
      if (finalConfig.headers?.["Content-Type"] === "application/json" && method === "post") {
        requestData = JSON.stringify(params);
      }

      const result: ApiResponse<T> = await this.instance[method](
        url,
        requestData,
        finalConfig
      );

      if (loading) {
        this.hideLoading();
      }

      if (this.isSuccessRes(result)) {
        return resDataKey
          ? (result[resDataKey as keyof typeof result] as T)
          : (result as T);
      } else {
        if (import.meta.env.DEV) {
          console.log(
            "url:\n\t",
            url,
            "\nparams:\n\t",
            JSON.stringify(oldData),
            "\nerr:\n\t",
            result
          );
        }
        throw result;
      }
    } catch (error) {
      if (loading) {
        this.hideLoading();
      }
      throw error;
    }
  }

  post<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    return this.http<T>(url, data, config, "post");
  }

  get<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    return this.http<T>(url, data, config, "get");
  }

  $post<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    const rsaConfig = { 
      ...config, 
      isRsaEncrypt: true,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    };
    return this.http<T>(url, data, rsaConfig, "post");
  }

  async upload(
    url: string,
    file: File,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    if (data) {
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
    }

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    };

    return await this.instance.post(url, formData, uploadConfig);
  }

  postJson<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    const jsonConfig = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    };
    return this.post<T>(url, data, jsonConfig);
  }

  getJson<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    const jsonConfig = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    };
    return this.get<T>(url, data, jsonConfig);
  }

  uploadFile(
    url: string,
    formData: FormData,
    config?: HttpConfig
  ): Promise<any> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    };

    return this.instance.post(url, formData, uploadConfig);
  }

  handleError(error: any): void {
    this.hideLoading();
    if (error.message !== "http cancel") {
      console.error(error.msg || "网络错误！");
    }
  }

  // 新增：使用sign.ts加密的POST方法
  $post100<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    // 设置请求头为application/json
    const signConfig = { 
      ...config, 
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    };
    
    // 调用带sign加密的http方法
    return this.httpWithSign<T>(url, data, signConfig, "post");
  }

  // 新增：使用sign.ts加密的GET方法
  $get100<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: HttpConfig
  ): Promise<T> {
    // 调用带sign加密的http方法
    return this.httpWithSign<T>(url, data, config || {}, "get");
  }

  // 修复：使用sign.ts加密的通用HTTP方法
// 修复：使用sign.ts加密的通用HTTP方法，基于参考代码重写
private async httpWithSign<T = any>(
  url: string,
  data: Record<string, any> = {},
  config: HttpConfig = {},
  method: "get" | "post" = "post"
): Promise<T> {
  let params = this.initData(data);
  const finalConfig = this.initConfig(config);
  const { loading, resDataKey } = finalConfig;

  try {
    if (loading) {
      this.showLoading();
    }

    // 设置签名参数
    Sign.setParams(params);
    let requestData: any;
    
    if (method === "post") {
      // POST 请求处理 - 进行 Sign 加密
      const encodedData = Sign.encodePost();
      requestData = JSON.parse(encodedData); // 解析为对象，因为 encodePost 返回的是字符串
    } else {
      // GET 请求处理
      requestData = {
        params: {
          ...params,
          sign: Sign.createSign()
        }
      };
    }

    // 发送请求
    const response = await this.instance.request({
      url,
      method,
      ...finalConfig,
      ...(method === 'post' ? { data: requestData } : requestData)
    });

    if (loading) {
      this.hideLoading();
    }

    // 获取响应数据
    let result = response;

    // 开发环境下打印原始响应
    if (import.meta.env.DEV) {
      console.log('Raw response:', result);
    }

    // 对响应数据进行解密处理
   if (method === 'post') {
      try {
        // 确保传入正确的数据格式
        const decryptParams = {
          data: result.data,
          sign: result.sign || ''
        };
        
        if (import.meta.env.DEV) {
          console.log('Decrypt params:', decryptParams);
        }
        
        result = Sign.decodePost(decryptParams);
        
        // 开发环境下打印解密后的数据
        if (import.meta.env.DEV) {
          console.log('Decoded response:', result);
        }
      } catch (decryptError) {
        console.error('解密失败，原始数据:', result);
        console.error('解密错误:', decryptError);
        throw new Error('数据解密失败');
      }
    }

    // 检查响应是否成功
    if (this.isSuccessRes(result)) {
      // 根据 resDataKey 返回数据
      return resDataKey && result[resDataKey] 
        ? result[resDataKey] 
        : result;
    }

    // 处理业务错误
    throw result;

  } catch (error: any) {
    if (loading) {
      this.hideLoading();
    }
    
    // 错误日志
    if (import.meta.env.DEV) {
      console.error('Request failed:', {
        url,
        originalData: params,
        error: error?.response?.data || error.message || error
      });
    }
    
    throw error;
  }
}
}

export default new HttpService();
export { HttpService, type ApiResponse };
