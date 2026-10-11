package com.auratriage.receiver

import android.bluetooth.BluetoothClass
import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.auratriage.service.CrashDetectionService

/**
 * BluetoothTriggerReceiver
 * Listens for vehicle Bluetooth connection/disconnection events.
 * Automatically wakes up the high-frequency sensor fusion driving service
 * when the user enters and connects to their vehicle.
 */
class BluetoothTriggerReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AuraTriage:BTReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
        }

        when (action) {
            BluetoothDevice.ACTION_ACL_CONNECTED -> {
                if (device != null && isVehicleAudioDevice(device)) {
                    Log.i(TAG, "Vehicle Bluetooth Connected: ${device.name} [${device.address}]. Starting AuraTriage Service.")
                    startDrivingService(context, device.name ?: "Vehicle Audio")
                }
            }
            BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                if (device != null && isVehicleAudioDevice(device)) {
                    Log.i(TAG, "Vehicle Bluetooth Disconnected: ${device.name}. Stopping AuraTriage Service.")
                    stopDrivingService(context)
                }
            }
        }
    }

    /**
     * Determines whether the connected Bluetooth peripheral is a car kit or hands-free system.
     */
    private fun isVehicleAudioDevice(device: BluetoothDevice): Boolean {
        val bluetoothClass = device.bluetoothClass ?: return true // Fallback to safe activation
        val deviceClass = bluetoothClass.deviceClass
        val majorDeviceClass = bluetoothClass.majorDeviceClass

        val isCarAudio = deviceClass == BluetoothClass.Device.AUDIO_VIDEO_CAR_AUDIO ||
                deviceClass == BluetoothClass.Device.AUDIO_VIDEO_HANDSFREE ||
                deviceClass == BluetoothClass.Device.AUDIO_VIDEO_WEARABLE_HEADSET

        val isAudioMajor = majorDeviceClass == BluetoothClass.Device.Major.AUDIO_VIDEO

        val name = device.name?.lowercase() ?: ""
        val nameIndicatesCar = name.contains("car") || name.contains("sync") ||
                name.contains("uconnect") || name.contains("auto") ||
                name.contains("bmw") || name.contains("audi") || name.contains("toyota")

        return isCarAudio || (isAudioMajor && nameIndicatesCar)
    }

    private fun startDrivingService(context: Context, vehicleName: String) {
        val serviceIntent = Intent(context, CrashDetectionService::class.java).apply {
            action = CrashDetectionService.ACTION_START_MONITORING
            putExtra("EXTRA_VEHICLE_NAME", vehicleName)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }

    private fun stopDrivingService(context: Context) {
        val serviceIntent = Intent(context, CrashDetectionService::class.java).apply {
            action = CrashDetectionService.ACTION_STOP_MONITORING
        }
        context.startService(serviceIntent)
    }
}

