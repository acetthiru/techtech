package org.cse.techbridge26

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import org.cse.techbridge26.network.ApiClient
import org.cse.techbridge26.security.AntiCheatManager
import org.cse.techbridge26.ui.screens.HomeScreen
import org.cse.techbridge26.ui.screens.QuestionScreen
import org.cse.techbridge26.ui.screens.BuzzerScreen
import org.cse.techbridge26.ui.theme.TechBridgeTheme

class MainActivity : ComponentActivity() {

    private lateinit var antiCheatManager: AntiCheatManager
    private var isMultiWindowWarningVisible by mutableStateOf(false)
    private var isBackgroundWarningVisible by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ====================================================================
        // ANTI-CHEAT ENFORCEMENT 1: FLAG_SECURE
        // Blocks screenshots, screen-recording, recent apps task thumbnailing,
        // and external display capture wherever supported by Android OS.
        // ====================================================================
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        // Keep screen awake during symposium competition
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        antiCheatManager = AntiCheatManager(this)

        // Check if device is in developer/USB debugging mode
        checkDeveloperSettings()

        // Observe Lifecycle for App Backgrounding / Task Switcher
        lifecycle.addObserver(LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE -> {
                    antiCheatManager.reportViolation(
                        eventType = "APP_BACKGROUND",
                        details = "Participant minimized or left the official competition application."
                    )
                    isBackgroundWarningVisible = true
                }
                Lifecycle.Event.ON_RESUME -> {
                    // Reconnect and verify state with server
                    ApiClient.syncStateWithServer()
                }
                else -> Unit
            }
        })

        // Attempt LockTask / Kiosk mode if supported or provisioned
        tryStartLockTask()

        setContent {
            TechBridgeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF07090E)
                ) {
                    TechBridgeAppRoot(
                        antiCheatManager = antiCheatManager,
                        showMultiWindowWarning = isMultiWindowWarningVisible,
                        showBackgroundWarning = isBackgroundWarningVisible,
                        onDismissWarning = {
                            isBackgroundWarningVisible = false
                            isMultiWindowWarningVisible = false
                        }
                    )
                }
            }
        }
    }

    // ====================================================================
    // ANTI-CHEAT ENFORCEMENT 2: Focus Loss & Window Obscuration
    // ====================================================================
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (!hasFocus) {
            antiCheatManager.reportViolation(
                eventType = "WINDOW_FOCUS_LOST",
                details = "Application lost window focus (possible overlay, split-screen, or system dialog)."
            )
        }
    }

    // ====================================================================
    // ANTI-CHEAT ENFORCEMENT 3: Multi-Window / Split Screen Detection
    // ====================================================================
    override fun onMultiWindowModeChanged(isInMultiWindowMode: Boolean) {
        super.onMultiWindowModeChanged(isInMultiWindowMode)
        if (isInMultiWindowMode) {
            isMultiWindowWarningVisible = true
            antiCheatManager.reportViolation(
                eventType = "MULTI_WINDOW_DETECTED",
                details = "Participant attempted to open Android split-screen or multi-window mode."
            )
        } else {
            isMultiWindowWarningVisible = false
        }
    }

    // ====================================================================
    // ANTI-CHEAT ENFORCEMENT 4: Picture-in-Picture Detection
    // ====================================================================
    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode)
        if (isInPictureInPictureMode) {
            antiCheatManager.reportViolation(
                eventType = "PICTURE_IN_PICTURE",
                details = "Picture-in-picture mode initiated during competition."
            )
        }
    }

    private fun checkDeveloperSettings() {
        try {
            val devEnabled = Settings.Global.getInt(
                contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0
            )
            if (devEnabled != 0) {
                antiCheatManager.reportViolation(
                    eventType = "DEV_TOOLS_DETECTED",
                    details = "Android Developer Options or USB Debugging enabled on participant hardware."
                )
            }
        } catch (_: Exception) {}
    }

    private fun tryStartLockTask() {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (am?.lockTaskModeState == ActivityManager.LOCK_TASK_MODE_NONE) {
                try {
                    startLockTask()
                } catch (_: Exception) {
                    // LockTask requires device owner or pinning confirmation
                }
            }
        }
    }
}

@Composable
fun TechBridgeAppRoot(
    antiCheatManager: AntiCheatManager,
    showMultiWindowWarning: Boolean,
    showBackgroundWarning: Boolean,
    onDismissWarning: () -> Unit
) {
    var registeredTeam by remember { mutableStateOf<ApiClient.TeamInfo?>(ApiClient.getSavedTeam()) }
    var currentRound by remember { mutableIntStateOf(1) }
    var isRoundRunning by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        if (registeredTeam == null) {
            HomeScreen(
                onRegistered = { team ->
                    registeredTeam = team
                    ApiClient.saveTeam(team)
                }
            )
        } else {
            if (currentRound == 3) {
                BuzzerScreen(
                    team = registeredTeam!!,
                    onBuzz = {
                        ApiClient.sendBuzzer(registeredTeam!!.id)
                    }
                )
            } else {
                QuestionScreen(
                    team = registeredTeam!!,
                    roundNumber = currentRound,
                    isRoundRunning = isRoundRunning
                )
            }
        }

        // Anti-Cheat Multi-Window Warning Lockout Overlay
        if (showMultiWindowWarning) {
            AlertDialog(
                onDismissRequest = {},
                title = { Text("SECURITY VIOLATION: SPLIT-SCREEN") },
                text = {
                    Text("Multi-window / Split-screen is strictly forbidden in TECH BRIDGE '26. The competition is locked until you restore full-screen mode.")
                },
                confirmButton = {},
                containerColor = Color(0xFF1E1010),
                titleContentColor = Color(0xFFFF4D4D),
                textContentColor = Color(0xFFF1F5F9)
            )
        }

        // Anti-Cheat Background Warning Dialog
        if (showBackgroundWarning) {
            AlertDialog(
                onDismissRequest = onDismissWarning,
                title = { Text("WARNING: APP LEFT BACKGROUND") },
                text = {
                    Text("Leaving the official competition app is prohibited. This security event has been logged and forwarded to the CSE symposium organizers.")
                },
                confirmButton = {
                    Button(
                        onClick = onDismissWarning,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4))
                    ) {
                        Text("RETURN TO COMPETITION")
                    }
                },
                containerColor = Color(0xFF161922),
                titleContentColor = Color(0xFFFBBF24),
                textContentColor = Color(0xFFF1F5F9)
            )
        }
    }
}
