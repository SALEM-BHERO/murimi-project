import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:image_picker/image_picker.dart';

class GeminiService {
  final String apiKey;
  late final GenerativeModel _model;

  GeminiService(this.apiKey) {
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      ),
    );
  }

  Future<String?> analyzeCropImage(XFile image) async {
    try {
      final imageBytes = await image.readAsBytes();
      
      final prompt = [
        Content.multi([
          TextPart("""
            You are an expert Zimbabwean Agronomist specializing in Grain Crops (Maize, Sorghum, Millet).
            Analyze the provided image of a crop leaf or plant.
            
            1. Identify the crop (Maize, Sorghum, or Millet).
            2. Identify any visible disease or pest issue.
            3. Provide a confidence level.
            4. If a disease is found, provide a concise explanation and a 3-step treatment plan suitable for a Zimbabwean smallholder farmer.
            5. If healthy, confirm it is healthy and provide one maintenance tip.
            
            Format your response in plain text with clear headings.
          """),
          DataPart('image/jpeg', imageBytes),
        ])
      ];

      final response = await _model.generateContent(prompt);
      return response.text;
    } catch (e) {
      return "Error analyzing image: $e";
    }
  }
}
