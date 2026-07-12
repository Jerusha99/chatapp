import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';

final themeModeProvider = StateProvider<bool>((ref) => false);

class ThemeToggle extends ConsumerWidget {
  const ThemeToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(themeModeProvider);

    return GestureDetector(
      onTap: () => ref.read(themeModeProvider.notifier).state = !isDark,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (child, animation) {
          return RotationTransition(
            turns: animation,
            child: FadeTransition(
              opacity: animation,
              child: child,
            ),
          );
        },
        child: isDark
            ? Container(
                key: const ValueKey('sun'),
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.wb_sunny_outlined,
                  color: AppColors.warning,
                  size: 20,
                ),
              )
            : Container(
                key: const ValueKey('moon'),
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.brucePrimary.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.dark_mode_outlined,
                  color: AppColors.brucePrimary,
                  size: 20,
                ),
              ),
      ),
    );
  }
}
