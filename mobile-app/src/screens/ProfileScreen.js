import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getProfile, getDetectionHistory } from '../services/api';
import { t } from '../utils/i18n';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = ({ navigation }) => {
  const { user, setUser, logout, detectionHistory, setDetectionHistory, language } = useApp();
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfileData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileData, historyData] = await Promise.all([
        getProfile(),
        getDetectionHistory()
      ]);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (profileData) setUser(prev => ({ ...prev, ...profileData }));
      if (historyData) setDetectionHistory(historyData);
    } catch (err) {
      // Silently fail — demo mode or backend not connected
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout', language),
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  // Compute stats
  const totalScans = detectionHistory.length;
  const uniqueDiseases = [...new Set(detectionHistory.map(d => d.disease_name).filter(Boolean))];
  const uniqueCrops = [...new Set(detectionHistory.map(d => d.crop_type).filter(Boolean))];
  const mostCommonDisease = uniqueDiseases.length > 0
    ? detectionHistory.reduce((acc, d) => {
      if (d.disease_name) acc[d.disease_name] = (acc[d.disease_name] || 0) + 1;
      return acc;
    }, {})
    : {};
  const topDisease = Object.entries(mostCommonDisease).sort((a, b) => b[1] - a[1])[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-ZW', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.full_name || 'F').charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <MaterialIcons name="camera-alt" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.full_name || t('farmer', language)}</Text>
          <View style={styles.phoneBadge}>
            <MaterialIcons name="phone" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.userPhone}>{user?.phone_number || '+263 XX XXX XXXX'}</Text>
          </View>
          {user?.created_at && (
            <Text style={styles.userJoined}>{t('member_since', language)} {formatDate(user.created_at)}</Text>
          )}
        </View>

        {/* Glassmorphism Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.glassStatCard}>
            <Text style={styles.statNumber}>{totalScans}</Text>
            <Text style={styles.statLabel}>{t('total_scans', language)}</Text>
          </View>
          <View style={styles.glassStatCard}>
            <Text style={styles.statNumber}>{uniqueDiseases.length}</Text>
            <Text style={styles.statLabel}>{t('diseases_found', language)}</Text>
          </View>
          <View style={styles.glassStatCard}>
            <Text style={styles.statNumber}>{uniqueCrops.length}</Text>
            <Text style={styles.statLabel}>{t('crops_tracked', language)}</Text>
          </View>
        </View>

        {/* Premium Insight Card */}
        {topDisease && (
          <View style={styles.glassInsightCard}>
            <View style={styles.insightIconCircle}>
              <MaterialIcons name="trending-up" size={24} color="#2c5926" />
            </View>
            <View style={styles.insightTextContent}>
              <Text style={styles.insightTitle}>{t('most_common_issue', language)}</Text>
              <Text style={styles.insightValue}>{topDisease[0]}</Text>
              <Text style={styles.insightSub}>{t('detected_times', language, topDisease[1])}</Text>
            </View>
          </View>
        )}

        {/* Detection History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('detection_history', language)}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator color="#2c5926" style={{ marginVertical: 20 }} />}

          {detectionHistory.length === 0 && !loading ? (
            <View style={styles.glassEmptyHistory}>
              <View style={styles.emptyEmojiCircle}>
                <Text style={styles.emptyEmoji}>📸</Text>
              </View>
              <Text style={styles.emptyText}>{t('no_scans_yet', language)}</Text>
              <Text style={styles.emptySub}>{t('scan_first_crop', language)}</Text>
              <TouchableOpacity
                style={styles.scanNowButton}
                onPress={() => navigation.navigate('DiseaseDetection')}
                activeOpacity={0.8}
              >
                <Text style={styles.scanNowText}>{t('scan_now', language)}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            detectionHistory.slice(0, 10).map((scan, index) => (
              <View key={scan.id || index} style={styles.glassHistoryItem}>
                <View style={[styles.historyDotCircle, { borderColor: (scan.confidence || 0) > 0.75 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                  <View style={[styles.historyDot, { backgroundColor: (scan.confidence || 0) > 0.75 ? '#EF4444' : '#F59E0B' }]} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDisease}>{scan.disease_name || 'Unknown Condition'}</Text>
                  <Text style={styles.historyMeta}>
                    {scan.crop_type || 'Unknown crop'} • {Math.round((scan.confidence || 0) * 100)}% {t('confidence_score', language) || 'Confidence'}
                  </Text>
                </View>
                <Text style={styles.historyDate}>{formatDate(scan.created_at)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="settings" size={24} color="#4B5563" />
            <Text style={styles.actionText}>Settings</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="help-outline" size={24} color="#4B5563" />
            <Text style={styles.actionText}>Support</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={22} color="#DC2626" />
            <Text style={styles.logoutText}>{t('logout', language)}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f6'
  },
  header: {
    backgroundColor: '#2c5926',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#34d399',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2c5926'
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
    fontWeight: '600'
  },
  userJoined: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    fontWeight: '500'
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -30,
    gap: 10
  },
  glassStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2c5926',
    letterSpacing: -1
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  glassInsightCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: 'rgba(44, 89, 38, 0.04)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.08)',
    gap: 16
  },
  insightIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  insightTextContent: {
    flex: 1
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2c5926',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginTop: 4
  },
  insightSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500'
  },
  historySection: {
    paddingHorizontal: 20,
    marginTop: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5
  },
  seeAllText: {
    fontSize: 14,
    color: '#2c5926',
    fontWeight: '700'
  },
  glassEmptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 89, 38, 0.05)',
    borderStyle: 'dashed'
  },
  emptyEmojiCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2
  },
  emptyEmoji: {
    fontSize: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151'
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40
  },
  scanNowButton: {
    backgroundColor: '#2c5926',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  scanNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15
  },
  glassHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  historyDotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 5,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  historyInfo: {
    flex: 1
  },
  historyDisease: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.2
  },
  historyMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500'
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600'
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    gap: 16
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151'
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
    gap: 10
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626'
  }
});

export default ProfileScreen;
