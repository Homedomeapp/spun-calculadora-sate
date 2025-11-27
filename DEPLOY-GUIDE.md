# Guía de Despliegue - Calculadora SATE SPUN

## Resumen del Stack

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   CALCULADORA   │────▶│      MAKE       │────▶│    AIRTABLE     │
│  (Vercel/React) │     │    (Webhook)    │     │   (Base datos)  │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  EMAIL (Gmail)  │
                        │  Notificaciones │
                        │                 │
                        └─────────────────┘
```

---

## PASO 1: Configurar Airtable (15 min)

1. **Crear cuenta** en [airtable.com](https://airtable.com) (gratis)
2. **Crear base** "SPUN_Leads_SATE" siguiendo `airtable-structure.md`
3. **Crear las vistas** filtradas (Leads ALTA prioridad, Para contactar, etc.)

---

## PASO 2: Configurar Make (20 min)

1. **Crear cuenta** en [make.com](https://www.make.com) (1000 ops/mes gratis)
2. **Crear escenario** siguiendo `make-setup-guide.md`
3. **Copiar la URL del webhook** - la necesitarás para el paso 3

---

## PASO 3: Configurar el código con tu webhook

Abre el archivo `src/CalculadoraSATE.jsx` y busca esta línea (alrededor de la línea 255):

```javascript
const WEBHOOK_URL = 'https://hook.eu1.make.com/TU_WEBHOOK_ID_AQUI';
```

Reemplaza `TU_WEBHOOK_ID_AQUI` con tu URL real de Make.

---

## PASO 4: Desplegar en Vercel (10 min)

### Opción A: Desde GitHub (Recomendado)

1. **Sube el código a GitHub:**
   ```bash
   cd calculadora-sate-deploy
   git init
   git add .
   git commit -m "Initial commit - Calculadora SATE SPUN"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/spun-calculadora-sate.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com) y crea cuenta (gratis)
   - Click "Add New Project"
   - Importa desde GitHub el repositorio `spun-calculadora-sate`
   - Framework Preset: Vite
   - Click "Deploy"

3. **Vercel te dará una URL** tipo:
   - `https://spun-calculadora-sate.vercel.app`
   - O puedes configurar dominio personalizado

### Opción B: Deploy directo con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En el directorio del proyecto
cd calculadora-sate-deploy

# Login y deploy
vercel login
vercel

# Seguir las instrucciones interactivas
```

---

## PASO 5: Incrustar en Wix (5 min)

1. **En Wix**, crea una nueva página o ve a la existente
2. **Añade un elemento "HTML Embed"** (o "Código HTML")
3. **Pega este código**, reemplazando la URL:

```html
<iframe 
  src="https://TU-PROYECTO.vercel.app" 
  width="100%" 
  height="2000" 
  frameborder="0"
  style="border: none; min-height: 100vh;"
  title="Calculadora SATE SPUN"
></iframe>

<style>
  /* Hacer el iframe responsivo */
  iframe {
    width: 100%;
    max-width: 100%;
  }
</style>
```

4. **Ajusta la altura** según necesites (2000px suele ser suficiente)
5. **Publica la página**

### URL recomendada en Wix:
- `tuweb.com/calculadora-sate-madrid`
- o `tuweb.com/rehabilitacion-energetica`

---

## PASO 6: Probar el flujo completo

1. **Abre la calculadora** en tu web de Wix
2. **Rellena el formulario** con datos de prueba:
   - CP: 28001
   - Año: 1980-2006
   - Plantas: 5
   - Viviendas: 20
   - Superficie: 600 m²
   - Fachada: Ladrillo
   - Situación: Media
3. **Click "Calcular proyecto"**
4. **Click "Ver estimación detallada"**
5. **Rellena el gate** con tus datos
6. **Verifica que:**
   - ✅ Se crea registro en Airtable
   - ✅ Recibes email de notificación
   - ✅ El usuario ve el detalle

---

## PASO 7: Configurar dominio personalizado (Opcional)

### En Vercel:
1. Ve a tu proyecto → Settings → Domains
2. Añade tu dominio (ej: `calculadora.spun.es`)
3. Configura los DNS según las instrucciones

### O usa subdirectorio en Wix:
- El iframe ya funciona en cualquier URL de tu web Wix

---

## Troubleshooting

### "El iframe no carga"
- Verifica que la URL de Vercel es correcta
- Comprueba que no hay errores en la consola del navegador

### "Los leads no llegan a Airtable"
- Verifica la URL del webhook en el código
- Revisa el historial de ejecuciones en Make
- Comprueba que los campos de Airtable coinciden

### "Error de CORS"
- Vercel ya maneja CORS automáticamente
- Si usas otro hosting, añade headers CORS

### "El email no llega"
- Revisa la configuración de email en Make
- Comprueba la carpeta de spam
- Verifica que el email del remitente es válido

---

## Costes estimados

| Servicio | Plan | Coste |
|----------|------|-------|
| Vercel | Hobby | GRATIS |
| Airtable | Free | GRATIS (1000 registros) |
| Make | Free | GRATIS (1000 ops/mes) |
| Wix | Tu plan actual | Ya lo tienes |

**Total: 0€/mes** para empezar a validar

---

## Próximos pasos cuando funcione

1. **Tracking**: Añadir Google Analytics / Tag Manager
2. **Ads**: Crear campañas Google Ads:
   - "subvenciones rehabilitación fachada madrid"
   - "SATE edificio comunidad madrid"
   - "coste rehabilitación energética madrid"
3. **SEO**: Crear contenido alrededor de la calculadora
4. **Outbound**: Usar la calculadora como lead magnet en emails a administradores
5. **Escalar**: Si hay volumen, migrar a HubSpot/Pipedrive
