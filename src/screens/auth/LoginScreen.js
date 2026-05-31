// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
import React, { useState, useContext } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Input } from '../../components/ui/index.js'
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/index.js'
import AuthContext from '../../context/AuthContext.js'

export default function LoginScreen({ navigation, route }) {
  const { login } = useContext(AuthContext)
  const appConfig = route.params?.appConfig || { primary:'#1B5EF7', icon:'🔧', name:'QuickFix' }

  const [tab, setTab]         = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleLogin = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError(null)
    try {
      await login({ email, password })
      // Navegación manejada por AuthContext
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={[styles.logoIcon, { backgroundColor: appConfig.primary }]}>
              <Text style={styles.logoEmoji}>{appConfig.icon}</Text>
            </View>
            <Text style={styles.logoName}>{appConfig.name}</Text>
            <Text style={styles.logoSub}>
              {tab==='login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['login','register'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => { setTab(t); setError(null) }}
                style={[styles.tabBtn, tab===t && { backgroundColor: appConfig.primary }]}
              >
                <Text style={[styles.tabText, tab===t && { color: COLORS.white }]}>
                  {t==='login' ? 'Iniciar sesión' : 'Registrarse'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Login Form */}
          {tab==='login' && (
            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                color={appConfig.primary}
                style={{ marginTop: SPACING.sm }}
              />
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={[styles.forgotText, { color: appConfig.primary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Register Form */}
          {tab==='register' && (
            <RegisterForm
              appConfig={appConfig}
              onError={setError}
            />
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function RegisterForm({ appConfig, onError }) {
  const { register } = useContext(AuthContext)
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', role:'CLIENT', country:'CO' })
  const [loading, setLoading] = useState(false)

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleRegister = async () => {
    const { firstName, lastName, email, password } = form
    if (!firstName || !lastName || !email || !password) { onError('Completa todos los campos'); return }
    if (password.length < 8) { onError('La contraseña debe tener mínimo 8 caracteres'); return }
    setLoading(true); onError(null)
    try {
      await register({ ...form, language: 'es' })
    } catch (e) {
      onError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.form}>
      <View style={{ flexDirection:'row', gap:10 }}>
        <View style={{ flex:1 }}>
          <Input label="Nombre" value={form.firstName} onChangeText={v => update('firstName',v)} placeholder="Carlos"/>
        </View>
        <View style={{ flex:1 }}>
          <Input label="Apellido" value={form.lastName} onChangeText={v => update('lastName',v)} placeholder="Pérez"/>
        </View>
      </View>
      <Input label="Email" value={form.email} onChangeText={v => update('email',v)} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none"/>
      <Input label="Contraseña" value={form.password} onChangeText={v => update('password',v)} placeholder="Mínimo 8 caracteres" secureTextEntry/>

      <Text style={styles.inputLabel}>Soy</Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom:SPACING.md }}>
        {[{v:'CLIENT',l:'👤 Cliente'},{v:'EXPERT',l:'🏆 Experto'}].map(opt => (
          <TouchableOpacity
            key={opt.v}
            onPress={() => update('role', opt.v)}
            style={[styles.roleBtn, form.role===opt.v && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}
          >
            <Text style={[styles.roleBtnText, form.role===opt.v && { color: COLORS.white }]}>{opt.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>País</Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom:SPACING.lg }}>
        {[{v:'CO',l:'🇨🇴 Colombia'},{v:'US',l:'🇺🇸 USA'}].map(c => (
          <TouchableOpacity
            key={c.v}
            onPress={() => update('country', c.v)}
            style={[styles.roleBtn, form.country===c.v && { backgroundColor: appConfig.primary, borderColor: appConfig.primary }]}
          >
            <Text style={[styles.roleBtnText, form.country===c.v && { color: COLORS.white }]}>{c.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Crear cuenta" onPress={handleRegister} loading={loading} color={appConfig.primary}/>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:       { flex:1 },
  scroll:     { flexGrow:1, padding:SPACING.xl },
  logoWrap:   { alignItems:'center', marginTop:SPACING.xxl, marginBottom:SPACING.xxl },
  logoIcon:   { width:64, height:64, borderRadius:18, alignItems:'center', justifyContent:'center', marginBottom:SPACING.md },
  logoEmoji:  { fontSize:28 },
  logoName:   { fontSize:FONTS.sizes.xl, fontWeight:'800', color:COLORS.text, marginBottom:4 },
  logoSub:    { fontSize:FONTS.sizes.sm, color:COLORS.muted },
  tabs:       { flexDirection:'row', backgroundColor:COLORS.bg3, borderRadius:RADIUS.md, padding:3, marginBottom:SPACING.xl },
  tabBtn:     { flex:1, paddingVertical:10, borderRadius:RADIUS.sm, alignItems:'center' },
  tabText:    { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.muted },
  errorBox:   { backgroundColor:'rgba(239,68,68,0.12)', borderWidth:1, borderColor:'rgba(239,68,68,0.25)', borderRadius:RADIUS.md, padding:SPACING.md, marginBottom:SPACING.md },
  errorText:  { fontSize:FONTS.sizes.sm, color:COLORS.error },
  form:       { gap:0 },
  forgotWrap: { alignItems:'center', marginTop:SPACING.lg },
  forgotText: { fontSize:FONTS.sizes.sm, fontWeight:'600' },
  inputLabel: { fontSize:FONTS.sizes.sm, fontWeight:'600', color:COLORS.muted, marginBottom:6 },
  roleBtn:    { flex:1, paddingVertical:10, borderRadius:RADIUS.md, borderWidth:1, borderColor:COLORS.border, alignItems:'center' },
  roleBtnText:{ fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.muted },
})
