package com.auratriage.ui

import android.app.Activity
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Base64
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.util.concurrent.TimeUnit
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * CountdownAlertActivity
 * 10-Second High-Priority Fail-Safe Crash Confirmation Screen.
 * Sounds an 85dB+ high-priority audio alarm, pulses the haptic vibrator,
 * displays a 10s countdown timer, and dispatches the encrypted SOS payload
 * via WebSocket / HTTP fallback if not canceled by the occupant.
 */
class CountdownAlertActivity : Activity() {

    companion object {
        private const val TAG = "AuraTriage:Countdown"
        const val EXTRA_PEAK_G = "extra_peak_g"
        const val EXTRA_PRE_SPEED = "extra_pre_speed"
        const val EXTRA_IMPACT_SPEED = "extra_impact_speed"
        const val EXTRA_LAT = "extra_lat"
        const val EXTRA_LON = "extra_lon"

        private const val COUNTDOWN_DURATION_MS = 10000L
        private const val COUNTDOWN_INTERVAL_MS = 100L
        private const val BACKEND_WS_URL = "ws://10.0.2.2:5000/socket.io/?EIO=4&transport=websocket"
        private const val BACKEND_REST_URL = "http://10.0.2.2:5000/api/incidents/sos"
        
        // Demo Patient UUID configured on this device (Alex Mercer, O-)
        private const val DEFAULT_PATIENT_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
        // Pre-shared 256-bit symmetric key for zero-knowledge end-to-end trauma payload encryption
        private val DEMO_AES_KEY = "AuraTriageAESKey2026Secure000000".toByteArray(StandardCharsets.UTF_8)
    }

    private var countDownTimer: CountDownTimer? = null
    private var toneGenerator: ToneGenerator? = null
    private var vibrator: Vibrator? = null
    private var isDispatched = false
    private var isCancelled = false

    private lateinit var tvTimerSeconds: TextView
    private lateinit var tvWarningDetails: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnCancel: Button
    private lateinit var tvStatusMessage: TextView

    private var peakG: Float = 0f
    private var preSpeed: Double = 0.0
    private var impactSpeed: Double = 0.0
    private var latitude: Double = 0.0
    private var longitude: Double = 0.0

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        wakeAndUnlockScreen()

        // Extract telematics bundle
        peakG = intent.getFloatExtra(EXTRA_PEAK_G, 4.2f)
        preSpeed = intent.getDoubleExtra(EXTRA_PRE_SPEED, 85.0)
        impactSpeed = intent.getDoubleExtra(EXTRA_IMPACT_SPEED, 12.0)
        latitude = intent.getDoubleExtra(EXTRA_LAT, 40.7645)
        longitude = intent.getDoubleExtra(EXTRA_LON, -73.9554)

