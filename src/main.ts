import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css';
import './styles/main.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


import App from './App.vue'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi', 
    },
})

createApp(App).use(vuetify).mount('#app')