class AppConstants {
  AppConstants._();

  static const String appName = 'Chat Bruce';
  static const String appVersion = '1.0.0';

  // Hive boxes
  static const String settingsBox = 'settings';
  static const String cacheBox = 'cache';
  static const String themeKey = 'theme_mode';
  static const String localeKey = 'locale';

  // Shared preferences keys
  static const String hasSeenOnboarding = 'has_seen_onboarding';
  static const String userIdKey = 'user_id';

  // Animation durations
  static const Duration animFast = Duration(milliseconds: 150);
  static const Duration animNormal = Duration(milliseconds: 300);
  static const Duration animSlow = Duration(milliseconds: 500);

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB

  // Message limits
  static const int maxMessageLength = 4000;
  static const int typingTimeoutSeconds = 3;

  // Avatar sizes
  static const double avatarSmall = 36;
  static const double avatarMedium = 48;
  static const double avatarLarge = 80;

  // Online status threshold in seconds
  static const int onlineThresholdSeconds = 120;
}
