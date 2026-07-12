import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/helpers.dart';
import '../../../shared/widgets/glass_container.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_button.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = context.isDarkMode;
    final authState = ref.watch(authProvider);
    final user = Supabase.instance.client.auth.currentUser;
    final displayName = user?.userMetadata?['display_name'] as String? ??
        user?.email?.split('@').first ??
        'User';
    final email = user?.email ?? '';
    final phone = user?.phone ?? '';
    final avatarUrl = user?.userMetadata?['avatar_url'] as String?;
    final bio = user?.userMetadata?['bio'] as String? ?? 'No bio yet';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            size: 20,
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Profile',
          style: AppTextStyles.h2.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        centerTitle: false,
        actions: [
          TextButton(
            onPressed: () => context.push('/edit-profile'),
            child: const Text(
              'Edit',
              style: TextStyle(
                color: AppColors.brucePrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildAvatarSection(avatarUrl, displayName, isDark),
            const SizedBox(height: 24),
            _buildInfoCard(isDark, displayName, email, phone, bio),
            const SizedBox(height: 20),
            _buildStatsCard(isDark),
            const SizedBox(height: 20),
            _buildSettingsSection(context, isDark, ref),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarSection(String? avatarUrl, String name, bool isDark) {
    return Column(
      children: [
        AppAvatar(
          imageUrl: avatarUrl,
          name: name,
          size: 100,
          hasBorder: true,
        ),
        const SizedBox(height: 16),
        Text(
          name,
          style: AppTextStyles.displayMedium.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Online',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.online,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms).slideY(
          begin: -0.1,
          end: 0,
          duration: 400.ms,
          curve: Curves.easeOutCubic,
        );
  }

  Widget _buildInfoCard(
    bool isDark,
    String displayName,
    String email,
    String phone,
    String bio,
  ) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildInfoRow(
            icon: Icons.person_outline,
            label: 'Display Name',
            value: displayName,
            isDark: isDark,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.email_outlined,
            label: 'Email',
            value: email.isEmpty ? 'Not set' : email,
            isDark: isDark,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.phone_outlined,
            label: 'Phone',
            value: phone.isEmpty ? 'Not set' : phone,
            isDark: isDark,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.info_outline,
            label: 'Bio',
            value: bio,
            isDark: isDark,
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    required bool isDark,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.brucePrimary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.brucePrimary, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSmall.copyWith(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatsCard(bool isDark) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStatItem('0', 'Chats', isDark),
          Container(
            width: 1,
            height: 40,
            color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
          ),
          _buildStatItem('0', 'Messages', isDark),
          Container(
            width: 1,
            height: 40,
            color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
          ),
          _buildStatItem('0', 'Contacts', isDark),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildStatItem(String value, String label, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: AppTextStyles.displayMedium.copyWith(
            color: AppColors.brucePrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsSection(BuildContext context, bool isDark, WidgetRef ref) {
    return Column(
      children: [
        _buildSettingsTile(
          icon: Icons.notifications_outlined,
          title: 'Notifications',
          isDark: isDark,
          onTap: () {},
        ),
        _buildSettingsTile(
          icon: Icons.lock_outline,
          title: 'Privacy',
          isDark: isDark,
          onTap: () {},
        ),
        _buildSettingsTile(
          icon: Icons.help_outline,
          title: 'Help & Support',
          isDark: isDark,
          onTap: () {},
        ),
        const SizedBox(height: 16),
        AppButton(
          text: 'Sign Out',
          variant: AppButtonVariant.danger,
          icon: Icons.logout,
          onPressed: () async {
            Helpers.showAppDialog(
              context,
              title: 'Sign Out',
              content: 'Are you sure you want to sign out?',
              confirmText: 'Sign Out',
              isDestructive: true,
              onConfirm: () async {
                await ref.read(authProvider.notifier).signOut();
              },
            );
          },
        ),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 400.ms);
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          icon,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          size: 20,
        ),
      ),
      title: Text(
        title,
        style: AppTextStyles.bodyLarge.copyWith(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
        size: 22,
      ),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
