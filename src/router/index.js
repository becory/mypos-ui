import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/Dashboard',
    children: [
      {
        path: 'Dashboard',
        component: () => import('@/views/Dashboard/index'),
        name: 'Dashboard',
        meta: { title: '?????????', icon: 'fas el-icon-fa-tachometer-alt', affix: true, noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/Order',
    component: Layout,
    meta: { title: '??????', icon: 'fas el-icon-fa-shopping-cart' },
    children: [
      {
        path: '',
        component: () => import('@/views/Order/index'),
        name: 'Order',
        meta: { title: '??????', affix: true, noCache: true }
      },
      {
        path: ':id',
        component: () => import('@/views/Order/index'),
        name: 'EditOrder',
        meta: { title: '??????????????????' },
        hidden: true
      }
    ]
  },
  {
    path: '/HistoryOrder',
    component: Layout,
    meta: { title: '????????????', icon: 'fas el-icon-fa-history' },
    children: [
      {
        path: '',
        component: () => import('@/views/HistoryOrder/index'),
        name: 'OrderList',
        meta: { title: '??????????????????' }
      },
      {
        path: 'Status',
        component: () => import('@/views/HistoryOrder/Status'),
        name: 'OrderStatus',
        meta: { title: '????????????????????????' }
      },
      {
        path: 'Cook',
        component: () => import('@/views/HistoryOrder/Cook'),
        name: 'Cook',
        meta: { title: '??????????????????' }
      }
    ]
  },
  {
    path: '/Customer',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/Customer/index'),
        name: 'Customer',
        meta: { title: '??????', icon: 'fas el-icon-fa-users' }
      }
    ]
  },
  {
    path: '/Menu',
    component: Layout,
    meta: { title: '??????', icon: 'fas el-icon-fa-utensils' },
    children: [
      {
        path: '',
        component: () => import('@/views/Menu/index'),
        name: 'Menu',
        meta: { title: '??????' }
      },
      {
        path: 'Status',
        component: () => import('@/views/Menu/Status'),
        name: 'MenuStatus',
        meta: { title: '????????????' }
      }
    ]
  },
  {
    path: '/Stock',
    component: Layout,
    meta: { title: '??????', icon: 'fas el-icon-fa-boxes' },
    children: [
      {
        path: '',
        component: () => import('@/views/Stock/index'),
        name: 'Stock',
        meta: { title: '??????' }
      },
      {
        path: 'Unit',
        component: () => import('@/views/Stock/Unit'),
        name: 'Unit',
        meta: { title: '????????????' }
      }
    ]
  },
  {
    path: '/Report',
    component: Layout,
    meta: { title: '??????', icon: 'fas el-icon-fa-chart-line' },
    children: [
      {
        path: '',
        component: () => import('@/views/Analysis/index'),
        name: 'Stock',
        meta: { title: '??????' }
      }
    ]
  },
  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    hidden: true,
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
