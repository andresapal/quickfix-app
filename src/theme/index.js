// ─── TEMA COMPARTIDO ──────────────────────────────────────────────────────────
// Todos los colores, tipografías y espaciados del proyecto móvil.

export const COLORS = {
  // Fondos
  bg:      '#0A0D13',
  bg2:     '#111520',
  bg3:     '#1E2534',
  // Texto
  text:    '#EEF0F5',
  muted:   'rgba(255,255,255,0.45)',
  // Bordes
  border:  'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.14)',
  // Estados
  success: '#22C55E',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',
  white:   '#FFFFFF',
}

// Colores por app
export const APP_COLORS = {
  QUICKFIX:  { primary:'#1B5EF7', light:'rgba(27,94,247,0.12)',  border:'rgba(27,94,247,0.3)',  name:'QuickFix',  icon:'🔧' },
  MINDSPACE: { primary:'#6C3FC5', light:'rgba(108,63,197,0.12)', border:'rgba(108,63,197,0.3)', name:'MindSpace', icon:'🧠' },
  EDUPRO:    { primary:'#2D6A4F', light:'rgba(45,106,79,0.12)',  border:'rgba(45,106,79,0.3)',  name:'EduPro',    icon:'📚' },
  PETCARE:   { primary:'#E8622A', light:'rgba(232,98,42,0.12)',  border:'rgba(232,98,42,0.3)',  name:'PetCare',   icon:'🐾' },
}

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
  sizes: { xs:11, sm:13, base:15, md:17, lg:20, xl:24, xxl:30, xxxl:38 }
}

export const SPACING = {
  xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, xxxl:40
}

export const RADIUS = {
  sm:8, md:12, lg:16, xl:20, full:100
}

export const SHADOWS = {
  sm: { shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.25, shadowRadius:4,  elevation:3 },
  md: { shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.3,  shadowRadius:8,  elevation:6 },
  lg: { shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.4,  shadowRadius:16, elevation:12 },
}
