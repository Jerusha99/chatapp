import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_decorations.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../auth/providers/auth_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _bioController;
  bool _isLoading = false;
  XFile? _pickedImage;
  String? _currentAvatarUrl;

  @override
  void initState() {
    super.initState();
    final user = Supabase.instance.client.auth.currentUser;
    _nameController = TextEditingController(
      text: user?.userMetadata?['display_name'] as String? ?? '',
    );
    _bioController = TextEditingController(
      text: user?.userMetadata?['bio'] as String? ?? '',
    );
    _currentAvatarUrl = user?.userMetadata?['avatar_url'] as String?;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );
    if (picked != null) {
      setState(() => _pickedImage = picked);
    }
  }

  Future<String?> _uploadAvatar() async {
    if (_pickedImage == null) return _currentAvatarUrl;

    final userId = Supabase.instance.client.auth.currentUser!.id;
    final file = File(_pickedImage!.path);
    final bytes = await file.readAsBytes();
    final ext = _pickedImage!.path.split('.').last;
    final path = 'avatars/$userId.$ext';

    await Supabase.instance.client.storage
        .from('avatars')
        .uploadBinary(path, bytes, fileOptions: const FileOptions(upsert: true));

    final url = Supabase.instance.client.storage.from('avatars').getPublicUrl(path);
    return url;
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final avatarUrl = await _uploadAvatar();

      await Supabase.instance.client.auth.updateUser(
        UserAttributes(
          data: {
            'display_name': _nameController.text.trim(),
            'bio': _bioController.text.trim(),
            if (avatarUrl != null) 'avatar_url': avatarUrl,
          },
        ),
      );

      if (mounted) {
        context.showAppSnackBar('Profile updated successfully');
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar(e.toString(), isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

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
          'Edit Profile',
          style: AppTextStyles.h2.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildAvatarPicker(isDark),
              const SizedBox(height: 32),
              _buildNameField(isDark),
              const SizedBox(height: 16),
              _buildBioField(isDark),
              const SizedBox(height: 32),
              AppButton(
                text: 'Save Changes',
                onPressed: _isLoading ? null : _handleSave,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarPicker(bool isDark) {
    return GestureDetector(
      onTap: _pickImage,
      child: Stack(
        children: [
          _pickedImage != null
              ? ClipOval(
                  child: Image.file(
                    File(_pickedImage!.path),
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                )
              : AppAvatar(
                  imageUrl: _currentAvatarUrl,
                  name: _nameController.text.isNotEmpty
                      ? _nameController.text
                      : 'User',
                  size: 100,
                  hasBorder: true,
                ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                gradient: AppColors.bruceGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.camera_alt,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).scale(
          begin: const Offset(0.9, 0.9),
          end: const Offset(1, 1),
          duration: 400.ms,
        );
  }

  Widget _buildNameField(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Display Name',
          style: AppTextStyles.labelLarge.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: AppDecorations.neumorphicBox(
            isDark: isDark,
            borderRadius: 14,
          ),
          child: TextFormField(
            controller: _nameController,
            style: TextStyle(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              fontSize: 15,
            ),
            decoration: InputDecoration(
              hintText: 'Enter your display name',
              hintStyle: TextStyle(
                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
              ),
              prefixIcon: Icon(
                Icons.person_outline,
                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                size: 20,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter your display name';
              }
              if (value.trim().length < 2) {
                return 'Name must be at least 2 characters';
              }
              return null;
            },
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildBioField(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bio',
          style: AppTextStyles.labelLarge.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: AppDecorations.neumorphicBox(
            isDark: isDark,
            borderRadius: 14,
          ),
          child: TextFormField(
            controller: _bioController,
            maxLines: 3,
            maxLength: 200,
            style: TextStyle(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              fontSize: 15,
            ),
            decoration: InputDecoration(
              hintText: 'Tell us about yourself...',
              hintStyle: TextStyle(
                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
              ),
              prefixIcon: Padding(
                padding: const EdgeInsets.only(left: 14, right: 10, top: 14),
                child: Icon(
                  Icons.info_outline,
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                  size: 20,
                ),
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              counterStyle: TextStyle(
                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }
}
