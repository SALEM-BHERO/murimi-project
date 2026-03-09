class DetectionResult {
  final String id;
  final String cropType;
  final String diseaseName;
  final String confidence;
  final String analysis;
  final String imagePath;
  final DateTime dateTime;

  DetectionResult({
    required this.id,
    required this.cropType,
    required this.diseaseName,
    required this.confidence,
    required this.analysis,
    required this.imagePath,
    required this.dateTime,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'cropType': cropType,
      'diseaseName': diseaseName,
      'confidence': confidence,
      'analysis': analysis,
      'imagePath': imagePath,
      'dateTime': dateTime.toIso8601String(),
    };
  }

  factory DetectionResult.fromMap(Map<String, dynamic> map) {
    return DetectionResult(
      id: map['id'],
      cropType: map['cropType'],
      diseaseName: map['diseaseName'],
      confidence: map['confidence'],
      analysis: map['analysis'],
      imagePath: map['imagePath'],
      dateTime: DateTime.parse(map['dateTime']),
    );
  }
}
