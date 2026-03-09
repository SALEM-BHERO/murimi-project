import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:murimi_app/services/api_service.dart';
import 'package:murimi_app/theme/app_theme.dart';
import 'package:murimi_app/screens/prescription_screen.dart';

class CameraScanScreen extends StatefulWidget {
  const CameraScanScreen({super.key});

  @override
  State<CameraScanScreen> createState() => _CameraScanScreenState();
}

class _CameraScanScreenState extends State<CameraScanScreen> {
  CameraController? _controller;
  Future<void>? _initializeControllerFuture;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;

    _controller = CameraController(
      cameras.first,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    _initializeControllerFuture = _controller!.initialize();
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _takePictureAndAnalyze() async {
    if (_controller == null || !_controller!.value.isInitialized || _isProcessing) return;

    setState(() => _isProcessing = true);

    try {
      await _initializeControllerFuture;
      final image = await _controller!.takePicture();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Processing with Murimi AI Backend...')),
      );

      final apiService = ApiService();
      final response = await apiService.detectDisease(image.path, cropType: 'Grain');

      if (!mounted) return;

      if (response != null && response['detection'] != null) {
        final det = response['detection'];
        final info = response['disease_info'];
        
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PrescriptionScreen(
              imagePath: image.path,
              analysisResult: """
# ${det['disease_name']}
**Confidence:** ${(det['confidence'] * 100).toStringAsFixed(1)}%

## Symptoms
${info['symptoms']}

## Treatment
${info['treatment']}

## Prevention
${info['prevention']}
""",
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('AI analysis failed. Please try again.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: FutureBuilder<void>(
              future: _initializeControllerFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done) {
                  return CameraPreview(_controller!);
                } else {
                  return const Center(child: CircularProgressIndicator(color: Colors.white));
                }
              },
            ),
          ),

          // Overlay Scrim
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.4),
                  Colors.transparent,
                  Colors.transparent,
                  Colors.black.withOpacity(0.6),
                ],
              ),
            ),
          ),

          // Header
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white),
                    style: IconButton.styleFrom(backgroundColor: Colors.black26),
                  ),
                  const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Murimi AI',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      Row(
                        children: [
                          Icon(Icons.circle, color: AppTheme.primaryColor, size: 8),
                          SizedBox(width: 4),
                          Text(
                            'LIVE SCAN',
                            style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.help_outline, color: Colors.white),
                    style: IconButton.styleFrom(backgroundColor: Colors.black26),
                  ),
                ],
              ),
            ),
          ),

          // Viewfinder
          Center(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white38, width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Stack(
                children: [
                  _buildCorner(Alignment.topLeft),
                  _buildCorner(Alignment.topRight),
                  _buildCorner(Alignment.bottomLeft),
                  _buildCorner(Alignment.bottomRight),
                  const Center(
                    child: Divider(color: AppTheme.primaryColor, thickness: 2),
                  ),
                ],
              ),
            ),
          ),

          // Controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSideButton(Icons.image, 'Gallery'),
                GestureDetector(
                  onTap: _takePictureAndAnalyze,
                  child: Container(
                    width: 80,
                    height: 80,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 4),
                    ),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: _isProcessing 
                        ? const Padding(
                            padding: EdgeInsets.all(12.0),
                            child: CircularProgressIndicator(color: AppTheme.primaryColor),
                          )
                        : null,
                    ),
                  ),
                ),
                _buildSideButton(Icons.flash_on, 'Flash'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCorner(Alignment alignment) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          border: Border(
            top: alignment == Alignment.topLeft || alignment == Alignment.topRight 
                ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
            bottom: alignment == Alignment.bottomLeft || alignment == Alignment.bottomRight 
                ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
            left: alignment == Alignment.topLeft || alignment == Alignment.bottomLeft 
                ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
            right: alignment == Alignment.topRight || alignment == Alignment.bottomRight 
                ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
          ),
          borderRadius: BorderRadius.only(
            topLeft: alignment == Alignment.topLeft ? const Radius.circular(12) : Radius.zero,
            topRight: alignment == Alignment.topRight ? const Radius.circular(12) : Radius.zero,
            bottomLeft: alignment == Alignment.bottomLeft ? const Radius.circular(12) : Radius.zero,
            bottomRight: alignment == Alignment.bottomRight ? const Radius.circular(12) : Radius.zero,
          ),
        ),
      ),
    );
  }

  Widget _buildSideButton(IconData icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white10,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white24),
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        const SizedBox(height: 4),
        Text(
          label.toUpperCase(),
          style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
