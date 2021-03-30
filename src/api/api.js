import axios from 'axios'

export const serverBackend = axios.create({
  baseURL: process.env.VUE_APP_API
})

export const getCustomerList = (params) => serverBackend.get('/Customer/' + params)
export const getCustomerForm = () => serverBackend.get('/Customer/Form/')
export const postCustomer = (data) => serverBackend.post('/Customer/', data)
export const putCustomer = (id, data) => serverBackend.put('/Customer/' + id + '/', data)
export const deleteCustomer = (id) => serverBackend.delete('/Customer/' + id + '/')

export const getMenuList = (params) => serverBackend.get('/Menu/Menu/' + params)
export const getMenuForm = () => serverBackend.get('/Menu/Menu/Form/')
export const postMenu = (data) => serverBackend.post('/Menu/Menu/', data)
export const putMenu = (id, data) => serverBackend.put('/Menu/Menu/' + id + '/', data)
export const deleteMenu = (id) => serverBackend.delete('/Menu/Menu/' + id + '/')

export const getMenuItemList = (params) => serverBackend.get('/Menu/MenuItem/' + params)
export const getMenuItemForm = () => serverBackend.get('/Menu/MenuItem/Form/')
export const postMenuItem = (data) => serverBackend.post('/Menu/MenuItem/', data)
export const putMenuItem = (id, data) => serverBackend.put('/Menu/MenuItem/' + id + '/', data)
export const deleteMenuItem = (id) => serverBackend.delete('/Menu/MenuItem/' + id + '/')

export const getMenuStatusList = (params) => serverBackend.get('/Menu/Status/' + params)
export const getMenuStatusForm = () => serverBackend.get('/Menu/Status/Form/')
export const postMenuStatus = (data) => serverBackend.post('/Menu/Status/', data)
export const putMenuStatus = (id, data) => serverBackend.put('/Menu/Status/' + id + '/', data)
export const deleteMenuStatus = (id) => serverBackend.delete('/Menu/Status/' + id + '/')

export const getWeekList = (params) => serverBackend.get('/Menu/Week/' + params)

export const getLabelList = (params) => serverBackend.get('/Stock/Label/' + params)
export const getLabelForm = () => serverBackend.get('/Stock/Label/Form/')
export const postLabel = (data) => serverBackend.post('/Stock/Label/', data)
export const putLabel = (id, data) => serverBackend.put('/Stock/Label/' + id + '/', data)
export const deleteLabel = (id) => serverBackend.delete('/Stock/Label/' + id + '/')

export const getUnitList = (params) => serverBackend.get('/Stock/Unit/' + params)
export const getUnitForm = () => serverBackend.get('/Stock/Unit/Form/')
export const postUnit = (data) => serverBackend.post('/Stock/Unit/', data)
export const putUnit = (id, data) => serverBackend.put('/Stock/Unit/' + id + '/', data)
export const deleteUnit = (id) => serverBackend.delete('/Stock/Unit/' + id + '/')

export const getMaterialList = (params) => serverBackend.get('/Stock/Material/' + params)
export const getMaterialForm = () => serverBackend.get('/Stock/Material/Form/')
export const postMaterial = (data) => serverBackend.post('/Stock/Material/', data)
export const putMaterial = (id, data) => serverBackend.put('/Stock/Material/' + id + '/', data)
export const deleteMaterial = (id) => serverBackend.delete('/Stock/Material/' + id + '/')

export const getStockList = (params) => serverBackend.get('/Stock/Stock/' + params)
export const getStockForm = () => serverBackend.get('/Stock/Stock/Form/')
export const postStock = (data) => serverBackend.post('/Stock/Stock/', data)
export const putStock = (id, data) => serverBackend.put('/Stock/Stock/' + id + '/', data)
export const deleteStock = (id) => serverBackend.delete('/Stock/Stock/' + id + '/')
