# ServiceHub Mobile

App móvil en React Native (Expo) para QuickFix, MindSpace, EduPro y PetCare.
El mismo código sirve para las 4 apps — solo cambia `APP_ID` en `AppNavigator.js` y los assets.

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar API URL
# Editar src/api/client.js → cambiar API_URL por tu URL de Railway

# 3. Arrancar en desarrollo
npm start
# Escanear QR con Expo Go (iOS/Android)

# 4. Probar en simulador
npm run ios      # Mac con Xcode
npm run android  # Android Studio
```

## Compilar para producción

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Compilar APK para Android (pruebas)
npm run build:android

# Compilar para App Store / Play Store (producción)
# iOS
eas build --platform ios --profile production
# Android
eas build --platform android --profile production

# Publicar en stores
npm run submit:ios
npm run submit:android
```

## Cambiar entre las 4 apps

Solo modifica en `src/navigation/AppNavigator.js`:
```js
const APP_ID = 'QUICKFIX'   // ← QUICKFIX | MINDSPACE | EDUPRO | PETCARE
```

Cada app tiene su color, ícono y servicios automáticamente desde `src/theme/index.js`.

## Pantallas implementadas

| Pantalla | Descripción |
|---|---|
| LoginScreen | Login + registro · bilingüe · detección de rol |
| HomeScreen | Lista de expertos · búsqueda · filtros por servicio |
| ExpertDetailScreen | Perfil · selección servicio · calendario · slots |
| BookingCheckoutScreen | Resumen + pago (Stripe/PayU según país) |
| BookingConfirmedScreen | Confirmación animada + tracking GPS |
| MyBookingsScreen | Historial de reservas con filtros de estado |
| ExpertDashboardScreen | Panel experto · stats · confirmar/completar reservas |

## Variables de entorno (app.json → extra)

```json
"extra": {
  "appId": "QUICKFIX",
  "apiUrl": "https://tu-api.railway.app/api/v1"
}
```
