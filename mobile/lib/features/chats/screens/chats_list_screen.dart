import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_decorations.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/glass_container.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/theme_toggle.dart';
import '../providers/chats_provider.dart';
import '../widgets/chat_list_tile.dart';
import '../widgets/chat_search_bar.dart';

class ChatsListScreen extends ConsumerStatefulWidget {
  const ChatsListScreen({super.key});

  @override
  ConsumerState<ChatsListScreen> createState() => _ChatsListScreenState();
}

class _ChatsListScreenState extends ConsumerState<ChatsListScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(chatsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final chatsAsync = ref.watch(chatsProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(isDark),
            const ChatSearchBar(),
            Expanded(
              child: chatsAsync.when(
                data: (chats) {
                  if (chats.isEmpty) {
                    return EmptyState(
                      icon: Icons.chat_bubble_outline,
                      title: 'No Chats Yet',
                      subtitle: 'Start a conversation with your friends',
                      actionText: 'Start Chat',
                      onAction: () => context.push('/create-chat'),
                    );
                  }
                  return RefreshIndicator(
                    onRefresh: () => ref.read(chatsProvider.notifier).refresh(),
                    color: AppColors.brucePrimary,
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: chats.length,
                      itemBuilder: (context, index) {
                        final chat = chats[index];
                        return ChatListTile(
                          chat: chat,
                          onTap: () {
                            context.push('/chat/${chat.id}?name=${Uri.encodeComponent(chat.name)}');
                          },
                        ).animate().fadeIn(
                              delay: Duration(milliseconds: index * 30),
                              duration: 400.ms,
                            ).slideX(
                              begin: 0.05,
                              end: 0,
                              delay: Duration(milliseconds: index * 30),
                              duration: 400.ms,
                              curve: Curves.easeOutCubic,
                            );
                      },
                    ),
                  );
                },
                loading: () => const ChatListSkeleton(),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: AppColors.error),
                      const SizedBox(height: 16),
                      Text('Failed to load chats',
                          style: AppTextStyles.bodyLarge.copyWith(
                              color: isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight)),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => ref.invalidate(chatsProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/create-chat'),
        backgroundColor: AppColors.brucePrimary,
        elevation: 4,
        child: const Icon(Icons.add_comment_outlined, color: Colors.white),
      ).animate().scale(
            delay: 300.ms,
            duration: 400.ms,
            curve: Curves.easeOutCubic,
          ),
    );
  }

  Widget _buildHeader(bool isDark) {
    final user = ref.read(chatsProvider.notifier);

    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      blur: 15,
      opacity: isDark ? 0.05 : 0.12,
      borderRadius: 0,
      child: Row(
        children: [
          Text(
            'Chat Bruce',
            style: AppTextStyles.h1.copyWith(
              foreground: Paint()..shader = AppColors.bruceGradient.createShader(
                const Rect.fromLTWH(0, 0, 200, 40),
              ),
            ),
          ),
          const Spacer(),
          const ThemeToggle(),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => context.push('/profile'),
            child: AppAvatar(
              imageUrl: null,
              name: 'U',
              size: 36,
            ),
          ),
        ],
      ),
    );
  }
}
