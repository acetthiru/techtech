package org.cse.techbridge26.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF06B6D4), // Electric Cyan
    onPrimary = Color(0xFF07090E),
    secondary = Color(0xFF38BDF8),
    tertiary = Color(0xFFF59E0B), // Symposium Amber
    background = Color(0xFF07090E),
    surface = Color(0xFF0D111A),
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
    error = Color(0xFFEF4444)
)

@Composable
fun TechBridgeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
