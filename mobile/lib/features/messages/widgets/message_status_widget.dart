import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../data/messages_repository.dart';

class MessageStatusWidget extends StatelessWidget {
  final MessageStatus status;

  const MessageStatusWidget({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case MessageStatus.sending:
        return SizedBox(
          width: 12,
          height: 12,
          child: CircularProgressIndicator(
            strokeWidth: 1.5,
            color: Colors.white.withOpacity(0.5),
          ),
        );

      case MessageStatus.sent:
        return Icon(
          Icons.done,
          size: 14,
          color: Colors.white.withOpacity(0.7),
        );

      case MessageStatus.delivered:
        return Icon(
          Icons.done_all,
          size: 14,
          color: Colors.white.withOpacity(0.7),
        );

      case MessageStatus.read:
        return const Icon(
          Icons.done_all,
          size: 14,
          color: AppColors.tickRead,
        );

      case MessageStatus.failed:
        return const Icon(
          Icons.error_outline,
          size: 14,
          color: AppColors.error,
        );
    }
  }
}
