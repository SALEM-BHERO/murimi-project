import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:murimi_app/models/user.dart';
import 'package:murimi_app/models/detection_result.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulators, localhost for physical devices or iOS
  static const String baseUrl = 'http://10.0.2.2:3001/api';
  static String? _token;

  static void setToken(String token) => _token = token;

  Future<User?> login(String phoneNumber, String password) async {
    try {
      print('Attempting login for: $phoneNumber');
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone_number': phoneNumber,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data);
        _token = user.token;
        return user;
      }
      return null;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  Future<User?> register(String phoneNumber, String fullName, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone_number': phoneNumber,
          'full_name': fullName,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        // After registration, the backend doesn't return a token, so we login
        return await login(phoneNumber, password);
      }
      return null;
    } catch (e) {
      print('Registration error: $e');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getKnowledgeArticles() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/knowledge/articles'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> detectDisease(String imagePath, {String? cropType, double? lat, double? lng}) async {
    if (_token == null) return null;
    try {
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/disease/detect'));
      request.headers['Authorization'] = 'Bearer $_token';
      
      request.files.add(await http.MultipartFile.fromPath('image', imagePath));
      if (cropType != null) request.fields['crop_type'] = cropType;
      if (lat != null) request.fields['lat'] = lat.toString();
      if (lng != null) request.fields['lng'] = lng.toString();

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Detection error: $e');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getNearbyShops(double lat, double lng, {double radius = 20}) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/shops?lat=$lat&lng=$lng&radius=$radius'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
      return [];
    } catch (e) {
      print('Error fetching shops: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> profile() async {
    if (_token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<List<DetectionResult>> getHistory() async {
    if (_token == null) return [];
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/disease/history'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => DetectionResult.fromMap({
          'id': item['id'].toString(),
          'cropType': item['crop_type'],
          'diseaseName': item['disease_name'],
          'confidence': item['confidence'].toString(),
          'analysis': item['analysis_result'],
          'imagePath': item['image_url'],
          'dateTime': item['created_at'],
        })).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> getArticleById(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/knowledge/articles/$id'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
