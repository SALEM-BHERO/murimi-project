import 'package:murimi_app/services/api_service.dart';

class ArticleDetailScreen extends StatefulWidget {
  final String crop;
  final String topic;
  final String? articleId;

  const ArticleDetailScreen({
    super.key,
    required this.crop,
    required this.topic,
    this.articleId,
  });

  @override
  State<ArticleDetailScreen> createState() => _ArticleDetailScreenState();
}

class _ArticleDetailScreenState extends State<ArticleDetailScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _articleData;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.articleId != null) {
      _loadArticle();
    }
  }

  Future<void> _loadArticle() async {
    setState(() => _isLoading = true);
    final data = await _apiService.getArticleById(widget.articleId!);
    if (mounted) {
      setState(() {
        _articleData = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    String title = _articleData?['title'] ?? '${widget.crop}: ${widget.topic}';
    String content = _articleData?['content'] ?? _getDefaultContent();

    return Scaffold(
      appBar: AppBar(
        title: Text(title.length > 20 ? widget.crop : title),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    _getHeroImage(),
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  title,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildInfoCard(isDark),
                const SizedBox(height: 24),
                _buildContentSection('Guide Details', content),
                if (_articleData == null) ...[
                  _buildContentSection('Key Steps', _getSteps()),
                  _buildContentSection('Pro-Tips', 'Always check moisture levels and ensure proper pest control.'),
                ],
                const SizedBox(height: 40),
              ],
            ),
          ),
    );
  }

  String _getDefaultContent() {
    return 'In Zimbabwe, ${widget.crop} is a vital crop. Proper ${widget.topic} is essential for ensuring food security and maximizing yields.';
  }

  String _getHeroImage() {
    return _articleData?['image_url'] ?? (widget.crop == 'Maize' 
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFpMd5Fr94jzCUK-Eauh12oq2KKNNvRSr8xX_uSsAt4w7xsxTI8CGGz4EeZbk_ifuQ9i5171baAaNKF3uWkSfKVnOLXm4zlGsFq2PSgV7SNQv0avW0HZYhKrK1GZWZtfvDzjUh1xpbJfFwfhcEv5n_nwabS0uHJaKY8I0kSGtXeyaUPn1w3k0b5ew3XcxiJgBwBLsf855yXw3uXQ7L07-CYa6bDZMH5Qg0CUNczq0p3CwQ_kFPReo7b-a3Gs9tbT6FfQbUo4sO7wSf'
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqzM0jZEMWyfyZNLXwLH25o1hoN8lWgYwrZtMFtPzLb0BEd8fMcIXty0r7j2gJoqsAeotBMTniCmVsbiVmAbQcamyB10WO8dwlmkLdDa1yeNPhCdhdwh5zd77jKlhNfVkgmD_7KwrKIGKDOm_9ODit_0jGtEteFlshqAX_qTnbzrVB9OB1AGrjDFWZzzoSi8qRypg5u8EdomMXl4N2YVZgxJBnVyYFl-UTlu-Vm4cjQrbUh4NJlwK_wQyVwDU4pCFWiQevuAN7CUKx');
  }

  String _getSteps() {
    if (topic == 'Growing') return '1. Soil preparation: Deep ploughing.\n2. Seed selection: Use certified hybrid seed.\n3. Planting: Sow at first rains.';
    if (topic == 'Harvesting') return '1. Timing: When silks are dry and brown.\n2. Method: Manual picking or machine.\n3. Post-harvest: Clear field of residue.';
    return '1. Drying: Reach 13% moisture.\n2. Bagging: Use hermetic liners.\n3. Protection: Stack on pallets.';
  }

  Widget _buildInfoCard(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
      ),
      child: const Row(
        children: [
          Icon(Icons.tips_and_updates, color: AppTheme.primaryColor),
          SizedBox(width: 12),
          Expanded(child: Text('Based on ARDA Zimbabwe standards.', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor))),
        ],
      ),
    );
  }

  Widget _buildContentSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
          const SizedBox(height: 8),
          Text(content, style: const TextStyle(fontSize: 14, height: 1.6, color: Colors.grey)),
        ],
      ),
    );
  }
}
