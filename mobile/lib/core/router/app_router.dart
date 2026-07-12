import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/auth/screens/phone_login_screen.dart';
import '../../features/auth/screens/otp_verification_screen.dart';
import '../../features/chats/screens/chats_list_screen.dart';
import '../../features/chats/screens/create_chat_screen.dart';
import '../../features/messages/screens/chat_screen.dart';
import '../../features/contacts/screens/contacts_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const LoginScreen(),
        ),
      ),
      GoRoute(
        path: '/signup',
        name: 'signup',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const SignupScreen(),
        ),
      ),
      GoRoute(
        path: '/phone-login',
        name: 'phone-login',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const PhoneLoginScreen(),
        ),
      ),
      GoRoute(
        path: '/otp-verification',
        name: 'otp-verification',
        pageBuilder: (context, state) {
          final phoneNumber = state.uri.queryParameters['phone'] ?? '';
          return _buildPage(
            state: state,
            child: OtpVerificationScreen(phoneNumber: phoneNumber),
          );
        },
      ),
      GoRoute(
        path: '/',
        name: 'chats-list',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const ChatsListScreen(),
        ),
      ),
      GoRoute(
        path: '/chat/:chatId',
        name: 'chat',
        pageBuilder: (context, state) {
          final chatId = state.pathParameters['chatId']!;
          final chatName = state.uri.queryParameters['name'] ?? 'Chat';
          return _buildPage(
            state: state,
            child: ChatScreen(chatId: chatId, chatName: chatName),
          );
        },
      ),
      GoRoute(
        path: '/contacts',
        name: 'contacts',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const ContactsScreen(),
        ),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const ProfileScreen(),
        ),
      ),
      GoRoute(
        path: '/edit-profile',
        name: 'edit-profile',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const EditProfileScreen(),
        ),
      ),
      GoRoute(
        path: '/create-chat',
        name: 'create-chat',
        pageBuilder: (context, state) => _buildPage(
          state: state,
          child: const CreateChatScreen(),
        ),
      ),
    ],
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final isAuthenticated = auth.valueOrNull != null;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup' ||
          state.matchedLocation == '/phone-login' ||
          state.matchedLocation == '/otp-verification';

      if (!isAuthenticated && !isAuthRoute) return '/login';
      if (isAuthenticated && isAuthRoute) return '/';
      return null;
    },
  );
});

CustomTransitionPage<void> _buildPage({
  required GoRouterState state,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 300),
    reverseTransitionDuration: const Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final isNewRoute = secondaryAnimation.isCompleted;
      final beginOffset = isNewRoute
          ? const Offset(0.3, 0.0)
          : const Offset(-0.3, 0.0);

      final slideAnimation = Tween<Offset>(
        begin: beginOffset,
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      ));

      final fadeAnimation = Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.easeOut,
      ));

      return SlideTransition(
        position: slideAnimation,
        child: FadeTransition(
          opacity: fadeAnimation,
          child: child,
        ),
      );
    },
  );
}
