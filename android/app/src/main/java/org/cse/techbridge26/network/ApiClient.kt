package org.cse.techbridge26.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

object ApiClient {
    // Configured with symposium cloud backend URL (Supports mobile data over public HTTPS)
    var BASE_URL = "https://your-techbridge-cloud-server.run.app"

    private val client = OkHttpClient.Builder()
        .retryOnConnectionFailure(true)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    data class TeamInfo(
        val id: String,
        val name: String,
        val participant1: String,
        val participant2: String?,
        val college: String,
        val phone: String
    )

    private var currentTeam: TeamInfo? = null

    fun saveTeam(team: TeamInfo) {
        currentTeam = team
    }

    fun getSavedTeam(): TeamInfo? = currentTeam

    suspend fun syncStateWithServer() = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder()
                .url("$BASE_URL/api/event")
                .get()
                .build()
            client.newCall(req).execute().close()
        } catch (_: Exception) {}
    }

    suspend fun registerTeam(
        name: String,
        p1: String,
        p2: String?,
        college: String,
        dept: String,
        year: String,
        phone: String
    ): Result<TeamInfo> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("name", name)
                put("participant1", p1)
                put("participant2", p2 ?: "")
                put("college", college)
                put("department", dept)
                put("year", year)
                put("phone", phone)
            }

            val body = json.toString().toRequestBody(JSON_MEDIA)
            val request = Request.Builder()
                .url("$BASE_URL/api/team/register")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            val resStr = response.body?.string() ?: ""

            if (response.isSuccessful) {
                val resJson = JSONObject(resStr)
                val teamObj = resJson.getJSONObject("team")
                val team = TeamInfo(
                    id = teamObj.getString("id"),
                    name = teamObj.getString("name"),
                    participant1 = teamObj.getString("participant1"),
                    participant2 = if (teamObj.has("participant2")) teamObj.getString("participant2") else null,
                    college = teamObj.getString("college"),
                    phone = teamObj.getString("phone")
                )
                saveTeam(team)
                Result.success(team)
            } else {
                val err = JSONObject(resStr).optString("error", "Registration failed")
                Result.failure(IOException(err))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitAnswer(
        teamId: String,
        questionId: String,
        answer: String
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("teamId", teamId)
                put("questionId", questionId)
                put("answer", answer)
            }
            val body = json.toString().toRequestBody(JSON_MEDIA)
            val req = Request.Builder()
                .url("$BASE_URL/api/answer")
                .post(body)
                .build()
            val resp = client.newCall(req).execute()
            Result.success(resp.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendBuzzer(teamId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("teamId", teamId)
                put("questionId", "q301")
            }
            val body = json.toString().toRequestBody(JSON_MEDIA)
            val req = Request.Builder()
                .url("$BASE_URL/api/buzzer")
                .post(body)
                .build()
            val resp = client.newCall(req).execute()
            Result.success(resp.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun postAntiCheatEvent(teamId: String, eventType: String, details: String) =
        withContext(Dispatchers.IO) {
            val json = JSONObject().apply {
                put("teamId", teamId)
                put("eventType", eventType)
                put("details", details)
            }
            val body = json.toString().toRequestBody(JSON_MEDIA)
            val req = Request.Builder()
                .url("$BASE_URL/api/anti-cheat")
                .post(body)
                .build()
            client.newCall(req).execute().close()
        }
}
