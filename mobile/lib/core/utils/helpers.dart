import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  Helpers._();

  static String formatTime(DateTime time) {
    return DateFormat('HH:mm').format(time);
  }

  static String formatDate(DateTime time) {
    if (_isToday(time)) return 'Today';
    if (_isYesterday(time)) return 'Yesterday';
    return DateFormat('MMM d, yyyy').format(time);
  }

  static String formatMessageCount(int count) {
    if (count == 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  }

  static String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  static String formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  static bool _isToday(DateTime time) {
    final now = DateTime.now();
    return time.year == now.year && time.month == now.month && time.day == now.day;
  }

  static bool _isYesterday(DateTime time) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return time.year == yesterday.year &&
        time.month == yesterday.month &&
        time.day == yesterday.day;
  }

  static void hideKeyboard(BuildContext context) {
    final currentFocus = FocusScope.of(context);
    if (!currentFocus.hasPrimaryFocus) {
      currentFocus.unfocus();
    }
  }

  static void showAppDialog(
    BuildContext context, {
    required String title,
    required String content,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    required VoidCallback onConfirm,
    bool isDestructive = false,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(cancelText),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onConfirm();
            },
            child: Text(
              confirmText,
              style: TextStyle(
                color: isDestructive ? Colors.red : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static String getChatDisplayName(List<String> memberNames) {
    if (memberNames.isEmpty) return 'Unknown';
    if (memberNames.length == 1) return memberNames.first;
    if (memberNames.length == 2) return memberNames.join(' & ');
    return '${memberNames.first} & ${memberNames.length - 1} others';
  }
}
