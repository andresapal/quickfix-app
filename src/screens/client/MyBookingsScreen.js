// ─── MIS RESERVAS (CLIENTE) ───────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, StatusPill, Loader, EmptyState } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import { api } from '../../api/client.js'

const STATUS_FILTERS = [
  { key:'all',         label:'Todas' },
  { key:'PENDING',     label:'Pendientes' },
  { key:'CONFIRMED',   label:'Confirmadas' },
  { key:'COMPLETED',   label:'Completadas' },
  { key:'CANCELLED',   label:'Canceladas' },
]

export default function MyBookingsScreen({ navigation, route }) {
  const appConfig = route.params?.appConfig || { primary:'#1B5EF7', id:'QUICKFIX' }
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setFilter] = useState('all')

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const params = activeFilter !== 'all' ? `?status=${activeFilter}` : ''
      const data = await api.get(`/bookings/my${params}`)
      setBookings(data.bookings || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [activeFilter])

  if (loading) return <Loader message="Cargando reservas..."/>

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
      </View>

      {/* Status filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_FILTERS}
        keyExtractor={i => i.key}
        contentContainerStyle={styles.filtersRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item.key)}
            style={[styles.filterPill, activeFilter===item.key && { backgroundColor:appConfig.primary, borderColor:appConfig.primary }]}
          >
            <Text style={[styles.filterText, activeFilter===item.key && { color:COLORS.white }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={bookings}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding:SPACING.xl, gap:SPACING.md, paddingBottom:SPACING.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>load(true)} tintColor={appConfig.primary}/>}
        ListEmptyComponent={<EmptyState icon="📅" title="No hay reservas" subtitle="Aquí aparecerán tus reservas cuando contrates un servicio"/>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { booking:item, appConfig })} activeOpacity={0.85}>
            <Card>
              <View style={styles.cardTop}>
                <View style={[styles.cardIcon, { backgroundColor:appConfig.primary+'22' }]}>
                  <Text style={{ fontSize:20 }}>{appConfig.icon}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={styles.cardService}>{item.service?.name}</Text>
                  <Text style={styles.cardExpert}>{item.expert?.user?.firstName} {item.expert?.user?.lastName}</Text>
                </View>
                <StatusPill status={item.status}/>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  📅 {new Date(item.scheduledAt).toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </Text>
                <Text style={[styles.cardPrice, { color:appConfig.primary }]}>${item.total}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header:      { paddingHorizontal:SPACING.xl, paddingVertical:SPACING.md },
  title:       { fontSize:FONTS.sizes.xl, fontWeight:'800', color:COLORS.text },
  filtersRow:  { paddingHorizontal:SPACING.xl, paddingBottom:SPACING.md, gap:8 },
  filterPill:  { paddingHorizontal:SPACING.lg, paddingVertical:8, borderRadius:RADIUS.full, borderWidth:1, borderColor:COLORS.border2, backgroundColor:COLORS.bg2 },
  filterText:  { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.muted },
  cardTop:     { flexDirection:'row', alignItems:'center', gap:SPACING.md, marginBottom:SPACING.md },
  cardIcon:    { width:44, height:44, borderRadius:RADIUS.md, alignItems:'center', justifyContent:'center' },
  cardService: { fontSize:FONTS.sizes.base, fontWeight:'700', color:COLORS.text },
  cardExpert:  { fontSize:FONTS.sizes.sm, color:COLORS.muted, marginTop:2 },
  cardFooter:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderTopWidth:1, borderTopColor:COLORS.border, paddingTop:SPACING.md },
  cardDate:    { fontSize:FONTS.sizes.sm, color:COLORS.muted },
  cardPrice:   { fontSize:FONTS.sizes.base, fontWeight:'800' },
})
