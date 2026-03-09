import 'dart:io';
import 'package:flutter/material.dart';
import 'package:murimi_app/theme/app_theme.dart';
import 'package:murimi_app/screens/camera_scan_screen.dart';
import 'package:murimi_app/screens/shop_finder_screen.dart';
import 'package:murimi_app/screens/knowledge_hub_screen.dart';
import 'package:murimi_app/services/weather_service.dart';
import 'package:murimi_app/services/storage_service.dart';
import 'package:murimi_app/models/detection_result.dart';

import 'package:murimi_app/services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  final WeatherService _weatherService = WeatherService();
  final StorageService _storageService = StorageService();
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _weatherData;
  List<DetectionResult> _recentDetections = [];
  String _userName = 'Farmer';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final weather = await _weatherService.getWeatherData('Harare');
    final profile = await _apiService.profile();
    
    // Try to get backend history first, fallback to local if empty
    var history = await _apiService.getHistory();
    if (history.isEmpty) {
      history = await _storageService.getDetections();
    }

    if (mounted) {
      setState(() {
        _weatherData = weather;
        _recentDetections = history.take(3).toList();
        if (profile != null && profile['full_name'] != null) {
          _userName = profile['full_name'];
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    final List<Widget> screens = [
      _buildHomeScreen(isDark),
      _buildHomeScreen(isDark), // Identify tab also shows home but FAB is primary
      const ShopFinderScreen(),
      const KnowledgeHubScreen(),
    ];

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _selectedIndex,
          children: screens,
        ),
      ),
      bottomNavigationBar: _buildBottomNav(isDark),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCamera,
        backgroundColor: AppTheme.primaryColor,
        shape: const CircleBorder(),
        elevation: 4,
        child: const Icon(Icons.add, color: Colors.white, size: 32),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  void _openCamera() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CameraScanScreen()),
    );
  }

  Widget _buildHomeScreen(bool isDark) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(isDark),
          _buildHeroSection(),
          _buildWeatherWidget(isDark),
          _buildQuickActions(isDark),
          _buildRecentDetections(isDark),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 20,
            backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAf0s_YvfmcDCxUkFaTJnuJ3dGvkScHed4bnfyZr8G3XAh00n--_LAE7CLp_QpqUxzFRe5SupDLgLusmE4NFiO29qieBE9Gq79nmMQdF6EZHt2OiZC5hi7Q-tWSYND3EPPw25NsIA3c1rwO-cHEujT_ZoVe9y1VYm4k_oi1me838yO9Ws2uKHnEKFuzViX8hvqZoZEC_nj6Uba6tagaulymzan0_-vHFmI_vrxWaXxVc5C7-Nj9TVfoa8OzGbso1mRMoSdv-V2j1QBe'),
          ),
          const SizedBox(width: 12),
          const Text(
            'Murimi',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search),
            style: IconButton.styleFrom(
              backgroundColor: isDark ? Colors.grey[800] : Colors.grey[100],
            ),
          ),
          Stack(
            children: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.notifications_outlined),
                style: IconButton.styleFrom(
                  backgroundColor: isDark ? Colors.grey[800] : Colors.grey[100],
                ),
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        height: 180,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          image: const DecorationImage(
            image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuB3IAnsNTnfzIcwhQt38zNAi8jIhYUGWf-UYsKu2NoMci-baGDvNZIa2naRRs_OM3guE7GIeVst7ULZaNAzerSQP4Fws2osOaJ0SgZ1hgR3zdQOFxYj6GJ72dnirGc9M21YJiEtZVmjf05fRk3cQt7D0GbR1ZYJOfwF5qcVBg00_hBnOSx6EwZnwi0o-VZS0eWRx1_itUvdveKwKnOGsDBKZ6vANlyzNpZBn0MV-nxUNvrZ5RHN2OAG4PZtsiCCJhaSl9C2XvT6TfsW'),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                AppTheme.primaryColor.withOpacity(0.8),
              ],
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'WELCOME BACK',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                'Hello, $_userName!',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWeatherWidget(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'TODAY\'S WEATHER',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                  ),
                ),
                Icon(Icons.wb_sunny, color: Colors.amber[600]),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '24°C',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Sunny',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Row(
              children: [
                Icon(Icons.opacity, color: AppTheme.primaryColor, size: 16),
                SizedBox(width: 4),
                Text(
                  '62% humidity',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            'Quick Actions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildActionButton(Icons.center_focus_strong, 'Scan Crop', isDark, onTap: _openCamera),
              _buildActionButton(Icons.storefront, 'Find Shops', isDark, color: Colors.amber, 
                onTap: () => setState(() => _selectedIndex = 2)),
              _buildActionButton(Icons.menu_book, 'Knowledge', isDark, color: Colors.blue,
                onTap: () => setState(() => _selectedIndex = 3)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String label, bool isDark, {Color color = AppTheme.primaryColor, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 105,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1e291f) : Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? Colors.white10 : Colors.grey[200]!),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentDetections(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Detections',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              TextButton(
                onPressed: () {},
                child: const Text(
                  'See All',
                  style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_recentDetections.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(child: Text('No detections yet', style: TextStyle(color: Colors.grey))),
            )
          else
            ..._recentDetections.map((det) => Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: _buildDetectionItem(
                det.diseaseName,
                '${DateTime.now().difference(det.dateTime).inHours}h ago',
                'RESULT',
                AppTheme.primaryColor,
                det.imagePath,
                isDark,
                isLocal: true,
              ),
            )),
        ],
      ),
    );
  }

  Widget _buildDetectionItem(String title, String time, String status, Color statusColor, String imageUrl, bool isDark, {bool isLocal = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1e291f) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.grey[100]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: imageUrl.startsWith('http')
              ? Image.network(imageUrl, width: 56, height: 56, fit: BoxFit.cover)
              : (isLocal 
                  ? Image.file(File(imageUrl), width: 56, height: 56, fit: BoxFit.cover)
                  : Image.network(imageUrl, width: 56, height: 56, fit: BoxFit.cover)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  'Detected $time',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: statusColor,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(bool isDark) {
    return BottomAppBar(
      shape: const CircularNotchedRectangle(),
      notchMargin: 8,
      color: isDark ? const Color(0xFF1e291f).withOpacity(0.95) : Colors.white.withOpacity(0.95),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.home, 'Home', 0),
          _buildNavItem(Icons.camera_alt, 'Identify', 1),
          const SizedBox(width: 48), // Space for FAB
          _buildNavItem(Icons.shopping_bag, 'Market', 2),
          _buildNavItem(Icons.school, 'Learn', 3),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isSelected ? AppTheme.primaryColor : Colors.grey[400],
            size: 24,
          ),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? AppTheme.primaryColor : Colors.grey[400],
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
