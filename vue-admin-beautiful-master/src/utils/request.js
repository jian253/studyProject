import Vue from 'vue'
import axios from 'axios'
import {
  baseURL,
  contentType,
  debounce,
  invalidCode,
  noPermissionCode,
  requestTimeout,
  successCode,
  tokenName,
  loginInterception,
} from '@/config'
import store from '@/store'
import qs from 'qs'
import router from '@/router'
import { isArray } from '@/utils/validate'

let loadingInstance
/*-------------axios用法详解-----------------*/
/*
//get请求
axios.get('/user?ID=12345')
  .then(
    function (response) {
      console.log(response); }
   )
   .catch(function (error) {
     console.log(error);
   });
//post请求
axios.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
}).then(function (response) {
  console.log(response);
}) .catch(function (error) {
  console.log(error);
});
// delete请求
axios.delete('/delete', {
  params: {	// 请求参数拼接在url上
    id: 12
  }
}).then(res => {
  console.log(res)
})

axios.delete('/delete', {
  data: {	// 请求参数放在请求体
    id: 12
  }
}).then(res => {
  console.log(res)
})

axios({
  method: 'delete',
  url: '/delete',
  params: {}, // 请求参数拼接在url上
  data: {}  // 请求参数放在请求体
}).then(res => {
  console.log(res)
});
//axios headers配置
axios.defaults.headers = {
  'Content-type': 'application/x-www-form-urlencoded'||'multipart/form-data'||'application/json'//json对象传参||上传文件||json字符串
}
//axios config配置
axios.config={
    url:'',// 是用于请求的服务器 URL
    method:'',//是创建请求时使用的方法,默认是 get
    baseURL:'',//便于为 axios 实例的方法传递相对 URL
    transformRequest:[function(data,headers){//只能用在 'PUT', 'POST' 和 'PATCH'
    // 对 data 进行任意转换处理
    return  data;
  }],
    transformResponse:[function(data){
    // 在传递给 then/catch 前，允许修改响应数据
    return data;
  }],
    headers: {// `headers` 是即将被发送的自定义请求头
      'X-Requested-With': 'XMLHttpRequest'
    },
    params: {//是即将与请求一起发送的 URL 参数  必须是一个无格式对象(plain object)或 URLSearchParams 对象
      ID: 12345
    },
    paramsSerializer: function (params) {//将params序列化的函数，常用于表单数据
      return Qs.stringify(params, {arrayFormat: 'brackets'})
    },
    data: {// `data` 是作为请求主体被发送的数据  只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
      firstName: 'Fred'
    },
    timeout: 1000,//指定请求超时的毫秒数(0 表示无超时时间)
    withCredentials: false, // 默认的   表示跨域请求时是否需要使用凭证
    auth: {
      // `auth` 表示应该使用 HTTP 基础验证，并提供凭据
      // 这将设置一个 `Authorization` 头，覆写掉现有的任意使用 `headers` 设置的自定义 `Authorization`头
      //请注意，只能通过此参数配置HTTP Basic身份验证。
      //对于Bearer令牌等，请改用`Authorization`自定义标头。
      username: 'janedoe',
      password: 's00pers3cret'
    },
    responseEncoding: 'utf8', // 默认的 responseType表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    xsrfCookieName: 'XSRF-TOKEN', // default  xsrfCookieName是cookie的名称，用作xsrf令牌的值
    xsrfHeaderName: 'X-XSRF-TOKEN', // 默认的   承载 xsrf token 的值的 HTTP 头的名称
    onUploadProgress: function (progressEvent) {
       // 对原生进度事件的处理
    },
    onDownloadProgress: function (progressEvent) {
      // 对原生载处理进度事件的处理
    },
    maxContentLength: 2000,//定义允许的响应内容的最大尺寸
      validateStatus: function (status) {//定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise
      //`validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 rejecte
      return status >= 200 && status < 300; // 默认的
    },
    maxRedirects: 5, //定义在 node.js 中 follow 的最大重定向数目 如果设置为0，将不会 follow 任何重定向
    httpAgent: new http.Agent({ keepAlive: true }),//http 自定义代理
    httpsAgent: new https.Agent({ keepAlive: true }),//https 自定义代理
    proxy: {//定义代理服务器的主机名称和端口
    // `auth` 表示 HTTP 基础验证应当用于连接代理，并提供凭据
    // 这将会设置一个 `Proxy-Authorization` 头，覆写掉已有的通过使用 `header` 设置的自定义 `Proxy-Authorization` 头。
    host: '127.0.0.1',
      port: 9000,
      auth: {
        username: 'mikeymike',
        password: 'rapunz3l'
    }
  }
}
全局的 axios 默认值
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

自定义实例默认值
// 创建实例时设置配置的默认值
var instance = axios.create({
  baseURL: 'https://api.example.com'
});

// 在实例已创建后修改默认值
axios.defaults.baseURL = 'https://api.example.com';
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

配置的优先顺序
var instance = axios.create();
instance.defaults.timeout = 2500;
instance.get('/longRequest', {
  timeout: 5000
});
*/

