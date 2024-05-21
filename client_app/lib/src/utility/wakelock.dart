import 'package:cycletowork/src/utility/logger.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class WakeLock {
  static Future<void> enable() async {
    try {
      await WakelockPlus.enable();
    } catch (e) {
      Logger.error(e);
    }
  }

  static Future<void> disable() async {
    try {
      await WakelockPlus.disable();
    } catch (e) {
      Logger.error(e);
    }
  }

  static Future<bool> get enabled async {
    return await WakelockPlus.enabled;
  }
}
