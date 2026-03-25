import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Login
      'login.title': 'CCE Demo Platform',
      'login.subtitle': 'Cloud Container Engine Management System',
      'login.welcome': 'Welcome Back',
      'login.signIn': 'Sign in to access your dashboard',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.signInBtn': 'Sign In',
      'login.signingIn': 'Signing in...',
      'login.error': 'Invalid username or password',
      'login.demo': 'Demo credentials: admin / admin123',
      
      // Navigation
      'nav.logout': 'Logout',
      'nav.welcome': 'Welcome',
      
      // User Management
      'user.title': 'User Management',
      'user.addNew': 'Add New User',
      'user.edit': 'Edit User',
      'user.name': 'Name',
      'user.email': 'Email',
      'user.phone': 'Phone',
      'user.actions': 'Actions',
      'user.editBtn': 'Edit',
      'user.deleteBtn': 'Delete',
      'user.noUsers': 'No users found',
      'user.created': 'User created successfully!',
      'user.updated': 'User updated successfully!',
      'user.deleted': 'User deleted successfully!',
      'user.failed': 'Operation failed',
      'user.confirmDelete': 'Are you sure you want to delete this user?',
      'user.cancel': 'Cancel',
      'user.fetchFailed': 'Failed to fetch users',
      'user.deleteFailed': 'Delete failed',
      
      // File Management
      'file.title': 'File Management',
      'file.upload': 'Upload File',
      'file.list': 'File List',
      'file.refresh': 'Refresh',
      'file.selectFile': 'Click to select file or drag here',
      'file.uploadBtn': 'Upload',
      'file.uploading': 'Uploading...',
      'file.filename': 'Filename',
      'file.size': 'Size',
      'file.uploadTime': 'Upload Time',
      'file.download': 'Download',
      'file.delete': 'Delete',
      'file.noFiles': 'No files uploaded',
      'file.uploadSuccess': 'File uploaded successfully',
      'file.uploadFailed': 'Upload failed',
      'file.deleteSuccess': 'File deleted successfully',
      'file.deleteFailed': 'Delete failed',
      'file.confirmDelete': 'Are you sure you want to delete',
      'file.fetchFailed': 'Failed to fetch files',
      'file.selectFirst': 'Please select a file first',
      'file.downloadFailed': 'Download failed',
      
      // Mount Info
      'mount.title': 'Storage Mount Info',
      'mount.type': 'Mount Type',
      'mount.path': 'Storage Path',
      'mount.absolutePath': 'Absolute Path',
      'mount.local': 'Local',
      'mount.obs': 'OBS',
      
      // Common
      'common.loading': 'Loading...',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.info': 'Info',
    }
  },
  zh: {
    translation: {
      // Login
      'login.title': 'CCE 演示平台',
      'login.subtitle': '云容器引擎管理系统',
      'login.welcome': '欢迎回来',
      'login.signIn': '登录以访问仪表板',
      'login.username': '用户名',
      'login.password': '密码',
      'login.signInBtn': '登录',
      'login.signingIn': '登录中...',
      'login.error': '用户名或密码错误',
      'login.demo': '演示账号: admin / admin123',
      
      // Navigation
      'nav.logout': '退出登录',
      'nav.welcome': '欢迎',
      
      // User Management
      'user.title': '用户管理',
      'user.addNew': '添加用户',
      'user.edit': '编辑用户',
      'user.name': '姓名',
      'user.email': '邮箱',
      'user.phone': '电话',
      'user.actions': '操作',
      'user.editBtn': '编辑',
      'user.deleteBtn': '删除',
      'user.noUsers': '暂无用户',
      'user.created': '用户创建成功！',
      'user.updated': '用户更新成功！',
      'user.deleted': '用户删除成功！',
      'user.failed': '操作失败',
      'user.confirmDelete': '确定要删除此用户吗？',
      'user.cancel': '取消',
      'user.fetchFailed': '获取用户失败',
      'user.deleteFailed': '删除失败',
      
      // File Management
      'file.title': '文件管理',
      'file.upload': '上传文件',
      'file.list': '文件列表',
      'file.refresh': '刷新',
      'file.selectFile': '点击选择文件或拖拽到此处',
      'file.uploadBtn': '上传',
      'file.uploading': '上传中...',
      'file.filename': '文件名',
      'file.size': '大小',
      'file.uploadTime': '上传时间',
      'file.download': '下载',
      'file.delete': '删除',
      'file.noFiles': '暂无上传文件',
      'file.uploadSuccess': '文件上传成功',
      'file.uploadFailed': '上传失败',
      'file.deleteSuccess': '文件删除成功',
      'file.deleteFailed': '删除失败',
      'file.confirmDelete': '确定要删除',
      'file.fetchFailed': '获取文件失败',
      'file.selectFirst': '请先选择文件',
      'file.downloadFailed': '下载失败',
      
      // Mount Info
      'mount.title': '存储挂载信息',
      'mount.type': '挂载类型',
      'mount.path': '存储路径',
      'mount.absolutePath': '绝对路径',
      'mount.local': '本地',
      'mount.obs': 'OBS对象存储',
      
      // Common
      'common.loading': '加载中...',
      'common.success': '成功',
      'common.error': '错误',
      'common.warning': '警告',
      'common.info': '信息',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'zh', // default language
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
