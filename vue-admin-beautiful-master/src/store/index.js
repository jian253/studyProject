/**
 * @author chuzhixin 1204505056@qq.com （不想保留author可删除）
 * @description 导入所有 vuex 模块，自动加入namespaced:true，用于解决vuex命名冲突，请勿修改。
 */

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//Vuex 自动注入所有 ./modules 下的 vuex 子模块
const files = require.context('./modules', false, /\.js$/)
const modules = {}
files.keys().forEach((key) => {
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})
Object.keys(modules).forEach((key) => {
  modules[key]['namespaced'] = true  //vuex modules 命名空间 namespaced 属性
})
const store = new Vuex.Store({
  modules,
})
export default store
