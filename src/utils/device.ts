import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

export async function get_device_info() {
  const brand = Device.brand || '';
  const model_name = Device.modelName || '';
  const device_name = Device.deviceName || '';
  const os_name = Device.osName || Platform.OS;
  const os_version = Device.osVersion || String(Platform.Version);
  const app_version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
  const build_number = Application.nativeBuildVersion || '1';
  const is_device = Device.isDevice;

  let device_id = 'unknown';
  if (Platform.OS === 'android') {
    device_id = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    device_id = await Application.getIosIdForVendorAsync() || 'unknown';
  }

  return {
    platform: Platform.OS,
    brand,
    model_name,
    device_name,
    os_name,
    os_version,
    app_version,
    build_number,
    is_device,
    device_id,
  };
}
