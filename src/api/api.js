import axios from 'axios'
import { Message } from 'element-ui'

// this base url will be change based on
// if you need to point to production.
export const BASE_URL = process.env.VUE_APP_API
export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'

export const tokenRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json'
  }
})

export const loginUser = (loginBody) => {
  return tokenRequest.post('/token/obtain/', loginBody)
    .then((response) => {
      return Promise.resolve(response.data)
    }).catch((error) => {
      Message({ message: '帳號密碼錯誤', type: 'warning' })
      return Promise.reject(error)
    })
}

export const refreshToken = () => {
  const refreshBody = { refresh: localStorage.getItem(REFRESH_TOKEN) }
  return tokenRequest.post('/token/refresh/', refreshBody)
    .then((response) => {
      localStorage.setItem(ACCESS_TOKEN, response.data.access)
      return Promise.resolve(response.data)
    }).catch((error) => Promise.reject(error))
}

export const verifyToken = () => {
  const refreshBody = { token: localStorage.getItem(ACCESS_TOKEN) }
  return tokenRequest.post('/token/verify/', refreshBody)
    .then((response) => {
      return Promise.resolve(response.data)
    }).catch((error) => Promise.reject(error))
}

const isCorrectRefreshError = (status) => status === 401

/*
 * authRequest
 *
 * This refreshes the request and retries the token if it is invalid.
 * This is what you use to create any requests that need the Tokens.
 * Reference: https://hackernoon.com/110percent-complete-jwt-authentication-with-django-and-react-2020-iejq34ta
 *
 * Example:
 *     authRequest.get('/path/to/endpoint/',extraParameters)
 *        .then(response=>{
 *          // do something with successful request
 *        }).catch((error)=> {
 *          // handle any errors.
 *        });
*/
export const authRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
    'Content-Type': 'application/json'
  }
})

const logoutUser = () => {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(REFRESH_TOKEN)
  authRequest.defaults.headers.Authorization = ''
}

const errorInterceptor = (error) => {
  const originalRequest = error.config
  const { status } = error.response
  if (isCorrectRefreshError(status)) {
    return refreshToken().then(() => {
      const headerAuthorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
      authRequest.defaults.headers.Authorization = headerAuthorization
      originalRequest.headers.Authorization = headerAuthorization
      return authRequest(originalRequest)
    }).catch((tokenRefreshError) => {
      // if token refresh fails, logout the user to avoid potential security risks.
      logoutUser()
      return Promise.reject(tokenRefreshError)
    })
  }
  return Promise.reject(error)
}

authRequest.interceptors.response.use(
  (response) => response, // this is for all successful requests.
  (error) => errorInterceptor(error) // handle the request
)

// export const tokenRequest = axios.create({
//   baseURL: process.env.VUE_APP_API
// })
export const getCustomerList = (params) => authRequest.get('/Customer/' + params)
export const getCustomerForm = () => authRequest.get('/Customer/Form/')
export const postCustomer = (data) => authRequest.post('/Customer/', data)
export const putCustomer = (id, data) => authRequest.put('/Customer/' + id + '/', data)
export const deleteCustomer = (id) => authRequest.delete('/Customer/' + id + '/')

export const getMenuList = (params) => authRequest.get('/Menu/Menu/' + params)
export const getMenuForm = () => authRequest.get('/Menu/Menu/Form/')
export const postMenu = (data) => authRequest.post('/Menu/Menu/', data)
export const putMenu = (id, data) => authRequest.put('/Menu/Menu/' + id + '/', data)
export const deleteMenu = (id) => authRequest.delete('/Menu/Menu/' + id + '/')

export const getMenuItemList = (params) => authRequest.get('/Menu/MenuItem/' + params)
export const getMenuItemForm = () => authRequest.get('/Menu/MenuItem/Form/')
export const postMenuItem = (data) => authRequest.post('/Menu/MenuItem/', data)
export const putMenuItem = (id, data) => authRequest.put('/Menu/MenuItem/' + id + '/', data)
export const deleteMenuItem = (id) => authRequest.delete('/Menu/MenuItem/' + id + '/')

export const getMenuStatusList = (params) => authRequest.get('/Menu/Status/' + params)
export const getMenuStatusForm = () => authRequest.get('/Menu/Status/Form/')
export const postMenuStatus = (data) => authRequest.post('/Menu/Status/', data)
export const putMenuStatus = (id, data) => authRequest.put('/Menu/Status/' + id + '/', data)
export const deleteMenuStatus = (id) => authRequest.delete('/Menu/Status/' + id + '/')

