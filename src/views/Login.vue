<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="bg-gradient"></div>
      <div class="bg-patterns">
        <div class="pattern-circle"></div>
        <div class="pattern-circle"></div>
        <div class="pattern-circle"></div>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-form">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo">
            <span class="logo-text">MobieTV</span>
          </div>
          <h1 class="login-title">欢迎登录</h1>
          <p class="login-subtitle">请输入您的账号信息</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="form">
          <!-- 用户名输入框 -->
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <van-field
                v-model="formData.username"
                name="username"
                placeholder="请输入用户名"
                :border="false"
                :error="hasUsernameError"
                :error-message="usernameErrorMessage"
                class="custom-field"
                @blur="validateUsername"
                @input="clearUsernameError"
              />
            </div>
          </div>

          <!-- 密码输入框 -->
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="input-wrapper">
              <van-field
                v-model="formData.password"
                type="password"
                name="password"
                placeholder="请输入密码"
                :border="false"
                :error="hasPasswordError"
                :error-message="passwordErrorMessage"
                class="custom-field"
                @blur="validatePassword"
                @input="clearPasswordError"
              />
            </div>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="form-options">
            <van-checkbox v-model="rememberMe" class="remember-me">
              记住我
            </van-checkbox>
            <button
              type="button"
              class="forgot-password"
              @click="handleForgotPassword"
            >
              忘记密码？
            </button>
          </div>

          <!-- 登录按钮 -->
          <van-button
            type="primary"
            block
            round
            :loading="isLoading"
            loading-text="登录中..."
            class="login-button"
            @click="handleSubmit"
          >
            登录
          </van-button>

          <!-- 错误提示 -->
          <div v-if="hasError" class="error-message">
            {{ loginError }}
          </div>
        </form>

        <!-- 其他登录方式 -->
        <div class="other-login">
          <div class="divider">
            <span class="divider-text">其他登录方式</span>
          </div>
          <div class="social-login">
            <button type="button" class="social-button">
              <span class="social-icon">📱</span>
              <span>手机号登录</span>
            </button>
            <button type="button" class="social-button">
              <span class="social-icon">📧</span>
              <span>邮箱登录</span>
            </button>
          </div>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <button type="button" class="register-button" @click="handleRegister">
            立即注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showSuccessToast, showFailToast } from "vant";
import { useAuthStore } from "@/stores/auth";
import type { LoginParams } from "@/http/api";
import { exists, isNotEmpty } from "@/utils/functional";

// ============================================================================
// 类型定义
// ============================================================================

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username: string;
  password: string;
}

// ============================================================================
// 依赖注入
// ============================================================================

const router = useRouter();
const authStore = useAuthStore();

// ============================================================================
// 响应式状态
// ============================================================================

/** 表单数据 */
const formData = ref<FormData>({
  username: "",
  password: "",
});

/** 表单验证错误 */
const formErrors = ref<FormErrors>({
  username: "",
  password: "",
});

/** 记住我选项 */
const rememberMe = ref<boolean>(false);

// ============================================================================
// 计算属性
// ============================================================================

/** 是否正在加载 */
const isLoading = computed<boolean>(() => authStore.isLoading);

/** 是否有错误 */
const hasError = computed<boolean>(() => authStore.hasError);

/** 登录错误信息 */
const loginError = computed<string>(() => authStore.loginError);

/** 用户名是否有错误 */
const hasUsernameError = computed<boolean>(() =>
  isNotEmpty(formErrors.value.username)
);

/** 密码是否有错误 */
const hasPasswordError = computed<boolean>(() =>
  isNotEmpty(formErrors.value.password)
);

/** 用户名错误信息 */
const usernameErrorMessage = computed<string>(() => formErrors.value.username);

/** 密码错误信息 */
const passwordErrorMessage = computed<string>(() => formErrors.value.password);

// ============================================================================
// 纯函数工具
// ============================================================================

/**
 * 验证用户名格式
 */
const validateUsernameFormat = (username: string): string => {
  if (!exists(username) || username.trim() === "") {
    return "请输入用户名";
  }

  if (username.length < 3) {
    return "用户名至少3个字符";
  }

  if (username.length > 20) {
    return "用户名不能超过20个字符";
  }

  // 检查用户名格式（字母、数字、下划线）
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return "用户名只能包含字母、数字和下划线";
  }

  return "";
};

/**
 * 验证密码格式
 */
const validatePasswordFormat = (password: string): string => {
  if (!exists(password) || password.trim() === "") {
    return "请输入密码";
  }

  if (password.length < 6) {
    return "密码至少6个字符";
  }

  if (password.length > 50) {
    return "密码不能超过50个字符";
  }

  return "";
};

/**
 * 创建登录参数
 */
const createLoginParams = (data: FormData): LoginParams => ({
  username: data.username.trim(),
  password: data.password,
});

// ============================================================================
// 表单验证
// ============================================================================

/**
 * 验证用户名
 */
const validateUsername = (): boolean => {
  const error = validateUsernameFormat(formData.value.username);
  formErrors.value.username = error;
  return error === "";
};

/**
 * 验证密码
 */
const validatePassword = (): boolean => {
  const error = validatePasswordFormat(formData.value.password);
  formErrors.value.password = error;
  return error === "";
};

/**
 * 验证整个表单
 */
const validateForm = (): boolean => {
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  return isUsernameValid && isPasswordValid;
};

/**
 * 清除用户名错误
 */
const clearUsernameError = (): void => {
  formErrors.value.username = "";
};

/**
 * 清除密码错误
 */
const clearPasswordError = (): void => {
  formErrors.value.password = "";
};

/**
 * 清除所有错误
 */
const clearAllErrors = (): void => {
  formErrors.value.username = "";
  formErrors.value.password = "";
  authStore.resetLoginState();
};

