import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/utils/extensions.dart';
import '../data/messages_repository.dart';
import 'message_status_widget.dart';
import 'voice_message_widget.dart';

class MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool showSender;
  final VoidCallback? onReply;

  const MessageBubble({
    super.key,
    required this.message,
    this.showSender = true,
    this.onReply,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMine = message.isMine;

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: GestureDetector(
        onLongPress: () => _showContextMenu(context),
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.78,
          ),
          margin: EdgeInsets.only(
            left: isMine ? 48 : 0,
            right: isMine ? 0 : 48,
            top: showSender ? 6 : 2,
            bottom: 2,
          ),
          child: Column(
            crossAxisAlignment:
                isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              if (showSender && !isMine)
                Padding(
                  padding: const EdgeInsets.only(left: 4, bottom: 4),
                  child: Text(
                    message.senderName,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: _getSenderColor(message.senderName),
                    ),
                  ),
                ),
              _buildBubbleContent(context, isDark, isMine),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBubbleContent(BuildContext context, bool isDark, bool isMine) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: _getBubbleDecoration(isDark, isMine),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (message.replyToId != null) _buildReplyPreview(isDark),
          _buildMessageContent(context, isDark, isMine),
          const SizedBox(height: 2),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (message.updatedAt != null)
                Text(
                  'edited',
                  style: AppTextStyles.labelSmall.copyWith(
                    fontSize: 10,
                    color: isMine
                        ? Colors.white.withOpacity(0.6)
                        : (isDark
                            ? AppColors.textTertiaryDark
                            : AppColors.textTertiaryLight),
                  ),
                ),
              const SizedBox(width: 4),
              Text(
                Helpers.formatTime(message.createdAt),
                style: AppTextStyles.chatTimestamp.copyWith(
                  color: isMine
                      ? Colors.white.withOpacity(0.7)
                      : (isDark
                          ? AppColors.textTertiaryDark
                          : AppColors.textTertiaryLight),
                  fontSize: 10,
                ),
              ),
              if (isMine) ...[
                const SizedBox(width: 4),
                MessageStatusWidget(status: message.status),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessageContent(BuildContext context, bool isDark, bool isMine) {
    switch (message.type) {
      case MessageType.text:
        return Text(
          message.content,
          style: AppTextStyles.chatMessage.copyWith(
            color: isMine
                ? Colors.white
                : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
          ),
        );

      case MessageType.image:
        return _buildImageContent(context, isDark);

      case MessageType.voice:
        return VoiceMessageWidget(
          audioUrl: message.voiceUrl ?? '',
          duration: message.voiceDuration ?? 0,
          isMine: isMine,
        );

      case MessageType.document:
        return _buildDocumentContent(isDark);

      case MessageType.system:
        return Text(
          message.content,
          style: AppTextStyles.bodySmall.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            fontStyle: FontStyle.italic,
          ),
        );
    }
  }

  Widget _buildImageContent(BuildContext context, bool isDark) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: GestureDetector(
        onTap: () => _showFullImage(context),
        child: CachedNetworkImage(
          imageUrl: message.imageUrl ?? '',
          width: 220,
          height: 160,
          fit: BoxFit.cover,
          placeholder: (context, url) => Container(
            width: 220,
            height: 160,
            color: isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
            child: const Center(
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.brucePrimary,
                ),
              ),
            ),
          ),
          errorWidget: (context, url, error) => Container(
            width: 220,
            height: 160,
            color: isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
            child: Icon(
              Icons.broken_image_outlined,
              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDocumentContent(bool isDark) {
    final textColor = message.isMine
        ? Colors.white
        : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight);
    final subTextColor = message.isMine
        ? Colors.white.withOpacity(0.7)
        : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: message.isMine
                ? Colors.white.withOpacity(0.2)
                : AppColors.brucePrimary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.insert_drive_file_outlined,
            color: message.isMine ? Colors.white : AppColors.brucePrimary,
            size: 22,
          ),
        ),
        const SizedBox(width: 10),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.documentName ?? 'Document',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              if (message.documentSize != null)
                Text(
                  Helpers.formatFileSize(message.documentSize!),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: subTextColor,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReplyPreview(bool isDark) {
    final textColor = message.isMine
        ? Colors.white
        : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight);

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: message.isMine
            ? Colors.white.withOpacity(0.15)
            : AppColors.brucePrimary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border(
          left: BorderSide(
            color: message.isMine
                ? Colors.white.withOpacity(0.5)
                : AppColors.brucePrimary,
            width: 3,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message.replyToSender ?? '',
            style: AppTextStyles.labelSmall.copyWith(
              color: message.isMine
                  ? Colors.white.withOpacity(0.8)
                  : AppColors.brucePrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            message.replyToContent ?? '',
            style: AppTextStyles.bodySmall.copyWith(
              color: textColor.withOpacity(0.7),
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  BoxDecoration _getBubbleDecoration(bool isDark, bool isMine) {
    if (isMine) {
      return BoxDecoration(
        gradient: AppColors.bruceGradient,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(16),
          topRight: const Radius.circular(16),
          bottomLeft: const Radius.circular(16),
          bottomRight: const Radius.circular(4),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.brucePrimary.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      );
    }

    return BoxDecoration(
      color: isDark ? AppColors.darkCard : AppColors.lightCard,
      borderRadius: BorderRadius.only(
        topLeft: const Radius.circular(16),
        topRight: const Radius.circular(16),
        bottomLeft: const Radius.circular(4),
        bottomRight: const Radius.circular(16),
      ),
      border: Border.all(
        color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
        width: 0.5,
      ),
    );
  }

  Color _getSenderColor(String name) {
    final colors = [
      const Color(0xFF7C3AED),
      const Color(0xFFEC4899),
      const Color(0xFF06B6D4),
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
      const Color(0xFF3B82F6),
    ];
    return colors[name.hashCode.abs() % colors.length];
  }

  void _showContextMenu(BuildContext context) {
    final isMine = message.isMine;
    final now = DateTime.now();
    final canEdit = isMine &&
        message.type == MessageType.text &&
        now.difference(message.createdAt).inMinutes < 15;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: 12, bottom: 16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.reply, size: 22),
                title: const Text('Reply'),
                onTap: () {
                  Navigator.pop(context);
                  onReply?.call();
                },
              ),
              if (message.type == MessageType.text)
                ListTile(
                  leading: const Icon(Icons.copy, size: 22),
                  title: const Text('Copy'),
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: message.content));
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Message copied'),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              if (canEdit)
                ListTile(
                  leading: const Icon(Icons.edit, size: 22),
                  title: const Text('Edit'),
                  onTap: () {
                    Navigator.pop(context);
                    _showEditDialog(context);
                  },
                ),
              if (isMine)
                ListTile(
                  leading: const Icon(Icons.delete, size: 22, color: AppColors.error),
                  title: const Text('Delete', style: TextStyle(color: AppColors.error)),
                  onTap: () {
                    Navigator.pop(context);
                    _showDeleteDialog(context);
                  },
                ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  void _showEditDialog(BuildContext context) {
    final controller = TextEditingController(text: message.content);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Message'),
        content: TextField(
          controller: controller,
          maxLines: null,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Edit message...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Message'),
        content: const Text('Are you sure you want to delete this message?'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showFullImage(BuildContext context) {
    if (message.imageUrl == null) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.black,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: Center(
            child: InteractiveViewer(
              child: CachedNetworkImage(
                imageUrl: message.imageUrl!,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
