# Calculadora SATE Madrid - SPUN

Herramienta de captación de leads B2B para rehabilitación energética de edificios con SATE en Madrid.

## 🎯 Funcionalidades

- **Estimación de costes** basada en precios reales de mercado (80-130 €/m²)
- **Cálculo de ahorro energético** según situación actual del edificio
- **Estimación de subvenciones** Plan Rehabilita Madrid 2025 (40-90%)
- **ROI y payback** calculado automáticamente
- **Flujo bifurcado** para demanda (comunidades) y oferta (profesionales)
- **Scoring de leads** automático (ALTA/MEDIA/BAJA prioridad)
- **Integración con CRM** vía webhook (Make/Zapier → Airtable)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build
```

## ⚙️ Configuración

1. Crea un webhook en Make/Zapier
2. Edita `src/CalculadoraSATE.jsx` línea ~255:
   ```javascript
   const WEBHOOK_URL = 'https://hook.eu1.make.com/TU_WEBHOOK_ID';
   ```
3. Configura Airtable según `airtable-structure.md`

## 📦 Deploy

Ver `DEPLOY-GUIDE.md` para instrucciones completas de:
- Configuración de Airtable
- Configuración de Make
- Deploy en Vercel
- Integración con Wix

## 📊 Stack

- React 18
- Vite
- Tailwind CSS
- Make (webhooks)
- Airtable (base de datos)

## 📈 Datos de referencia

- **Precios SATE Madrid 2025:** 80-130 €/m²
- **Subvenciones:** 20-70% según antigüedad y zona
- **Ahorro energético:** 15-45% según estado actual
- **Fuentes:** Plan Rehabilita Madrid 2025, CGATE, datos de mercado

---

**SPUN** · Marketplace de construcción sostenible
