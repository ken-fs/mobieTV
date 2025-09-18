import type { RouteConfig } from "@/types/router";

export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "首页",
      icon: "home",
      showInNav: true,
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
    meta: {
      title: "登录",
      icon: "login",
      requiresAuth: false,
    },
  },
  {
    path: "/learning",
    name: "learning",
    component: () => import("@/views/Learning.vue"),
    meta: {
      title: "学习",
      icon: "video",
      showInNav: true,
    },
    children: [
      {
        path: "preschool",
        name: "preschool",
        component: () => import("@/views/Preschool.vue"),
        meta: {
          title: "学龄前",
          icon: "video",
        },
      },
      {
        path: "primary",
        name: "primary",
        component: () => import("@/views/Primary.vue"),
        meta: {
          title: "小学",
          icon: "tv",
        },
      },
      {
        path: "middle",
        name: "middle",
        component: () => import("@/views/Middle.vue"),
        meta: {
          title: "初中",
          icon: "tv",
        },
      },
      {
        path: "high",
        name: "high",
        component: () => import("@/views/High.vue"),
        meta: {
          title: "高中",
          icon: "tv",
        },
      },
    ],
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/Search.vue"),
    meta: {
      title: "搜索",
      icon: "search",
      showInNav: true,
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/Profile.vue"),
    meta: {
      title: "我的",
      icon: "user",
      showInNav: true,
    },
  },
  {
    path: "/teacher-course-list/:id?",
    name: "teacherCourseList",
    component: () => import("@/views/TeacherCourseList.vue"),
    meta: {
      title: "同步名师课堂",
      icon: "teacher",
    },
  },
  {
    path: "/course-display/:id?",
    name: "CourseDisplay",
    component: () => import("@/views/CourseDisplay.vue"),
    meta: {
      title: "微课堂",
      icon: "class",
    },
  },
  {
    path: "/other-page/:id?",
    name: "OtherPage",
    component: () => import("@/views/OtherPage.vue"),
    meta: {
      title: "其他页面",
      icon: "other",
    },
  },
  {
    path: "/audio-reading/:id?",
    name: "audioReading",
    component: () => import("@/views/AudioReading.vue"),
    meta: {
      title: "有声阅读",
      icon: "audio",
    },
  },
  {
    path: "/video-detail/:id",
    name: "videoDetail",
    component: () => import("@/views/VideoDetail.vue"),
    meta: {
      title: "视频详情",
      icon: "video",
    },
  },
  {
    path: "/subject-course/:id?",
    name: "subjectCourse",
    component: () => import("@/views/SubjectCourse.vue"),
    meta: {
      title: "专题课程列表",
      icon: "apps",
    },
  },
  {
    path: "/network-error",
    name: "networkError",
    component: () => import("@/components/common/NetworkError.vue"),
    meta: {
      title: "网络错误",
      icon: "error",
    },
  },
];

export const navigationItems = routeConfigs
  .filter((route) => route.meta?.showInNav)
  .map((route) => ({
    name: route.name,
    path: route.path,
    title: route.meta?.title || route.name,
    icon: route.meta?.icon || "default",
  }));
