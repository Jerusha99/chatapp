import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary brand colors
  static const Color brucePrimary = Color(0xFF7C3AED);
  static const Color brucePrimaryLight = Color(0xFF8B5CF6);
  static const Color brucePrimaryDark = Color(0xFF6D28D9);

  static const Color bruceSecondary = Color(0xFF2563EB);
  static const Color bruceAccent = Color(0xFF06B6D4);

  // Gradient
  static const LinearGradient bruceGradient = LinearGradient(
    colors: [brucePrimary, bruceSecondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient bruceGradientHorizontal = LinearGradient(
    colors: [brucePrimary, bruceSecondary],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Online indicator
  static const Color online = Color(0xFF22C55E);

  // Message ticks
  static const Color tickSent = Color(0xFF9CA3AF);
  static const Color tickDelivered = Color(0xFF9CA3AF);
  static const Color tickRead = Color(0xFF3B82F6);

  // Light theme surfaces
  static const Color lightBackground = Color(0xFFF8F9FE);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceVariant = Color(0xFFF1F5F9);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightDivider = Color(0xFFE2E8F0);
  static const Color glassLight = Color(0x26FFFFFF);
  static const Color glassLightHeavy = Color(0x40FFFFFF);

  // Dark theme surfaces
  static const Color darkBackground = Color(0xFF0F0F1A);
  static const Color darkSurface = Color(0xFF1A1A2E);
  static const Color darkSurfaceVariant = Color(0xFF232342);
  static const Color darkCard = Color(0xFF1E1E35);
  static const Color darkDivider = Color(0xFF2D2D4A);
  static const Color glassDark = Color(0x261A1A2E);
  static const Color glassDarkHeavy = Color(0x401A1A2E);

  // Neumorphic shadows (light mode)
  static const Color neuLightShadowLight = Color(0xFFFFFFFF);
  static const Color neuLightShadowDark = Color(0xFFD1D5DB);

  // Neumorphic shadows (dark mode)
  static const Color neuDarkShadowLight = Color(0xFF252542);
  static const Color neuDarkShadowDark = Color(0xFF0A0A15);

  // Text colors
  static const Color textPrimaryLight = Color(0xFF1E293B);
  static const Color textSecondaryLight = Color(0xFF64748B);
  static const Color textTertiaryLight = Color(0xFF94A3B8);

  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textTertiaryDark = Color(0xFF64748B);

  // Chat bubble colors
  static const Color sentBubbleLight = Color(0xFF7C3AED);
  static const Color receivedBubbleLight = Color(0xFFFFFFFF);
  static const Color sentBubbleDark = Color(0xFF2D1B69);
  static const Color receivedBubbleDark = Color(0xFF1E1E35);
}
