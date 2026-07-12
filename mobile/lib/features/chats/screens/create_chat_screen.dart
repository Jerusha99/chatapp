import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../providers/chats_provider.dart';

class CreateChatScreen extends ConsumerStatefulWidget {
  const CreateChatScreen({super.key});

  @override
  ConsumerState<CreateChatScreen> createState() => _CreateChatScreenState();
}

class _CreateChatScreenState extends ConsumerState<CreateChatScreen> {
  final _nameController = TextEditingController();
  final _searchController = TextEditingController();
  final Set<String> _selectedUserIds = {};
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleCreateChat() async {
    if (_nameController.text.trim().isEmpty && _selectedUserIds.isEmpty) {
      context.showAppSnackBar('Please enter a chat name or select members', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      final chat = await ref.read(chatsProvider.notifier).createChat(
            name: _nameController.text.trim(),
            type: _selectedUserIds.length > 1 ? 'group' : 'direct',
            memberIds: _selectedUserIds.toList(),
          );
      if (mounted) {
        context.push('/chat/${chat.id}?name=${Uri.encodeComponent(chat.name)}');
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
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'New Chat',
          style: AppTextStyles.h2.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        centerTitle: false,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppTextField(
              hintText: 'Chat name (optional for direct messages)',
              controller: _nameController,
              textInputAction: TextInputAction.next,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: AppTextField(
              hintText: 'Search contacts...',
              controller: _searchController,
              prefixIcon: Icon(
                Icons.search,
                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                size: 20,
              ),
              onChanged: (value) {
                setState(() {});
              },
            ),
          ),
          const SizedBox(height: 8),
          if (_selectedUserIds.isNotEmpty)
            Container(
              height: 80,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: _selectedUserIds.map((userId) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Stack(
                          children: [
                            AppAvatar(
                              name: userId.substring(0, 2).toUpperCase(),
                              size: 48,
                            ),
                            Positioned(
                              top: -2,
                              right: -2,
                              child: GestureDetector(
                                onTap: () {
                                  setState(() => _selectedUserIds.remove(userId));
                                },
                                child: Container(
                                  width: 20,
                                  height: 20,
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          userId.length > 8 ? userId.substring(0, 8) : userId,
                          style: AppTextStyles.labelSmall.copyWith(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          const SizedBox(height: 8),
          Expanded(
            child: _searchController.text.isNotEmpty
                ? _buildSearchResults(isDark)
                : _buildContactsList(isDark),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppButton(
              text: _selectedUserIds.isEmpty ? 'Create Direct Chat' : 'Create Group Chat',
              onPressed: _isLoading ? null : _handleCreateChat,
              isLoading: _isLoading,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactsList(bool isDark) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        _buildSectionHeader('Recent', isDark),
        const SizedBox(height: 8),
        _buildEmptyContactState(isDark),
      ],
    );
  }

  Widget _buildSearchResults(bool isDark) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.search,
            size: 48,
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
          ),
          const SizedBox(height: 12),
          Text(
            'Search for contacts',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Text(
      title,
      style: AppTextStyles.labelLarge.copyWith(
        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
      ),
    );
  }

  Widget _buildEmptyContactState(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Center(
        child: Text(
          'No contacts found. Try searching by name or phone number.',
          style: AppTextStyles.bodyMedium.copyWith(
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
