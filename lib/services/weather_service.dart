import 'dart:convert';
import 'package:http/http.dart' as http;

class WeatherService {
  // Typically you'd use a key here, e.g. from OpenWeatherMap.
  // For the school project, we will simulate real data if no key is present,
  // or use a free public API.
  
  Future<Map<String, dynamic>> getWeatherData(String city) async {
    try {
      // Simulate real API latency
      await Future.delayed(const Duration(seconds: 1));
      
      // Real school projects can use MetaWeather or OpenWeather free tier.
      // Here we provide structured data that matches the UI.
      return {
        'temp': 24,
        'condition': 'Sunny',
        'humidity': 62,
        'location': city,
      };
    } catch (e) {
      return {
        'temp': 20,
        'condition': 'Cloudy',
        'humidity': 50,
        'location': 'Harare',
      };
    }
  }
}
