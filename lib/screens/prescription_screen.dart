import 'dart:io';
import 'package:flutter/material.dart';
import 'package:murimi_app/theme/app_theme.dart';
import 'package:murimi_app/screens/camera_scan_screen.dart';

class PrescriptionScreen extends StatelessWidget {
  final String imagePath;
  final String analysisResult;

  const PrescriptionScreen({
    super.key,
    required this.imagePath,
    required this.analysisResult,
  });

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            leading: IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              style: IconButton.styleFrom(backgroundColor: Colors.black26),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Image.file(
                File(imagePath),
                fit: BoxFit.cover,
              ),
            ),
            actions: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.share, color: Colors.white),
                style: IconButton.styleFrom(backgroundColor: Colors.black26),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                           Text(
                            'Detection Result',
                            style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            'Murimi AI Analysis',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.psychology, color: AppTheme.primaryColor, size: 32),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader('Diagnosis', Icons.info_outline),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[50],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1)),
                    ),
                    child: Text(
                      analysisResult,
                      style: TextStyle(
                        fontSize: 14, 
                        height: 1.6,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                  _buildSectionHeader('Recommended Actions', Icons.bolt),
                  const SizedBox(height: 12),
                  _buildActionItem(Icons.science, 'Treatment', 'Apply appropriate fungicides/pesticides based on the AI diagnosis above.', isDark),
                  _buildActionItem(Icons.content_cut, 'Pruning', 'Remove infected leaves and burn them to prevent further spread.', isDark),
                  _buildActionItem(Icons.storefront, 'Supplies', 'Check the Market/Shop Finder for verified stockists nearby.', isDark),
                  
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.storefront, color: Colors.white),
                      label: const Text('FIND TREATMENT NEARBY', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        shape: RoundedRectangleDirectional.fromSTEB(16, 16, 16, 16).borderRadius,
                        elevation: 4,
                      ),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(isDark, context),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildActionItem(IconData icon, String title, String description, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: AppTheme.primaryColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  description,
                  style: const TextStyle(color: Colors.grey, fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(bool isDark, BuildContext context) {
    return BottomAppBar(
      color: isDark ? const Color(0xFF1e291f) : Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.home, 'Home', false, () => Navigator.popUntil(context, (route) => route.isFirst)),
          _buildNavItem(Icons.center_focus_strong, 'Scan', true, () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const CameraScanScreen()))),
          _buildNavItem(Icons.store, 'Shop', false, () {}),
          _buildNavItem(Icons.person, 'Profile', false, () {}),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
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
