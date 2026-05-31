// ─── BOOKING CONFIRMED SCREEN ─────────────────────────────────────────────────
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'

export default function BookingConfirmedScreen({ navigation, route }) {
  const { booking, appConfig } = route.params
  const scale = new Animated.Value(0)

  useEffect(() => {
    Animated.spring(scale, { toValue:1, tension:50, friction:6, useNativeDriver:true }).start()
  }, [])

  const isGPS = appConfig.id === 'PETCARE' || appConfig.id === 'QUICKFIX'

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: COLORS.bg }}>
      <View style={styles.container}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.iconWrap, { transform:[{scale}] }]}>
          <Text style={styles.iconText}>✅</Text>
        </Animated.View>

        <Text style={styles.title}>¡Reserva confirmada!</Text>
        <Text style={styles.sub}>
          Tu profesional fue notificado. Recibirás un mensaje de confirmación.
        </Text>

        {/* Booking details */}
        <Card style={styles.card}>
          <Row label="Servicio"     value={booking.service?.name}/>
          <Row label="Profesional"  value={`${booking.expert?.user?.firstName} ${booking.expert?.user?.lastName}`}/>
          <Row label="Fecha y hora" value={new Date(booking.scheduledAt).toLocaleString('es-CO', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}/>
          <Row label="Estado"       value="✅ Confirmado" success/>
        </Card>

        {/* GPS tip */}
        {isGPS && (
          <View style={[styles.tip, { borderColor: appConfig.primary+'44', backgroundColor: appConfig.primary+'12' }]}>
            <Text style={styles.tipIcon}>{appConfig.id==='PETCARE' ? '📍' : '🗺️'}</Text>
            <Text style={[styles.tipText, { color: appConfig.primary }]}>
              {appConfig.id==='PETCARE'
                ? 'Podrás seguir el paseo de tu mascota en tiempo real con GPS desde esta app.'
                : 'Podrás ver en el mapa cuándo llega el técnico a tu domicilio.'}
            </Text>
          </View>
        )}

        <Button
          title="Ver mis reservas"
          onPress={() => navigation.navigate('MyBookings')}
          color={appConfig.primary}
          style={{ marginBottom: SPACING.md }}
        />
        <Button
          title="Volver al inicio"
          onPress={() => navigation.navigate('Home')}
          variant="ghost"
        />
      </View>
    </SafeAreaView>
  )
}

function Row({ label, value, success }) {
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
      <Text style={{ fontSize:FONTS.sizes.sm, color:COLORS.muted }}>{label}</Text>
      <Text style={{ fontSize:FONTS.sizes.sm, fontWeight:'700', color: success ? COLORS.success : COLORS.text }}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:SPACING.xl },
  iconWrap:  { width:90, height:90, borderRadius:45, backgroundColor:'rgba(34,197,94,0.15)', alignItems:'center', justifyContent:'center', marginBottom:SPACING.xl, borderWidth:2, borderColor:'rgba(34,197,94,0.3)' },
  iconText:  { fontSize:36 },
  title:     { fontSize:FONTS.sizes.xxl, fontWeight:'800', color:COLORS.text, textAlign:'center', marginBottom:SPACING.sm },
  sub:       { fontSize:FONTS.sizes.sm, color:COLORS.muted, textAlign:'center', lineHeight:22, marginBottom:SPACING.xl },
  card:      { width:'100%', marginBottom:SPACING.xl },
  tip:       { width:'100%', flexDirection:'row', gap:SPACING.md, borderWidth:1, borderRadius:RADIUS.lg, padding:SPACING.lg, marginBottom:SPACING.xl, alignItems:'flex-start' },
  tipIcon:   { fontSize:22, flexShrink:0 },
  tipText:   { fontSize:FONTS.sizes.sm, fontWeight:'600', flex:1, lineHeight:20 },
})
