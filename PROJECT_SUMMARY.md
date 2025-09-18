# MobieTV ��Ŀ����

## ��Ŀ��λ
- �����ƶ��˵Ľ�������Ƶ�ۺ�Ӧ�ã��ṩ��ҳ�Ƽ���ר��γ̡�ѧ��ר������Ƶ�Ķ�������Ƶ����
- Ŀ���û����ȵ�¼����������γ��б�������Ƶ�������γ�/��ʦ���ڲ�ͬѧ�μ��л���

## ����ջ
- ǰ�˿�ܣ�Vue 3 + `<script setup>` ���ļ������
- ״̬����Pinia�������� `src/stores`����
- ·�ɣ�Vue Router 4���������ö�̬����ҳ�棨`src/router/routes.ts:1`����
- UI & ��ʽ��Vant ����⡢Tailwind CSS ԭ�ӻ���ʽ��Less �Զ�����ʽ��
- �������ߣ�Vite 5����� `@vitejs/plugin-vue`��`@vitejs/plugin-legacy` ���ݾ��������
- ����㣺Axios + �Զ�����������`src/http/index.ts:1`����֧�� RSA ���ܡ�Token ע�롢ͳһ������
- ý�岥�ţ�`hls.js` + ���� `m3u8` ���������`src/components/m3u8/vue3-m3u8-player.vue:1`����
- ����������`jsencrypt`�����ܣ���`pinia`��`tailwindcss` �ȡ�

## ������ű�
- ����������`.env.development` ָ�򱾵ش���`.env.production` ָ����ʽ API ������
- ���ýű���`pnpm dev`��`pnpm build`��`pnpm preview`��`pnpm lint`��`pnpm build:check`��
- `clear-cache.js` �� `src/utils/clearCache.ts` ���ڿ���ʱ�����棬�������Դ���š�

## Ŀ¼�ṹҪ��
- `src/main.ts:1`��Ӧ����ڣ����� Pinia/Vue Router/Vant �����������֤��ʼ�����ٹ���Ӧ�á�
- `src/router/index.ts:1`������ `routeConfigs` ����·�ɱ�����ҳ����⡢��Ȩ�������¼�ض���
- `src/stores`��
  - `auth.ts:1` �����¼̬�����ơ��û���Ϣ��Ӧ�����á�
  - `learning.ts:1` ���� Tab �б�ҳ�����顢�γ�/��ʦ���������ſγ̡���ǩ������״̬��
  - `education.ts` �ṩ��ѧ��Դ����߼�������Զ���ҳ�����ʽ������
- `src/http/api.ts:1`�����ж��� API Endpoint��URL �����߼���ҵ�񷽷���
- `src/views`����ҵ�񻮷�ҳ�棬���� `Home.vue`��`Learning.vue`��`SubjectCourse.vue:1`��`TeacherCourseList.vue` �ȡ�
- `src/components`��������������������ء������������ģ��ȣ���ר���������ר��γ��б�������壩��
- `src/composable`�����ʽ������װ�����߼������� `useHttp.ts`��ͼ��������/ռλ����`useImageLoader.ts:1`��`useLazyImage.ts`�����γ� Tab ����ȡ�
- `src/utils`������ʽ���ߣ�`functional.ts`����Cookie ����Mock API��������ع��ߡ�
- `src/types`��HTTP ��Ӧ��·�ɶ����Լ�������������������

## ����ҵ��ģ��

### �û���֤
- `src/stores/auth.ts:1` ʹ�� Pinia ά����¼״̬��֧�ֱ��ش洢�û���Ϣ��Cookie �洢����/ˢ�����ơ�
- ��¼����ͨ�� `apiService.login` ���� `/api/user/api/register`���ɹ���д��״̬�뱾�ػ��档
- ��Ӧ�������� 401 ʱ�Զ�������Ʋ��ض����½ҳ��

### ѧϰ��γ���Դ
- `learning` store �ṩ Tab �б�ҳ�����顢���ſγ̡��γ�/��ʦ�������꼶/ѧ��/�������ǩ������
- `apiService` ��ѧϰ��ؽӿ� (`getPageTabList`��`getSubjectCourseList` ��) �����ⲿ API��
- ���ʽ���� `useAutoPageEducation.ts` �� `useTabItems.ts` �� store ״̬��ҳ������߼����

### ר��γ�ҳ
- `src/views/SubjectCourse.vue:1`������·�ɲ�������ר��γ̣���ද̬ɸѡ Tab���Ҳ�γ����񡢿�״̬�����״̬չʾ��
- ���� `useImageLoader` ����������ռλ��������ˣ������¼״̬���û���Ϣ������
- ֧�ֵ���γ���ת�����¼��ء���̬���������� `subjectObj` ���ý���/����ͼ����

### ��Ƶ����
- `src/components/m3u8/vue3-m3u8-player.vue:1`������ `hls.js` ��װ HLS ��������֧���Զ�����������¼�������
- `VideoDetail.vue` ��ҳ��ɸ��ø����������ý����Դ��

### ���������ݹ���
- `src/views/Search.vue` ��� `learning` store ��ɿγ̡���ʦ��������¼������ʷ��`apiService.addCourseSearchRecord`����
- `utils/search` �ڷ�װ��ʷ��¼�����ȴʴ�����߼���

## ״̬��������
1. ��ڳ�ʼ����`src/main.ts:1` ����Ӧ�á�������֤״̬������·�ɹ���ʱ����
2. ·��������`src/router/index.ts:1` �� `beforeEach` �м��·��Ԫ��Ϣ `requiresAuth`��δ��¼ʱ��ת��¼ҳ�������ض��������
3. ������ã������ store ���� `apiService` ���� �� `src/http/index.ts:1` �������� �� ������ͳһע�� Token������״̬�롣
4. ״̬ͬ����Pinia store ������Ӧʽ״̬��ҳ�������ʽ����ͨ�� `computed`/`watch` ���ģ����� UI ���¡�
5. ������ԣ�Token ʹ�� Cookie (`utils/cookies.ts`)���û���Ϣ�� `localStorage`�������������� `clearCache` ����

## UI ������
- Vant ����� Tailwind ��ʽ���ʹ�ã���� Less д�ֲ���ʽ���� `SubjectCourse.vue:200+` �еĲ����뽥�䱳������
- ���������`components/layout/NavBar.vue:1`��`TabBar.vue:1`��ͳһ�������飻`BottomDrawer.vue` �ṩ�ƶ��˳��뽻����
- Loading����״̬������̬��������� `components/loading`��`components/common`������һ�µ��û�������

## �����벿��
- Vite ������������� `dist/`��֧�� `pnpm preview` ����Ԥ����
- `@vitejs/plugin-legacy` ���Ͼ���������ݣ�`vite.config.ts` ����·������ `@` ָ�� `src`��
- `.env.production` �е� `VITE_API_BASE_URL` �������� API����ȷ�����˴���һ�¡�
- `postcss.config.js`��`tailwind.config.js` ������ʽ������֧�ְ��� Purge��

## �ɸĽ����򣨹۲쵽��Ǳ�ڵ㣩
- ����ӿڴ�����ʾ�� UI ������������ڿ���̨�����
- ���ǲ�ִ��� store���� `learning.ts`��Ϊ��С��ģ�飬���͸��Ӷȡ�
- �����Զ������ԣ�������Ի�˵��ˣ��Ը�����Ҫ���̡�
- ���ӽӿ�·��ƴд���� `courseSearchAdd` ȱ��ǰб�ܣ��� Mock/��ʵ�ӿ�ӳ���һ���ԡ�
