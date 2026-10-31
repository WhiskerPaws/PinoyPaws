package com.whiskerpaws.utilitybox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DualTrackerDashboard()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DualTrackerDashboard() {
    var selectedTab by remember { mutableStateOf(0) }
    var dailyUsageCount by remember { mutableStateOf(0) }
    val maxFreeLimit = 3
    
    val tabs = listOf("⚡ Meralco", "📺 Royal Cable", "💧 SPCWD Water")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pinoy Utility Box", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        bottomBar = {
            Column {
                AdmobBannerView()
                TabRow(selectedTabIndex = selectedTab) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = { Text(title, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Global Daily Free Actions: $dailyUsageCount / $maxFreeLimit",
                        fontWeight = FontWeight.Bold,
                        color = if (dailyUsageCount >= maxFreeLimit) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            when (selectedTab) {
                0 -> MeralcoSubModule(isLocked = dailyUsageCount >= maxFreeLimit, onActionExecuted = { dailyUsageCount++ })
                1 -> RoyalCableSubModule(isLocked = dailyUsageCount >= maxFreeLimit, onActionExecuted = { dailyUsageCount++ })
                2 -> SpcwdSubModule(isLocked = dailyUsageCount >= maxFreeLimit, onActionExecuted = { dailyUsageCount++ })
            }
        }
    }
}

@Composable
fun MeralcoSubModule(isLocked: Boolean, onActionExecuted: () -> Unit) {
    var kwhInput by remember { mutableStateOf("") }
    var estimatedBill by remember { mutableStateOf(0.0) }
    val meralcoRatePerKwh = 11.50

    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Meralco Bill Estimator", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(value = kwhInput, onValueChange = { kwhInput = it }, label = { Text("Enter Monthly Consumption (kWh)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { if (!isLocked) { val kwh = kwhInput.toDoubleOrNull() ?: 0.0; estimatedBill = kwh * meralcoRatePerKwh; onActionExecuted() } }, modifier = Modifier.fillMaxWidth().height(50.dp), colors = ButtonDefaults.buttonColors(containerColor = if (isLocked) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)) {
            Text(if (isLocked) "🔒 Watch Ad to Unlock" else "Calculate Meralco Cost")
        }
        if (estimatedBill > 0.0) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(String.format("Estimated Cost: ₱%,.2f PHP", estimatedBill), fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
fun RoyalCableSubModule(isLocked: Boolean, onActionExecuted: () -> Unit) {
    var monthsInput by remember { mutableStateOf("1") }
    var runningTotal by remember { mutableStateOf(0.0) }
    val basePlanRate = 1400.0

    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Royal Cable Bill Tracker", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(value = monthsInput, onValueChange = { monthsInput = it }, label = { Text("Number of Billing Months") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { if (!isLocked) { val months = monthsInput.toDoubleOrNull() ?: 1.0; runningTotal = months * basePlanRate; onActionExecuted() } }, modifier = Modifier.fillMaxWidth().height(50.dp), colors = ButtonDefaults.buttonColors(containerColor = if (isLocked) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.secondary)) {
            Text(if (isLocked) "🔒 Watch Ad to Unlock" else "Project Cable Expenses")
        }
        if (runningTotal > 0.0) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(String.format("Projected Plan Obligation: ₱%,.2f PHP", runningTotal), fontSize = 22.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
        }
    }
}

@Composable
fun SpcwdSubModule(isLocked: Boolean, onActionExecuted: () -> Unit) {
    var accountNoInput by remember { mutableStateOf("") }
    var amountInput by remember { mutableStateOf("") }
    var trackerSavedMessage by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("SPCWD Water Bill Tracker", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.tertiary)
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(value = accountNoInput, onValueChange = { accountNoInput = it }, label = { Text("Enter Water Account Number") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = amountInput, onValueChange = { amountInput = it }, label = { Text("Enter Bill Amount Due (₱)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = {
                if (!isLocked && accountNoInput.isNotBlank() && amountInput.isNotBlank()) {
                    trackerSavedMessage = "Saved! Please pay via GCash App -> Pay Bills -> Water Utilities -> Search 'San Pablo Water District'"
                    onActionExecuted()
                }
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = if (isLocked) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.tertiary)
        ) {
            Text(if (isLocked) "🔒 Watch Ad to Unlock" else "Log & Verify Biller Info")
        }

        if (trackerSavedMessage.isNotBlank()) {
            Spacer(modifier = Modifier.height(20.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("💡 GCash Payment Guide:", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onTertiaryContainer)
                    Text(text = trackerSavedMessage, fontSize = 14.sp, color = MaterialTheme.colorScheme.onTertiaryContainer, modifier = Modifier.padding(top = 4.dp))
                    Text("⚠️ Note: GCash charges an additional ₱15 convenience fee.", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 6.dp))
                }
            }
        }
    }
}

@Composable
fun AdmobBannerView() {
    AndroidView(
        modifier = Modifier.fillMaxWidth().wrapContentHeight(),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = "ca-app-pub-3940256099942544/6300978111"
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}
