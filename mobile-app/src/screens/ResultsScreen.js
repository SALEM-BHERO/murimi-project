import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Share,
  Animated,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

const ResultsScreen = ({ navigation, route }) => {
  const { language } = useApp();
  const { result, imageUri } = route.params || {};
  const detection = result?.detection || {};
  const predictions = result?.predictions || [];
  const diseaseInfo = result?.disease_info || {};
  const translations = result?.translations || {};
  const confidencePercent = Math.round((detection.confidence || 0) * 100);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Get localized content from AI result or fallback to English
  const localizedTitle = translations[language]?.name || detection.disease_name;
  const localizedSymptoms = translations[language]?.symptoms || diseaseInfo.symptoms;
  const localizedTreatment = translations[language]?.treatment || diseaseInfo.treatment;
  const localizedPrevention = translations[language]?.prevention || diseaseInfo.prevention;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Murimi App Detection Result: ${detection.disease_name || 'Crop Disease'} detected with ${confidencePercent}% confidence.`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.glassBackBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={28} color="#2c5926" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('results', language)}</Text>
        <TouchableOpacity style={styles.glassShareBtn} onPress={onShare}>
          <MaterialIcons name="ios-share" size={22} color="#2c5926" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Hero Section with Image and Badge */}
          <View style={styles.heroSection}>
            <Image source={{ uri: imageUri || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2' }} style={styles.heroImage} />
            <View style={styles.gradientOverlay} />

            <View style={styles.glassConfidenceBadge}>
              <MaterialIcons name="verified" size={16} color="#FFF" style={styles.badgeIcon} />
              <Text style={styles.badgeText}>{confidencePercent}% {t('confidence', language)}</Text>
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.cropTypeTag}>{detection.crop_type?.toUpperCase() || 'CROP SPECIMEN'}</Text>
              <Text style={styles.diseaseTitle}>{localizedTitle || 'Maize Streak Virus'}</Text>
            </View>
          </View>

          {/* Glass Symptoms Section */}
          <View style={styles.infoCardContainer}>
            <View style={styles.glassInfoCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(44, 89, 38, 0.1)' }]}>
                  <MaterialIcons name="remove-red-eye" size={22} color="#2c5926" />
                </View>
                <Text style={styles.cardTitle}>{t('symptoms', language)}</Text>
              </View>
              <Text style={styles.cardBody}>
                {localizedSymptoms || "Look for broken, yellowish to white streaks that run parallel to the leaf veins. Streaks are usually uniform in width and distributed throughout the leaf surface."}
              </Text>
            </View>
          </View>

          {/* Treatment Steps - Premium List */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                <MaterialIcons name="healing" size={22} color="#059669" />
              </View>
              <Text style={styles.sectionTitle}>{t('treatment', language)}</Text>
            </View>

            <View style={styles.modernStepsList}>
              {(localizedTreatment || "Remove infected plants\nApply insecticides\nClear grassy weeds").split('\n').map((step, i) => (
                <View key={i} style={styles.modernStepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Prevention - Premium Card */}
          <View style={styles.sectionContainer}>
            <View style={styles.glassPreventionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <MaterialIcons name="security" size={22} color="#2563EB" />
                </View>
                <Text style={[styles.cardTitle, { color: '#2563EB' }]}>{t('prevention', language)}</Text>
              </View>
              <Text style={styles.preventionBody}>
                {localizedPrevention || "The best long-term strategy is planting resistant maize varieties. Ensure proper spacing between plants and maintain optimal soil health."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRowContainer}>
            <TouchableOpacity
              style={styles.premiumPrimaryBtn}
              onPress={() => navigation.navigate('ShopFinder')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="storefront" size={24} color="#FFF" />
              <Text style={styles.primaryBtnText}>{t('find_nearby_shops', language)}</Text>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.premiumSecondaryBtn} activeOpacity={0.7}>
              <MaterialIcons name="bookmark-border" size={24} color="#374151" />
              <Text style={styles.secondaryBtnText}>{t('save_result', language)}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Matching Nav Parity */}
      <View style={styles.bottomNavModern}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="home-outline" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('DiseaseDetection')}>
          <MaterialCommunityIcons name="camera-outline" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ShopFinder')}>
          <MaterialCommunityIcons name="storefront-outline" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account-outline" size={24} color="#9ca3af" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(246, 247, 246, 0.8)',
    zIndex: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5
  },
  glassBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  glassShareBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  scrollContent: {
    paddingBottom: 120
  },
  heroSection: {
    marginHorizontal: 16,
    height: 340,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  glassConfidenceBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(44, 89, 38, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  badgeIcon: {
    marginRight: 6
  },
  badgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24
  },
  cropTypeTag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8
  },
  diseaseTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -1
  },
  infoCardContainer: {
    paddingHorizontal: 16,
    marginTop: 24
  },
  glassInfoCard: {
    backgroundColor: 'rgba(44, 89, 38, 0.04)',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.08)'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2c5926',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  cardBody: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '500'
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5
  },
  modernStepsList: {
    gap: 12
  },
  modernStepItem: {
    flexDirection: 'row',
    padding: 18,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center'
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2c5926'
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    fontWeight: '600'
  },
  glassPreventionCard: {
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)'
  },
  preventionBody: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '500'
  },
  actionRowContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 16
  },
  premiumPrimaryBtn: {
    backgroundColor: '#2c5926',
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  primaryBtnText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 14
  },
  premiumSecondaryBtn: {
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 12
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '800'
  },
  bottomNavModern: {
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  navItem: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500'
  }
});

export default ResultsScreen;

