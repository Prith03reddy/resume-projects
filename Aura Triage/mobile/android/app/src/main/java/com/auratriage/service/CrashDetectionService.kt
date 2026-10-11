package com.auratriage.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.auratriage.ui.CountdownAlertActivity
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import java.util.ArrayDeque
import kotlin.math.sqrt

/**
 * CrashDetectionService
 * Background Android Foreground Service performing continuous sensor fusion:
 * - Linear Acceleration (gravity-compensated) via Sensor.TYPE_LINEAR_ACCELERATION
 * - Real-time vehicle speed and coordinates via FusedLocationProviderClient
 * - Evaluates dual physics thresholds: Deceleration (Δv >= 40 km/h in 1s) AND Impact (>= 3.8g)
 */
class CrashDetectionService : Service(), SensorEventListener {

    companion object {
        private const val TAG = "AuraTriage:CrashService"
        const val ACTION_START_MONITORING = "com.auratriage.action.START_MONITORING"
        const val ACTION_STOP_MONITORING = "com.auratriage.action.STOP_MONITORING"
        private const val NOTIFICATION_ID = 9110
        private const val CHANNEL_ID = "auratriage_active_telemetry"

        // Physics Threshold Constants
        private const val STANDARD_GRAVITY = 9.80665f // m/s^2
        private const val MIN_IMPACT_G_FORCE = 3.8f  // 3.8g (~37.26 m/s^2)
        private const val MIN_DECELERATION_KMH = 40.0 // 40 km/h speed drop
        private const val DECEL_WINDOW_MS = 1200L     // ~1-second analysis window
        private const val COOLDOWN_LOCK_MS = 15000L   // Prevent duplicate triggers
    }

    data class SpeedSample(val timestampMs: Long, val speedKmh: Double, val location: Location?)

    private lateinit var sensorManager: SensorManager
    private var linearAccelerometer: Sensor? = null
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    // Rolling circular window for speed samples (stores last 5 seconds)
    private val speedHistory = ArrayDeque<SpeedSample>()
    private val historyLock = Any()

    @Volatile
    private var lastCrashTriggerTimestamp = 0L

    @Volatile
    private var currentSpeedKmh: Double = 0.0

    @Volatile
    private var lastKnownLocation: Location? = null

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        linearAccelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        setupLocationUpdates()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START_MONITORING

