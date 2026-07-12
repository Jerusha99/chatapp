import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_button.dart';
import '../providers/auth_provider.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String phoneNumber;

  const OtpVerificationScreen({super.key, required this.phoneNumber});

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  int _resendTimer = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _startResendTimer() {
    _resendTimer = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendTimer > 0) {
        setState(() => _resendTimer--);
      } else {
        timer.cancel();
      }
    });
  }

  String get _otpCode => _controllers.map((c) => c.text).join();

  Future<void> _handleVerify() async {
    final otp = _otpCode;
    if (otp.length != 6) {
      context.showAppSnackBar('Please enter the complete code', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ref.read(authProvider.notifier).verifyOtp(
            phone: widget.phoneNumber,
            token: otp,
          );
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar(e.toString(), isError: true);
        for (final c in _controllers) {
          c.clear();
        }
        _focusNodes[0].requestFocus();
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResend() async {
    if (_resendTimer > 0) return;
    try {
      await ref.read(authProvider.notifier).signInWithPhone(widget.phoneNumber);
      _startResendTimer();
      if (mounted) {
        context.showAppSnackBar('Verification code sent!');
      }
    } catch (e) {
      if (mounted) {
        context.showAppSnackBar(e.toString(), isError: true);
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
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.brucePrimary.withOpacity(0.1),
                  ),
                  child: const Icon(
                    Icons.pin_outlined,
                    color: AppColors.brucePrimary,
                    size: 36,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(
                      begin: -0.3,
                      end: 0,
                      duration: 500.ms,
                      curve: Curves.easeOutCubic,
                    ),
                const SizedBox(height: 20),
                Text(
                  'Verification Code',
                  style: AppTextStyles.displayMedium.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight,
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 500.ms),
                const SizedBox(height: 8),
                Text(
                  'Enter the 6-digit code sent to',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight,
                  ),
                ).animate().fadeIn(delay: 150.ms, duration: 500.ms),
                const SizedBox(height: 4),
                Text(
                  widget.phoneNumber,
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight,
                    fontWeight: FontWeight.w600,
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
                const SizedBox(height: 40),
                _buildOtpFields(isDark),
                const SizedBox(height: 32),
                AppButton(
                  text: 'Verify',
                  onPressed: _isLoading ? null : _handleVerify,
                  isLoading: _isLoading,
                ).animate().fadeIn(delay: 400.ms, duration: 500.ms),
                const SizedBox(height: 24),
                _buildResendSection(isDark),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOtpFields(bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(6, (index) {
        return Container(
          width: 48,
          height: 56,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          child: RawKeyboardListener(
            focusNode: FocusNode(),
            onKey: (event) {
              if (event is RawKeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace &&
                  _controllers[index].text.isEmpty &&
                  index > 0) {
                _controllers[index - 1].clear();
                _focusNodes[index - 1].requestFocus();
              }
            },
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              maxLength: 1,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
              decoration: InputDecoration(
                counterText: '',
                filled: true,
                fillColor: _controllers[index].text.isNotEmpty
                    ? AppColors.brucePrimary.withOpacity(0.1)
                    : (isDark
                        ? AppColors.darkSurfaceVariant.withOpacity(0.5)
                        : AppColors.lightSurfaceVariant.withOpacity(0.5)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: _focusNodes[index].hasFocus
                        ? AppColors.brucePrimary
                        : (isDark ? AppColors.darkDivider : AppColors.lightDivider),
                    width: _focusNodes[index].hasFocus ? 2 : 1,
                  ),
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
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(1),
              ],
              onChanged: (value) {
                setState(() {});
                if (value.isNotEmpty && index < 5) {
                  _focusNodes[index + 1].requestFocus();
                } else if (value.isEmpty && index > 0) {
                  _focusNodes[index - 1].requestFocus();
                }
                if (_otpCode.length == 6) {
                  _handleVerify();
                }
              },
            ),
          ),
        ).animate().fadeIn(
              delay: Duration(milliseconds: 250 + index * 50),
              duration: 400.ms,
            );
      }),
    );
  }

  Widget _buildResendSection(bool isDark) {
    return Column(
      children: [
        Text(
          _resendTimer > 0
              ? 'Resend code in ${_resendTimer}s'
              : 'Didn\'t receive the code?',
          style: AppTextStyles.bodySmall.copyWith(
            color: isDark
                ? AppColors.textSecondaryDark
                : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _resendTimer > 0 ? null : _handleResend,
          child: Text(
            'Resend Code',
            style: TextStyle(
              color: _resendTimer > 0
                  ? AppColors.textTertiaryLight
                  : AppColors.brucePrimary,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 600.ms, duration: 500.ms);
  }
}
