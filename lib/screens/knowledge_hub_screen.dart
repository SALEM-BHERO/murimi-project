import 'package:murimi_app/services/api_service.dart';

class KnowledgeHubScreen extends StatefulWidget {
  const KnowledgeHubScreen({super.key});

  @override
  State<KnowledgeHubScreen> createState() => _KnowledgeHubScreenState();
}

class _KnowledgeHubScreenState extends State<KnowledgeHubScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _articles = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadArticles();
  }

  Future<void> _loadArticles() async {
    final articles = await _apiService.getKnowledgeArticles();
    if (mounted) {
      setState(() {
        _articles = articles;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Knowledge Hub'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.share, color: AppTheme.primaryColor)),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
        : RefreshIndicator(
            onRefresh: _loadArticles,
            color: AppTheme.primaryColor,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHero(isDark),
                  _buildBackendCropSection('Maize', isDark),
                  _buildBackendCropSection('Sorghum', isDark),
                  _buildBackendCropSection('Millet', isDark),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildBackendCropSection(String crop, bool isDark) {
    final cropArticles = _articles.where((a) => 
      (a['crop_types'] as String?)?.toLowerCase().contains(crop.toLowerCase()) ?? false
    ).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            '$crop Management',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        SizedBox(
          height: 180,
          child: cropArticles.isEmpty 
            ? _buildPlaceholderSection(crop, isDark)
            : ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: cropArticles.length,
                itemBuilder: (context, index) {
                  final art = cropArticles[index];
                  return _buildTopicCard(
                    context, 
                    crop, 
                    art['title'], 
                    Icons.menu_book, 
                    isDark,
                    articleId: art['id'].toString(),
                    imageUrl: art['image_url'],
                  );
                },
              ),
        ),
      ],
    );
  }

  Widget _buildPlaceholderSection(String crop, bool isDark) {
    return ListView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        _buildTopicCard(context, crop, 'Growing', Icons.agriculture, isDark),
        _buildTopicCard(context, crop, 'Harvesting', Icons.handyman, isDark),
        _buildTopicCard(context, crop, 'Storage', Icons.warehouse, isDark),
      ],
    );
  }

  Widget _buildHero(bool isDark) {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuDqzM0jZEMWyfyZNLXwLH25o1hoN8lWgYwrZtMFtPzLb0BEd8fMcIXty0r7j2gJoqsAeotBMTniCmVsbiVmAbQcamyB10WO8dwlmkLdDa1yeNPhCdhdwh5zd77jKlhNfVkgmD_7KwrKIGKDOm_9ODit_0jGtEteFlshqAX_qTnbzrVB9OB1AGrjDFWZzzoSi8qRypg5u8EdomMXl4N2YVZgxJBnVyYFl-UTlu-Vm4cjQrbUh4NJlwK_wQyVwDU4pCFWiQevuAN7CUKx'),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
          ),
        ),
        padding: const EdgeInsets.all(16),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Chip(
              label: Text('Knowledge Base', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              backgroundColor: AppTheme.primaryColor,
              visualDensity: VisualDensity.compact,
            ),
            Text(
              'Essential Grain Storage & Growth',
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopicCard(BuildContext context, String crop, String topic, IconData icon, bool isDark, {String? articleId, String? imageUrl}) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ArticleDetailScreen(crop: crop, topic: topic, articleId: articleId),
          ),
        );
      },
      child: Container(
        width: 140,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1e291f) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (imageUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(imageUrl, width: 48, height: 48, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Icon(icon, color: AppTheme.primaryColor, size: 32)),
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppTheme.primaryColor, size: 32),
              ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                topic,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Text(
              'Essentials',
              style: TextStyle(color: Colors.grey, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }
}
