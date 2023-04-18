import './water.css'
import './app.css'
import App from './App.svelte'
import { devDependencies } from "../package.json";

const app = new App({
  target: document.getElementById('app'),
  props: {
    version: devDependencies["bookshop-component-migrator"]
  }
})

export default app