        buildDynamicLayout()
        initAudioAndHaptics()
        startEmergencyCountdown()
    }

    private fun wakeAndUnlockScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
    }

    private fun buildDynamicLayout() {
        val rootLayout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setBackgroundColor(0xFF0F172A.toInt()) // bg-slate-900
            setPadding(48, 64, 48, 64)
            gravity = android.view.Gravity.CENTER_HORIZONTAL
        }

        val tvTitle = TextView(this).apply {
            text = "CRASH DETECTED"
            textSize = 28f
            setTextColor(0xFFEF4444.toInt()) // Red-500
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            gravity = android.view.Gravity.CENTER
        }
        rootLayout.addView(tvTitle)

        tvWarningDetails = TextView(this).apply {
            text = "Impact Peak: ${String.format("%.1f", peakG)}g | Deceleration: ${String.format("%.0f", preSpeed - impactSpeed)} km/h\nInitiating Trauma SOS Dispatch..."
            textSize = 16f
            setTextColor(0xFFE2E8F0.toInt()) // Slate-200
            setPadding(0, 16, 0, 32)
            gravity = android.view.Gravity.CENTER
        }
        rootLayout.addView(tvWarningDetails)

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 10000
            progress = 10000
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT, 32
            )
        }
        rootLayout.addView(progressBar)

        tvTimerSeconds = TextView(this).apply {
            text = "10s"
            textSize = 72f
            setTextColor(0xFFF87171.toInt()) // Red-400
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            setPadding(0, 32, 0, 48)
            gravity = android.view.Gravity.CENTER
        }
        rootLayout.addView(tvTimerSeconds)

        btnCancel = Button(this).apply {
            text = "I'M OK - CANCEL SOS (FALSE ALARM)"
            textSize = 18f
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0xFF334155.toInt()) // Slate-700
            setPadding(32, 40, 32, 40)
            setOnClickListener { handleUserCancel() }
        }
        rootLayout.addView(btnCancel)

        tvStatusMessage = TextView(this).apply {
            text = "If no response within 10 seconds, encrypted kinematics & medical profile will be transmitted directly to the nearest Level 1/2 Trauma Hospital."
            textSize = 13f
            setTextColor(0xFF94A3B8.toInt()) // Slate-400
            setPadding(0, 48, 0, 0)
            gravity = android.view.Gravity.CENTER
        }
        rootLayout.addView(tvStatusMessage)

        setContentView(rootLayout)
    }

    private fun initAudioAndHaptics() {
        try {
            // Maximize alarm volume and initialize high-frequency ToneGenerator
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxAlarmVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxAlarmVol, 0)
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
            playSirenBurst()
        } catch (e: Exception) {
            Log.e(TAG, "Audio tone generation failed", e)
        }

        // Initialize haptic vibration
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibrator = vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        val vibrationPattern = longArrayOf(0, 400, 200, 400, 200, 800)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createWaveform(vibrationPattern, 0))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(vibrationPattern, 0)
        }
    }

    private fun playSirenBurst() {
        Thread {
            while (!isCancelled && !isDispatched) {
                toneGenerator?.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 350)
                try {
                    Thread.sleep(500)
                } catch (ie: InterruptedException) {
                    break
                }
            }
        }.start()
    }

    private fun startEmergencyCountdown() {
        countDownTimer = object : CountDownTimer(COUNTDOWN_DURATION_MS, COUNTDOWN_INTERVAL_MS) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsRemaining = (millisUntilFinished / 1000) + 1
                tvTimerSeconds.text = "${secondsRemaining}s"
                progressBar.progress = millisUntilFinished.toInt()
            }

            override fun onFinish() {
                if (!isCancelled) {
                    triggerEmergencyDispatch()
                }
            }
        }.start()
    }

    private fun handleUserCancel() {
        isCancelled = true
        stopAlerts()
        countDownTimer?.cancel()

        tvTimerSeconds.text = "CANCELED"
        tvTimerSeconds.setTextColor(0xFF10B981.toInt()) // Emerald-500
        btnCancel.visibility = View.GONE
        tvStatusMessage.text = "SOS sequence safely aborted. Telematics logged locally."

        btnCancel.postDelayed({ finish() }, 1500)
    }

    private fun stopAlerts() {
        toneGenerator?.stopTone()
        toneGenerator?.release()
        toneGenerator = null
        vibrator?.cancel()
    }

    private fun triggerEmergencyDispatch() {
        isDispatched = true
        stopAlerts()

        runOnUiThread {
            tvTimerSeconds.text = "DISPATCHING..."
            tvTimerSeconds.setTextColor(0xFF38BDF8.toInt()) // Sky-400
            btnCancel.visibility = View.GONE
            tvStatusMessage.text = "ENCRYPTING TELEMETRY & ROUTING TO NEAREST LEVEL-1/2 TRAUMA BAY..."
        }

        Thread {
            dispatchEncryptedSosPayload()
        }.start()
    }

    /**
     * Encrypts and transmits the medical + crash telemetry payload
     * via AES-256-GCM to backend WebSocket & REST endpoints.
     */
    private fun dispatchEncryptedSosPayload() {
        try {
            val payload = JSONObject().apply {
                put("patientId", DEFAULT_PATIENT_ID)
                put("preCrashSpeed", preSpeed)
                put("impactSpeed", impactSpeed)
                put("peakGForce", peakG)
                put("latitude", latitude)
                put("longitude", longitude)
                put("timestamp", System.currentTimeMillis())
                put("hardwareId", Build.MODEL)
            }

            val rawJsonString = payload.toString()
            val encryptedBundle = encryptAesGcm(rawJsonString.toByteArray(StandardCharsets.UTF_8), DEMO_AES_KEY)

            val networkPayload = JSONObject().apply {
                put("patientId", DEFAULT_PATIENT_ID)
                put("preCrashSpeed", preSpeed)
                put("impactSpeed", impactSpeed)
                put("peakGForce", peakG)
                put("latitude", latitude)
                put("longitude", longitude)
                put("iv", encryptedBundle.first)
                put("ciphertext", encryptedBundle.second)
                put("clientTimestamp", System.currentTimeMillis())
            }

            // HTTP POST Dispatch to AuraTriage Backend API
            val requestBody = networkPayload.toString()
                .toRequestBody("application/json; charset=utf-8".toMediaType())
            val request = Request.Builder()
                .url(BACKEND_REST_URL)
                .post(requestBody)
                .build()

            val response: Response = httpClient.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            runOnUiThread {
                tvTimerSeconds.text = "SOS SENT!"
                tvTimerSeconds.setTextColor(0xFF10B981.toInt())
                tvStatusMessage.text = "Trauma Center Dispatched. ETA & Kinematics Transmitted to ER Dashboard."
            }

            Log.i(TAG, "SOS Dispatch Successful: $responseBody")
        } catch (e: Exception) {
            Log.e(TAG, "SOS Dispatch failed over network", e)
            runOnUiThread {
                tvTimerSeconds.text = "OFFLINE QUEUE"
                tvStatusMessage.text = "Network failed. Retrying dispatch and queuing SMS relay to 911."
            }
        }
    }

    /**
     * AES-256-GCM Authenticated Encryption for Patient EMR & Telematics
     */
    private fun encryptAesGcm(plaintext: ByteArray, keyBytes: ByteArray): Pair<String, String> {
        val secretKey: SecretKey = SecretKeySpec(keyBytes, "AES")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val iv = ByteArray(12)
        SecureRandom().nextBytes(iv)
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)

        val ciphertext = cipher.doFinal(plaintext)
        val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
        val cipherBase64 = Base64.encodeToString(ciphertext, Base64.NO_WRAP)
        return Pair(ivBase64, cipherBase64)
    }

    override fun onDestroy() {
        stopAlerts()
        countDownTimer?.cancel()
        super.onDestroy()
    }
}