// ============================================================================
// 事件处理
// ============================================================================

/**
 * 处理表单提交
 */
const handleSubmit = async (): Promise<void> => {
  // 清除之前的错误
  clearAllErrors();

  // 表单验证
  // if (!validateForm()) {
  //   return;
  // }

  try {
    // 创建登录参数
    // const loginParams = createLoginParams(formData.value);

    // 使用 store 中的配置和表单数据执行登录
    const success = await authStore.login({
      // ...loginParams,
      password: "Abc123456.",
      phone: "18718543551",
      ...authStore.appConfig,
    });

    if (success) {
      showSuccessToast("登录成功");

      // // 如果选择记住我，保存用户名
      // if (rememberMe.value) {
      //   localStorage.setItem("remembered_username", formData.value.username);
      // } else {
      //   localStorage.removeItem("remembered_username");
      // }

      // 跳转到首页或之前访问的页面
      const redirect = router.currentRoute.value.query.redirect as string;
      await router.replace(redirect || "/");
    }
  } catch (error) {
    console.error("登录失败:", error);
    showFailToast("登录失败，请稍后重试");
  }
};

/**
 * 处理忘记密码
 */
const handleForgotPassword = (): void => {
  showToast("忘记密码功能开发中...");
};

/**
 * 处理注册
 */
const handleRegister = (): void => {
  showToast("注册功能开发中...");
};

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  // 如果已经登录，直接跳转
  if (authStore.isAuthenticated) {
    router.replace("/");
    return;
  }

  // 恢复记住的用户名
  const rememberedUsername = localStorage.getItem("remembered_username");
  if (exists(rememberedUsername)) {
    formData.value.username = rememberedUsername;
    rememberMe.value = true;
  }
});
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  background: @background-gradient;
}

// 背景样式
.login-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;

  .bg-gradient {
    width: 100%;
    height: 100%;
    background: @background-gradient;
  }

  .bg-patterns {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .pattern-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      animation: float 6s ease-in-out infinite;

      &:nth-child(1) {
        width: 200px;
        height: 200px;
        top: 10%;
        right: 10%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        width: 150px;
        height: 150px;
        bottom: 20%;
        left: 15%;
        animation-delay: 2s;
      }

      &:nth-child(3) {
        width: 100px;
        height: 100px;
        top: 60%;
        right: 20%;
        animation-delay: 4s;
      }
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 表单样式
.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.login-form {
  .card-base();
  padding: 40px 30px;
  box-shadow: @shadow-normal;

  &:hover {
    box-shadow: @shadow-hover;
  }

  @media (max-width: @mobile) {
    padding: 30px 20px;
    margin: 10px;
  }
}

// 头部样式
.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    margin-bottom: 20px;

    .logo-text {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, @primary-color, #4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: @text-white;
    margin: 0 0 8px 0;
  }

  .login-subtitle {
    font-size: 14px;
    color: @text-white-70;
    margin: 0;
  }
}

// 表单项样式
.form {
  .form-group {
    margin-bottom: 24px;

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: @text-white-80;
      margin-bottom: 8px;
    }

    .input-wrapper {
      position: relative;
      border-radius: @card-small-radius;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid transparent;
      transition: @transition-normal;
      overflow: hidden;

      &:focus-within {
        border-color: @primary-color;
        box-shadow: 0 0 0 3px @primary-light;
      }

      :deep(.van-cell) {
        background: transparent;
        padding: 12px 16px;

        .van-field__control {
          color: @text-white;
          font-size: 16px;

          &::placeholder {
            color: @text-white-70;
          }
        }
      }

      :deep(.van-field--error) {
        .van-field__control {
          color: #ff6b6b;
        }
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .remember-me {
      :deep(.van-checkbox__label) {
        color: @text-white-80;
        font-size: 14px;
      }

      :deep(.van-checkbox__icon--checked) {
        .van-icon {
          background-color: @primary-color;
          border-color: @primary-color;
        }
      }
    }

    .forgot-password {
      background: none;
      border: none;
      color: @primary-color;
      font-size: 14px;
      cursor: pointer;
      transition: @transition-fast;

      &:hover {
        color: lighten(@primary-color, 10%);
      }
    }
  }

  .login-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    background: linear-gradient(135deg, @primary-color, #4ecdc4);
    border: none;
    box-shadow: @shadow-primary;
    transition: @transition-normal;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px 6px @primary-shadow;
    }

    &:active {
      transform: translateY(0);
    }

    :deep(.van-button__text) {
      color: white;
    }
  }

  .error-message {
    text-align: center;
    color: #ff6b6b;
    font-size: 14px;
    margin-top: 16px;
    padding: 12px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: @card-small-radius;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
}

// 其他登录方式
.other-login {
  margin-top: 32px;

  .divider {
    position: relative;
    text-align: center;
    margin-bottom: 24px;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    .divider-text {
      background: @card-bg;
      padding: 0 16px;
      color: @text-white-70;
      font-size: 12px;
      position: relative;
      z-index: 1;
    }
  }

  .social-login {
    display: flex;
    gap: 12px;

    .social-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: @card-small-radius;
      color: @text-white-80;
      font-size: 14px;
      cursor: pointer;
      transition: @transition-normal;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: @primary-color;
      }

      .social-icon {
        font-size: 16px;
      }
    }
  }
}

// 注册链接
.register-link {
  text-align: center;
  margin-top: 24px;
  color: @text-white-70;
  font-size: 14px;

  .register-button {
    background: none;
    border: none;
    color: @primary-color;
    cursor: pointer;
    margin-left: 4px;
    transition: @transition-fast;

    &:hover {
      color: lighten(@primary-color, 10%);
    }
  }
}
</style>
