package org.cse.techbridge26.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.cse.techbridge26.network.ApiClient

@Composable
fun BuzzerScreen(
    team: ApiClient.TeamInfo,
    onBuzz: () -> Unit
) {
    var hasBuzzed by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07090E))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "ROUND 3: GRAND FINALE",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFEF4444),
                letterSpacing = 2.sp
            )
            Text(
                text = "LIVE DIGITAL BUZZER",
                fontSize = 14.sp,
                color = Color(0xFF94A3B8),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        // The Digital Buzzer Button
        Box(
            modifier = Modifier
                .size(240.dp)
                .shadow(24.dp, shape = CircleShape, spotColor = Color(0xFFEF4444))
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = if (hasBuzzed) listOf(Color(0xFF10B981), Color(0xFF047857))
                        else listOf(Color(0xFFFF3333), Color(0xFF990000))
                    )
                )
                .border(6.dp, Color(0xFF1E293B), CircleShape)
                .clickable(
                    enabled = !hasBuzzed,
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    hasBuzzed = true
                    onBuzz()
                },
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (hasBuzzed) "BUZZED!" else "BUZZ",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = 3.sp
                )
                Text(
                    text = if (hasBuzzed) "SERVER REGISTERED" else "TAP INSTANTLY",
                    fontSize = 11.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        Text(
            text = "Fastest atomic server timestamp wins speaking right for 3 points",
            fontSize = 12.sp,
            color = Color(0xFF64748B),
            modifier = Modifier.padding(bottom = 16.dp)
        )
    }
}
