import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/extensions.dart';
import '../providers/chats_provider.dart';

class ChatSearchBar extends ConsumerStatefulWidget {
  const ChatSearchBar({super.key});

  @override
  ConsumerState<ChatSearchBar> createState() => _ChatSearchBarState();
}

class _ChatSearchBarState extends ConsumerState<ChatSearchBar> {
  final _controller = TextEditingController();
  bool _isFocused = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurfaceVariant.withOpacity(0.5)
            : AppColors.lightSurfaceVariant.withOpacity(0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isFocused
              ? AppColors.brucePrimary.withOpacity(0.5)
              : (isDark ? AppColors.darkDivider : AppColors.lightDivider),
          width: _isFocused ? 1.5 : 1,
        ),
      ),
      child: TextField(
        controller: _controller,
        onChanged: (value) {
          ref.read(chatsProvider.notifier).search(value);
        },
        onTap: () => setState(() => _isFocused = true),
        onEditingComplete: () => setState(() => _isFocused = false),
        style: TextStyle(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          fontSize: 14,
        ),
        decoration: InputDecoration(
          hintText: 'Search chats...',
          hintStyle: TextStyle(
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
          ),
          prefixIcon: Icon(
            Icons.search,
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
            size: 20,
          ),
          suffixIcon: _controller.text.isNotEmpty
              ? GestureDetector(
                  onTap: () {
                    _controller.clear();
                    ref.read(chatsProvider.notifier).search('');
                    setState(() {});
                  },
                  child: Icon(
                    Icons.close,
                    color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                    size: 18,
                  ),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }
}
