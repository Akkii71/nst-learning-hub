import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ navigation }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');

  // Handle Login
  async function handleLogin(customEmail, customPassword) {
    const emailToUse = customEmail || loginEmail;
    const pwdToUse = customPassword || loginPassword;

    if (!emailToUse.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!pwdToUse) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(emailToUse.trim(), pwdToUse);
      Alert.alert('Welcome!', 'Logged in successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Student Registration
  async function handleRegister() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      Alert.alert('Validation Error', 'Please enter your NST email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: name.trim(),
        email: regEmail.trim(),
        password: regPassword,
        studentId: studentId.trim() || undefined,
        department: department.trim(),
        year: year.trim(),
      });
      Alert.alert('Success', 'Student account registered and logged in!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not register account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isLoginTab ? 'Sign In' : 'Create Account'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Branding Banner */}
        <View style={styles.brandBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="school" size={32} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>NST Learning Hub</Text>
          <Text style={styles.brandSubtitle}>
            {isLoginTab
              ? 'Sign in to discover, submit, and review syllabus resources'
              : 'Join fellow NST students to share and discover syllabus materials'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLoginTab && styles.tabButtonActive]}
            onPress={() => setIsLoginTab(true)}
          >
            <Text style={[styles.tabText, isLoginTab && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLoginTab && styles.tabButtonActive]}
            onPress={() => setIsLoginTab(false)}
          >
            <Text style={[styles.tabText, !isLoginTab && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* SIGN IN FORM */}
        {isLoginTab ? (
          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="student@nst.edu"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textLight}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={() => handleLogin()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Logins for Instant Testing */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>— Quick Demo Logins —</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => handleLogin('student@nst.edu', 'password123')}
                  disabled={submitting}
                >
                  <Ionicons name="person" size={14} color={colors.primary} />
                  <Text style={styles.demoChipText}>Student Demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, { borderColor: '#7C3AED' }]}
                  onPress={() => handleLogin('reviewer@nst.edu', 'password123')}
                  disabled={submitting}
                >
                  <Ionicons name="shield-checkmark" size={14} color="#7C3AED" />
                  <Text style={[styles.demoChipText, { color: '#7C3AED' }]}>Reviewer Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* REGISTRATION FORM */
          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NST Email Address *</Text>
              <TextInput
                style={styles.input}
                value={regEmail}
                onChangeText={setRegEmail}
                placeholder="rahul.sharma@nst.edu"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password (min 6 characters) *</Text>
              <TextInput
                style={styles.input}
                value={regPassword}
                onChangeText={setRegPassword}
                placeholder="Create a password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Student ID (optional)</Text>
              <TextInput
                style={styles.input}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="NST2024..."
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={setDepartment}
                placeholder="Computer Science, Electronics, etc."
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Academic Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="1st Year, 2nd Year, etc."
                placeholderTextColor={colors.textLight}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Register Student Account</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.roleNote}>
              Note: New accounts are automatically registered as Students. Reviewer roles are granted by faculty administration.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  scroll: { padding: 16, paddingBottom: 32 },
  brandBox: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  roleNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
