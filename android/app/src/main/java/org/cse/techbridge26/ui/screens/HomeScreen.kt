package org.cse.techbridge26.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.cse.techbridge26.network.ApiClient

@Composable
fun HomeScreen(
    onRegistered: (ApiClient.TeamInfo) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var teamName by remember { mutableStateOf("") }
    var participant1 by remember { mutableStateOf("") }
    var participant2 by remember { mutableStateOf("") }
    var collegeName by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("Computer Science & Engineering") }
    var year by remember { mutableStateOf("3rd Year") }
    var phone by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07090E))
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "TECH BRIDGE '26",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF06B6D4),
            letterSpacing = 2.sp
        )
        Text(
            text = "Visual Technical Rebus Challenge",
            fontSize = 14.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0D111A))
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "TEAM REGISTRATION",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFFF1F5F9),
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                OutlinedTextField(
                    value = teamName,
                    onValueChange = { teamName = it },
                    label = { Text("Team Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = participant1,
                    onValueChange = { participant1 = it },
                    label = { Text("Participant 1 (Lead)") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = participant2,
                    onValueChange = { participant2 = it },
                    label = { Text("Participant 2 (Optional)") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = collegeName,
                    onValueChange = { collegeName = it },
                    label = { Text("College Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = department,
                    onValueChange = { department = it },
                    label = { Text("Department") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Mobile Phone Number") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorMessage != null) {
                    Text(
                        text = errorMessage!!,
                        color = Color(0xFFEF4444),
                        fontSize = 13.sp,
                        modifier = Modifier.padding(top = 12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        if (teamName.isBlank() || participant1.isBlank() || collegeName.isBlank() || phone.isBlank()) {
                            errorMessage = "Please complete all mandatory fields"
                            return@Button
                        }
                        isLoading = true
                        errorMessage = null
                        coroutineScope.launch {
                            val res = ApiClient.registerTeam(
                                name = teamName,
                                p1 = participant1,
                                p2 = participant2.ifBlank { null },
                                college = collegeName,
                                dept = department,
                                year = year,
                                phone = phone
                            )
                            isLoading = false
                            res.onSuccess { team ->
                                onRegistered(team)
                            }.onFailure { ex ->
                                errorMessage = ex.message ?: "Registration failed"
                            }
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4))
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = Color(0xFF07090E), modifier = Modifier.size(24.dp))
                    } else {
                        Text("ENTER SYMPOSIUM ARENA", color = Color(0xFF07090E), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
