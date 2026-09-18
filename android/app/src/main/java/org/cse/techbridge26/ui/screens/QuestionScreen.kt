package org.cse.techbridge26.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.cse.techbridge26.network.ApiClient

@Composable
fun QuestionScreen(
    team: ApiClient.TeamInfo,
    roundNumber: Int,
    isRoundRunning: Boolean
) {
    val coroutineScope = rememberCoroutineScope()
    var currentAnswer by remember { mutableStateOf("") }
    var isSubmitted by remember { mutableStateOf(false) }
    var submissionStatusText by remember { mutableStateOf<String?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07090E))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Status & Team Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = team.name,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFF1F5F9)
                )
                Text(
                    text = "ID: ${team.id}",
                    fontSize = 13.sp,
                    color = Color(0xFF06B6D4),
                    fontFamily = FontFamily.Monospace
                )
            }
            Surface(
                color = Color(0xFF0F172A),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Text(
                    text = "ROUND $roundNumber",
                    color = Color(0xFF38BDF8),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }

        Divider(color = Color(0xFF1E293B), modifier = Modifier.padding(vertical = 8.dp))

        if (!isRoundRunning) {
            Box(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Color(0xFF06B6D4), modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "WAITING FOR ORGANIZER",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF1F5F9),
                        letterSpacing = 1.5.sp
                    )
                    Text(
                        text = "Round will start automatically when initiated from control desk",
                        fontSize = 13.sp,
                        color = Color(0xFF94A3B8),
                        modifier = Modifier.padding(top = 6.dp)
                    )
                }
            }
        } else {
            // Visual Rebus Presentation Card
            Card(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF06B6D4).copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0D111A))
            ) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "VISUAL TECHNICAL REBUS CLUE",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF06B6D4),
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )

                    // Rebus Clue Viewport (Secured from save/share/download)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .background(Color(0xFF07090E), RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "[ MULTI-PANEL REBUS CLUE ]",
                            color = Color(0xFF38BDF8),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Text(
                        text = "Identify the core CSE concept represented by the panels",
                        fontSize = 12.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // One-Submission Answer Input
            OutlinedTextField(
                value = currentAnswer,
                onValueChange = { if (!isSubmitted) currentAnswer = it },
                label = { Text("Your Technical Answer") },
                enabled = !isSubmitted && !isSubmitting,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    if (currentAnswer.isNotBlank() && !isSubmitted) {
                        isSubmitting = true
                        coroutineScope.launch {
                            val res = ApiClient.submitAnswer(team.id, "q101", currentAnswer)
                            isSubmitting = false
                            if (res.isSuccess) {
                                isSubmitted = true
                                submissionStatusText = "SUBMITTED & LOCKED. Awaiting next question."
                            }
                        }
                    }
                },
                enabled = !isSubmitted && !isSubmitting && currentAnswer.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isSubmitted) Color(0xFF10B981) else Color(0xFF06B6D4)
                )
            ) {
                Text(
                    text = if (isSubmitted) "LOCKED (ONE SUBMISSION ALLOWED)" else "SUBMIT ANSWER",
                    fontWeight = FontWeight.Bold
                )
            }

            if (submissionStatusText != null) {
                Text(
                    text = submissionStatusText!!,
                    color = Color(0xFF10B981),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
    }
}
