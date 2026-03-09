import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  TextInput,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Animated
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getNearbyShops } from '../services/api';
import { useApp } from '../context/AppContext';
import { t } from '../utils/i18n';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const DEMO_SHOPS = [
  { id: '1', name: 'GreenAgro Stockists', address: 'CBD, Harare', phone_number: '+263 772 123 456', distance_km: 1.2, rating: 4.8, reviews: 120, open: 'Until 5:00 PM', lat: -17.8248, lng: 31.0530, types: ['grass', 'grain'] },
  { id: '2', name: 'Agrifoods Ltd', address: 'Workington, Harare', phone_number: '+263 242 756 231', distance_km: 2.3, rating: 4.5, reviews: 85, open: 'Until 4:30 PM', lat: -17.8350, lng: 31.0330, types: ['pest_control', 'grass'] },
];

const ShopFinderScreen = ({ navigation }) => {
  const { language } = useApp();
  const [shops, setShops] = useState(DEMO_SHOPS);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: -17.8248, longitude: 31.0530 });
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadShops();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShops(DEMO_SHOPS);
      } else {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation(loc.coords);
        const data = await getNearbyShops(loc.coords.latitude, loc.coords.longitude, 20);
        if (data && data.length > 0) {
          setShops(data.map(s => ({ ...s, rating: 4.5, reviews: 50, open: 'Until 5:00 PM', types: ['grass', 'grain'] })));
        }
      }
    } catch (err) {
      setShops(DEMO_SHOPS);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShop = (shop) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedShop(shop);
    if (shop) {
      mapRef.current?.animateToRegion({
        latitude: shop.lat || -17.82,
        longitude: shop.lng || 31.05,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const callShop = (phone) => {
    const url = Platform.select({ ios: `tel:${phone}`, android: `tel:${phone}` });
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to make a call'));
  };

  const openDirections = (shop) => {
    const lat = shop.lat || -17.83;
    const lng = shop.lng || 31.05;
    const url = Platform.select({
      ios: `maps:?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`
    });
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`));
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#2c5926" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('find_shop', language)}</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#2c5926" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="rgba(44, 89, 38, 0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_shops', language)}
            placeholderTextColor="#9ca3af"
            defaultValue="Harare CBD"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 20 }}>
          <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
            <MaterialIcons name="filter-list" size={18} color="#FFF" />
            <Text style={[styles.filterText, styles.activeFilterText]}>{t('all_shops', language)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialIcons name="grass" size={18} color="#2c5926" />
            <Text style={styles.filterText}>{t('fertilizers', language)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialIcons name="pest-control" size={18} color="#2c5926" />
            <Text style={styles.filterText}>{t('pesticides', language)}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {loading && !shops.length ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#2c5926" />
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {shops.map((shop) => (
              <Marker
                key={shop.id}
                coordinate={{ latitude: shop.lat || -17.82, longitude: shop.lng || 31.05 }}
                onPress={() => handleSelectShop(shop)}
              >
                <View style={[styles.markerContainer, selectedShop?.id === shop.id && styles.activeMarker]}>
                  {selectedShop?.id === shop.id && (
                    <View style={styles.markerLabel}>
                      <Text style={styles.markerText}>{shop.name}</Text>
                    </View>
                  )}
                  <View style={[styles.markerCircle, selectedShop?.id === shop.id && styles.activeMarkerCircle]}>
                    <MaterialIcons
                      name="storefront"
                      size={20}
                      color={selectedShop?.id === shop.id ? "#FFF" : "#2c5926"}
                    />
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Floating Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlBtn}>
            <MaterialIcons name="add" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity style={styles.mapControlBtn}>
            <MaterialIcons name="remove" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.myLocationBtn} onPress={() => {
          mapRef.current?.animateToRegion({
            ...userLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }}>
          <MaterialIcons name="my-location" size={24} color="#2c5926" />
        </TouchableOpacity>
      </View>

      {/* Shop Detail Card - Glassmorphism */}
      {selectedShop && (
        <View style={styles.detailCardContainer}>
          <View style={styles.glassDetailCard}>
            <TouchableOpacity onPress={() => handleSelectShop(null)} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.dragBar} />

            <View style={styles.cardInfoRow}>
              <View style={styles.mainInfo}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>⭐ HIGHLY RATED</Text>
                </View>
                <Text style={styles.shopName}>{selectedShop.name}</Text>
                <View style={styles.locRow}>
                  <MaterialIcons name="near-me" size={14} color="#6B7280" />
                  <Text style={styles.locText}>{selectedShop.distance_km}km away • {selectedShop.address}</Text>
                </View>
              </View>
              <View style={styles.statusInfo}>
                <View style={styles.openBadge}>
                  <Text style={styles.openStatusText}>Open</Text>
                </View>
                <Text style={styles.openTime}>{selectedShop.open}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.miniStat}>
                <Text style={styles.statLineLabel}>STOCKED ITEMS</Text>
                <View style={styles.typeIcons}>
                  {selectedShop.types?.map(t => (
                    <View key={t} style={styles.typeIconBadge}>
                      <MaterialIcons name={t} size={16} color="#2c5926" />
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.statLineLabel}>TRUST SCORE</Text>
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={18} color="#f9ab00" />
                  <Text style={styles.ratingText}>{selectedShop.rating}</Text>
                  <Text style={styles.reviewsText}>({selectedShop.reviews} reviews)</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.directionsBtn} onPress={() => openDirections(selectedShop)} activeOpacity={0.8}>
                <MaterialIcons name="directions" size={22} color="#FFF" />
                <Text style={styles.directionsText}>{language === 'sn' ? 'Mirayiridzo' : language === 'nd' ? 'Izikhombisi' : 'Directions'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => callShop(selectedShop.phone_number)} activeOpacity={0.7}>
                <MaterialIcons name="call" size={24} color="#2c5926" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <MaterialIcons name="share" size={24} color="#2c5926" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Nav Styled with Glassmorphism */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>{t('dashboard', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleSelectShop(null)}>
          <View style={styles.activeNavIndicator} />
          <MaterialCommunityIcons name="map-marker" size={24} color="#2c5926" />
          <Text style={[styles.navText, { color: '#2c5926', fontWeight: '700' }]}>{t('find_shop', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="shopping-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>{t('profile', language)}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f6'
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 10
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 89, 38, 0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 89, 38, 0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    fontWeight: '500'
  },
  filterRow: {
    flexDirection: 'row'
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(44, 89, 38, 0.04)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.08)'
  },
  activeChip: {
    backgroundColor: '#2c5926',
    borderColor: '#2c5926',
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c5926',
    marginLeft: 8
  },
  activeFilterText: {
    color: '#FFF'
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    marginTop: -20, // Negative margin to tuck under rounded header
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.1)'
  },
  markerText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '800',
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#2c5926'
  },
  activeMarkerCircle: {
    backgroundColor: '#2c5926',
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }]
  },
  activeMarker: {
    zIndex: 100
  },
  mapControls: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  mapControlBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 10
  },
  myLocationBtn: {
    position: 'absolute',
    bottom: 240, // Above the detail card
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  detailCardContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  glassDetailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dragBar: {
    width: 40,
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  mainInfo: {
    flex: 1
  },
  badge: {
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2c5926',
    letterSpacing: 0.5
  },
  shopName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  locText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500'
  },
  statusInfo: {
    alignItems: 'flex-end'
  },
  openBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1fae5'
  },
  openStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669'
  },
  openTime: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '500'
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(44, 89, 38, 0.03)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.05)'
  },
  miniStat: {
    flex: 1
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    marginHorizontal: 16
  },
  statLineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 10
  },
  typeIcons: {
    flexDirection: 'row',
    gap: 8
  },
  typeIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginLeft: 4
  },
  reviewsText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12
  },
  directionsBtn: {
    flex: 1,
    backgroundColor: '#2c5926',
    height: 56,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  directionsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 0.3
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(44, 89, 38, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.1)'
  },
  bottomNav: {
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
    paddingTop: 10
  },
  activeNavIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 4,
    backgroundColor: '#2c5926',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    fontWeight: '600'
  }
});

export default ShopFinderScreen;


