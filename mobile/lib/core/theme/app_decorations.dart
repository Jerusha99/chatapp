import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppDecorations {
  AppDecorations._();

  // ── Neumorphic ──────────────────────────────────────────
  static BoxDecoration neumorphicBox({
    Color? color,
    bool isPressed = false,
    bool isDark = false,
    double borderRadius = 16,
  }) {
    final surface = color ?? (isDark ? AppColors.darkSurface : AppColors.lightSurface);
    final shadowLight = isDark ? AppColors.neuDarkShadowLight : AppColors.neuLightShadowLight;
    final shadowDark = isDark ? AppColors.neuDarkShadowDark : AppColors.neuLightShadowDark;

    return BoxDecoration(
      color: surface,
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: isPressed
          ? [
              BoxShadow(
                color: shadowDark.withOpacity(0.5),
                offset: const Offset(2, 2),
                blurRadius: 4,
                spreadRadius: 1,
              ),
              BoxShadow(
                color: shadowLight.withOpacity(0.8),
                offset: const Offset(-2, -2),
                blurRadius: 4,
                spreadRadius: 1,
              ),
            ]
          : [
              BoxShadow(
                color: shadowDark.withOpacity(0.4),
                offset: const Offset(4, 4),
                blurRadius: 10,
                spreadRadius: 1,
              ),
              BoxShadow(
                color: shadowLight.withOpacity(0.7),
                offset: const Offset(-4, -4),
                blurRadius: 10,
                spreadRadius: 1,
              ),
            ],
    );
  }

  // ── Glassmorphism ───────────────────────────────────────
  static BoxDecoration glassBox({
    double blur = 10,
    double opacity = 0.15,
    bool isDark = false,
    double borderRadius = 16,
    Color? tint,
  }) {
    final bgColor = tint ??
        (isDark
            ? Colors.white.withOpacity(opacity * 0.3)
            : Colors.white.withOpacity(opacity));

    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: isDark
            ? Colors.white.withOpacity(0.08)
            : Colors.white.withOpacity(0.2),
        width: 1,
      ),
    );
  }

  // ── Gradient container ──────────────────────────────────
  static BoxDecoration gradientBox({
    LinearGradient? gradient,
    double borderRadius = 16,
  }) {
    return BoxDecoration(
      gradient: gradient ?? AppColors.bruceGradient,
      borderRadius: BorderRadius.circular(borderRadius),
    );
  }

  // ── Card ────────────────────────────────────────────────
  static BoxDecoration cardBox({
    bool isDark = false,
    double borderRadius = 16,
  }) {
    return BoxDecoration(
      color: isDark ? AppColors.darkCard : AppColors.lightCard,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
        width: 0.5,
      ),
    );
  }

  // ── Input decoration ────────────────────────────────────
  static InputDecoration inputDecoration({
    required bool isDark,
    String? hintText,
    Widget? prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: TextStyle(
        color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
      ),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: isDark
          ? AppColors.darkSurfaceVariant.withOpacity(0.5)
          : AppColors.lightSurfaceVariant.withOpacity(0.5),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.brucePrimary,
          width: 2,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.error,
          width: 1,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.error,
          width: 2,
        ),
      ),
    );
  }

  // ── Shimmer gradient ────────────────────────────────────
  static LinearGradient shimmerGradient({bool isDark = false}) {
    return LinearGradient(
      colors: isDark
          ? [
              AppColors.darkSurfaceVariant,
              AppColors.darkSurface.withOpacity(0.5),
              AppColors.darkSurfaceVariant,
            ]
          : [
              AppColors.lightSurfaceVariant,
              AppColors.lightSurface.withOpacity(0.5),
              AppColors.lightSurfaceVariant,
            ],
      stops: const [0.0, 0.5, 1.0],
      begin: const Alignment(-1.0, -0.3),
      end: const Alignment(1.0, 0.3),
    );
  }
}
