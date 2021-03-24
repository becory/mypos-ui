import axios from 'axios'

const serverBackend = axios.create({
  baseURL: process.env.VUE_APP_API
})

export const getCustomerList = (params) => serverBackend.get('/Customer/' + params)
export const getCustomerForm = () => serverBackend.get('/Customer/Form/')
export const postCustomer = (data) => serverBackend.post('/Customer/', data)
export const putCustomer = (id, data) => serverBackend.put('/Customer/' + id + '/', data)
export const deleteCustomer = (id) => serverBackend.delete('/Customer/' + id + '/')
