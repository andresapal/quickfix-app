// ─── EXPERT DETAIL + BOOKING SCREEN ──────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card, Stars, Badge, Loader } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import { api } from '../../api/client.js'

export default function ExpertDetailScreen({ navigation, route }) {
  const { expertId, appConfig } = route.params
  const [expert, setExpert]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [selectedService, setService] = useState(null)
  const [selectedDate, setDate]     = useState(null)
  const [selectedTime, setTime]     = useState(null)
  const [slots, setSlots]           = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [step, setStep]             = useState(1) // 1=info, 2=schedule, 3=confirm

  useEffect(() => {
    api.get(`/experts/${expertId}`)
      .then(data => { setExpert(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [expertId])

  useEffect(() => {
    if (!selectedDate || !expertId) return
    setSlotsLoading(true)
    const dateStr = selectedDate.toISOString().split('T')[0]
    api.get(`/experts/${expertId}/slots?date=${dateStr}`)
      .then(data => setSlots(data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate])

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Faltan datos', 'Selecciona servicio, fecha y hora')
      return
    }
    try {
      const dateTime = new Date(selectedDate)
      const [h, m] = selectedTime.split(':')
      dateTime.setHours(parseInt(h), parseInt(m), 0, 0)
      const booking = await api.post('/bookings', {
        expertId,
        serviceId: selectedService.id,
        scheduledAt: dateTime.toISOString()
      })
      navigation.navigate('BookingCheckout', { booking, appConfig })
    } catch (e) {
      Alert.alert('Error', e.message)
    }
  }

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  if (loading) return <Loader message="Cargando perfil..."/>
  if (!expert) return null

  const name = `${expert.user?.firstName || ''} ${expert.user?.lastName || ''}`.trim()

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: appConfig.primary + '18' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: appConfig.primary + '33' }]}>
              <Text style={styles.avatarIcon}>{appConfig.icon}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={styles.expertName}>{name}</Text>
              <Text style={styles.expertSpec}>{expert.specialty}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:6 }}>
                <Stars rating={expert.rating} size={14}/>
                <Text style={styles.ratingText}>{expert.rating?.toFixed(1)} · {expert.totalReviews} reseñas</Text>
              </View>
            </View>
            <View style={{ alignItems:'flex-end', gap:6 }}>
              <Badge label={`${expert.yearsExperience} años`} color={appConfig.primary}/>
              <View style={styles.availRow}>
                <View style={[styles.dot, { backgroundColor: expert.isAvailable ? COLORS.success : COLORS.error }]}/>
                <Text style={styles.availText}>{expert.isAvailable ? 'Disponible' : 'Ocupado'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Steps indicator */}
          <View style={styles.steps}>
            {['Servicio','Fecha','Confirmar'].map((s,i) => (
              <React.Fragment key={s}>
                <View style={[styles.stepCircle, (step>i+1||step===i+1) && { backgroundColor: appConfig.primary }]}>
                  <Text style={[styles.stepNum, (step>i+1||step===i+1) && { color: COLORS.white }]}>{i+1}</Text>
                </View>
                {i<2 && <View style={[styles.stepLine, step>i+1 && { backgroundColor: appConfig.primary }]}/>}
              </React.Fragment>
            ))}
          </View>

          {/* STEP 1: Seleccionar servicio */}
          {step === 1 && (
            <>
              <Text style={styles.sectionTitle}>Elige el servicio</Text>
              {(expert.services || []).map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setService(s)}
                  style={[styles.serviceOpt, selectedService?.id===s.id && { borderColor: appConfig.primary, backgroundColor: appConfig.primary+'18' }]}
                >
                  <View style={{ flex:1 }}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.serviceDur}>⏱ {s.duration} min</Text>
                  </View>
                  <View style={{ alignItems:'flex-end', gap:6 }}>
                    <Text style={[styles.servicePrice, { color: appConfig.primary }]}>${s.price}</Text>
                    <View style={[styles.radio, selectedService?.id===s.id && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}>
                      {selectedService?.id===s.id && <View style={styles.radioDot}/>}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <Button
                title="Continuar →"
                onPress={() => selectedService && setStep(2)}
                disabled={!selectedService}
                color={appConfig.primary}
                style={{ marginTop: SPACING.md }}
              />
            </>
          )}

          {/* STEP 2: Fecha y hora */}
          {step === 2 && (
            <>
              <Text style={styles.sectionTitle}>Elige la fecha</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:SPACING.xl }}>
                {dates.map((d,i) => {
                  const isSelected = selectedDate?.toDateString() === d.toDateString()
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => { setDate(d); setTime(null) }}
                      style={[styles.dateBtn, isSelected && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}
                    >
                      <Text style={[styles.dateName, isSelected && { color: COLORS.white }]}>{dayNames[d.getDay()]}</Text>
                      <Text style={[styles.dateNum, isSelected && { color: COLORS.white }]}>{d.getDate()}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              {selectedDate && (
                <>
                  <Text style={styles.sectionTitle}>Elige la hora</Text>
                  {slotsLoading
                    ? <Loader/>
                    : <View style={styles.timeGrid}>
                        {slots.map((slot,i) => (
                          <TouchableOpacity
                            key={i}
                            disabled={!slot.available}
                            onPress={() => setTime(slot.time)}
                            style={[
                              styles.timeSlot,
                              !slot.available && { opacity:0.3 },
                              selectedTime===slot.time && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }
                            ]}
                          >
                            <Text style={[styles.timeText, selectedTime===slot.time && { color: COLORS.white }]}>{slot.time}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                  }
                </>
              )}

              <View style={{ flexDirection:'row', gap:10, marginTop:SPACING.md }}>
                <Button title="← Atrás" onPress={() => setStep(1)} variant="ghost" style={{ flex:1 }}/>
                <Button title="Continuar →" onPress={() => selectedDate && selectedTime && setStep(3)} disabled={!selectedDate||!selectedTime} color={appConfig.primary} style={{ flex:1 }}/>
              </View>
            </>
          )}

          {/* STEP 3: Confirmación */}
          {step === 3 && (
            <>
              <Text style={styles.sectionTitle}>Resumen de tu reserva</Text>
              <Card style={{ marginBottom: SPACING.lg }}>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Profesional</Text><Text style={styles.summaryVal}>{name}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Servicio</Text><Text style={styles.summaryVal}>{selectedService?.name}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Duración</Text><Text style={styles.summaryVal}>{selectedService?.duration} min</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Fecha</Text><Text style={styles.summaryVal}>{selectedDate?.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Hora</Text><Text style={styles.summaryVal}>{selectedTime}</Text></View>
                <View style={[styles.summaryRow, { borderBottomWidth:0, paddingTop:SPACING.md }]}>
                  <Text style={[styles.summaryLabel, { fontWeight:'800', color:COLORS.text }]}>Total</Text>
                  <Text style={[styles.summaryVal, { color: appConfig.primary, fontSize:FONTS.sizes.lg, fontWeight:'800' }]}>${selectedService?.price}</Text>
                </View>
              </Card>
              <View style={{ flexDirection:'row', gap:10 }}>
                <Button title="← Atrás" onPress={() => setStep(2)} variant="ghost" style={{ flex:1 }}/>
                <Button title="Reservar y pagar" onPress={handleBook} color={appConfig.primary} style={{ flex:1 }}/>
              </View>
            </>
          )}

          {/* Reviews section */}
          {step === 1 && (expert.reviews || []).length > 0 && (
            <View style={{ marginTop: SPACING.xxl }}>
              <Text style={styles.sectionTitle}>Reseñas ({expert.reviews.length})</Text>
              {expert.reviews.slice(0,3).map(r => (
                <Card key={r.id} style={{ marginBottom: SPACING.md }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 }}>
                    <Text style={styles.reviewName}>{r.client?.firstName}</Text>
                    <Stars rating={r.rating} size={12}/>
                  </View>
                  <Text style={styles.reviewText}>{r.comment}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxxl }}/>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  headerCard:  { padding:SPACING.xl, paddingTop:SPACING.md },
  backBtn:     { marginBottom:SPACING.lg },
  backText:    { color:COLORS.muted, fontSize:FONTS.sizes.sm, fontWeight:'600' },
  profileRow:  { flexDirection:'row', gap:SPACING.md },
  avatar:      { width:60, height:60, borderRadius:RADIUS.lg, alignItems:'center', justifyContent:'center' },
  avatarIcon:  { fontSize:26 },
  expertName:  { fontSize:FONTS.sizes.md, fontWeight:'800', color:COLORS.text },
  expertSpec:  { fontSize:FONTS.sizes.sm, color:COLORS.muted, marginTop:2 },
  ratingText:  { fontSize:FONTS.sizes.xs, color:COLORS.muted },
  availRow:    { flexDirection:'row', alignItems:'center', gap:4 },
  dot:         { width:7, height:7, borderRadius:4 },
  availText:   { fontSize:FONTS.sizes.xs, color:COLORS.muted, fontWeight:'600' },
  content:     { padding:SPACING.xl },
  steps:       { flexDirection:'row', alignItems:'center', marginBottom:SPACING.xxl },
  stepCircle:  { width:28, height:28, borderRadius:14, backgroundColor:COLORS.bg3, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:COLORS.border },
  stepNum:     { fontSize:FONTS.sizes.sm, fontWeight:'800', color:COLORS.muted },
  stepLine:    { flex:1, height:1, backgroundColor:COLORS.border },
  sectionTitle:{ fontSize:FONTS.sizes.base, fontWeight:'800', color:COLORS.text, marginBottom:SPACING.md },
  serviceOpt:  { backgroundColor:COLORS.bg2, borderWidth:1.5, borderColor:COLORS.border, borderRadius:RADIUS.lg, padding:SPACING.lg, flexDirection:'row', alignItems:'center', marginBottom:SPACING.sm },
  serviceName: { fontSize:FONTS.sizes.base, fontWeight:'700', color:COLORS.text },
  serviceDur:  { fontSize:FONTS.sizes.xs, color:COLORS.muted, marginTop:2 },
  servicePrice:{ fontSize:FONTS.sizes.md, fontWeight:'800' },
  radio:       { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:COLORS.border2, alignItems:'center', justifyContent:'center' },
  radioDot:    { width:8, height:8, borderRadius:4, backgroundColor:COLORS.white },
  dateBtn:     { alignItems:'center', justifyContent:'center', width:56, height:72, borderRadius:RADIUS.lg, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.bg2, marginRight:8 },
  dateName:    { fontSize:FONTS.sizes.xs, fontWeight:'700', color:COLORS.muted },
  dateNum:     { fontSize:FONTS.sizes.lg, fontWeight:'800', color:COLORS.text },
  timeGrid:    { flexDirection:'row', flexWrap:'wrap', gap:8 },
  timeSlot:    { width:'22%', paddingVertical:10, borderRadius:RADIUS.md, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.bg2, alignItems:'center' },
  timeText:    { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.text },
  summaryRow:  { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:COLORS.border },
  summaryLabel:{ fontSize:FONTS.sizes.sm, color:COLORS.muted },
  summaryVal:  { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.text },
  reviewName:  { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.text },
  reviewText:  { fontSize:FONTS.sizes.sm, color:COLORS.muted, lineHeight:20 },
})
