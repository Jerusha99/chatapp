import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authProvider = StreamNotifierProvider<AuthNotifier, AsyncValue<User?>>(AuthNotifier.new);

class AuthNotifier extends StreamNotifier<AsyncValue<User?>> {
  late final AuthRepository _repository;
  StreamSubscription<AuthState>? _subscription;

  @override
  Stream<AsyncValue<User?>> build() async* {
    _repository = ref.read(authRepositoryProvider);
    yield AsyncValue.data(_repository.currentUser);

    await for (final state in _repository.authStateChanges) {
      final event = state.event;
      final session = state.session;

      switch (event) {
        case AuthChangeEvent.signedIn:
        case AuthChangeEvent.tokenRefreshed:
          yield AsyncValue.data(session?.user);
          break;
        case AuthChangeEvent.signedOut:
          yield const AsyncValue.data(null);
          break;
        case AuthChangeEvent.passwordRecovery:
          break;
        case AuthChangeEvent.initialSession:
          yield AsyncValue.data(session?.user);
          break;
        default:
          yield AsyncValue.data(session?.user);
      }
    }
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      await _repository.signUp(
        email: email,
        password: password,
        displayName: displayName,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    try {
      await _repository.signIn(
        email: email,
        password: password,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signInWithPhone(String phoneNumber) async {
    try {
      await _repository.signInWithPhone(phoneNumber);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> verifyOtp({
    required String phone,
    required String token,
  }) async {
    try {
      await _repository.verifyOtp(
        phone: phone,
        token: token,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await _repository.signOut();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfile({
    String? displayName,
    String? avatarUrl,
  }) async {
    try {
      await _repository.updateProfile(
        displayName: displayName,
        avatarUrl: avatarUrl,
      );
    } catch (e) {
      rethrow;
    }
  }

  User? get currentUser => _repository.currentUser;
  String? get userDisplayName => _repository.userDisplayName;
  String? get userAvatarUrl => _repository.userAvatarUrl;
}
