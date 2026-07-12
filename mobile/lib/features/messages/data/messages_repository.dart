import 'package:supabase_flutter/supabase_flutter.dart';

enum MessageType { text, image, voice, document, system }

enum MessageStatus { sending, sent, delivered, read, failed }

class MessageModel {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? replyToId;
  final String? replyToContent;
  final String? replyToSender;
  final String? imageUrl;
  final String? voiceUrl;
  final int? voiceDuration;
  final String? documentName;
  final int? documentSize;

  MessageModel({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    this.type = MessageType.text,
    this.status = MessageStatus.sent,
    required this.createdAt,
    this.updatedAt,
    this.replyToId,
    this.replyToContent,
    this.replyToSender,
    this.imageUrl,
    this.voiceUrl,
    this.voiceDuration,
    this.documentName,
    this.documentSize,
  });

  bool get isMine {
    return senderId == Supabase.instance.client.auth.currentUser?.id;
  }

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'] ?? '',
      chatId: json['chat_id'] ?? '',
      senderId: json['sender_id'] ?? '',
      senderName: json['sender_name'] ?? json['sender']?['display_name'] ?? 'Unknown',
      senderAvatarUrl: json['sender_avatar'] ?? json['sender']?['avatar_url'],
      content: json['content'] ?? '',
      type: MessageType.values.firstWhere(
        (t) => t.name == (json['type'] ?? 'text'),
        orElse: () => MessageType.text,
      ),
      status: MessageStatus.values.firstWhere(
        (s) => s.name == (json['status'] ?? 'sent'),
        orElse: () => MessageStatus.sent,
      ),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
      replyToId: json['reply_to_id'],
      replyToContent: json['reply_to_content'],
      replyToSender: json['reply_to_sender'],
      imageUrl: json['image_url'],
      voiceUrl: json['voice_url'],
      voiceDuration: json['voice_duration'],
      documentName: json['document_name'],
      documentSize: json['document_size'],
    );
  }
}

class MessagesRepository {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<MessageModel>> getMessages({
    required String chatId,
    int limit = 30,
    String? cursor,
  }) async {
    var query = _client
        .from('messages')
        .select('*, sender:users(display_name, avatar_url)')
        .eq('chat_id', chatId);

    if (cursor != null) {
      query = query.lt('created_at', cursor);
    }

    final response = await query
        .order('created_at', ascending: false)
        .limit(limit);

    return (response as List).map((json) {
      final sender = json['sender'];
      return MessageModel(
        id: json['id'],
        chatId: json['chat_id'],
        senderId: json['sender_id'],
        senderName: sender?['display_name'] ?? 'Unknown',
        senderAvatarUrl: sender?['avatar_url'],
        content: json['content'] ?? '',
        type: MessageType.values.firstWhere(
          (t) => t.name == (json['type'] ?? 'text'),
          orElse: () => MessageType.text,
        ),
        status: MessageStatus.values.firstWhere(
          (s) => s.name == (json['status'] ?? 'sent'),
          orElse: () => MessageStatus.sent,
        ),
        createdAt: DateTime.parse(json['created_at']),
        updatedAt: json['updated_at'] != null
            ? DateTime.parse(json['updated_at'])
            : null,
        replyToId: json['reply_to_id'],
        replyToContent: json['reply_to_content'],
        replyToSender: json['reply_to_sender'],
        imageUrl: json['image_url'],
        voiceUrl: json['voice_url'],
        voiceDuration: json['voice_duration'],
        documentName: json['document_name'],
        documentSize: json['document_size'],
      );
    }).toList();
  }

  Future<MessageModel> sendMessage({
    required String chatId,
    required String content,
    MessageType type = MessageType.text,
    String? replyToId,
    String? imageUrl,
    String? voiceUrl,
    int? voiceDuration,
    String? documentName,
    int? documentSize,
  }) async {
    final userId = _client.auth.currentUser!.id;

    final data = {
      'chat_id': chatId,
      'sender_id': userId,
      'content': content,
      'type': type.name,
      'status': 'sent',
      'reply_to_id': replyToId,
      'image_url': imageUrl,
      'voice_url': voiceUrl,
      'voice_duration': voiceDuration,
      'document_name': documentName,
      'document_size': documentSize,
    };

    final response = await _client
        .from('messages')
        .insert(data)
        .select('*, sender:users(display_name, avatar_url)')
        .single();

    final sender = response['sender'];
    return MessageModel(
      id: response['id'],
      chatId: response['chat_id'],
      senderId: response['sender_id'],
      senderName: sender?['display_name'] ?? 'Unknown',
      senderAvatarUrl: sender?['avatar_url'],
      content: response['content'] ?? '',
      type: MessageType.values.firstWhere(
        (t) => t.name == (response['type'] ?? 'text'),
        orElse: () => MessageType.text,
      ),
      status: MessageStatus.sent,
      createdAt: DateTime.parse(response['created_at']),
      replyToId: response['reply_to_id'],
      imageUrl: response['image_url'],
      voiceUrl: response['voice_url'],
      voiceDuration: response['voice_duration'],
      documentName: response['document_name'],
      documentSize: response['document_size'],
    );
  }

  Future<MessageModel> editMessage({
    required String chatId,
    required String messageId,
    required String content,
  }) async {
    final response = await _client
        .from('messages')
        .update({
          'content': content,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', messageId)
        .select('*, sender:users(display_name, avatar_url)')
        .single();

    final sender = response['sender'];
    return MessageModel(
      id: response['id'],
      chatId: response['chat_id'],
      senderId: response['sender_id'],
      senderName: sender?['display_name'] ?? 'Unknown',
      senderAvatarUrl: sender?['avatar_url'],
      content: response['content'] ?? '',
      type: MessageType.values.firstWhere(
        (t) => t.name == (response['type'] ?? 'text'),
        orElse: () => MessageType.text,
      ),
      status: MessageStatus.values.firstWhere(
        (s) => s.name == (response['status'] ?? 'sent'),
        orElse: () => MessageStatus.sent,
      ),
      createdAt: DateTime.parse(response['created_at']),
      updatedAt: response['updated_at'] != null
          ? DateTime.parse(response['updated_at'])
          : null,
    );
  }

  Future<void> deleteMessage(String messageId) async {
    await _client.from('messages').delete().eq('id', messageId);
  }

  Future<void> markAsRead(String chatId) async {
    final userId = _client.auth.currentUser!.id;
    await _client
        .from('messages')
        .update({'status': 'read'})
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .neq('status', 'read');
  }

  Stream<List<Map<String, dynamic>>> subscribeToMessages(String chatId) {
    return _client
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('chat_id', chatId)
        .order('created_at', ascending: false);
  }
}
