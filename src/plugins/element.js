import Vue from 'vue'
import {
  Button, Form, FormItem, Input, Message, Container, Header,
  Aside, Main, Menu, MenuItem, Submenu, Breadcrumb, BreadcrumbItem,
  Card, Table, TableColumn, Switch, Row, Col, Tooltip, Pagination,
  Dialog, MessageBox
} from 'element-ui'

Vue.use(Button)
Vue.use(Dialog)
Vue.use(Pagination)
Vue.use(Tooltip)
Vue.use(Row)
Vue.use(Col)
Vue.use(Switch)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Card)
Vue.use(BreadcrumbItem)
Vue.use(Breadcrumb)
Vue.use(Form)
Vue.use(Input)
Vue.use(FormItem)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.prototype.$message = Message
Vue.prototype.$messagebox = MessageBox
