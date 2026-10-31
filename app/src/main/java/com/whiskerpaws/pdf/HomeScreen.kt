package com.whiskerpaws.pdf

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import java.io.File
import java.text.DateFormat
import java.util.Date

@Composable
fun HomeScreen(vm: MainViewModel) {
    val ctx = LocalContext.current
    val activity = remember(ctx) { ctx.findActivity() }
    val docs by vm.docs.collectAsStateWithLifecycle()
    val isPro by vm.isPro.collectAsStateWithLifecycle()
    val remaining by vm.remaining.collectAsStateWithLifecycle()

    val scanLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            GmsDocumentScanningResult.fromActivityResultIntent(result.data)?.pdf?.uri?.let(vm::onScanned)
        }
    }
    val importLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        if (uris.isNotEmpty()) vm.importDocs(uris)
    }

    fun startScan() {
        if (!vm.requestScan()) return
        val options = GmsDocumentScannerOptions.Builder()
            .setGalleryImportAllowed(true)
            .setPageLimit(if (isPro) 50 else 5)
            .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_PDF)
            .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
            .build()
        GmsDocumentScanning.getClient(options)
            .getStartScanIntent(activity)
            .addOnSuccessListener { scanLauncher.launch(IntentSenderRequest.Builder(it).build()) }
    }

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
            Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("WhiskerPaws", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.weight(1f))
                IconButton(onClick = { importLauncher.launch(arrayOf("application/pdf")) }) {
                    Icon(Icons.Default.FileUpload, "Import PDF")
                }
                if (!isPro) TextButton(onClick = { vm.showPaywall.value = true }) { Text("Go Pro") }
            }
            if (!isPro) Text("$remaining free scans left today", style = MaterialTheme.typography.labelLarge)
            Spacer(Modifier.height(8.dp))
            if (docs.isEmpty()) {
                Box(Modifier.fillMaxSize(), Alignment.Center) { Text("No documents yet. Tap Scan or import a PDF.") }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), contentPadding = PaddingValues(bottom = 88.dp)) {
                    items(docs, key = { it.name }) { file -> DocRow(file, onDelete = { vm.delete(file) }) }
                }
            }
        }
        ExtendedFloatingActionButton(
            onClick = ::startScan,
            icon = { Icon(Icons.Default.DocumentScanner, null) },
            text = { Text("Scan") },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        )
    }
}

@Composable
private fun DocRow(file: File, onDelete: () -> Unit) {
    val ctx = LocalContext.current
    Card(Modifier.fillMaxWidth()) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(file.name, style = MaterialTheme.typography.titleSmall)
                Text(
                    "${DateFormat.getDateTimeInstance().format(Date(file.lastModified()))} · ${file.length() / 1024} KB",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            IconButton(onClick = { share(ctx, file) }) { Icon(Icons.Default.Share, "Share") }
            IconButton(onClick = onDelete) { Icon(Icons.Default.Delete, "Delete") }
        }
    }
}

private fun share(ctx: Context, file: File) {
    val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.fileprovider", file)
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    ctx.startActivity(Intent.createChooser(intent, "Share PDF"))
}

private fun Context.findActivity(): Activity {
    var c = this
    while (c is ContextWrapper) {
        if (c is Activity) return c
        c = c.baseContext
    }
    error("No Activity found")
}
