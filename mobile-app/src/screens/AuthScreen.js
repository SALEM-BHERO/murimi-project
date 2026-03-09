import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Animated
} from 'react-native';
import { useApp } from '../context/AppContext';
import { loginUser, registerUser } from '../services/api';
import { t } from '../utils/i18n';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AuthScreen = ({ navigation }) => {
  const { login, language } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const toggleAuthMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('Missing Fields', 'Please enter phone number and password.');
      return;
    }
    if (!isLogin && !fullName) {
      Alert.alert('Missing Fields', 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await loginUser(phoneNumber, password);
        await login(data.token, data.user);
      } else {
        await registerUser(phoneNumber, fullName, password);
        const data = await loginUser(phoneNumber, password);
        await login(data.token, data.user);
      }
      navigation.replace('Dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo mode — skip auth for testing without backend
  const handleDemoLogin = async () => {
    await login('demo-token', { id: 'demo-user', full_name: 'Demo Farmer', phone_number: '+263 77 123 4567' });
    navigation.replace('Dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo Section - Modernized */}
        <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>Murimi</Text>
          <Text style={styles.tagline}>{t('ai_powered', language) || 'AI-Powered Crop Management'}</Text>
        </Animated.View>

        {/* Form Card - Glassmorphism Applied */}
        <Animated.View style={[styles.glassFormCard, { opacity: fadeAnim }]}>
          <Text style={styles.formTitle}>{isLogin ? t('welcome_back', language) : t('create_account', language)}</Text>
          <Text style={styles.formSubtitle}>
            {isLogin ? t('sign_in_msg', language) : t('join_msg', language)}
          </Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('full_name', language)}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('phone_number', language)}</Text>
            <TextInput
              style={styles.input}
              placeholder="+263 77 123 4567"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password', language)}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? t('sign_in', language) : t('create_account', language)}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isLogin ? t('dont_have_account', language) : t('already_have_account', language)}
              {' '}<Text style={styles.toggleTextBold}>{isLogin ? t('sign_up', language) : t('sign_in', language)}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Demo Login - Modernized */}
        <TouchableOpacity onPress={handleDemoLogin} style={styles.demoButton} activeOpacity={0.7}>
          <Text style={styles.demoButtonText}>🚜 {t('demo_mode', language)}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f6' // Match dashboard background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2c5926',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  logoEmoji: {
    fontSize: 44
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#2c5926',
    letterSpacing: -1
  },
  tagline: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
    letterSpacing: 0.2,
    fontWeight: '500'
  },
  glassFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
    letterSpacing: -0.5
  },
  formSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 28
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500'
  },
  submitButton: {
    backgroundColor: '#2c5926',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center'
  },
  toggleText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500'
  },
  toggleTextBold: {
    color: '#2c5926',
    fontWeight: '800'
  },
  demoButton: {
    marginTop: 32,
    padding: 16,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 89, 38, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(44, 89, 38, 0.02)'
  },
  demoButtonText: {
    color: '#2c5926',
    fontSize: 15,
    fontWeight: '700'
  }
});

export default AuthScreen;