/**
 * @author chuzhixin 1204505056@qq.com （不想保留author可删除）
 * @description 处理code异常
 * @param {*} code
 * @param {*} msg
 */
const handleCode = (code, msg) => {
  switch (code) {
    case invalidCode:
      Vue.prototype.$baseMessage(msg || `后端接口${code}异常`, 'error')
      store.dispatch('user/resetAccessToken').catch(() => {})
      if (loginInterception) {
        location.reload()
      }
      break
    case noPermissionCode:
      router.push({ path: '/401' }).catch(() => {})
      break
    default:
      Vue.prototype.$baseMessage(msg || `后端接口${code}异常`, 'error')
      break
  }
}

const instance = axios.create({
  baseURL,
  timeout: requestTimeout,
  headers: {
    'Content-Type': contentType,
  },
})
//请求拦截器
instance.interceptors.request.use(
  (config) => {
    if (store.getters['user/accessToken']) {
      config.headers[tokenName] = store.getters['user/accessToken']
    }
    //这里会过滤所有为空、0、false的key，如果不需要请自行注释
    if (config.data)
      config.data = Vue.prototype.$baseLodash.pickBy(
        config.data,
        Vue.prototype.$baseLodash.identity
      )
    if (
      config.data &&
      config.headers['Content-Type'] ===
        'application/x-www-form-urlencoded;charset=UTF-8'
    )
      config.data = qs.stringify(config.data)
    if (debounce.some((item) => config.url.includes(item)))
      loadingInstance = Vue.prototype.$baseLoading()
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
//响应拦截器
instance.interceptors.response.use(
  (response) => {
    if (loadingInstance) loadingInstance.close()

    const { data, config } = response
    const { code, msg } = data
    // 操作正常Code数组
    const codeVerificationArray = isArray(successCode)
      ? [...successCode]
      : [...[successCode]]
    // 是否操作正常
    if (codeVerificationArray.includes(code)) {
      return data
    } else {
      handleCode(code, msg)
      return Promise.reject(
        'vue-admin-beautiful请求异常拦截:' +
          JSON.stringify({ url: config.url, code, msg }) || 'Error'
      )
    }
  },
  (error) => {
    if (loadingInstance) loadingInstance.close()
    const { response, message } = error
    if (error.response && error.response.data) {
      const { status, data } = response
      handleCode(status, data.msg || message)
      return Promise.reject(error)
    } else {
      let { message } = error
      if (message === 'Network Error') {
        message = '后端接口连接异常'
      }
      if (message.includes('timeout')) {
        message = '后端接口请求超时'
      }
      if (message.includes('Request failed with status code')) {
        const code = message.substr(message.length - 3)
        message = '后端接口' + code + '异常'
      }
      Vue.prototype.$baseMessage(message || `后端接口未知异常`, 'error')
      return Promise.reject(error)
    }
  }
)

export default instance
