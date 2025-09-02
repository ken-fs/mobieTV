import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Vant
import { 
  Button, 
  Cell, 
  CellGroup, 
  Tabbar, 
  TabbarItem, 
  Search, 
  Tag, 
  Toast 
} from 'vant'
import 'vant/lib/index.css'

// Import Tailwind CSS
import './assets/styles/index.css'

const app = createApp(App)

app.use(router)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Search)
app.use(Tag)
app.use(Toast)

app.mount('#app')