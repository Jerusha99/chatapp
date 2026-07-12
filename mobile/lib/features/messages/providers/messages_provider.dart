import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/messages_repository.dart';

final messagesRepositoryProvider = Provider<MessagesRepository>((ref) {
  return MessagesRepository();
});

final messagesProvider = AsyncNotifierProvider.family<MessagesNotifier, List<MessageModel>, String>(
  MessagesNotifier.new,
);

class MessagesNotifier extends FamilyAsyncNotifier<List<MessageModel>, String> {
  late final MessagesRepository _repository;
  RealtimeChannel? _channel;

  @override
  Future<List<MessageModel>> build(String chatId) async {
    _repository = ref.read(messagesRepositoryProvider);
    _setupRealtimeChannel(chatId);
    _repository.markAsRead(chatId);
    return _repository.getMessages(chatId: chatId);
  }

  void _setupRealtimeChannel(String chatId) {
    _channel?.unsubscribe();

    final userId = Supabase.instance.client.auth.currentUser?.id;

    _channel = Supabase.instance.client
        .channel('chat-$chatId')
        .onPostgresChanges(
          event: PostgresInsertEvent,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'chat_id',
            value: chatId,
          ),
          callback: (payload) async {
            final newMessage = payload.newRecord;
            final senderId = newMessage['sender_id'];

            if (senderId != userId) {
              final messages = await _repository.getMessages(chatId: chatId);
              state = AsyncData(messages);
              _repository.markAsRead(chatId);
            }
          },
        )
        .onPostgresChanges(
          event: PostgresUpdateEvent,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'chat_id',
            value: chatId,
          ),
          callback: (payload) async {
            final updatedData = payload.newRecord;
            final messageId = updatedData['id'];
            final current = state.valueOrNull;
            if (current != null) {
              final index = current.indexWhere((m) => m.id == messageId);
              if (index != -1) {
                final messages = await _repository.getMessages(chatId: chatId);
                state = AsyncData(messages);
              }
            }
          },
        )
        .onPostgresChanges(
          event: PostgresDeleteEvent,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'chat_id',
            value: chatId,
          ),
          callback: (payload) async {
            final deletedId = payload.oldRecord['id'];
            final current = state.valueOrNull;
            if (current != null) {
              state = AsyncData(
                current.where((m) => m.id != deletedId).toList(),
              );
            }
          },
        )
        .subscribe();
  }

  Future<void> loadMore(String chatId) async {
    final current = state.valueOrNull ?? [];
    if (current.isEmpty) return;
    final oldest = current.last;
    final more = await _repository.getMessages(
      chatId: chatId,
      cursor: oldest.createdAt.toIso8601String(),
    );
    state = AsyncData([...current, ...more]);
  }

  Future<MessageModel> sendMessage({
    required String chatId,
    required String content,
    MessageType type = MessageType.text,
    String? replyToId,
    String? imageUrl,
    String? voiceUrl,
    int? voiceDuration,
  }) async {
    final message = await _repository.sendMessage(
      chatId: chatId,
      content: content,
      type: type,
      replyToId: replyToId,
      imageUrl: imageUrl,
      voiceUrl: voiceUrl,
      voiceDuration: voiceDuration,
    );

    final current = state.valueOrNull ?? [];
    state = AsyncData([message, ...current]);

    return message;
  }

  Future<void> editMessage({
    required String chatId,
    required String messageId,
    required String content,
  }) async {
    final updated = await _repository.editMessage(
      chatId: chatId,
      messageId: messageId,
      content: content,
    );

    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((m) => m.id == messageId);
    if (index != -1) {
      final newList = [...current];
      newList[index] = updated;
      state = AsyncData(newList);
    }
  }

  Future<void> deleteMessage(String chatId, String messageId) async {
    await _repository.deleteMessage(messageId);
    final current = state.valueOrNull ?? [];
    state = AsyncData(current.where((m) => m.id != messageId).toList());
  }

  @override
  void dispose() {
    _channel?.unsubscribe();
    super.dispose();
  }
}

final typingProvider = StateProvider.family<bool, String>((ref, chatId) => false);
