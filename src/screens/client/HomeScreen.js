// ─── HOME SCREEN (CLIENTE) ────────────────────────────────────────────────────
import React, { useState, useEffect, useContext } from 'react'
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, Badge, Stars, Avatar, Loader, EmptyState } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import { api } from '../../api/client.js'
import AuthContext from '../../context/AuthContext.js'

export default function HomeScreen({ navigation, route }) {
  const { user } = useContext(AuthContext)
  const appConfig = route.params?.appConfig || { primary:'#1B5EF7', icon:'🔧', name:'QuickFix', id:'QUICKFIX' }

  const [experts, setExperts]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]       = useState('')
  const [activeFilter, setFilter] = useState('all')

  const filters = appConfig.id === 'QUICKFIX'
    ? ['all','Plomería','Electricidad','Cerrajería','Limpieza']
    : appConfig.id === 'MINDSPACE'
    ? ['all','Psicología','Coaching','Terapia','Meditación']
    : appConfig.id === 'EDUPRO'
    ? ['all','Matemáticas','Inglés','Música','SAT']
    : ['all','Paseos','Vet virtual','Peluquería','Guardería']

  const loadExperts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const data = await api.get(`/experts?app=${appConfig.id}&limit=20`, appConfig.id)
      setExperts(data.experts || [])
    } catch (e) {
      console.log('Error loading experts:', e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadExperts() }, [])

  const filtered = experts.filter(e => {
    const matchSearch = !search || e.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      `${e.user?.firstName} ${e.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'all' || e.specialty?.toLowerCase().includes(activeFilter.toLowerCase())
    return matchSearch && matchFilter
  })

  if (loading) return <Loader message="Cargando profesionales..."/>

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.firstName} 👋</Text>
          <Text style={styles.subtitle}>
            <Text style={{ color: appConfig.primary }}>{appConfig.icon} {appConfig.name}</Text>
            {' · '}
            <Text style={{ color: COLORS.muted }}>{experts.length} profesionales</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadExperts(true)} tintColor={appConfig.primary}/>}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { borderColor: COLORS.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={`Buscar en ${appConfig.name}...`}
              placeholderTextColor={COLORS.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterPill, activeFilter===f && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}
            >
              <Text style={[styles.filterText, activeFilter===f && { color: COLORS.white }]}>
                {f === 'all' ? 'Todos' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section label */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>⭐ Mejor calificados</Text>
          <Text style={[styles.sectionCount, { color: appConfig.primary }]}>{filtered.length} disponibles</Text>
        </View>

        {/* Expert cards */}
        {filtered.length === 0
          ? <EmptyState icon="🔍" title="No se encontraron resultados" subtitle="Prueba con otro filtro o búsqueda"/>
          : filtered.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              appConfig={appConfig}
              onPress={() => navigation.navigate('ExpertDetail', { expertId: expert.id, appConfig })}
            />
          ))
        }

        <View style={{ height: SPACING.xxxl }}/>
      </ScrollView>
    </SafeAreaView>
  )
}

function ExpertCard({ expert, appConfig, onPress }) {
  const name = `${expert.user?.firstName || ''} ${expert.user?.lastName || ''}`.trim()
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.expertCard}>
        <View style={styles.expertTop}>
          <View style={[styles.expertAvatar, { backgroundColor: appConfig.primary + '22' }]}>
            <Text style={styles.expertAvatarIcon}>{appConfig.icon}</Text>
          </View>
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{name}</Text>
            <Text style={styles.expertSpec}>{expert.specialty}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:4 }}>
              <Stars rating={expert.rating} size={12}/>
              <Text style={styles.expertRating}>{expert.rating?.toFixed(1)} ({expert.totalReviews})</Text>
            </View>
          </View>
          <View style={[styles.priceTag, { backgroundColor: appConfig.primary }]}>
            <Text style={styles.priceText}>${expert.basePrice}</Text>
          </View>
        </View>

        <View style={styles.expertTags}>
          {expert.services?.slice(0,3).map((s,i) => (
            <View key={i} style={[styles.tag, { backgroundColor: appConfig.primary + '18', borderColor: appConfig.primary + '33' }]}>
              <Text style={[styles.tagText, { color: appConfig.primary }]}>{s.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.expertFooter}>
          <View style={styles.availDot}>
            <View style={[styles.dot, { backgroundColor: expert.isAvailable ? COLORS.success : COLORS.error }]}/>
            <Text style={styles.availText}>{expert.isAvailable ? 'Disponible ahora' : 'No disponible'}</Text>
          </View>
          <Text style={[styles.bookBtn, { color: appConfig.primary }]}>Ver perfil →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe:          { flex:1 },
  header:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:SPACING.xl, paddingVertical:SPACING.md, borderBottomWidth:1 },
  greeting:      { fontSize:FONTS.sizes.lg, fontWeight:'800', color:COLORS.text },
  subtitle:      { fontSize:FONTS.sizes.sm, marginTop:2 },
  notifBtn:      { width:40, height:40, borderRadius:RADIUS.md, backgroundColor:COLORS.bg3, alignItems:'center', justifyContent:'center' },
  searchWrap:    { padding:SPACING.xl, paddingBottom:SPACING.md },
  searchBar:     { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.bg2, borderWidth:1, borderRadius:RADIUS.lg, paddingHorizontal:SPACING.md, paddingVertical:SPACING.md, gap:8 },
  searchIcon:    { fontSize:16 },
  searchInput:   { flex:1, fontSize:FONTS.sizes.base, color:COLORS.text },
  filtersScroll: { marginBottom:SPACING.md },
  filtersContent:{ paddingHorizontal:SPACING.xl, gap:8 },
  filterPill:    { paddingHorizontal:SPACING.lg, paddingVertical:8, borderRadius:RADIUS.full, borderWidth:1, borderColor:COLORS.border2, backgroundColor:COLORS.bg2 },
  filterText:    { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.muted },
  sectionRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:SPACING.xl, marginBottom:SPACING.md },
  sectionTitle:  { fontSize:FONTS.sizes.base, fontWeight:'700', color:COLORS.text },
  sectionCount:  { fontSize:FONTS.sizes.sm, fontWeight:'600' },
  expertCard:    { marginHorizontal:SPACING.xl, marginBottom:SPACING.md },
  expertTop:     { flexDirection:'row', gap:SPACING.md, marginBottom:SPACING.md },
  expertAvatar:  { width:52, height:52, borderRadius:RADIUS.md, alignItems:'center', justifyContent:'center', flexShrink:0 },
  expertAvatarIcon:{ fontSize:22 },
  expertInfo:    { flex:1 },
  expertName:    { fontSize:FONTS.sizes.base, fontWeight:'800', color:COLORS.text },
  expertSpec:    { fontSize:FONTS.sizes.sm, color:COLORS.muted, marginTop:2 },
  expertRating:  { fontSize:FONTS.sizes.xs, color:COLORS.muted },
  priceTag:      { borderRadius:RADIUS.full, paddingHorizontal:10, paddingVertical:4, alignSelf:'flex-start', flexShrink:0 },
  priceText:     { fontSize:FONTS.sizes.sm, fontWeight:'800', color:COLORS.white },
  expertTags:    { flexDirection:'row', gap:6, flexWrap:'wrap', marginBottom:SPACING.md },
  tag:           { paddingHorizontal:10, paddingVertical:3, borderRadius:RADIUS.full, borderWidth:1 },
  tagText:       { fontSize:FONTS.sizes.xs, fontWeight:'700' },
  expertFooter:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  availDot:      { flexDirection:'row', alignItems:'center', gap:6 },
  dot:           { width:7, height:7, borderRadius:4 },
  availText:     { fontSize:FONTS.sizes.xs, color:COLORS.muted, fontWeight:'600' },
  bookBtn:       { fontSize:FONTS.sizes.sm, fontWeight:'700' },
})