export const getWeekList = (params) => authRequest.get('/Menu/Week/' + params)

export const getLabelList = (params) => authRequest.get('/Stock/Label/' + params)
export const getLabelForm = () => authRequest.get('/Stock/Label/Form/')
export const postLabel = (data) => authRequest.post('/Stock/Label/', data)
export const putLabel = (id, data) => authRequest.put('/Stock/Label/' + id + '/', data)
export const deleteLabel = (id) => authRequest.delete('/Stock/Label/' + id + '/')

export const getUnitList = (params) => authRequest.get('/Stock/Unit/' + params)
export const getUnitForm = () => authRequest.get('/Stock/Unit/Form/')
export const postUnit = (data) => authRequest.post('/Stock/Unit/', data)
export const putUnit = (id, data) => authRequest.put('/Stock/Unit/' + id + '/', data)
export const deleteUnit = (id) => authRequest.delete('/Stock/Unit/' + id + '/')

export const getMaterialList = (params) => authRequest.get('/Stock/Material/' + params)
export const getMaterialForm = () => authRequest.get('/Stock/Material/Form/')
export const postMaterial = (data) => authRequest.post('/Stock/Material/', data)
export const putMaterial = (id, data) => authRequest.put('/Stock/Material/' + id + '/', data)
export const deleteMaterial = (id) => authRequest.delete('/Stock/Material/' + id + '/')

export const getStockList = (params) => authRequest.get('/Stock/Stock/' + params)
export const getStockForm = () => authRequest.get('/Stock/Stock/Form/')
export const postStock = (data) => authRequest.post('/Stock/Stock/', data)
export const putStock = (id, data) => authRequest.put('/Stock/Stock/' + id + '/', data)
export const deleteStock = (id) => authRequest.delete('/Stock/Stock/' + id + '/')

export const getOrderList = (params) => authRequest.get('/Order/Order/' + params)
export const getOrderDashboardList = (params) => authRequest.get('/Order/Order/Dashboard/' + params)
export const getOrder = (id) => authRequest.get('/Order/Order/' + id + '/')
export const getOrderEdit = (id) => authRequest.get('/Order/Order/' + id + '/Edit/')
export const getOrderForm = () => authRequest.get('/Order/Order/Form/')
export const postOrder = (data) => authRequest.post('/Order/Order/', data)
export const putOrder = (id, data) => authRequest.put('/Order/Order/' + id + '/', data)
export const patchOrder = (id, data) => authRequest.patch('/Order/Order/' + id + '/', data)
export const deleteOrder = (id) => authRequest.delete('/Order/Order/' + id + '/')

export const getOrderStatusList = (params) => authRequest.get('/Order/Status/' + params)
export const getOrderStatusForm = () => authRequest.get('/Order/Status/Form/')
export const postOrderStatus = (data) => authRequest.post('/Order/Status/', data)
export const putOrderStatus = (id, data) => authRequest.put('/Order/Status/' + id + '/', data)
export const deleteOrderStatus = (id) => authRequest.delete('/Order/Status/' + id + '/')

export const getOrderDetailList = (params) => authRequest.get('/Order/OrderDetail/' + params)
export const getOrderDetailForm = () => authRequest.get('/Order/OrderDetail/Form/')
export const postOrderDetail = (data) => authRequest.post('/Order/OrderDetail/', data)
export const putOrderDetail = (id, data) => authRequest.put('/Order/OrderDetail/' + id + '/', data)
// export const deleteOrderDetail = (id) => authRequest.delete('/Order/OrderDetail/' + id + '/')

export const getCookList = (params) => authRequest.get('/Order/Cook/' + params)
export const getCookForm = () => authRequest.get('/Order/Cook/Form/')
export const postCook = (data) => authRequest.post('/Order/Cook/', data)
export const putCook = (id, data) => authRequest.put('/Order/Cook/' + id + '/', data)
export const deleteCook = (id) => authRequest.delete('/Order/Cook/' + id + '/')

export const getAnalysis = (aggregation, app, name, value, params) => authRequest.get('/Analysis/?aggregation=' + aggregation + '&app=' + app + '&name=' + name + '&value=' + value + params)
export const getAnalysisApp = () => authRequest.get('/Analysis/App/')
export const getAnalysisColumns = (app) => authRequest.get('/Analysis/Columns/?app=' + app)
export const getAnalysisValue = (app) => authRequest.get('/Analysis/Value/?app=' + app)
export const getAnalysisSetting = () => authRequest.get('/Analysis/Setting/')
export const putAnalysisSetting = (data) => authRequest.put('/Analysis/Setting/', data)
