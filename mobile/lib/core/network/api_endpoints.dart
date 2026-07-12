class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String signUp = '/auth/signup';
  static const String signIn = '/auth/signin';
  static const String signOut = '/auth/signout';
  static const String refreshToken = '/auth/refresh';
  static const String userProfile = '/auth/me';

  // Users
  static const String users = '/users';
  static String userById(String id) => '/users/$id';
  static String userSearch(String query) => '/users/search?q=$query';

  // Chats
  static const String chats = '/chats';
  static String chatById(String id) => '/chats/$id';
  static String chatMembers(String chatId) => '/chats/$chatId/members';
  static String addMembers(String chatId) => '/chats/$chatId/members';

  // Messages
  static String messages(String chatId) => '/chats/$chatId/messages';
  static String messageById(String chatId, String messageId) =>
      '/chats/$chatId/messages/$messageId';
  static String messageRead(String chatId, String messageId) =>
      '/chats/$chatId/messages/$messageId/read';

  // Contacts
  static const String contacts = '/contacts';
  static const String contactRequests = '/contacts/requests';
  static String acceptContact(String id) => '/contacts/$id/accept';
  static String rejectContact(String id) => '/contacts/$id/reject';

  // Upload
  static const String upload = '/upload';
  static const String uploadImage = '/upload/image';
  static const String uploadVoice = '/upload/voice';

  // Profile
  static const String updateProfile = '/profile';
  static const String uploadAvatar = '/profile/avatar';
  static const String updateStatus = '/profile/status';
}
