package com.whiskerpaws.pdf

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Stores PDFs in app-private storage. */
class DocRepository(private val context: Context) {
    private val dir = File(context.filesDir, "pdfs").apply { mkdirs() }

    private fun stamp() = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())

    fun newFile(prefix: String): File = File(dir, "${prefix}_${stamp()}.pdf")

    fun save(source: Uri): File = copy(source, newFile("Scan"))

    fun importUri(source: Uri): File {
        val name = context.contentResolver.query(source, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { if (it.moveToFirst()) it.getString(0) else null }
            ?.removeSuffix(".pdf")?.replace(Regex("[^A-Za-z0-9._-]"), "_")
            ?: "Imported"
        return copy(source, File(dir, "${name}_${stamp()}.pdf"))
    }

    private fun copy(source: Uri, out: File): File {
        context.contentResolver.openInputStream(source)?.use { input ->
            out.outputStream().use { input.copyTo(it) }
        }
        return out
    }

    fun list(): List<File> =
        dir.listFiles { f -> f.extension == "pdf" }?.sortedByDescending { it.lastModified() }.orEmpty()

    fun delete(file: File) = file.delete()
}
