class User {
  final String id;
  final String phoneNumber;
  final String fullName;
  final String? token;

  User({
    required this.id,
    required this.phoneNumber,
    required this.fullName,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['user']?['id'] ?? json['id'] ?? '',
      phoneNumber: json['user']?['phone_number'] ?? json['phone_number'] ?? '',
      fullName: json['user']?['full_name'] ?? json['full_name'] ?? '',
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone_number': phoneNumber,
      'full_name': fullName,
      'token': token,
    };
  }
}
