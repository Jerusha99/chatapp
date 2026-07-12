import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/helpers.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../providers/messages_provider.dart';
import '../data/messages_repository.dart';
import '../widgets/message_bubble.dart';
import '../widgets/message_input.dart';
import '../widgets/typing_indicator.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String chatId;
  final String chatName;

  const ChatScreen({
    super.key,
    required this.chatId,
    required this.chatName,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();
  String? _replyToId;
  String? _replyToName;
  String? _replyToContent;
  bool _isLoadingMore = false;
  bool _showScrollDown = false;
  Timer? _typingTimer;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom(instant: true);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _textController.dispose();
    _typingTimer?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreMessages();
    }

    final atBottom = _scrollController.position.pixels <=
        _scrollController.position.maxScrollExtent - 100;
    if (_showScrollDown == atBottom) {
      setState(() => _showScrollDown = !atBottom);
    }
  }

  Future<void> _loadMoreMessages() async {
    if (_isLoadingMore) return;
    _isLoadingMore = true;
    final previousOffset = _scrollController.position.maxScrollExtent;

    await ref.read(messagesProvider(widget.chatId).notifier).loadMore(widget.chatId);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final newOffset = _scrollController.position.maxScrollExtent;
      final delta = newOffset - previousOffset;
      if (delta > 0) {
        _scrollController.jumpTo(delta);
      }
      _isLoadingMore = false;
    });
  }

  void _scrollToBottom({bool instant = false}) {
    if (_scrollController.hasClients) {
      if (instant) {
        _scrollController.jumpTo(0);
      } else {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
        );
      }
    }
  }

  void _setReplyTo(String? messageId, String? senderName, String? content) {
    setState(() {
      _replyToId = messageId;
      _replyToName = senderName;
      _replyToContent = content;
    });
  }

  void _clearReply() {
    setState(() {
      _replyToId = null;
      _replyToName = null;
      _replyToContent = null;
    });
  }

  void _onTyping() {
    _typingTimer?.cancel();
    ref.read(typingProvider(widget.chatId).notifier).state = true;
    _typingTimer = Timer(const Duration(seconds: 3), () {
      ref.read(typingProvider(widget.chatId).notifier).state = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final messagesAsync = ref.watch(messagesProvider(widget.chatId));
    final isTyping = ref.watch(typingProvider(widget.chatId));

    ref.listen(messagesProvider(widget.chatId), (previous, next) {
      next.whenData((messages) {
        if (_scrollController.position.pixels <=
            _scrollController.position.maxScrollExtent + 50) {
          _scrollToBottom();
        }
      });
    });

    return Scaffold(
      appBar: _buildAppBar(isDark),
      body: Container(
        color: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        child: Column(
          children: [
            Expanded(
              child: Stack(
                children: [
                  messagesAsync.when(
                    data: (messages) {
                      if (messages.isEmpty) {
                        return _buildEmptyState(isDark);
                      }
                      return _buildMessagesList(messages, isDark);
                    },
                    loading: () => const MessageListSkeleton(),
                    error: (e, _) => _buildErrorState(e, isDark),
                  ),
                  if (_showScrollDown)
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: FloatingActionButton.small(
                        onPressed: () => _scrollToBottom(),
                        backgroundColor: isDark
                            ? AppColors.darkSurfaceVariant
                            : AppColors.lightSurface,
                        elevation: 2,
                        child: Icon(
                          Icons.keyboard_arrow_down,
                          color: isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (isTyping) const TypingIndicator(),
            MessageInput(
              chatId: widget.chatId,
              textController: _textController,
              replyToId: _replyToId,
              replyToName: _replyToName,
              replyToContent: _replyToContent,
              onClearReply: _clearReply,
              onTyping: _onTyping,
              onMessageSent: () {
                _clearReply();
                _scrollToBottom();
              },
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(bool isDark) {
    return AppBar(
      leading: IconButton(
        icon: Icon(
          Icons.arrow_back_ios_new,
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          size: 20,
        ),
        onPressed: () => context.pop(),
      ),
      title: Row(
        children: [
          AppAvatar(
            imageUrl: null,
            name: widget.chatName,
            size: 36,
            showOnline: true,
            isOnline: ref.watch(typingProvider(widget.chatId)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.chatName,
                  style: AppTextStyles.h3.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight,
                    fontSize: 16,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Online',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.online,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(
            Icons.videocam_outlined,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
          onPressed: () {},
        ),
        PopupMenuButton<String>(
          icon: Icon(
            Icons.more_vert,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onSelected: (value) {
            switch (value) {
              case 'view_profile':
                context.push('/profile');
                break;
              case 'clear_chat':
                _showClearChatDialog();
                break;
              case 'block':
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view_profile',
              child: Text('View Profile'),
            ),
            const PopupMenuItem(
              value: 'clear_chat',
              child: Text('Clear Chat'),
            ),
            const PopupMenuItem(
              value: 'block',
              child: Text('Block User', style: TextStyle(color: AppColors.error)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMessagesList(List<MessageModel> messages, bool isDark) {
    return ListView.builder(
      controller: _scrollController,
      reverse: true,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        final previousMessage = index < messages.length - 1
            ? messages[index + 1]
            : null;
        final showDateSeparator = previousMessage == null ||
            !_isSameDay(message.createdAt, previousMessage.createdAt);
        final showSender = previousMessage == null ||
            previousMessage.senderId != message.senderId;

        return Column(
          children: [
            if (showDateSeparator) _buildDateSeparator(message.createdAt, isDark),
            MessageBubble(
              message: message,
              showSender: showSender,
              onReply: () => _setReplyTo(
                message.id,
                message.senderName,
                message.content,
              ),
            )
                .animate()
                .fadeIn(duration: 300.ms)
                .slideY(
                  begin: 0.1,
                  end: 0,
                  duration: 300.ms,
                  curve: Curves.easeOutCubic,
                ),
          ],
        );
      },
    );
  }

  Widget _buildDateSeparator(DateTime date, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.darkSurfaceVariant.withOpacity(0.7)
              : AppColors.lightSurfaceVariant.withOpacity(0.7),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          Helpers.formatDate(date),
          style: AppTextStyles.labelSmall.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppColors.bruceGradient.withOpacity(0.15),
            ),
            child: const Center(
              child: Icon(
                Icons.chat_bubble_outline,
                size: 36,
                color: AppColors.brucePrimary,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No messages yet',
            style: AppTextStyles.h3.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Say hello to start the conversation!',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(Object error, bool isDark) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            'Failed to load messages',
            style: AppTextStyles.bodyLarge.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => ref.invalidate(messagesProvider(widget.chatId)),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  void _showClearChatDialog() {
    Helpers.showAppDialog(
      context,
      title: 'Clear Chat',
      content: 'Are you sure you want to clear all messages in this chat?',
      confirmText: 'Clear',
      isDestructive: true,
      onConfirm: () {},
    );
  }
}
