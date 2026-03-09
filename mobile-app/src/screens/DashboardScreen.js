import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getDetectionHistory } from '../services/api';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DashboardScreen = ({ navigation }) => {
  const { user, detectionHistory, setDetectionHistory, language, changeLanguage } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sn', name: 'Shona', flag: '🇿🇼' },
    { code: 'nd', name: 'Ndebele', flag: '🇿🇼' }
  ];

  const loadHistory = async () => {
    try {
      const data = await getDetectionHistory();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDetectionHistory(data);
    } catch (err) {
      // Silently fail — user may be in demo mode or backend not connected
    }
  };

  useEffect(() => {
    loadHistory();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const recentScans = detectionHistory.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2c5926']} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlOtkJcf7pczeERIlxRfRpOAiZMZFfiqjQqmKp1exQy1BMcaUveCSg76Plb9C8XHfInqbOgvouwtW2fXouPNwjlRn-zcvcRVn1-eRYCtxP829iUR2PmGxPC-frp5qdg1g7Xfa3Avju8gK1QPtIfNNLhGP-g7Zh7aQDqYlQjaqzvKELFfg2chCk03JCyRMyQpE6LQ8zhvbPMqKZTz0cr1TKGIb17l78Q25pTfAtIcrHtNJQfEE2YdT9eGiIWscrjVthp3Fsai6SyFg' }}
                  style={styles.avatar}
                />
              </View>
              <View>
                <Text style={styles.greeting}>
                  {language === 'sn' ? 'Mhoro' : language === 'nd' ? 'Salibonani' : 'Hello'}, {user?.full_name?.split(' ')[0] || 'Farai'}
                </Text>
                <Text style={styles.location}>Harare, Zimbabwe</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.langButton}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text style={styles.langEmoji}>
                  {languages.find(l => l.code === language)?.flag}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationBtn}>
                <MaterialIcons name="notifications-none" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards - Glassmorphism Applied */}
          <View style={styles.statsContainer}>
            <View style={styles.glassStatCard}>
              <Text style={styles.statLabel}>{t('status', language)}</Text>
              <Text style={styles.statValue}>3 {language === 'sn' ? 'Mapurazi ane hutano' : language === 'nd' ? 'Amapulazi aphilileyo' : 'Healthy Farms'}</Text>
            </View>
            <View style={styles.glassStatCard}>
              <Text style={styles.statLabel}>{t('alerts', language)}</Text>
              <Text style={styles.statValue}>0 {language === 'sn' ? 'Yambiro' : language === 'nd' ? 'Izviyelelo' : 'Pending'}</Text>
            </View>
          </View>
        </View>

        {/* Action Card - Modernized */}
        <View style={styles.actionSection}>
          <View style={styles.glassActionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="photo-camera" size={48} color="#2c5926" />
            </View>
            <Text style={styles.actionTitle}>{t('ai_detection', language)}</Text>
            <Text style={styles.actionSubtitle}>
              {language === 'sn'
                ? 'Nangisa khamera pachirimwa kuti uone zvirwere nekukurumidza.'
                : language === 'nd'
                  ? 'Khomba ikhamera esilini ukuze ubone imikhuhlane masinyane.'
                  : 'Point your camera at a crop to identify pests or diseases instantly.'}
            </Text>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => navigation.navigate('DiseaseDetection')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="focus-field" size={24} color="#FFF" style={styles.scanIcon} />
              <Text style={styles.scanBtnText}>{t('scan_crop', language)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Detections */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recent_activity', language)}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAllText}>{t('view_all', language) || 'View All'}</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length > 0 ? (
            recentScans.map((scan, index) => (
              <TouchableOpacity key={scan.id || index} style={styles.glassListItem}>
                <View style={styles.scanImageContainer}>
                  <MaterialIcons name="grass" size={32} color="rgba(44, 89, 38, 0.4)" />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>{scan.disease_name || 'White Maize'}</Text>
                  <Text style={styles.scanTime}>Scanned 2 hours ago</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(44, 89, 38, 0.1)' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#2c5926' }]}>Healthy</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <>
              {/* Mock items for design parity if no history yet */}
              <TouchableOpacity style={styles.glassListItem}>
                <View style={styles.scanImageContainer}>
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDhK73HZwjJqhwU6QuH3LFhcU7DBq1t7-yG8BxamzQLn3Cd5fnySqXJE7gmVrqKqMjfxCytYklfkRbrlJx3p5iPqSiq2onM9uVUDJXKbCsOqZMFnAuGIbxfQrcPw7lSatyYBx1xhh2-GxpMaLoKsYs2RdNTq1O4P7LE3f9uZLM3OtP0v2BYz7cMAd-r1e6381RNLpcY0cvTX29AnU_NOxMn8nes1MYwjvebjrcBkLoGAQZSQF6WemZVdbe1CVWZA_T19p0TmBiOJA' }}
                    style={styles.mockScanThumb}
                  />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>White Maize</Text>
                  <Text style={styles.scanTime}>Scanned 2 hours ago</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(44, 89, 38, 0.1)' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#2c5926' }]}>Healthy</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.glassListItem}>
                <View style={styles.scanImageContainer}>
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeaZ3O8-as7Wmg5kkpI689E5PrUBgWYnyuYpKxpYxn9zlLS9_sViM0VyOnMfJXhHsLh1QspLUe2U78dcODOlaKn2iF_X2bNlGhwZqjg9zvXwpqU8aR-ibyPv9mvuTcbMrxpQk0EvqAghiS8rqy0JXgq7hhArxJm0glHvclAPqFaM5T42lWcBPCFgY9D30M9AxiQE7f7kav55IJ_ESEEDDu00sqJQi5ZuCgTEEpIsNbDnGIUxX5lJC30SkI0ZyYVQFOXvzcsrPMPvw' }}
                    style={styles.mockScanThumb}
                  />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>Roma Tomato</Text>
                  <Text style={styles.scanTime}>Scanned yesterday</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#856404' }]}>Needs Attention</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Feature Cards Grid - Glassmorphism */}
        <View style={styles.gridSection}>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.glassGridCard} onPress={() => navigation.navigate('ShopFinder')}>
              <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(26, 115, 232, 0.1)' }]}>
                <MaterialIcons name="storefront" size={24} color="#1a73e8" />
              </View>
              <Text style={styles.gridCardTitle}>{t('find_shop', language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassGridCard} onPress={() => navigation.navigate('Knowledge')}>
              <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(249, 171, 0, 0.1)' }]}>
                <MaterialIcons name="menu-book" size={24} color="#f9ab00" />
              </View>
              <Text style={styles.gridCardTitle}>{t('knowledge', language)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.glassModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_language', language)}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemActive
                ]}
                onPress={() => {
                  changeLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={styles.languageEmoji}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.languageNameActive
                ]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#2c5926" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation - Glassmorphism */}
      <View style={styles.glassBottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="home" size={28} color="#2c5926" />
          <Text style={[styles.navText, { color: '#2c5926', fontWeight: 'bold' }]}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ShopFinder')}>
          <MaterialIcons name="shopping-bag" size={26} color="#9ca3af" />
          <Text style={styles.navText}>SHOP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Knowledge')}>
          <MaterialIcons name="menu-book" size={26} color="#9ca3af" />
          <Text style={styles.navText}>LEARN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person" size={26} color="#9ca3af" />
          <Text style={styles.navText}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f6'
  },
  scrollContent: {
    paddingBottom: 120
  },
  header: {
    backgroundColor: '#2c5926',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60,
    paddingBottom: 64,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 16
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  langButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  langEmoji: {
    fontSize: 20,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16
  },
  glassStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 22
  },
  actionSection: {
    paddingHorizontal: 24,
    marginTop: -32
  },
  glassActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(44, 89, 38, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.05)'
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  actionSubtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 10
  },
  scanBtn: {
    backgroundColor: '#2c5926',
    width: '100%',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  scanIcon: {
    marginRight: 12
  },
  scanBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 40
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5
  },
  viewAllText: {
    color: '#2c5926',
    fontWeight: '700',
    fontSize: 14
  },
  glassListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  scanImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(44, 89, 38, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.05)'
  },
  mockScanThumb: {
    width: '100%',
    height: '100%'
  },
  scanInfo: {
    flex: 1
  },
  scanName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4
  },
  scanTime: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  gridSection: {
    paddingHorizontal: 24,
    marginTop: 16
  },
  grid: {
    flexDirection: 'row',
    gap: 16
  },
  glassGridCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  bottomPadding: {
    height: 40
  },
  glassBottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 0,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  glassModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageItemActive: {
    backgroundColor: 'rgba(44, 89, 38, 0.08)',
    borderColor: 'rgba(44, 89, 38, 0.2)',
  },
  languageEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 17,
    color: '#444',
    flex: 1,
    fontWeight: '600'
  },
  languageNameActive: {
    fontWeight: '800',
    color: '#2c5926',
  },
});

export default DashboardScreen;


