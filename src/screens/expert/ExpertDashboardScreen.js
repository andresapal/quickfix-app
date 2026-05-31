// ─── DASHBOARD DEL EXPERTO (MÓVIL) ───────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, StatusPill, Badge, Loader, EmptyState } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import { api } from '../../api/client.js'

export default function ExpertDashboardScreen({ navigation, route }) {
  const appConfig = route.params?.appConfig || { primary:'#1B5EF7', icon:'🔧', name:'QuickFix' }
  const [stats, setStats]         = useState(null)
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setTab]       = useState('today')

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [statsData, bookingsData] = await Promise.all([
        api.get('/bookings/expert/stats'),
        api.get(`/bookings/expert?${activeTab==='today' ? `date=${today}` : 'status=PENDING'}`)
      ])
      setStats(statsData)
      setBookings(bookingsData.bookings || [])
    } catch (e) { console.log(e.message) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [activeTab])

  const handleAction = async (bookingId, action) => {
    try {
      await api.put(`/bookings/${bookingId}/${action}`, {})
      load()
    } catch (e) {
      Alert.alert('Error', e.message)
    }
  }

  if (loading) return <Loader message="Cargando dashboard..."/>

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:COLORS.bg }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>load(true)} tintColor={appConfig.primary}/>}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: appConfig.primary+'18' }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>{appConfig.icon} {appConfig.name} Pro</Text>
              <Text style={styles.headerSub}>Panel del experto</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExpertProfile', { appConfig })}
              style={[styles.profileBtn, { backgroundColor: appConfig.primary }]}
            >
              <Text style={{ color:COLORS.white, fontSize:FONTS.sizes.sm, fontWeight:'700' }}>Mi perfil</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          {stats && (
            <View style={styles.statsRow}>
              <StatBox icon="✅" value={stats.completed}     label="Completados" color={COLORS.success}/>
              <StatBox icon="⏳" value={stats.pending}       label="Pendientes"  color={COLORS.warning}/>
              <StatBox icon="💰" value={`$${stats.totalRevenue?.toFixed(0)||0}`} label="Ingresos" color={appConfig.primary}/>
              <StatBox icon="📊" value={stats.total}         label="Total"       color={COLORS.muted}/>
            </View>
          )}
        </View>

        <View style={{ padding:SPACING.xl }}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {[{k:'today',l:'Hoy'},{k:'pending',l:'Pendientes'},{k:'all',l:'Todas'}].map(t => (
              <TouchableOpacity
                key={t.k}
                onPress={() => setTab(t.k)}
                style={[styles.tabBtn, activeTab===t.k && { backgroundColor:appConfig.primary }]}
              >
                <Text style={[styles.tabText, activeTab===t.k && { color:COLORS.white }]}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bookings */}
          <Text style={styles.sectionTitle}>
            {activeTab==='today' ? "Reservas de hoy" : activeTab==='pending' ? "Pendientes de confirmar" : "Todas las reservas"}
            {' '}({bookings.length})
          </Text>

          {bookings.length === 0
            ? <EmptyState icon="📅" title="Sin reservas" subtitle={activeTab==='today' ? "No tienes reservas para hoy" : "No hay reservas en esta categoría"}/>
            : bookings.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                appConfig={appConfig}
                onConfirm={() => handleAction(b.id, 'confirm')}
                onComplete={() => handleAction(b.id, 'complete')}
              />
            ))
          }

          {/* Quick actions */}
          <Text style={[styles.sectionTitle, { marginTop:SPACING.xxl }]}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon:'📅', label:'Mi disponibilidad',  onPress:() => navigation.navigate('Availability', { appConfig }) },
              { icon:'💳', label:'Mis ingresos',        onPress:() => navigation.navigate('Earnings', { appConfig }) },
              { icon:'⭐', label:'Mis reseñas',          onPress:() => navigation.navigate('MyReviews', { appConfig }) },
              { icon:'⬆️', label:'Subir de plan',        onPress:() => navigation.navigate('Plans', { appConfig }) },
            ].map((a,i) => (
              <TouchableOpacity key={i} onPress={a.onPress} style={styles.actionBtn}>
                <Text style={{ fontSize:22 }}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function StatBox({ icon, value, label, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={{ fontSize:16 }}>{icon}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function BookingCard({ booking, appConfig, onConfirm, onComplete }) {
  const clientName = `${booking.client?.firstName||''} ${booking.client?.lastName||''}`.trim()
  const time = new Date(booking.scheduledAt).toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })
  const date = new Date(booking.scheduledAt).toLocaleDateString('es-CO', { day:'numeric', month:'short' })

  return (
    <Card style={{ marginBottom:SPACING.md }}>
      <View style={styles.bookingTop}>
        <View style={{ flex:1 }}>
          <Text style={styles.bookingClient}>{clientName}</Text>
          <Text style={styles.bookingService}>{booking.service?.name}</Text>
          <Text style={styles.bookingTime}>📅 {date} · ⏰ {time}</Text>
        </View>
        <View style={{ alignItems:'flex-end', gap:6 }}>
          <StatusPill status={booking.status}/>
          <Text style={[styles.bookingPrice, { color:appConfig.primary }]}>${booking.total}</Text>
        </View>
      </View>
      {booking.address && <Text style={styles.bookingAddress}>📍 {booking.address}</Text>}

      {/* Action buttons based on status */}
      {booking.status === 'PENDING' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity onPress={onConfirm} style={[styles.actionPill, { backgroundColor:COLORS.success+'22', borderColor:COLORS.success+'44' }]}>
            <Text style={{ color:COLORS.success, fontWeight:'700', fontSize:FONTS.sizes.sm }}>✓ Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionPill, { backgroundColor:COLORS.error+'22', borderColor:COLORS.error+'44' }]}>
            <Text style={{ color:COLORS.error, fontWeight:'700', fontSize:FONTS.sizes.sm }}>✗ Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
      {booking.status === 'CONFIRMED' && (
        <TouchableOpacity onPress={onComplete} style={[styles.actionPill, { backgroundColor:appConfig.primary+'22', borderColor:appConfig.primary+'44', marginTop:SPACING.sm }]}>
          <Text style={{ color:appConfig.primary, fontWeight:'700', fontSize:FONTS.sizes.sm }}>✅ Marcar como completado</Text>
        </TouchableOpacity>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  header:       { padding:SPACING.xl, paddingBottom:SPACING.lg },
  headerTop:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:SPACING.lg },
  headerTitle:  { fontSize:FONTS.sizes.lg, fontWeight:'800', color:COLORS.text },
  headerSub:    { fontSize:FONTS.sizes.sm, color:COLORS.muted, marginTop:2 },
  profileBtn:   { paddingHorizontal:SPACING.md, paddingVertical:8, borderRadius:RADIUS.full },
  statsRow:     { flexDirection:'row', gap:SPACING.sm },
  statBox:      { flex:1, backgroundColor:COLORS.bg2, borderRadius:RADIUS.md, padding:SPACING.md, alignItems:'center', gap:4 },
  statVal:      { fontSize:FONTS.sizes.md, fontWeight:'800' },
  statLabel:    { fontSize:9, color:COLORS.muted, fontWeight:'600', textAlign:'center' },
  tabs:         { flexDirection:'row', backgroundColor:COLORS.bg3, borderRadius:RADIUS.md, padding:3, marginBottom:SPACING.lg },
  tabBtn:       { flex:1, paddingVertical:9, borderRadius:RADIUS.sm, alignItems:'center' },
  tabText:      { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.muted },
  sectionTitle: { fontSize:FONTS.sizes.base, fontWeight:'800', color:COLORS.text, marginBottom:SPACING.md },
  bookingTop:   { flexDirection:'row', marginBottom:SPACING.sm },
  bookingClient:{ fontSize:FONTS.sizes.base, fontWeight:'800', color:COLORS.text },
  bookingService:{ fontSize:FONTS.sizes.sm, color:COLORS.muted, marginTop:2 },
  bookingTime:  { fontSize:FONTS.sizes.xs, color:COLORS.muted, marginTop:4 },
  bookingPrice: { fontSize:FONTS.sizes.base, fontWeight:'800' },
  bookingAddress:{ fontSize:FONTS.sizes.xs, color:COLORS.muted, marginBottom:SPACING.sm },
  bookingActions:{ flexDirection:'row', gap:8, marginTop:SPACING.sm },
  actionPill:   { flex:1, paddingVertical:8, borderRadius:RADIUS.md, borderWidth:1, alignItems:'center' },
  actionsGrid:  { display:'flex', flexDirection:'row', flexWrap:'wrap', gap:SPACING.md },
  actionBtn:    { width:'47%', backgroundColor:COLORS.bg2, borderWidth:1, borderColor:COLORS.border, borderRadius:RADIUS.lg, padding:SPACING.lg, alignItems:'center', gap:8 },
  actionLabel:  { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.text, textAlign:'center' },
})
