import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/chats_repository.dart';

final chatsRepositoryProvider = Provider<ChatsRepository>((ref) {
  return ChatsRepository();
});

final chatsProvider = AsyncNotifierProvider<ChatsNotifier, List<ChatModel>>(ChatsNotifier.new);

class ChatsNotifier extends AsyncNotifier<List<ChatModel>> {
  late final ChatsRepository _repository;
  StreamSubscription? _subscription;

  @override
  Future<List<ChatModel>> build() async {
    _repository = ref.read(chatsRepositoryProvider);
    _setupRealtimeSubscription();
    return _repository.getChats();
  }

  void _setupRealtimeSubscription() {
    _subscription?.cancel();
    _subscription = Supabase.instance.client
        .from('chats')
        .stream(primaryKey: ['id'])
        .order('last_message_at', ascending: false)
        .listen((_) {
      refresh();
    });
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull ?? [];
    final more = await _repository.getChats(
      offset: current.length,
    );
    state = AsyncData([...current, ...more]);
  }

  Future<void> search(String query) async {
    if (query.isEmpty) {
      refresh();
      return;
    }
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _repository.getChats(search: query));
  }

  Future<ChatModel> createChat({
    required String name,
    String type = 'direct',
    List<String> memberIds = const [],
  }) async {
    final chat = await _repository.createChat(
      name: name,
      type: type,
      memberIds: memberIds,
    );
    refresh();
    return chat;
  }

  Future<ChatModel> getChatDetail(String chatId) async {
    return _repository.getChatDetail(chatId);
  }

  Future<void> addMembers(String chatId, List<String> userIds) async {
    await _repository.addMembers(chatId, userIds);
    refresh();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final chatSearchProvider = StateProvider<String>((ref) => '');