        when (action) {
            ACTION_START_MONITORING -> {
                val vehicle = intent?.getStringExtra("EXTRA_VEHICLE_NAME") ?: "Active Vehicle"
                startForeground(NOTIFICATION_ID, buildForegroundNotification("Monitoring road dynamics: $vehicle"))
                registerSensors()
                startLocationUpdates()
                Log.i(TAG, "AuraTriage edge telemetry monitoring initiated.")
            }
            ACTION_STOP_MONITORING -> {
                unregisterSensors()
                stopLocationUpdates()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                Log.i(TAG, "AuraTriage edge telemetry monitoring terminated.")
            }
        }
        return START_STICKY
    }

    private fun registerSensors() {
        linearAccelerometer?.let { sensor ->
            // SENSOR_DELAY_FASTEST / SENSOR_DELAY_GAME for high-frequency collision peak sampling
            sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
        } ?: Log.e(TAG, "Hardware does not support TYPE_LINEAR_ACCELERATION!")
    }

    private fun unregisterSensors() {
        sensorManager.unregisterListener(this)
    }

    private fun setupLocationUpdates() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                val location = locationResult.lastLocation ?: return
                val now = System.currentTimeMillis()
                val speedKmh = if (location.hasSpeed()) (location.speed * 3.6) else 0.0

                currentSpeedKmh = speedKmh
                lastKnownLocation = location

                synchronized(historyLock) {
                    speedHistory.addLast(SpeedSample(now, speedKmh, location))
                    // Prune history older than 5 seconds
                    while (speedHistory.isNotEmpty() && (now - speedHistory.first.timestampMs) > 5000L) {
                        speedHistory.removeFirst()
                    }
                }
            }
        }
    }

    private fun startLocationUpdates() {
        try {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 500L)
                .setMinUpdateIntervalMillis(250L)
                .setMinUpdateDistanceMeters(0f)
                .build()

            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper())
        } catch (se: SecurityException) {
            Log.e(TAG, "Missing ACCESS_FINE_LOCATION permission", se)
        }
    }

    private fun stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    // --- High-Speed Sensor Fusion & Physics Verification ---
    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || event.sensor.type != Sensor.TYPE_LINEAR_ACCELERATION) return

        val ax = event.values[0]
        val ay = event.values[1]
        val az = event.values[2]

        // Vector magnitude of linear acceleration: sqrt(ax^2 + ay^2 + az^2)
        val linearAccelMps2 = sqrt((ax * ax + ay * ay + az * az).toDouble())
        val currentGForce = (linearAccelMps2 / STANDARD_GRAVITY).toFloat()

        // Fast reject if impact does not exceed 3.8g
        if (currentGForce < MIN_IMPACT_G_FORCE) return

        val now = System.currentTimeMillis()
        if (now - lastCrashTriggerTimestamp < COOLDOWN_LOCK_MS) {
            return // Prevent duplicate triggering during sustained secondary impacts
        }

        // Trigger Condition 2 Met: Linear acceleration spike >= 3.8g (~37.2 m/s^2)
        // Now verify Trigger Condition 1 (Deceleration): Speed drop >= 40 km/h in <= 1s window
        val decelEvaluation = evaluateDecelerationInWindow(now)

        if (decelEvaluation.isDecelMet) {
            lastCrashTriggerTimestamp = now
            Log.w(TAG, "!!! COLLISION CONFIRMED !!!")
            Log.w(TAG, "Peak G-Force: ${String.format("%.2f", currentGForce)}g (>= ${MIN_IMPACT_G_FORCE}g)")
            Log.w(TAG, "Speed Drop: ${String.format("%.1f", decelEvaluation.deltaV)} km/h (Pre: ${decelEvaluation.preCrashSpeedKmh} km/h -> Post: ${decelEvaluation.terminalSpeedKmh} km/h)")

            executeEmergencyProtocol(
                peakG = currentGForce,
                preSpeed = decelEvaluation.preCrashSpeedKmh,
                impactSpeed = decelEvaluation.terminalSpeedKmh,
                location = lastKnownLocation
            )
        }
    }

    private data class DecelResult(
        val isDecelMet: Boolean,
        val deltaV: Double,
        val preCrashSpeedKmh: Double,
        val terminalSpeedKmh: Double
    )

    private fun evaluateDecelerationInWindow(impactTimeMs: Long): DecelResult {
        synchronized(historyLock) {
            if (speedHistory.isEmpty()) {
                // If GPS speed history is cold, fallback to pre-crash speed estimate based on current speed
                return DecelResult(false, 0.0, currentSpeedKmh, currentSpeedKmh)
            }

            var maxSpeedInWindow = 0.0
            val windowStartTime = impactTimeMs - DECEL_WINDOW_MS

            for (sample in speedHistory) {
                if (sample.timestampMs in windowStartTime..impactTimeMs) {
                    if (sample.speedKmh > maxSpeedInWindow) {
                        maxSpeedInWindow = sample.speedKmh
                    }
                }
            }

            val terminalSpeed = currentSpeedKmh
            val deltaV = maxSpeedInWindow - terminalSpeed

            val condition1Met = deltaV >= MIN_DECELERATION_KMH
            return DecelResult(
                isDecelMet = condition1Met,
                deltaV = deltaV,
                preCrashSpeedKmh = maxSpeedInWindow,
                terminalSpeedKmh = terminalSpeed
            )
        }
    }

    private fun executeEmergencyProtocol(peakG: Float, preSpeed: Double, impactSpeed: Double, location: Location?) {
        val lat = location?.latitude ?: 40.7645 // Defaults to metro coordinates for fallback
        val lon = location?.longitude ?: -73.9554

        // Launch the 10-second fail-safe countdown screen
        val countdownIntent = Intent(this, CountdownAlertActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            putExtra(CountdownAlertActivity.EXTRA_PEAK_G, peakG)
            putExtra(CountdownAlertActivity.EXTRA_PRE_SPEED, preSpeed)
            putExtra(CountdownAlertActivity.EXTRA_IMPACT_SPEED, impactSpeed)
            putExtra(CountdownAlertActivity.EXTRA_LAT, lat)
            putExtra(CountdownAlertActivity.EXTRA_LON, lon)
        }
        startActivity(countdownIntent)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AuraTriage Crash Protection",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors vehicle dynamics for autonomous emergency dispatch"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(contentText: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AuraTriage Road Shield Active")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}

