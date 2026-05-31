// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/index.js'

// ── Button ───────────────────────────────────────────────────────────────────
export function Button({ title, onPress, loading, disabled, variant='primary', size='md', color, style }) {
  const bg = variant==='ghost' ? 'transparent' : (color || COLORS.info)
  const borderColor = variant==='ghost' ? COLORS.border2 : 'transparent'
  const textColor = COLORS.white
  const pad = size==='sm' ? {paddingVertical:8,paddingHorizontal:16} : {paddingVertical:14,paddingHorizontal:24}

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor:bg, borderWidth:1, borderColor, ...pad, opacity:(disabled||loading)?0.55:1 }, SHADOWS.sm, style]}
    >
      {loading
        ? <ActivityIndicator color={COLORS.white} size="small"/>
        : <Text style={[styles.btnText, { color:textColor, fontSize: size==='sm'?13:16 }]}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={COLORS.muted}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>{children}</View>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = COLORS.info, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || color+'22', borderColor: color+'44' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size=44, color=COLORS.info }) {
  const initials = name ? name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : '?'
  return (
    <View style={[styles.avatar, { width:size, height:size, borderRadius:size/2, backgroundColor:color+'33' }]}>
      <Text style={[styles.avatarText, { fontSize:size*0.36, color }]}>{initials}</Text>
    </View>
  )
}

// ── Stars ─────────────────────────────────────────────────────────────────────
export function Stars({ rating=0, size=14 }) {
  return (
    <View style={{ flexDirection:'row', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize:size, color: i<=Math.round(rating) ? '#FBBF24' : COLORS.border2 }}>★</Text>
      ))}
    </View>
  )
}

// ── Loader ───────────────────────────────────────────────────────────────────
export function Loader({ message }) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={COLORS.info}/>
      {message && <Text style={styles.loaderText}>{message}</Text>}
    </View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon='📭', title, subtitle, action, onAction }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      {action && <Button title={action} onPress={onAction} style={{marginTop:16}}/>}
    </View>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  PENDING:'#F59E0B', CONFIRMED:'#3B82F6', IN_PROGRESS:'#8B5CF6',
  COMPLETED:'#22C55E', CANCELLED:'#EF4444', REFUNDED:'#6B7280'
}
const STATUS_LABELS_ES = { PENDING:'Pendiente', CONFIRMED:'Confirmado', IN_PROGRESS:'En curso', COMPLETED:'Completado', CANCELLED:'Cancelado', REFUNDED:'Reembolsado' }
const STATUS_LABELS_EN = { PENDING:'Pending', CONFIRMED:'Confirmed', IN_PROGRESS:'In progress', COMPLETED:'Completed', CANCELLED:'Cancelled', REFUNDED:'Refunded' }

export function StatusPill({ status, lang='es' }) {
  const color = STATUS_COLORS[status] || COLORS.muted
  const label = (lang==='es' ? STATUS_LABELS_ES : STATUS_LABELS_EN)[status] || status
  return <Badge label={label} color={color}/>
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn:          { borderRadius:RADIUS.full, alignItems:'center', justifyContent:'center' },
  btnText:      { fontWeight:'700', letterSpacing:0.2 },
  inputWrap:    { marginBottom:SPACING.md },
  inputLabel:   { fontSize:FONTS.sizes.sm, fontWeight:'600', color:COLORS.muted, marginBottom:6 },
  input:        { backgroundColor:COLORS.bg3, borderWidth:1, borderColor:COLORS.border, borderRadius:RADIUS.md, paddingHorizontal:SPACING.lg, paddingVertical:SPACING.md, fontSize:FONTS.sizes.base, color:COLORS.text },
  inputError:   { borderColor:COLORS.error },
  inputErrorText:{ fontSize:FONTS.sizes.xs, color:COLORS.error, marginTop:4 },
  card:         { backgroundColor:COLORS.bg2, borderWidth:1, borderColor:COLORS.border, borderRadius:RADIUS.lg, padding:SPACING.lg },
  badge:        { borderWidth:1, borderRadius:RADIUS.full, paddingHorizontal:10, paddingVertical:3, alignSelf:'flex-start' },
  badgeText:    { fontSize:FONTS.sizes.xs, fontWeight:'700' },
  avatar:       { alignItems:'center', justifyContent:'center' },
  avatarText:   { fontWeight:'800' },
  loader:       { flex:1, alignItems:'center', justifyContent:'center', gap:SPACING.md },
  loaderText:   { color:COLORS.muted, fontSize:FONTS.sizes.sm },
  empty:        { flex:1, alignItems:'center', justifyContent:'center', padding:SPACING.xxxl },
  emptyIcon:    { fontSize:48, marginBottom:SPACING.lg },
  emptyTitle:   { fontSize:FONTS.sizes.md, fontWeight:'700', color:COLORS.text, textAlign:'center', marginBottom:SPACING.sm },
  emptySub:     { fontSize:FONTS.sizes.sm, color:COLORS.muted, textAlign:'center', lineHeight:20 },
})
