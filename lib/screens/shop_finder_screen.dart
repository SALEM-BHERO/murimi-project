import 'package:murimi_app/services/api_service.dart';

class ShopFinderScreen extends StatefulWidget {
  const ShopFinderScreen({super.key});

  @override
  State<ShopFinderScreen> createState() => _ShopFinderScreenState();
}

class _ShopFinderScreenState extends State<ShopFinderScreen> {
  final MapController _mapController = MapController();
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _shops = [];
  Map<String, dynamic>? _selectedShop;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadShops();
  }

  Future<void> _loadShops() async {
    // Harare default coordinates for simulation
    final shops = await _apiService.getNearbyShops(-17.8252, 31.0335);
    if (mounted) {
      setState(() {
        _shops = shops;
        _isLoading = false;
        if (_shops.isNotEmpty) _selectedShop = _shops.first;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop Finder'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search Agrochemical Stockists',
                prefixIcon: const Icon(Icons.search, color: AppTheme.primaryColor),
                filled: true,
                fillColor: isDark ? Colors.white10 : Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(-17.8252, 31.0335), // Harare, Zimbabwe
              initialZoom: 13,
              onTap: (_, __) => setState(() => _selectedShop = null),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.murimi.app',
                tileBuilder: isDark 
                  ? (context, tileWidget, tile) {
                      return ColorFiltered(
                        colorFilter: const ColorFilter.matrix([
                          -1.0, 0.0, 0.0, 0.0, 255.0,
                          0.0, -1.0, 0.0, 0.0, 255.0,
                          0.0, 0.0, -1.0, 0.0, 255.0,
                          0.0, 0.0, 0.0, 1.0, 0.0,
                        ]),
                        child: tileWidget,
                      );
                    }
                  : null,
              ),
              MarkerLayer(
                markers: _shops.map((shop) => Marker(
                  point: LatLng(shop['lat'], shop['lng']),
                  width: 40,
                  height: 40,
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedShop = shop),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _selectedShop?['id'] == shop['id'] ? Colors.orange : AppTheme.primaryColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: const Icon(Icons.storefront, color: Colors.white, size: 20),
                    ),
                  ),
                )).toList(),
              ),
            ],
          ),
          
          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
          
          // Floating Action Buttons
          Positioned(
            right: 16,
            top: 16,
            child: Column(
              children: [
                _buildMapFab(Icons.layers, isDark),
                const SizedBox(height: 8),
                _buildMapFab(Icons.my_location, isDark, primary: true, onTap: _loadShops),
              ],
            ),
          ),

          // Selected Shop Card
          if (_selectedShop != null)
            Positioned(
              bottom: 24,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1e291f) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20)],
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(_selectedShop!['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const Text('4.8', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    Text(_selectedShop!['address'], style: const TextStyle(color: Colors.grey, fontSize: 13)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.phone, color: AppTheme.primaryColor, size: 16),
                        const SizedBox(width: 8),
                        Text(_selectedShop!['phone_number'] ?? 'No contact', style: const TextStyle(fontSize: 13)),
                        const Spacer(),
                        const Icon(Icons.schedule, color: AppTheme.primaryColor, size: 16),
                        const SizedBox(width: 8),
                        const Text('Closes 5:00 PM', style: TextStyle(fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.directions, color: Colors.white),
                            label: const Text('DIRECTIONS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.share, color: AppTheme.primaryColor, size: 20),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMapFab(IconData icon, bool isDark, {bool primary = false, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: primary ? AppTheme.primaryColor : (isDark ? const Color(0xFF1e291f) : Colors.white),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
        ),
        child: Icon(icon, color: primary ? Colors.white : (isDark ? Colors.white70 : Colors.black87)),
      ),
    );
  }
}

  Widget _buildMapFab(IconData icon, bool isDark, {bool primary = false}) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: primary ? AppTheme.primaryColor : (isDark ? const Color(0xFF1e291f) : Colors.white),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: Icon(icon, color: primary ? Colors.white : (isDark ? Colors.white70 : Colors.black87)),
    );
  }
}
