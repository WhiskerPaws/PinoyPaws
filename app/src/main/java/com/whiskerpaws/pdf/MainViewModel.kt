package com.whiskerpaws.pdf

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = DocRepository(app)
    private val limiter = UsageLimiter(app)

    val docs = MutableStateFlow(repo.list())
    val isPro = MutableStateFlow(limiter.isPro)
    val remaining = MutableStateFlow(limiter.remainingToday())
    val showPaywall = MutableStateFlow(false)
    val busy = MutableStateFlow<String?>(null)
    val message = MutableStateFlow<String?>(null)

    init { PdfTools.init(app) }

    // ---- Scanning ----
    /** True if the scan may proceed; otherwise shows the paywall. */
    fun requestScan(): Boolean {
        val ok = isPro.value || limiter.remainingToday() > 0
        if (!ok) showPaywall.value = true
        return ok
    }

    fun onScanned(uri: Uri) {
        repo.save(uri)
        limiter.recordScan()
        refresh()
    }

    fun importDocs(uris: List<Uri>) = runTask("Importing…") { uris.forEach(repo::importUri) }

    fun delete(file: File) { repo.delete(file); refresh() }

    // ---- Tools ----
    suspend fun pageCount(file: File): Int = withContext(Dispatchers.IO) {
        runCatching { PdfTools.pageCount(file) }.getOrDefault(0)
    }

    fun merge(files: List<File>) {
        if (!isPro.value && files.size > UsageLimiter.FREE_MERGE_LIMIT) { showPaywall.value = true; return }
        runTask("Merging…") { PdfTools.merge(files, repo.newFile("Merged")) }
    }

    fun split(file: File, from: Int, to: Int) =
        runTask("Splitting…") { PdfTools.split(file, from, to, repo.newFile("Split")) }

    fun compress(file: File, level: CompressLevel) {
        if (level == CompressLevel.HIGH && !isPro.value) { showPaywall.value = true; return }
        runTask("Compressing…") {
            val out = repo.newFile("Compressed")
            PdfTools.compress(file, out, level)
            val saved = 100 - (out.length() * 100 / file.length().coerceAtLeast(1))
            message.value = if (saved > 0) "Done: ${saved}% smaller" else "Done (already small; size unchanged)"
        }
    }

    // ---- Paywall / UI state ----
    fun dismissPaywall() { showPaywall.value = false }
    fun clearMessage() { message.value = null }

    /** Debug builds only. Replace with a real purchase flow (RevenueCat / Play Billing). */
    fun unlockProDebug() {
        limiter.isPro = true
        isPro.value = true
        showPaywall.value = false
    }

    private fun runTask(label: String, block: () -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            busy.value = label
            try {
                block()
                if (message.value == null) message.value = "Done"
            } catch (e: Exception) {
                message.value = "Failed: ${e.message ?: "unknown error"}"
            } finally {
                busy.value = null
                refresh()
            }
        }
    }

    private fun refresh() {
        docs.value = repo.list()
        remaining.value = limiter.remainingToday()
    }
}
