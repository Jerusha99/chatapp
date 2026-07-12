import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:record/record.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/glass_container.dart';
import '../providers/messages_provider.dart';
import '../data/messages_repository.dart';

class MessageInput extends ConsumerStatefulWidget {
  final String chatId;
  final TextEditingController textController;
  final String? replyToId;
  final String? replyToName;
  final String? replyToContent;
  final VoidCallback? onClearReply;
  final VoidCallback? onTyping;
  final VoidCallback? onMessageSent;

  const MessageInput({
    super.key,
    required this.chatId,
    required this.textController,
    this.replyToId,
    this.replyToName,
    this.replyToContent,
    this.onClearReply,
    this.onTyping,
    this.onMessageSent,
  });

  @override
  ConsumerState<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends ConsumerState<MessageInput>
    with SingleTickerProviderStateMixin {
  late AnimationController _sendAnimController;
  late Animation<double> _sendScaleAnimation;
  bool _hasText = false;
  bool _isRecording = false;
  DateTime? _recordStartTime;
  Timer? _recordTimer;
  String _recordDuration = '0:00';
  final AudioRecorder _audioRecorder = AudioRecorder();

  @override
  void initState() {
    super.initState();
    _sendAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _sendScaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _sendAnimController, curve: Curves.easeOut),
    );
    widget.textController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    widget.textController.removeListener(_onTextChanged);
    _sendAnimController.dispose();
    _recordTimer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final hasText = widget.textController.text.trim().isNotEmpty;
    if (hasText != _hasText) {
      setState(() => _hasText = hasText);
      if (hasText) {
        _sendAnimController.forward().then((_) => _sendAnimController.reverse());
      }
    }
    widget.onTyping?.call();
  }

  Future<void> _sendMessage() async {
    final text = widget.textController.text.trim();
    if (text.isEmpty) return;

    widget.textController.clear();
    setState(() => _hasText = false);

    try {
      await ref.read(messagesProvider(widget.chatId).notifier).sendMessage(
            chatId: widget.chatId,
            content: text,
            type: MessageType.text,
            replyToId: widget.replyToId,
          );
      widget.onClearReply?.call();
      widget.onMessageSent?.call();
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar('Failed to send message', isError: true);
      }
    }
  }

  void _showAttachmentSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => GlassContainer(
        blur: 20,
        opacity: isDark ? 0.1 : 0.2,
        borderRadius: 20,
        padding: const EdgeInsets.all(20),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildAttachmentOption(
                    icon: Icons.camera_alt_outlined,
                    label: 'Camera',
                    color: AppColors.brucePrimary,
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                  _buildAttachmentOption(
                    icon: Icons.photo_library_outlined,
                    label: 'Gallery',
                    color: AppColors.bruceSecondary,
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                  _buildAttachmentOption(
                    icon: Icons.insert_drive_file_outlined,
                    label: 'Document',
                    color: AppColors.success,
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                  _buildAttachmentOption(
                    icon: Icons.location_on_outlined,
                    label: 'Location',
                    color: AppColors.error,
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAttachmentOption({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      await _stopRecording();
    } else {
      await _startRecording();
    }
  }

  Future<void> _startRecording() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      if (mounted) {
        context.showAppSnackBar('Microphone permission required', isError: true);
      }
      return;
    }

    try {
      await _audioRecorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc),
        path: '',
      );
      setState(() {
        _isRecording = true;
        _recordStartTime = DateTime.now();
      });
      _recordTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (_recordStartTime != null) {
          final elapsed = DateTime.now().difference(_recordStartTime!);
          setState(() {
            _recordDuration = '${elapsed.inMinutes}:${(elapsed.inSeconds % 60).toString().padLeft(2, '0')}';
          });
        }
      });
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar('Failed to start recording', isError: true);
      }
    }
  }

  Future<void> _stopRecording() async {
    _recordTimer?.cancel();
    final path = await _audioRecorder.stop();
    setState(() => _isRecording = false);

    if (path != null && mounted) {
      final duration = _recordStartTime != null
          ? DateTime.now().difference(_recordStartTime!).inSeconds
          : 0;

      try {
        await ref.read(messagesProvider(widget.chatId).notifier).sendMessage(
              chatId: widget.chatId,
              content: 'Voice message',
              type: MessageType.voice,
              voiceUrl: path,
              voiceDuration: duration,
            );
        widget.onMessageSent?.call();
      } catch (e) {
        context.showAppSnackBar('Failed to send voice message', isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return GlassContainer(
      blur: 15,
      opacity: isDark ? 0.06 : 0.12,
      borderRadius: 0,
      padding: EdgeInsets.zero,
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.replyToId != null) _buildReplyBar(isDark),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  GestureDetector(
                    onTap: _showAttachmentSheet,
                    child: Container(
                      width: 36,
                      height: 36,
                      margin: const EdgeInsets.only(bottom: 4),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.darkSurfaceVariant
                            : AppColors.lightSurfaceVariant,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.add,
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                        size: 22,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Container(
                      constraints: const BoxConstraints(minHeight: 40),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.darkSurfaceVariant.withOpacity(0.6)
                            : AppColors.lightSurfaceVariant.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
                          width: 0.5,
                        ),
                      ),
                      child: TextField(
                        controller: widget.textController,
                        maxLines: 4,
                        minLines: 1,
                        textInputAction: TextInputAction.newline,
                        style: TextStyle(
                          color: isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight,
                          fontSize: 15,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: TextStyle(
                            color: isDark
                                ? AppColors.textTertiaryDark
                                : AppColors.textTertiaryLight,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  if (_hasText)
                    _buildSendButton(isDark)
                  else
                    _buildMicButton(isDark),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSendButton(bool isDark) {
    return AnimatedBuilder(
      animation: _sendScaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _sendScaleAnimation.value,
          child: child,
        );
      },
      child: GestureDetector(
        onTap: _sendMessage,
        child: Container(
          width: 40,
          height: 40,
          margin: const EdgeInsets.only(bottom: 2),
          decoration: const BoxDecoration(
            gradient: AppColors.bruceGradient,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.send_rounded,
            color: Colors.white,
            size: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildMicButton(bool isDark) {
    return GestureDetector(
      onTap: _toggleRecording,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 40,
        height: 40,
        margin: const EdgeInsets.only(bottom: 2),
        decoration: BoxDecoration(
          color: _isRecording
              ? AppColors.error.withOpacity(0.15)
              : (isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant),
          shape: BoxShape.circle,
          border: _isRecording
              ? Border.all(color: AppColors.error.withOpacity(0.5), width: 1.5)
              : null,
        ),
        child: Icon(
          _isRecording ? Icons.stop : Icons.mic,
          color: _isRecording ? AppColors.error : AppColors.brucePrimary,
          size: 22,
        ),
      ),
    );
  }

  Widget _buildReplyBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurfaceVariant.withOpacity(0.5)
            : AppColors.lightSurfaceVariant.withOpacity(0.5),
        border: Border(
          left: const BorderSide(color: AppColors.brucePrimary, width: 3),
          top: BorderSide(
            color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reply to ${widget.replyToName ?? ''}',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.brucePrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  widget.replyToContent ?? '',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              Icons.close,
              size: 18,
              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
            ),
            onPressed: widget.onClearReply,
          ),
        ],
      ),
    );
  }
}
