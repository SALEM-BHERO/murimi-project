import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { detectDisease } from '../services/api';

const { width, height } = Dimensions.get('window');

const DiseaseDetectionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [showTips, setShowTips] = useState(true);
  const cameraRef = useRef(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tipsFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!selectedImage && permission?.granted) {
      // Scanning line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 240,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Corner pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [selectedImage, permission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setSelectedImage(photo.uri);
      handleDetect(photo.uri);
    } catch (err) {
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      handleDetect(result.assets[0].uri);
    }
  };

  const handleDetect = async (uri) => {
    setLoading(true);
    try {
      let lat = null, lng = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch (locErr) { }

      const result = await detectDisease(uri, 'maize', lat, lng);
      navigation.navigate('Results', { result, imageUri: uri });
    } catch (err) {
      // Mock result for demo
      const mockResult = {
        detection: {
          id: 'demo-' + Date.now(),
          disease_name: 'Maize Streak Virus',
          confidence: 0.92,
          crop_type: 'maize',
          created_at: new Date().toISOString()
        },
        predictions: [
          { disease_name: 'Maize Streak Virus', confidence: 0.92 },
          { disease_name: 'Grey Leaf Spot', confidence: 0.05 },
          { disease_name: 'Common Rust', confidence: 0.03 }
        ],
        disease_info: {
          symptoms: 'Broken, yellowish to white streaks that run parallel to the leaf veins. Streaks are usually uniform in width and distributed throughout the leaf surface.',
          treatment: '1. Identify and remove infected plants immediately\n2. Apply recommended systemic insecticides\n3. Keep the field clear of grassy weeds',
          prevention: 'Plant resistant maize varieties. Ensure proper spacing and maintain soil health.'
        }
      };
      setTimeout(() => {
        navigation.navigate('Results', { result: mockResult, imageUri: uri });
      }, 1500);
    } finally {
      setLoading(false);
      setSelectedImage(null); // Reset for next scan
    }
  };

  const hideTips = () => {
    Animated.timing(tipsFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setShowTips(false));
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#2c5926" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera Viewfinder */}
      <View style={styles.viewfinderContainer}>
        {!selectedImage && permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
          >
            {/* Premium Header Overlay */}
            <View style={styles.headerOverlay}>
              <TouchableOpacity style={styles.glassRoundBtn} onPress={() => navigation.goBack()}>
                <MaterialIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Crop Scanner</Text>
                <View style={styles.aiStatusBadge}>
                  <View style={styles.aiDot} />
                  <Text style={styles.aiText}>AI READY</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.glassRoundBtn}>
                <MaterialIcons name="help-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Premium Scanning HUD */}
            <View style={styles.guideContainer}>
              <View style={styles.guideFrame}>
                <Animated.View style={[styles.corner, styles.topL, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.corner, styles.topR, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.corner, styles.botL, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.corner, styles.botR, { opacity: pulseAnim }]} />

                {/* Glass Scan Line */}
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineAnim }] }
                  ]}
                />

                <View style={styles.hudOverlay}>
                  <MaterialCommunityIcons name="crop-free" size={40} color="rgba(255,255,255,0.2)" />
                </View>
              </View>
              <Text style={styles.guideText}>Center leaf in frame</Text>
            </View>

            {/* Premium glassmorphism Tips */}
            {showTips && (
              <Animated.View style={[styles.tipsContainer, { opacity: tipsFadeAnim }]}>
                <View style={styles.glassTipsCard}>
                  <View style={styles.tipsIconCircle}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#2c5926" />
                  </View>
                  <View style={styles.tipsTextContent}>
                    <Text style={styles.tipsTitle}>Pro Tip</Text>
                    <Text style={styles.tipsBody}>Hold steady for best accuracy. Ensure the leaf is well-lit.</Text>
                  </View>
                  <TouchableOpacity style={styles.tipsDismissBtn} onPress={hideTips}>
                    <Text style={styles.tipsDismissText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Modern Controls */}
            <View style={styles.controlsLayer}>
              <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.secondaryControl} onPress={pickFromGallery}>
                  <View style={styles.glassIconCircle}>
                    <MaterialIcons name="image" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.controlLabel}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.captureBtnContainer} onPress={takePicture} activeOpacity={0.8}>
                  <View style={styles.captureRingOuter}>
                    <View style={styles.captureRingInner}>
                      <View style={styles.captureButtonSolid}>
                        <MaterialIcons name="camera-alt" size={32} color="#FFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryControl}
                  onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
                >
                  <View style={styles.glassIconCircle}>
                    <MaterialIcons
                      name={flash === 'on' ? "flash-on" : "flash-off"}
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <Text style={styles.controlLabel}>{flash === 'on' ? 'Flash On' : 'Flash Off'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nav Parity */}
            <View style={styles.bottomNavGlass}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Dashboard')}>
                <MaterialCommunityIcons name="home-variant-outline" size={26} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtnActive}>
                <View style={styles.activeIndicator} />
                <MaterialCommunityIcons name="camera" size={28} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('ShopFinder')}>
                <MaterialCommunityIcons name="store-outline" size={26} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Profile')}>
                <MaterialCommunityIcons name="account-circle-outline" size={26} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : selectedImage ? (
          <View style={styles.fullPreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <View style={styles.analysisOverlay}>
              <ActivityIndicator size="large" color="#34d399" />
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingTitle}>Analyzing Specimen</Text>
                <Text style={styles.loadingSub}>Our AI is identifying conditions...</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.permissionBox}>
            <View style={styles.permIconCircle}>
              <MaterialIcons name="camera-enhance" size={48} color="#2c5926" />
            </View>
            <Text style={styles.permTitle}>Camera Access</Text>
            <Text style={styles.permText}>We need camera access to detect crop diseases in real-time.</Text>
            <TouchableOpacity style={styles.enableBtn} onPress={requestPermission} activeOpacity={0.8}>
              <Text style={styles.enableBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewfinderContainer: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20
  },
  glassRoundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  aiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)'
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    marginRight: 6
  },
  aiText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  guideFrame: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 32,
    position: 'relative',
    overflow: 'hidden'
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#34d399',
  },
  topL: { top: 0, left: 0, borderTopWidth: 6, borderLeftWidth: 6, borderTopLeftRadius: 32 },
  topR: { top: 0, right: 0, borderTopWidth: 6, borderRightWidth: 6, borderTopRightRadius: 32 },
  botL: { bottom: 0, left: 0, borderBottomWidth: 6, borderLeftWidth: 6, borderBottomLeftRadius: 32 },
  botR: { bottom: 0, right: 0, borderBottomWidth: 6, borderRightWidth: 6, borderBottomRightRadius: 32 },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    position: 'absolute'
  },
  hudOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  guideText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  tipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30
  },
  glassTipsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  tipsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  tipsTextContent: {
    flex: 1
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111'
  },
  tipsBody: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 18
  },
  tipsDismissBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#2c5926',
    borderRadius: 10,
    marginLeft: 10
  },
  tipsDismissText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800'
  },
  controlsLayer: {
    paddingBottom: 40,
    paddingHorizontal: 30
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  secondaryControl: {
    alignItems: 'center',
    width: 70
  },
  glassIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  captureBtnContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureRingOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  captureRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  captureButtonSolid: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2c5926',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10
  },
  bottomNavGlass: {
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  navBtn: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBtnActive: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34d399'
  },
  fullPreview: {
    flex: 1,
    backgroundColor: '#000'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6
  },
  analysisOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24
  },
  loadingTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  loadingSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500'
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f6f7f6'
  },
  permIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  permTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5
  },
  permText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 20
  },
  enableBtn: {
    backgroundColor: '#2c5926',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 40,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  enableBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900'
  }
});

export default DiseaseDetectionScreen;

