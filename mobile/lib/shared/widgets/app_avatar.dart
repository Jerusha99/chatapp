import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/constants.dart';
import '../../core/utils/extensions.dart';

class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double size;
  final bool showOnline;
  final bool isOnline;
  final VoidCallback? onTap;
  final bool hasBorder;

  const AppAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.size = AppConstants.avatarMedium,
    this.showOnline = false,
    this.isOnline = false,
    this.onTap,
    this.hasBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final initials = name.initials;

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: hasBorder
                  ? Border.all(
                      color: AppColors.brucePrimary.withOpacity(0.3),
                      width: 2,
                    )
                  : null,
            ),
            child: ClipOval(
              child: imageUrl != null && imageUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: imageUrl!,
                      fit: BoxFit.cover,
                      width: size,
                      height: size,
                      placeholder: (context, url) => _buildFallback(isDark, initials),
                      errorWidget: (context, url, error) => _buildFallback(isDark, initials),
                    )
                  : _buildFallback(isDark, initials),
            ),
          ),
          if (showOnline)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: size * 0.28,
                height: size * 0.28,
                decoration: BoxDecoration(
                  color: isOnline ? AppColors.online : AppColors.textTertiaryLight,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    width: 2,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFallback(bool isDark, String initials) {
    final gradientColors = _getGradientForName(name);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.36,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  List<Color> _getGradientForName(String name) {
    final gradients = [
      [const Color(0xFF7C3AED), const Color(0xFF2563EB)],
      [const Color(0xFFEC4899), const Color(0xFFF43F5E)],
      [const Color(0xFF06B6D4), const Color(0xFF10B981)],
      [const Color(0xFFF59E0B), const Color(0xFFEF4444)],
      [const Color(0xFF8B5CF6), const Color(0xFFEC4899)],
      [const Color(0xFF3B82F6), const Color(0xFF06B6D4)],
    ];
    final index = name.hashCode.abs() % gradients.length;
    return gradients[index];
  }
}
