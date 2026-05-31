// ─── CHECKOUT + PAGO SCREEN ───────────────────────────────────────────────────
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import { api } from '../../api/client.js'

const PAYMENT_METHODS = {
  CO: [
    { id:'payu_pse',    icon:'🏦', label:'PSE — Pago en línea',    sub:'Bancolombia, Davivienda, BBVA' },
    { id:'payu_card',   icon:'💳', label:'Tarjeta débito/crédito', sub:'Visa, Mastercard, Amex' },
    { id:'nequi',       icon:'📱', label:'Nequi / Daviplata',      sub:'Pago desde tu app' },
  ],
  US: [
    { id:'stripe_card', icon:'💳', label:'Credit / Debit card',    sub:'Visa, Mastercard, Amex' },
    { id:'apple_pay',   icon:'', label:'Apple Pay',               sub:'Touch ID or Face ID' },
    { id:'google_pay',  icon:'', label:'Google Pay',              sub:'Pay with Google' },
  ]
}

export default function BookingCheckoutScreen({ navigation, route }) {
  const { booking, appConfig } = route.params
  const [selectedMethod, setMethod] = useState(null)
  const [loading, setLoading]       = useState(false)

  const country = booking.client?.country || 'CO'
  const methods = PAYMENT_METHODS[country] || PAYMENT_METHODS.CO

  const serviceFee = (booking.subtotal * 0.05).toFixed(2)
  const total = (parseFloat(booking.subtotal) + parseFloat(serviceFee)).toFixed(2)

  const handlePay = async () => {
    if (!selectedMethod) { Alert.alert('Elige un método de pago'); return }
    setLoading(true)
    try {
      if (selectedMethod.startsWith('stripe')) {
        // Stripe flow
        const { clientSecret } = await api.post(`/payments/stripe/intent/${booking.id}`, {})
        // En producción: usar @stripe/stripe-react-native para presentar el sheet
        Alert.alert(
          '💳 Pago con Stripe',
          `Client Secret listo. Integra @stripe/stripe-react-native para el flujo completo.\n\nID: ${booking.id}`,
          [{ text: 'Simular pago exitoso', onPress: () => navigation.navigate('BookingConfirmed', { booking, appConfig }) }]
        )
      } else {
        // PayU flow
        const formData = await api.post(`/payments/payu/form/${booking.id}`, {})
        // Abrir PayU en el navegador
        const payuUrl = `https://checkout.payulatam.com/ppp-web-gateway-payu/?${new URLSearchParams(formData).toString()}`
        await Linking.openURL(payuUrl)
        navigation.navigate('BookingConfirmed', { booking, appConfig })
      }
    } catch (e) {
      Alert.alert('Error en el pago', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Confirmar y pagar</Text>

        {/* Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <SummaryRow label="Servicio" value={booking.service?.name}/>
          <SummaryRow label="Profesional" value={`${booking.expert?.user?.firstName} ${booking.expert?.user?.lastName}`}/>
          <SummaryRow label="Fecha" value={new Date(booking.scheduledAt).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}/>
          <SummaryRow label="Hora" value={new Date(booking.scheduledAt).toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })}/>
          <View style={styles.divider}/>
          <SummaryRow label="Subtotal" value={`$${booking.subtotal}`}/>
          <SummaryRow label="Cargo de servicio (5%)" value={`$${serviceFee}`}/>
          <View style={styles.divider}/>
          <SummaryRow label="Total" value={`$${total}`} bold primary={appConfig.primary}/>
        </Card>

        {/* Payment Methods */}
        <Text style={[styles.sectionTitle, { paddingHorizontal:0, marginTop:SPACING.xl }]}>Método de pago</Text>
        {methods.map(m => (
          <TouchableOpacity
            key={m.id}
            onPress={() => setMethod(m.id)}
            style={[styles.methodRow, selectedMethod===m.id && { borderColor: appConfig.primary, backgroundColor: appConfig.primary+'18' }]}
          >
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <View style={{ flex:1 }}>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
            </View>
            <View style={[styles.radio, selectedMethod===m.id && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}>
              {selectedMethod===m.id && <View style={styles.radioDot}/>}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.secureBadge}>
          <Text style={styles.secureText}>🔒 Pago 100% seguro · Solo cobraremos al finalizar el servicio</Text>
        </View>

        <Button
          title={loading ? 'Procesando...' : `Pagar $${total}`}
          onPress={handlePay}
          loading={loading}
          color={appConfig.primary}
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function SummaryRow({ label, value, bold, primary }) {
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:7 }}>
      <Text style={{ fontSize:FONTS.sizes.sm, color:COLORS.muted, fontWeight: bold?'800':'400' }}>{label}</Text>
      <Text style={{ fontSize:bold?FONTS.sizes.md:FONTS.sizes.sm, fontWeight: bold?'800':'700', color: primary||COLORS.text }}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll:       { padding:SPACING.xl, paddingBottom:SPACING.xxxl },
  back:         { marginBottom:SPACING.lg },
  backText:     { color:COLORS.muted, fontSize:FONTS.sizes.sm, fontWeight:'600' },
  title:        { fontSize:FONTS.sizes.xl, fontWeight:'800', color:COLORS.text, marginBottom:SPACING.xl },
  section:      { marginBottom:SPACING.xl },
  sectionTitle: { fontSize:FONTS.sizes.base, fontWeight:'800', color:COLORS.text, marginBottom:SPACING.md },
  divider:      { height:1, backgroundColor:COLORS.border, marginVertical:SPACING.sm },
  methodRow:    { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.bg2, borderWidth:1.5, borderColor:COLORS.border, borderRadius:RADIUS.lg, padding:SPACING.lg, marginBottom:SPACING.sm, gap:SPACING.md },
  methodIcon:   { fontSize:22, width:28, textAlign:'center' },
  methodLabel:  { fontSize:FONTS.sizes.base, fontWeight:'700', color:COLORS.text },
  methodSub:    { fontSize:FONTS.sizes.xs, color:COLORS.muted, marginTop:2 },
  radio:        { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:COLORS.border2, alignItems:'center', justifyContent:'center' },
  radioDot:     { width:8, height:8, borderRadius:4, backgroundColor:COLORS.white },
  secureBadge:  { backgroundColor:COLORS.bg3, borderRadius:RADIUS.md, padding:SPACING.md, marginTop:SPACING.md },
  secureText:   { fontSize:FONTS.sizes.xs, color:COLORS.muted, textAlign:'center', lineHeight:18 },
})
