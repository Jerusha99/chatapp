import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/helpers.dart';

class VoiceMessageWidget extends StatefulWidget {
  final String audioUrl;
  final int duration;
  final bool isMine;

  const VoiceMessageWidget({
    super.key,
    required this.audioUrl,
    required this.duration,
    required this.isMine,
  });

  @override
  State<VoiceMessageWidget> createState() => _VoiceMessageWidgetState();
}

class _VoiceMessageWidgetState extends State<VoiceMessageWidget> {
  bool _isPlaying = false;
  double _progress = 0.0;
  late List<double> _waveformBars;

  @override
  void initState() {
    super.initState();
    _waveformBars = _generateWaveform();
  }

  List<double> _generateWaveform() {
    final seed = widget.audioUrl.hashCode;
    final random = seed.abs();
    return List.generate(28, (index) {
      final value = ((random + index * 7) % 10) / 10.0;
      return 0.15 + value * 0.85;
    });
  }

  void _togglePlayback() {
    setState(() => _isPlaying = !_isPlaying);
    if (_isPlaying) {
      _simulatePlayback();
    }
  }

  void _simulatePlayback() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted || !_isPlaying) return false;
      setState(() {
        _progress += 1.0 / (widget.duration * 10);
        if (_progress >= 1.0) {
          _progress = 0.0;
          _isPlaying = false;
          return false;
        }
      });
      return true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final textColor = widget.isMine
        ? Colors.white
        : Theme.of(context).brightness == Brightness.dark
            ? AppColors.textPrimaryDark
            : AppColors.textPrimaryLight;

    final subTextColor = widget.isMine
        ? Colors.white.withOpacity(0.7)
        : Theme.of(context).brightness == Brightness.dark
            ? AppColors.textSecondaryDark
            : AppColors.textSecondaryLight;

    final barColor = widget.isMine
        ? Colors.white.withOpacity(0.4)
        : AppColors.brucePrimary.withOpacity(0.3);

    final activeBarColor = widget.isMine
        ? Colors.white
        : AppColors.brucePrimary;

    return SizedBox(
      width: 200,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: _togglePlayback,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: widget.isMine
                        ? Colors.white.withOpacity(0.2)
                        : AppColors.brucePrimary.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isPlaying ? Icons.pause : Icons.play_arrow_rounded,
                    color: widget.isMine ? Colors.white : AppColors.brucePrimary,
                    size: 18,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SizedBox(
                  height: 28,
                  child: CustomPaint(
                    painter: _WaveformPainter(
                      bars: _waveformBars,
                      progress: _progress,
                      barColor: barColor,
                      activeBarColor: activeBarColor,
                    ),
                    size: const Size(double.infinity, 28),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatProgress(_progress, widget.duration),
                style: AppTextStyles.labelSmall.copyWith(
                  color: subTextColor,
                  fontSize: 10,
                ),
              ),
              Text(
                Helpers.formatDuration(Duration(seconds: widget.duration)),
                style: AppTextStyles.labelSmall.copyWith(
                  color: subTextColor,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatProgress(double progress, int totalSeconds) {
    final currentSeconds = (progress * totalSeconds).floor();
    final minutes = currentSeconds ~/ 60;
    final seconds = currentSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }
}

class _WaveformPainter extends CustomPainter {
  final List<double> bars;
  final double progress;
  final Color barColor;
  final Color activeBarColor;

  _WaveformPainter({
    required this.bars,
    required this.progress,
    required this.barColor,
    required this.activeBarColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final barWidth = 2.5;
    final spacing = (size.width - bars.length * barWidth) / (bars.length - 1);

    for (var i = 0; i < bars.length; i++) {
      final x = i * (barWidth + spacing);
      final barHeight = bars[i] * size.height;
      final y = (size.height - barHeight) / 2;
      final progressPoint = progress * bars.length;

      final paint = Paint()
        ..color = i < progressPoint ? activeBarColor : barColor
        ..borderRadius = BorderRadius.circular(barWidth / 2);

      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, y, barWidth, barHeight),
          const Radius.circular(1.25),
        ),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _WaveformPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
