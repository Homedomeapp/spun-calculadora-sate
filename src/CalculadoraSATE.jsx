import React, { useState, useEffect } from 'react';

// ============================================
// CALCULADORA SATE B2B - SPUN
// Herramienta de captación de leads para 
// rehabilitación energética de edificios
// ============================================

const CalculadoraSATE = () => {
  // ============================================
  // ESTADOS DEL COMPONENTE
  // ============================================
  
  // Paso actual del flujo
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'summary' | 'gate' | 'detail'
  
  // Datos del edificio
  const [buildingData, setBuildingData] = useState({
    codigoPostal: '',
    anosConstruccion: '',
    numPlantas: '',
    numViviendas: '',
    superficieFachada: '',
    tipoFachada: '',
    situacionEnergetica: '',
    combinarVentanas: false,
    combinarCubierta: false,
    combinarNinguna: false
  });
  
  // Datos del lead
  const [leadData, setLeadData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    numEdificios: '',
    horizonte: '',
    tieneEmpresa: '',
    esProfesional: false,
    // Campos para profesionales
    nombreEmpresa: '',
    web: '',
    tipoEmpresa: '',
    zonasActuacion: ''
  });
  
  // Resultados del cálculo
  const [resultados, setResultados] = useState(null);
  
  // Animaciones
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ============================================
  // CONSTANTES DE CÁLCULO (Precios Madrid 2025)
  // ============================================
  
  const PRECIOS_BASE_M2 = {
    min: 80,
    max: 130,
    medio: 105
  };
  
  const FACTORES_ANTIGUEDAD = {
    'antes-1979': 1.20,      // +20% por adaptaciones complejas
    '1980-2006': 1.10,       // +10% edificios típicos sin aislamiento
    '2007-2013': 1.00,       // Base - ya con algo de normativa
    '2014-2020': 0.95,       // -5% más fáciles de adaptar
    '2021-adelante': 0.90    // -10% construcción reciente
  };
  
  const FACTORES_ALTURA = {
    1: 1.00, 2: 1.00, 3: 1.05, 4: 1.08, 5: 1.12,
    6: 1.15, 7: 1.18, 8: 1.22, 9: 1.25, 10: 1.30
  };
  
  const FACTORES_SITUACION = {
    'muy-mala': 1.15,   // Más trabajo preparación
    'media': 1.00,
    'aceptable': 0.95
  };
  
  const AHORRO_ENERGETICO = {
    'muy-mala': { min: 35, max: 45 },
    'media': { min: 25, max: 35 },
    'aceptable': { min: 15, max: 25 }
  };
  
  const GASTO_ENERGETICO_MEDIO_VIVIENDA = 1500; // €/año
  
  // Subvenciones Plan Rehabilita Madrid 2025
  const SUBVENCIONES = {
    'antes-1979': { min: 50, max: 70 },   // ZETU + antigüedad
    '1980-2006': { min: 40, max: 60 },
    '2007-2013': { min: 35, max: 50 },
    '2014-2020': { min: 30, max: 45 },
    '2021-adelante': { min: 20, max: 35 }
  };

  // ============================================
  // FUNCIONES DE CÁLCULO
  // ============================================
  
  const calcularProyecto = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const superficie = parseFloat(buildingData.superficieFachada) || 0;
      const numViviendas = parseInt(buildingData.numViviendas) || 1;
      const numPlantas = parseInt(buildingData.numPlantas) || 1;
      
      // Factor de altura (máximo 10 plantas en la tabla)
      const factorAltura = FACTORES_ALTURA[Math.min(numPlantas, 10)] || 1.30;
      
      // Factor de antigüedad
      const factorAntiguedad = FACTORES_ANTIGUEDAD[buildingData.anosConstruccion] || 1.00;
      
      // Factor de situación energética
      const factorSituacion = FACTORES_SITUACION[buildingData.situacionEnergetica] || 1.00;
      
      // Precio por m² ajustado
      const precioM2Min = PRECIOS_BASE_M2.min * factorAntiguedad * factorAltura * factorSituacion;
      const precioM2Max = PRECIOS_BASE_M2.max * factorAntiguedad * factorAltura * factorSituacion;
      const precioM2Medio = (precioM2Min + precioM2Max) / 2;
      
      // Costes totales
      const costeSinIVA = superficie * precioM2Medio;
      const costeConIVA = costeSinIVA * 1.21;
      const costePorVivienda = costeConIVA / numViviendas;
      const costePorM2 = costeConIVA / superficie;
      
      // Desglose por partidas (porcentajes típicos)
      const desglose = {
        sistemaSATE: costeSinIVA * 0.55,           // 55% material + mano obra SATE
        andamios: costeSinIVA * 0.15,              // 15% medios auxiliares
        reparacionSoportes: costeSinIVA * 0.10,   // 10% reparaciones previas
        acabados: costeSinIVA * 0.08,              // 8% acabados finales
        honorarios: costeSinIVA * 0.07,            // 7% honorarios técnicos
        licencias: costeSinIVA * 0.03,             // 3% licencias y tasas
        contingencias: costeSinIVA * 0.02          // 2% contingencias
      };
      
      // Ahorro energético
      const ahorroRango = AHORRO_ENERGETICO[buildingData.situacionEnergetica] || { min: 25, max: 35 };
      const ahorroPorcentajeMedio = (ahorroRango.min + ahorroRango.max) / 2;
      const ahorroAnualVivienda = GASTO_ENERGETICO_MEDIO_VIVIENDA * (ahorroPorcentajeMedio / 100);
      const ahorroAnualTotal = ahorroAnualVivienda * numViviendas;
      
      // Subvenciones
      const subvencionRango = SUBVENCIONES[buildingData.anosConstruccion] || { min: 30, max: 50 };
      const subvencionPorcentajeMedio = (subvencionRango.min + subvencionRango.max) / 2;
      const subvencionEstimada = costeConIVA * (subvencionPorcentajeMedio / 100);
      const inversionNeta = costeConIVA - subvencionEstimada;
      
      // ROI y Payback
      const paybackAnos = inversionNeta / ahorroAnualTotal;
      const paybackMin = Math.floor(paybackAnos * 0.85);
      const paybackMax = Math.ceil(paybackAnos * 1.15);
      
      setResultados({
        // Costes
        costeSinIVA: Math.round(costeSinIVA),
        costeConIVA: Math.round(costeConIVA),
        costePorVivienda: Math.round(costePorVivienda),
        costePorM2: Math.round(costePorM2),
        precioM2Rango: { min: Math.round(precioM2Min), max: Math.round(precioM2Max) },
        
        // Desglose
        desglose: {
          sistemaSATE: Math.round(desglose.sistemaSATE),
          andamios: Math.round(desglose.andamios),
          reparacionSoportes: Math.round(desglose.reparacionSoportes),
          acabados: Math.round(desglose.acabados),
          honorarios: Math.round(desglose.honorarios),
          licencias: Math.round(desglose.licencias),
          contingencias: Math.round(desglose.contingencias)
        },
        
        // Ahorro energético
        ahorroPorcentaje: ahorroPorcentajeMedio,
        ahorroPorcentajeRango: ahorroRango,
        ahorroAnualVivienda: Math.round(ahorroAnualVivienda),
        ahorroAnualTotal: Math.round(ahorroAnualTotal),
        
        // Subvenciones
        subvencionPorcentaje: subvencionPorcentajeMedio,
        subvencionPorcentajeRango: subvencionRango,
        subvencionEstimada: Math.round(subvencionEstimada),
        inversionNeta: Math.round(inversionNeta),
        
        // ROI
        paybackAnos: paybackAnos.toFixed(1),
        paybackRango: { min: paybackMin, max: paybackMax },
        
        // Metadata
        superficie,
        numViviendas,
        codigoPostal: buildingData.codigoPostal
      });
      
      setIsCalculating(false);
      setCurrentStep('summary');
      setShowResults(true);
    }, 1500);
  };

  // ============================================
  // SCORING DE LEADS (visible en comentarios)
  // ============================================
  
  /*
   * SISTEMA DE PRIORIZACIÓN DE LEADS
   * 
   * ALTA PRIORIDAD:
   * - Rol: administrador/gestor/presidente + 
   * - Edificios: más de 1 +
   * - Horizonte: < 12 meses +
   * - No tiene empresa
   * 
   * MEDIA PRIORIDAD:
   * - Un solo edificio +
   * - Horizonte < 12 meses
   * 
   * BAJA PRIORIDAD:
   * - "Solo explorando" o sin intención temporal clara
   */
  
  const calcularPrioridadLead = () => {
    const { rol, numEdificios, horizonte, tieneEmpresa } = leadData;
    
    const esGestorMultiple = 
      ['administrador', 'gestor', 'presidente'].includes(rol) && 
      ['2-10', 'mas-10'].includes(numEdificios);
    
    const horizonteCercano = ['6-meses', '6-12-meses'].includes(horizonte);
    const noTieneEmpresa = tieneEmpresa === 'no' || tieneEmpresa === 'comparando';
    
    if (esGestorMultiple && horizonteCercano && noTieneEmpresa) {
      return 'ALTA';
    } else if (horizonteCercano) {
      return 'MEDIA';
    } else {
      return 'BAJA';
    }
  };

  // ============================================
  // CONFIGURACIÓN DEL WEBHOOK
  // ============================================
  
  // ⚠️ IMPORTANTE: Reemplaza esta URL con tu webhook de Make/Zapier
  const WEBHOOK_URL = 'https://hook.eu2.make.com/mgjeeqs5wni2u7kmm1xmfcfl28cf13pm';

  // ============================================
  // ENVÍO DE DATOS A MAKE/ZAPIER → AIRTABLE
  // ============================================
  
  // Mapeo de valores internos → valores Airtable
  const MAPEO_AIRTABLE = {
    tipoFachada: {
      'ladrillo': 'Ladrillo',
      'monocapa': 'Monocapa',
      'revoco': 'Revoco',
      'otro': 'Otro'
    },
    situacionEnergetica: {
      'muy-mala': 'Muy mala',
      'media': 'Media',
      'aceptable': 'Aceptable'
    },
    anosConstruccion: {
      'antes-1979': 'Antes de 1979',
      '1980-2006': '1980-2006',
      '2007-2013': '2007-2013',
      '2014-2020': '2014-2020',
      '2021-adelante': '2021+'
    },
    rol: {
      'presidente': 'Presidente',
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'propietario': 'Propietario'
    },
    numEdificios: {
      'solo-este': 'Solo este',
      '2-10': 'Entre 2 y 10',
      'mas-10': 'Más de 10'
    },
    horizonte: {
      '6-meses': '6 meses',
      '6-12-meses': '6-12 meses',
      'explorando': 'Solo explorando'
    },
    tieneEmpresa: {
      'si': 'Sí',
      'no': 'No',
      'comparando': 'Comparando'
    },
    tipoEmpresa: {
      'instalador-sate': 'Instalador SATE',
      'rehabilitacion-integral': 'Rehabilitación integral',
      'arquitectura-ingenieria': 'Arquitectura Ingeniería',
      'otro': 'Otro'
    }
  };
  
  const enviarDatosLead = async () => {
    const prioridad = calcularPrioridadLead();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Estructura de datos para el CRM (con valores mapeados para Airtable)
    const datosParaCRM = {
      // Tipo de usuario
      tipoUsuario: leadData.esProfesional ? 'OFERTA' : 'DEMANDA',
      
      // Datos de contacto
      nombre: leadData.nombre,
      email: leadData.email,
      telefono: leadData.telefono || '',
      
      // Segmentación (mapeada)
      rol: leadData.esProfesional ? 'Profesional' : (MAPEO_AIRTABLE.rol[leadData.rol] || leadData.rol),
      numEdificios: MAPEO_AIRTABLE.numEdificios[leadData.numEdificios] || leadData.numEdificios || '',
      horizonte: MAPEO_AIRTABLE.horizonte[leadData.horizonte] || leadData.horizonte || '',
      tieneEmpresa: MAPEO_AIRTABLE.tieneEmpresa[leadData.tieneEmpresa] || leadData.tieneEmpresa || '',
      
      // Si es profesional (mapeado)
      nombreEmpresa: leadData.nombreEmpresa || '',
      web: leadData.web || '',
      tipoEmpresa: MAPEO_AIRTABLE.tipoEmpresa[leadData.tipoEmpresa] || leadData.tipoEmpresa || '',
      zonasActuacion: leadData.zonasActuacion || '',
      
      // Datos del edificio (mapeados)
      codigoPostal: buildingData.codigoPostal,
      anosConstruccion: MAPEO_AIRTABLE.anosConstruccion[buildingData.anosConstruccion] || buildingData.anosConstruccion,
      numPlantas: parseInt(buildingData.numPlantas) || 0,
      numViviendas: parseInt(buildingData.numViviendas) || 0,
      superficieFachada: parseFloat(buildingData.superficieFachada) || 0,
      tipoFachada: MAPEO_AIRTABLE.tipoFachada[buildingData.tipoFachada] || buildingData.tipoFachada,
      situacionEnergetica: MAPEO_AIRTABLE.situacionEnergetica[buildingData.situacionEnergetica] || buildingData.situacionEnergetica,
      
      // Actuaciones adicionales
      combinarVentanas: buildingData.combinarVentanas,
      combinarCubierta: buildingData.combinarCubierta,
      
      // Resultados calculados
      costeEstimadoTotal: resultados?.costeConIVA || 0,
      costePorVivienda: resultados?.costePorVivienda || 0,
      ahorroAnualEstimado: resultados?.ahorroAnualTotal || 0,
      paybackEstimado: parseFloat(resultados?.paybackAnos) || 0,
      subvencionEstimada: resultados?.subvencionEstimada || 0,
      inversionNeta: resultados?.inversionNeta || 0,
      
      // Scoring
      prioridadLead: prioridad,
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    // Log para debugging (quitar en producción)
    console.log('=== ENVIANDO A CRM ===');
    console.log(JSON.stringify(datosParaCRM, null, 2));
    
    try {
      // Envío real al webhook de Make/Zapier
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaCRM)
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar datos');
      }
      
      console.log('✅ Lead enviado correctamente');
      setCurrentStep('detail');
      
    } catch (error) {
      console.error('❌ Error enviando lead:', error);
      setSubmitError('Hubo un error al enviar tus datos. Por favor, inténtalo de nuevo.');
      
      // Aun así, mostramos el detalle (mejor UX que bloquear)
      // El lead se puede recuperar del console.log o reenviar
      setCurrentStep('detail');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // VALIDACIONES
  // ============================================
  
  const isFormValid = () => {
    return (
      buildingData.codigoPostal &&
      buildingData.anosConstruccion &&
      buildingData.numPlantas &&
      buildingData.numViviendas &&
      buildingData.superficieFachada &&
      buildingData.tipoFachada &&
      buildingData.situacionEnergetica
    );
  };
  
  const isLeadFormValid = () => {
    const baseValid = leadData.nombre && leadData.email && leadData.rol;
    
    if (leadData.esProfesional) {
      return baseValid && leadData.nombreEmpresa && leadData.tipoEmpresa;
    }
    
    return baseValid && leadData.numEdificios && leadData.horizonte && leadData.tieneEmpresa;
  };

  // ============================================
  // FORMATEO DE NÚMEROS
  // ============================================
  
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // ============================================
  // RENDERIZADO
  // ============================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium tracking-wide">Madrid 2025 – Precios orientativos</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
            Calculadora SATE para<br />edificios en Madrid
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Estima en segundos el coste, el ahorro energético y el retorno de la inversión de una rehabilitación con SATE para tu edificio.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* ============================================ */}
          {/* PASO 1: FORMULARIO DE DATOS DEL EDIFICIO */}
          {/* ============================================ */}
          
          {currentStep === 'form' && (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Datos del edificio</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Código Postal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Código postal
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="28001"
                    value={buildingData.codigoPostal}
                    onChange={(e) => setBuildingData({...buildingData, codigoPostal: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                
                {/* Año de construcción */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Año aproximado de construcción
                  </label>
                  <select
                    value={buildingData.anosConstruccion}
                    onChange={(e) => setBuildingData({...buildingData, anosConstruccion: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="antes-1979">Antes de 1979</option>
                    <option value="1980-2006">1980 – 2006</option>
                    <option value="2007-2013">2007 – 2013</option>
                    <option value="2014-2020">2014 – 2020</option>
                    <option value="2021-adelante">2021 en adelante</option>
                  </select>
                </div>
                
                {/* Número de plantas */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Nº de plantas sobre rasante
                  </label>
                  <select
                    value={buildingData.numPlantas}
                    onChange={(e) => setBuildingData({...buildingData, numPlantas: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {[...Array(15)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'planta' : 'plantas'}</option>
                    ))}
                  </select>
                </div>
                
                {/* Número de viviendas */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Nº aproximado de viviendas
                  </label>
                  <select
                    value={buildingData.numViviendas}
                    onChange={(e) => setBuildingData({...buildingData, numViviendas: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {[1,2,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'vivienda' : 'viviendas'}</option>
                    ))}
                  </select>
                </div>
                
                {/* Superficie de fachada */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Superficie aproximada de fachada (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="600"
                    min="50"
                    max="10000"
                    value={buildingData.superficieFachada}
                    onChange={(e) => setBuildingData({...buildingData, superficieFachada: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-xs text-slate-500">Suma todas las fachadas a rehabilitar</p>
                </div>
                
                {/* Tipo de fachada */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Tipo de fachada actual
                  </label>
                  <select
                    value={buildingData.tipoFachada}
                    onChange={(e) => setBuildingData({...buildingData, tipoFachada: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="ladrillo">Ladrillo visto</option>
                    <option value="monocapa">Monocapa</option>
                    <option value="revoco">Revoco / enfoscado</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                
                {/* Situación energética */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Situación energética actual (auto-declarada)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'muy-mala', label: 'Muy mala', desc: 'Mucho frío/calor, facturas muy altas' },
                      { value: 'media', label: 'Media', desc: 'Problemas estacionales puntuales' },
                      { value: 'aceptable', label: 'Aceptable', desc: 'Sin grandes problemas térmicos' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBuildingData({...buildingData, situacionEnergetica: opt.value})}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          buildingData.situacionEnergetica === opt.value
                            ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span className="block font-medium mb-1">{opt.label}</span>
                        <span className="text-xs text-slate-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Actuaciones adicionales */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300">
                    ¿Se plantea combinar con otras actuaciones?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'combinarVentanas', label: 'Ventanas' },
                      { key: 'combinarCubierta', label: 'Cubierta' },
                      { key: 'combinarNinguna', label: 'Ninguna / no lo sé' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setBuildingData({
                          ...buildingData, 
                          [opt.key]: !buildingData[opt.key],
                          ...(opt.key === 'combinarNinguna' && !buildingData[opt.key] 
                            ? { combinarVentanas: false, combinarCubierta: false } 
                            : {}),
                          ...(opt.key !== 'combinarNinguna' && !buildingData[opt.key]
                            ? { combinarNinguna: false }
                            : {})
                        })}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          buildingData[opt.key]
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {buildingData[opt.key] && (
                          <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Botón calcular */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={calcularProyecto}
                  disabled={!isFormValid() || isCalculating}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    isFormValid() && !isCalculating
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Calculando estimación...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calcular proyecto
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* PASO 2: RESUMEN (SIN DATOS PERSONALES) */}
          {/* ============================================ */}
          
          {currentStep === 'summary' && resultados && (
            <div className={`space-y-6 transition-all duration-500 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Tarjeta de resumen */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border-b border-emerald-500/20 px-6 py-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resumen estimado para tu edificio
                  </h2>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Coste total */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                      <p className="text-slate-400 text-sm mb-1">Coste total estimado</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(resultados.costeConIVA)}</p>
                      <p className="text-emerald-400 text-sm mt-1">IVA incluido</p>
                    </div>
                    
                    {/* Coste por vivienda */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                      <p className="text-slate-400 text-sm mb-1">Coste por vivienda</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(resultados.costePorVivienda)}</p>
                      <p className="text-slate-500 text-sm mt-1">{resultados.numViviendas} viviendas</p>
                    </div>
                    
                    {/* Ahorro anual */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                      <p className="text-slate-400 text-sm mb-1">Ahorro energético anual</p>
                      <p className="text-3xl font-bold text-emerald-400">{formatCurrency(resultados.ahorroAnualTotal)}</p>
                      <p className="text-slate-500 text-sm mt-1">~{resultados.ahorroPorcentaje}% de reducción</p>
                    </div>
                    
                    {/* Retorno */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                      <p className="text-slate-400 text-sm mb-1">Retorno de la inversión</p>
                      <p className="text-3xl font-bold text-amber-400">{resultados.paybackRango.min}–{resultados.paybackRango.max} años</p>
                      <p className="text-slate-500 text-sm mt-1">Según consumos reales</p>
                    </div>
                  </div>
                  
                  {/* CTA para ver detalle */}
                  <div className="mt-8 p-5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20">
                    <p className="text-slate-300 text-center mb-4">
                      Para ver el <strong>desglose por partidas</strong>, el <strong>detalle de subvenciones estimadas</strong> y recibir un <strong>informe descargable</strong>, completa tus datos.
                    </p>
                    <button
                      onClick={() => setCurrentStep('gate')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    >
                      Ver estimación detallada
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Botón volver */}
              <button
                onClick={() => setCurrentStep('form')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Modificar datos del edificio
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* PASO 3: GATE DE LEAD */}
          {/* ============================================ */}
          
          {currentStep === 'gate' && (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Para ver el detalle y recibir el informe</h2>
              </div>
              
              <div className="space-y-6">
                {/* Pregunta clave: ¿Es profesional? */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leadData.esProfesional}
                      onChange={(e) => setLeadData({...leadData, esProfesional: e.target.checked})}
                      className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                    />
                    <div>
                      <span className="font-medium text-amber-300">¿Eres empresa o profesional especializado en rehabilitación energética / SATE?</span>
                      <p className="text-sm text-slate-400 mt-1">Marca esta casilla si ofreces servicios de rehabilitación</p>
                    </div>
                  </label>
                </div>
                
                {/* Campos comunes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Nombre y apellidos *</label>
                    <input
                      type="text"
                      value={leadData.nombre}
                      onChange={(e) => setLeadData({...leadData, nombre: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Email *</label>
                    <input
                      type="email"
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Teléfono <span className="text-slate-500">(opcional pero recomendado)</span>
                    </label>
                    <input
                      type="tel"
                      value={leadData.telefono}
                      onChange={(e) => setLeadData({...leadData, telefono: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      placeholder="600 123 456"
                    />
                  </div>
                </div>
                
                {/* Campos para DEMANDA (no profesional) */}
                {!leadData.esProfesional && (
                  <div className="space-y-5 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Tu rol *</label>
                      <select
                        value={leadData.rol}
                        onChange={(e) => setLeadData({...leadData, rol: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="presidente">Presidente/a de comunidad</option>
                        <option value="administrador">Administrador/a de fincas</option>
                        <option value="gestor">Gestor/a de patrimonio / empresa</option>
                        <option value="propietario">Propietario particular</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">¿Cuántos edificios gestionas además de este? *</label>
                      <select
                        value={leadData.numEdificios}
                        onChange={(e) => setLeadData({...leadData, numEdificios: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="solo-este">Solo este</option>
                        <option value="2-10">Entre 2 y 10</option>
                        <option value="mas-10">Más de 10</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">¿Cuándo te gustaría ejecutar esta rehabilitación? *</label>
                      <select
                        value={leadData.horizonte}
                        onChange={(e) => setLeadData({...leadData, horizonte: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="6-meses">En los próximos 6 meses</option>
                        <option value="6-12-meses">En 6–12 meses</option>
                        <option value="explorando">Sin fecha clara / solo explorando</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">¿Tienes ya una empresa o técnico de confianza para este proyecto? *</label>
                      <select
                        value={leadData.tieneEmpresa}
                        onChange={(e) => setLeadData({...leadData, tieneEmpresa: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                        <option value="comparando">Estoy comparando opciones</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Campos para OFERTA (profesional) */}
                {leadData.esProfesional && (
                  <div className="space-y-5 pt-4 border-t border-slate-800">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-emerald-300 text-sm">
                        <strong>¡Genial!</strong> Estamos creando una red de empresas y técnicos especializados en rehabilitación energética para conectarles con comunidades y administradores que usan esta herramienta.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Nombre de la empresa *</label>
                      <input
                        type="text"
                        value={leadData.nombreEmpresa}
                        onChange={(e) => setLeadData({...leadData, nombreEmpresa: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Página web <span className="text-slate-500">(opcional)</span>
                      </label>
                      <input
                        type="url"
                        value={leadData.web}
                        onChange={(e) => setLeadData({...leadData, web: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        placeholder="https://tuempresa.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Tipo de empresa *</label>
                      <select
                        value={leadData.tipoEmpresa}
                        onChange={(e) => setLeadData({...leadData, tipoEmpresa: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="instalador-sate">Instalador SATE</option>
                        <option value="rehabilitacion-integral">Empresa de rehabilitación integral</option>
                        <option value="arquitectura-ingenieria">Estudio de arquitectura / ingeniería</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Zonas de actuación principales</label>
                      <input
                        type="text"
                        value={leadData.zonasActuacion}
                        onChange={(e) => setLeadData({...leadData, zonasActuacion: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        placeholder="Ej: Madrid capital, zona sur, Corredor del Henares..."
                      />
                    </div>
                    
                    {/* Rol oculto para profesionales */}
                    <input type="hidden" value="profesional" onChange={() => setLeadData({...leadData, rol: 'profesional'})} />
                  </div>
                )}
                
                {/* Mensaje de error si falla el envío */}
                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                    {submitError}
                  </div>
                )}
                
                {/* Botón enviar */}
                <div className="pt-4">
                  <button
                    onClick={enviarDatosLead}
                    disabled={!isLeadFormValid() || isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                      isLeadFormValid() && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Enviando...
                      </>
                    ) : leadData.esProfesional ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Quiero recibir proyectos como este
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver estimación detallada
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Botón volver */}
              <button
                onClick={() => setCurrentStep('summary')}
                className="mt-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al resumen
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* PASO 4: RESULTADO DETALLADO */}
          {/* ============================================ */}
          
          {currentStep === 'detail' && resultados && (
            <div className="space-y-6">
              {/* Cabecera */}
              <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Estimación detallada para tu edificio
                    </h2>
                    <p className="text-slate-400">
                      Código postal: <span className="text-white font-medium">{resultados.codigoPostal}</span> · 
                      {resultados.superficie} m² de fachada · 
                      {resultados.numViviendas} viviendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Coste total con IVA</p>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency(resultados.costeConIVA)}</p>
                  </div>
                </div>
              </div>
              
              {/* Grid de métricas principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Coste por vivienda</p>
                  <p className="text-xl font-bold">{formatCurrency(resultados.costePorVivienda)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Coste por m²</p>
                  <p className="text-xl font-bold">{formatCurrency(resultados.costePorM2)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Ahorro anual total</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(resultados.ahorroAnualTotal)}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Ahorro por vivienda</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(resultados.ahorroAnualVivienda)}/año</p>
                </div>
              </div>
              
              {/* Subvención y coste neto */}
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Subvenciones Plan Rehabilita Madrid 2025
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Subvención estimada</p>
                    <p className="text-2xl font-bold text-amber-400">{formatCurrency(resultados.subvencionEstimada)}</p>
                    <p className="text-xs text-slate-500">{resultados.subvencionPorcentajeRango.min}–{resultados.subvencionPorcentajeRango.max}% del coste</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Inversión neta tras subvención</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(resultados.inversionNeta)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Retorno estimado</p>
                    <p className="text-2xl font-bold text-emerald-400">{resultados.paybackRango.min}–{resultados.paybackRango.max} años</p>
                  </div>
                </div>
              </div>
              
              {/* Desglose por partidas */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Desglose por partidas principales
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sistema SATE (material + mano de obra)', value: resultados.desglose.sistemaSATE, pct: 55 },
                    { label: 'Medios auxiliares / andamios', value: resultados.desglose.andamios, pct: 15 },
                    { label: 'Reparación de soportes y encuentros', value: resultados.desglose.reparacionSoportes, pct: 10 },
                    { label: 'Acabados finales', value: resultados.desglose.acabados, pct: 8 },
                    { label: 'Honorarios técnicos estimados', value: resultados.desglose.honorarios, pct: 7 },
                    { label: 'Licencias y tasas', value: resultados.desglose.licencias, pct: 3 },
                    { label: 'Contingencias', value: resultados.desglose.contingencias, pct: 2 }
                  ].map((partida, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ opacity: 0.3 + (partida.pct / 100) }} />
                        <span className="text-slate-300">{partida.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(partida.value)}</span>
                        <span className="text-slate-500 text-sm ml-2">({partida.pct}%)</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700">
                    <span className="font-semibold">Total sin IVA</span>
                    <span className="font-bold text-lg">{formatCurrency(resultados.costeSinIVA)}</span>
                  </div>
                </div>
              </div>
              
              {/* Bloque de contexto */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-slate-400 space-y-2">
                    <p>Estos son <strong className="text-slate-300">valores orientativos</strong> basados en precios medios de mercado en Madrid para 2025.</p>
                    <p>Un técnico deberá visitar el edificio para cerrar cifras definitivas y evaluar las condiciones específicas de la fachada.</p>
                    <p><strong className="text-slate-300">SPUN puede coordinar visitas</strong> y ofertas de empresas especializadas verificadas sin compromiso.</p>
                  </div>
                </div>
              </div>
              
              {/* CTA final según tipo de usuario */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center">
                {leadData.esProfesional ? (
                  <>
                    <h3 className="text-xl font-semibold mb-3">¿Quieres recibir proyectos similares?</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      Únete a la red SPUN de profesionales verificados y conecta con comunidades que buscan empresas especializadas en rehabilitación energética.
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Quiero unirme a la red SPUN
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-3">¿Quieres recibir ofertas de empresas verificadas?</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      SPUN puede conectarte con empresas especializadas en SATE verificadas que trabajen en tu zona, sin compromiso.
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Quiero que me contacten empresas verificadas
                    </button>
                  </>
                )}
              </div>
              
              {/* Nueva estimación */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentStep('form');
                    setShowResults(false);
                    setBuildingData({
                      codigoPostal: '',
                      anosConstruccion: '',
                      numPlantas: '',
                      numViviendas: '',
                      superficieFachada: '',
                      tipoFachada: '',
                      situacionEnergetica: '',
                      combinarVentanas: false,
                      combinarCubierta: false,
                      combinarNinguna: false
                    });
                    setLeadData({
                      nombre: '',
                      email: '',
                      telefono: '',
                      rol: '',
                      numEdificios: '',
                      horizonte: '',
                      tieneEmpresa: '',
                      esProfesional: false,
                      nombreEmpresa: '',
                      web: '',
                      tipoEmpresa: '',
                      zonasActuacion: ''
                    });
                    setResultados(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Calcular otra estimación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Disclaimer */}
        <footer className="mt-12 pt-8 border-t border-slate-800/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              SPUN
            </div>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Estimaciones orientativas basadas en precios medios de mercado y supuestos estándar de consumo. 
              No constituyen oferta vinculante. Para un presupuesto cerrado es necesaria una visita técnica. 
              Los porcentajes de subvención son aproximados y están sujetos a normativa vigente, 
              convocatorias disponibles y cumplimiento de requisitos específicos del Plan Rehabilita Madrid 2025.
            </p>
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} SPUN · Marketplace de construcción sostenible
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CalculadoraSATE;
