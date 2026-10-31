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
                    MeralcoTrackerLayout()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeralcoTrackerLayout() {
    var kwhInput by remember { mutableStateOf("") }
    var estimatedBill by remember { mutableStateOf(0.0) }
    var dailyUsageCount by remember { mutableStateOf(0) }
    val maxFreeLimit = 3
    
    // Average baseline electricity rate per kWh in PHP
    val meralcoRatePerKwh = 11.50

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("⚡ Pinoy Meralco Tracker", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        bottomBar = {
            AdmobBannerView()
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Daily Free Computations: $dailyUsageCount / $maxFreeLimit",
                        fontWeight = FontWeight.Bold,
                        color = if (dailyUsageCount >= maxFreeLimit) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = kwhInput,
                onValueChange = { kwhInput = it },
                label = { Text("Enter Monthly Consumption (kWh)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    if (dailyUsageCount < maxFreeLimit) {
                        val kwh = kwhInput.toDoubleOrNull() ?: 0.0
                        estimatedBill = kwh * meralcoRatePerKwh
                        dailyUsageCount++
                    } else {
                        // Reset count or run rewarded monetization ad triggers here
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (dailyUsageCount >= maxFreeLimit) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
            ) {
                if (dailyUsageCount < maxFreeLimit) {
                    Text("Calculate Estimated Bill", fontSize = 16.sp)
                } else {
                    Text("🔒 Watch Ad to Unlock Calculator", fontSize = 16.sp)
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            if (estimatedBill > 0.0) {
                Text("Estimated Total Cost:", fontSize = 18.sp, color = MaterialTheme.colorScheme.outline)
                Text(
                    text = String.format("₱%,.2f PHP", estimatedBill),
                    fontSize = 36.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Calculated at baseline rate of ₱$meralcoRatePerKwh/kWh",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.outline,
                    modifier = Modifier.padding(top = 4.dp)
                )
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
