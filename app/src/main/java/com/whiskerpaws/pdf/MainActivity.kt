package com.whiskerpaws.pdf

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.ads.MobileAds

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MobileAds.initialize(this)
        setContent { MaterialTheme { AppRoot() } }
    }
}

@Composable
fun AppRoot(vm: MainViewModel = viewModel()) {
    val isPro by vm.isPro.collectAsStateWithLifecycle()
    val showPaywall by vm.showPaywall.collectAsStateWithLifecycle()
    val busy by vm.busy.collectAsStateWithLifecycle()
    val message by vm.message.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(message) {
        message?.let { snackbar.showSnackbar(it); vm.clearMessage() }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            Column {
                if (!isPro) AdBanner(Modifier.fillMaxWidth())
                NavigationBar {
                    NavigationBarItem(
                        selected = tab == 0, onClick = { tab = 0 },
                        icon = { Icon(Icons.Default.DocumentScanner, null) }, label = { Text("Scan") }
                    )
                    NavigationBarItem(
                        selected = tab == 1, onClick = { tab = 1 },
                        icon = { Icon(Icons.Default.Build, null) }, label = { Text("Tools") }
                    )
                }
            }
        }
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            if (tab == 0) HomeScreen(vm) else ToolsScreen(vm)
            busy?.let { label ->
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.scrim.copy(alpha = 0.5f)) {
                    Column(Modifier.fillMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                        CircularProgressIndicator()
                        Spacer(Modifier.height(12.dp))
                        Text(label, color = MaterialTheme.colorScheme.onPrimary)
                    }
                }
            }
        }
    }

    if (showPaywall) {
        AlertDialog(
            onDismissRequest = vm::dismissPaywall,
            title = { Text("Upgrade to Pro") },
            text = { Text("Unlimited scans, merge any number of files, best-quality compression, and no ads.") },
            confirmButton = {
                if (BuildConfig.DEBUG) Button(onClick = vm::unlockProDebug) { Text("Unlock (debug)") }
                else TextButton(onClick = vm::dismissPaywall) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = vm::dismissPaywall) { Text("Not now") } }
        )
    }
}
