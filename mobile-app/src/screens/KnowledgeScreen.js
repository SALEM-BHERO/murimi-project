import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getArticles, getCategories, getArticleById } from '../services/api';
import { t } from '../utils/i18n';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// Demo articles for fallback
const DEMO_ARTICLES = [
  { id: '1', title: 'Getting Started with Maize Farming in Zimbabwe', category: 'crops', crop_types: ['maize'], image_url: 'https://images.unsplash.com/photo-1601593768498-bda29cbfcf01?w=400', views: 245 },
  { id: '2', title: 'Tomato Growing Guide: From Seedbed to Harvest', category: 'crops', crop_types: ['tomato'], image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', views: 189 },
  { id: '3', title: "Understanding Soil Health: A Zimbabwean Farmer's Guide", category: 'soil', crop_types: ['maize', 'tomato'], image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400', views: 312 },
  { id: '4', title: 'Integrated Pest Management for Smallholder Farms', category: 'pests', crop_types: ['maize', 'tomato'], image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', views: 167 },
  { id: '5', title: 'Water-Smart Farming: Irrigation Techniques', category: 'irrigation', crop_types: ['maize', 'tomato'], image_url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400', views: 198 },
  { id: '6', title: 'Climate-Smart Agriculture: Adapting to Changing Weather', category: 'climate', crop_types: ['maize', 'soybean'], image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', views: 276 },
  { id: '7', title: 'Post-Harvest Handling: Reducing Losses', category: 'post-harvest', crop_types: ['maize', 'wheat'], image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400', views: 145 },
  { id: '8', title: 'Understanding Fertilizer: NPK and What Your Crops Need', category: 'soil', crop_types: ['maize', 'tomato', 'wheat'], image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400', views: 223 }
];

const DEMO_CATEGORIES = ['All', 'crops', 'soil', 'pests', 'irrigation', 'climate', 'post-harvest'];

const KnowledgeScreen = () => {
  const { language } = useApp();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesData, catsData] = await Promise.all([getArticles(), getCategories()]);
      setArticles(articlesData.length > 0 ? articlesData : DEMO_ARTICLES);
      setCategories(['All', ...(catsData.length > 0 ? catsData : DEMO_CATEGORIES.slice(1))]);
    } catch (err) {
      setArticles(DEMO_ARTICLES);
      setCategories(DEMO_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (article) => {
    setSelectedArticle(article);
    setArticleLoading(true);
    try {
      const full = await getArticleById(article.id);
      setSelectedArticle(full);
    } catch (err) {
      // Use partial data from article list
    } finally {
      setArticleLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(cat);
  };

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const getCategoryEmoji = (cat) => {
    const map = { crops: '🌾', soil: '🪴', pests: '🐛', irrigation: '💧', climate: '🌤️', 'post-harvest': '📦' };
    return map[cat] || '📄';
  };

  const renderArticle = ({ item, index }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20 * (index % 5), 0] }) }] }}>
      <TouchableOpacity style={styles.glassArticleCard} onPress={() => openArticle(item)} activeOpacity={0.9}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.articleImage} />
        )}
        <View style={styles.articleContent}>
          <View style={styles.articleMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.articleCategory}>{getCategoryEmoji(item.category)} {item.category}</Text>
            </View>
            <Text style={styles.articleViews}>👁 {item.views || 0}</Text>
          </View>
          <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
          {item.crop_types && item.crop_types.length > 0 && (
            <View style={styles.cropTags}>
              {item.crop_types.slice(0, 3).map((crop, i) => (
                <View key={i} style={styles.cropTag}>
                  <Text style={styles.cropTagText}>{crop}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c5926" />
        <Text style={styles.loadingText}>{t('loading_articles', language)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('knowledge_base', language)}</Text>
        <Text style={styles.headerSubtitle}>
          {filteredArticles.length} {t('articles_available', language, filteredArticles.length).split(' ').pop() || 'Articles'}
        </Text>
      </View>

      {/* Glassmorphism Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.glassCategoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => handleCategoryChange(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat === 'All' ? t('all', language) : `${getCategoryEmoji(cat)} ${cat}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Premium Article Detail Modal */}
      <Modal visible={!!selectedArticle} animationType="slide" transparent={false} onRequestClose={() => setSelectedArticle(null)}>
        <View style={styles.modalContainer}>
          <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.closeButton}>
                <MaterialIcons name="arrow-back" size={24} color="#2c5926" />
                <Text style={styles.closeButtonText}>{t('back', language)}</Text>
              </TouchableOpacity>
            </View>

            {selectedArticle?.image_url && (
              <Image source={{ uri: selectedArticle.image_url }} style={styles.modalImage} />
            )}

            <View style={styles.modalContent}>
              <View style={styles.modalMeta}>
                <View style={styles.modalCategoryBadge}>
                  <Text style={styles.modalCategory}>
                    {getCategoryEmoji(selectedArticle?.category)} {selectedArticle?.category}
                  </Text>
                </View>
                <Text style={styles.modalViews}>👁 {selectedArticle?.views || 0} {t('views', language)}</Text>
              </View>

              <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>

              <View style={styles.articleDivider} />

              {articleLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator color="#2c5926" />
                  <Text style={styles.loadingText}>Fetching content...</Text>
                </View>
              ) : (
                <Text style={styles.modalBody}>
                  {selectedArticle?.content || 'Murimi Knowledge Base provides farmers with the latest research-backed insights... \n\n' +
                    'Maize farming in Zimbabwe requires careful soil preparation, timely planting, and efficient irrigation management. ' +
                    'Our experts recommend starting soil testing at least 3 months before planting to ensure optimal nutrient balance.'}
                </Text>
              )}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// Import icons for the modal
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f6'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f7f6'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500'
  },
  header: {
    backgroundColor: '#2c5926',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#2c5926',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    fontWeight: '600'
  },
  categoryContainer: {
    marginTop: -25,
    zIndex: 20
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  glassCategoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  categoryChipActive: {
    backgroundColor: '#2c5926',
    borderColor: '#2c5926',
    shadowColor: '#2c5926',
    shadowOpacity: 0.3
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  categoryChipTextActive: {
    color: '#FFFFFF'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40
  },
  glassArticleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)'
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb'
  },
  articleContent: {
    padding: 20
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryBadge: {
    backgroundColor: 'rgba(44, 89, 38, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2c5926',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  articleViews: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600'
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    lineHeight: 25,
    letterSpacing: -0.3
  },
  cropTags: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 8
  },
  cropTag: {
    backgroundColor: 'rgba(44, 89, 38, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(44, 89, 38, 0.05)'
  },
  cropTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c5926',
    textTransform: 'capitalize'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  modalHeaderActions: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 89, 38, 0.05)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2c5926',
    marginLeft: 8
  },
  modalImage: {
    width: '100%',
    height: 250
  },
  modalContent: {
    padding: 28,
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalCategoryBadge: {
    backgroundColor: 'rgba(44, 89, 38, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  modalCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c5926',
    textTransform: 'uppercase'
  },
  modalViews: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600'
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    lineHeight: 34,
    marginBottom: 20,
    letterSpacing: -0.5
  },
  articleDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 20
  },
  modalLoading: {
    alignItems: 'center',
    marginTop: 40
  },
  modalBody: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 30,
    letterSpacing: 0.1,
    fontWeight: '400'
  }
});

export default KnowledgeScreen;

