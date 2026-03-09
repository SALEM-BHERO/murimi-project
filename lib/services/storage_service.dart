import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:murimi_app/models/detection_result.dart';

class StorageService {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    String path = join(await getDatabasesPath(), 'murimi.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE detections(
            id TEXT PRIMARY KEY,
            cropType TEXT,
            diseaseName TEXT,
            confidence TEXT,
            analysis TEXT,
            imagePath TEXT,
            dateTime TEXT
          )
        ''');
      },
    );
  }

  Future<void> saveDetection(DetectionResult result) async {
    final db = await database;
    await db.insert('detections', result.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<DetectionResult>> getDetections() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('detections', orderBy: 'dateTime DESC');
    return List.generate(maps.length, (i) => DetectionResult.fromMap(maps[i]));
  }
}
