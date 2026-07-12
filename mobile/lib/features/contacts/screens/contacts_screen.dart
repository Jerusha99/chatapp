import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../shared/widgets/glass_container.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_button.dart';

class ContactsScreen extends ConsumerStatefulWidget {
  const ContactsScreen({super.key});

  @override
  ConsumerState<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends ConsumerState<ContactsScreen> {
  final _searchController = TextEditingController();
  List<ContactUser> _contacts = [];
  List<ContactUser> _filteredContacts = [];
  bool _isLoading = false;
  bool _isSyncing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadContacts();
    _searchController.addListener(_filterContacts);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterContacts() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredContacts = query.isEmpty
          ? _contacts
          : _contacts
              .where((c) =>
                  c.displayName.toLowerCase().contains(query) ||
                  c.phone.toLowerCase().contains(query))
              .toList();
    });
  }

  Future<void> _loadContacts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiClient.instance.get(ApiEndpoints.contacts);
      final data = response.data as List<dynamic>;
      _contacts = data.map((json) => ContactUser.fromJson(json)).toList();
      _filteredContacts = _contacts;
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _syncContacts() async {
    setState(() => _isSyncing = true);

    try {
      await ApiClient.instance.post(
        ApiEndpoints.contacts,
        data: {'action': 'sync'},
      );
      await _loadContacts();
      if (mounted) {
        context.showAppSnackBar('Contacts synced successfully');
      }
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar('Failed to sync contacts', isError: true);
      }
    } finally {
      if (mounted) setState(() => _isSyncing = false);
    }
  }

  Future<void> _startChat(ContactUser contact) async {
    try {
      final response = await ApiClient.instance.post(
        ApiEndpoints.chats,
        data: {
          'type': 'direct',
          'member_ids': [contact.id],
        },
      );
      final chatId = response.data['id'] as String;
      if (mounted) {
        context.push('/chat/$chatId?name=${Uri.encodeComponent(contact.displayName)}');
      }
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar('Failed to start chat', isError: true);
      }
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
          'Contacts',
          style: AppTextStyles.h2.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: _isSyncing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.brucePrimary,
                    ),
                  )
                : Icon(
                    Icons.sync,
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
            onPressed: _isSyncing ? null : _syncContacts,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: _buildSearchBar(isDark),
          ),
          Expanded(
            child: _isLoading
                ? _buildLoadingState(isDark)
                : _error != null
                    ? _buildErrorState(isDark)
                    : _filteredContacts.isEmpty
                        ? _buildEmptyState(isDark)
                        : _buildContactsList(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurfaceVariant.withOpacity(0.5)
            : AppColors.lightSurfaceVariant.withOpacity(0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.darkDivider : AppColors.lightDivider,
          width: 1,
        ),
      ),
      child: TextField(
        controller: _searchController,
        style: TextStyle(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          fontSize: 14,
        ),
        decoration: InputDecoration(
          hintText: 'Search contacts...',
          hintStyle: TextStyle(
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
          ),
          prefixIcon: Icon(
            Icons.search,
            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
            size: 20,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? GestureDetector(
                  onTap: () {
                    _searchController.clear();
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

  Widget _buildContactsList(bool isDark) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _filteredContacts.length,
      itemBuilder: (context, index) {
        final contact = _filteredContacts[index];
        return _buildContactTile(contact, isDark)
            .animate()
            .fadeIn(
              delay: Duration(milliseconds: index * 30),
              duration: 300.ms,
            )
            .slideX(
              begin: 0.05,
              end: 0,
              delay: Duration(milliseconds: index * 30),
              duration: 300.ms,
            );
      },
    );
  }

  Widget _buildContactTile(ContactUser contact, bool isDark) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      borderRadius: 16,
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          AppAvatar(
            imageUrl: contact.avatarUrl,
            name: contact.displayName,
            size: 48,
            showOnline: contact.isOnline,
            isOnline: contact.isOnline,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  contact.displayName,
                  style: AppTextStyles.chatName.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  contact.phone,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _startChat(contact),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: AppColors.bruceGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                'Message',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState(bool isDark) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: AppColors.brucePrimary),
          const SizedBox(height: 16),
          Text(
            'Loading contacts...',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              'Failed to load contacts',
              style: AppTextStyles.bodyLarge.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 8),
            AppButton(
              text: 'Retry',
              variant: AppButtonVariant.secondary,
              isExpanded: false,
              onPressed: _loadContacts,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppColors.bruceGradient.withOpacity(0.1),
              ),
              child: const Center(
                child: Icon(
                  Icons.contacts_outlined,
                  size: 36,
                  color: AppColors.brucePrimary,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No Contacts Found',
              style: AppTextStyles.h3.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sync your phone contacts to find friends on Chat Bruce',
              style: AppTextStyles.bodyMedium.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            AppButton(
              text: 'Sync Contacts',
              icon: Icons.sync,
              onPressed: _isSyncing ? null : _syncContacts,
              isLoading: _isSyncing,
              isExpanded: false,
            ),
          ],
        ),
      ),
    );
  }
}

class ContactUser {
  final String id;
  final String displayName;
  final String phone;
  final String? avatarUrl;
  final bool isOnline;

  ContactUser({
    required this.id,
    required this.displayName,
    required this.phone,
    this.avatarUrl,
    this.isOnline = false,
  });

  factory ContactUser.fromJson(Map<String, dynamic> json) {
    return ContactUser(
      id: json['id'] ?? '',
      displayName: json['display_name'] ?? 'Unknown',
      phone: json['phone'] ?? '',
      avatarUrl: json['avatar_url'],
      isOnline: json['is_online'] ?? false,
    );
  }
}
