import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/neu_card.dart';
import '../data/chats_repository.dart';

class ChatListTile extends StatelessWidget {
  final ChatModel chat;
  final VoidCallback? onTap;

  const ChatListTile({
    super.key,
    required this.chat,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final displayName = _getDisplayName();
    final avatarUrl = _getAvatarUrl();
    final isOnline = _isAnyoneOnline();
    final hasUnread = chat.unreadCount > 0;

    return NeuCard(
      onTap: onTap,
      borderRadius: 16,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          AppAvatar(
            imageUrl: avatarUrl,
            name: displayName,
            size: 52,
            showOnline: true,
            isOnline: isOnline,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        displayName,
                        style: AppTextStyles.chatName.copyWith(
                          color: isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (chat.lastMessageAt != null)
                      Text(
                        chat.lastMessageAt!.chatTimestamp,
                        style: AppTextStyles.chatTimestamp.copyWith(
                          color: hasUnread
                              ? AppColors.brucePrimary
                              : (isDark
                                  ? AppColors.textTertiaryDark
                                  : AppColors.textTertiaryLight),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        chat.lastMessage ?? 'No messages yet',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: isDark
                              ? AppColors.textSecondaryDark
                              : AppColors.textSecondaryLight,
                          fontWeight: hasUnread ? FontWeight.w500 : FontWeight.w400,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (hasUnread) ...[
                      const SizedBox(width: 8),
                      Container(
                        constraints: const BoxConstraints(minWidth: 22, minHeight: 22),
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        decoration: const BoxDecoration(
                          color: AppColors.brucePrimary,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            _formatUnreadCount(chat.unreadCount),
                            style: AppTextStyles.chatUnreadBadge.copyWith(
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getDisplayName() {
    if (chat.name.isNotEmpty) return chat.name;
    if (chat.members.isNotEmpty) {
      return chat.members.map((m) => m.displayName).join(', ');
    }
    return 'Unknown Chat';
  }

  String? _getAvatarUrl() {
    if (chat.avatarUrl != null) return chat.avatarUrl;
    if (chat.members.length == 1) return chat.members.first.avatarUrl;
    return null;
  }

  bool _isAnyoneOnline() {
    return chat.members.any((m) => m.isOnline);
  }

  String _formatUnreadCount(int count) {
    if (count > 99) return '99+';
    return count.toString();
  }
}
