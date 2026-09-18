package org.cse.techbridge26.security

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.cse.techbridge26.network.ApiClient

/**
 * AntiCheatManager
 * Coordinates device security checks and transmits violation events
 * to the authoritative Tech Bridge '26 symposium server.
 */
class AntiCheatManager(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO)
    private var violationCount = 0

    fun reportViolation(eventType: String, details: String) {
        violationCount++
        val team = ApiClient.getSavedTeam()
        val teamId = team?.id ?: "UNREGISTERED_DEVICE"

        scope.launch {
            try {
                ApiClient.postAntiCheatEvent(
                    teamId = teamId,
                    eventType = eventType,
                    details = "Violation #$violationCount: $details"
                )
            } catch (e: Exception) {
                // Network error buffer queue if mobile data temporarily disconnected
            }
        }
    }

    fun getViolationCount(): Int = violationCount
}
