import { registerRootComponent } from 'expo';
import App from './App';

// Este comando diz ao Expo para ignorar o sistema de pastas 'app' 
// e usar o teu ficheiro App.js como o coração da aplicação.
registerRootComponent(App);