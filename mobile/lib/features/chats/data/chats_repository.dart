import 'package:supabase_flutter/supabase_flutter.dart';

class ChatModel {
  final String id;
  final String name;
  final String? avatarUrl;
  final String type;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final List<ChatMember> members;
  final DateTime createdAt;

  ChatModel({
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.type,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    this.members = const [],
    required this.createdAt,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      avatarUrl: json['avatar_url'],
      type: json['type'] ?? 'direct',
      lastMessage: json['last_message'],
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'])
          : null,
      unreadCount: json['unread_count'] ?? 0,
      members: (json['members'] as List<dynamic>?)
              ?.map((m) => ChatMember.fromJson(m))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class ChatMember {
  final String userId;
  final String displayName;
  final String? avatarUrl;
  final bool isOnline;
  final DateTime? lastSeen;

  ChatMember({
    required this.userId,
    required this.displayName,
    this.avatarUrl,
    this.isOnline = false,
    this.lastSeen,
  });

  factory ChatMember.fromJson(Map<String, dynamic> json) {
    return ChatMember(
      userId: json['user_id'] ?? json['id'] ?? '',
      displayName: json['display_name'] ?? json['name'] ?? 'Unknown',
      avatarUrl: json['avatar_url'],
      isOnline: json['is_online'] ?? false,
      lastSeen: json['last_seen'] != null ? DateTime.parse(json['last_seen']) : null,
    );
  }
}

class ChatsRepository {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<ChatModel>> getChats({
    int limit = 20,
    int offset = 0,
    String? search,
  }) async {
    var query = _client
        .from('chats')
        .select('*, members:chat_members(*, user:users(display_name, avatar_url, is_online, last_seen))');

    if (search != null && search.isNotEmpty) {
      query = query.ilike('name', '%$search%');
    }

    final response = await query
        .order('last_message_at', ascending: false)
        .range(offset, offset + limit - 1);

    return (response as List).map((json) {
      final members = (json['members'] as List?)
              ?.map((m) {
                final user = m['user'];
                return ChatMember(
                  userId: m['user_id'] ?? '',
                  displayName: user?['display_name'] ?? 'Unknown',
                  avatarUrl: user?['avatar_url'],
                  isOnline: user?['is_online'] ?? false,
                  lastSeen: user?['last_seen'] != null
                      ? DateTime.parse(user['last_seen'])
                      : null,
                );
              })
              .toList() ??
          [];

      return ChatModel(
        id: json['id'],
        name: json['name'] ?? '',
        avatarUrl: json['avatar_url'],
        type: json['type'] ?? 'direct',
        lastMessage: json['last_message'],
        lastMessageAt: json['last_message_at'] != null
            ? DateTime.parse(json['last_message_at'])
            : null,
        unreadCount: json['unread_count'] ?? 0,
        members: members,
        createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      );
    }).toList();
  }

  Future<ChatModel> createChat({
    required String name,
    String type = 'direct',
    List<String> memberIds = const [],
  }) async {
    final response = await _client
        .from('chats')
        .insert({
          'name': name,
          'type': type,
        })
        .select()
        .single();

    final chatId = response['id'];

    final currentUserId = _client.auth.currentUser!.id;
    final allMemberIds = {currentUserId, ...memberIds}.toList();

    await _client.from('chat_members').insert(
      allMemberIds.map((userId) => {
            'chat_id': chatId,
            'user_id': userId,
          }).toList(),
    );

    return ChatModel.fromJson(response);
  }

  Future<ChatModel> getChatDetail(String chatId) async {
    final response = await _client
        .from('chats')
        .select('*, members:chat_members(*, user:users(display_name, avatar_url, is_online, last_seen))')
        .eq('id', chatId)
        .single();

    final members = (response['members'] as List?)
            ?.map((m) {
              final user = m['user'];
              return ChatMember(
                userId: m['user_id'] ?? '',
                displayName: user?['display_name'] ?? 'Unknown',
                avatarUrl: user?['avatar_url'],
                isOnline: user?['is_online'] ?? false,
                lastSeen: user?['last_seen'] != null
                    ? DateTime.parse(user['last_seen'])
                    : null,
              );
            })
            .toList() ??
        [];

    return ChatModel(
      id: response['id'],
      name: response['name'] ?? '',
      avatarUrl: response['avatar_url'],
      type: response['type'] ?? 'direct',
      lastMessage: response['last_message'],
      lastMessageAt: response['last_message_at'] != null
          ? DateTime.parse(response['last_message_at'])
          : null,
      unreadCount: response['unread_count'] ?? 0,
      members: members,
      createdAt: DateTime.parse(response['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Future<void> addMembers(String chatId, List<String> userIds) async {
    await _client.from('chat_members').insert(
      userIds.map((userId) => {
            'chat_id': chatId,
            'user_id': userId,
          }).toList(),
    );
  }

  Future<void> leaveChat(String chatId) async {
    final userId = _client.auth.currentUser!.id;
    await _client
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);
  }

  Stream<List<Map<String, dynamic>>> subscribeToChats() {
    return _client
        .from('chats')
        .stream(primaryKey: ['id'])
        .order('last_message_at', ascending: false);
  }
}
