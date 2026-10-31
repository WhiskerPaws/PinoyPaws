package com.whiskerpaws.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.io.MemoryUsageSetting
import com.tom_roush.pdfbox.multipdf.PDFMergerUtility
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.PDPage
import com.tom_roush.pdfbox.pdmodel.PDPageContentStream
import com.tom_roush.pdfbox.pdmodel.common.PDRectangle
import com.tom_roush.pdfbox.pdmodel.graphics.image.JPEGFactory
import java.io.File

/** Render scale and JPEG quality for each compression level. HIGH is a Pro option. */
enum class CompressLevel(val label: String, val scale: Float, val quality: Float) {
    LOW("Smallest", 1.0f, 0.5f),
    MEDIUM("Balanced", 1.4f, 0.7f),
    HIGH("Best quality", 2.0f, 0.85f),
}

object PdfTools {
    fun init(context: Context) = PDFBoxResourceLoader.init(context.applicationContext)

    fun pageCount(file: File): Int = PDDocument.load(file).use { it.numberOfPages }

    fun merge(files: List<File>, out: File) {
        val merger = PDFMergerUtility()
        files.forEach { merger.addSource(it) }
        merger.destinationFileName = out.absolutePath
        merger.mergeDocuments(MemoryUsageSetting.setupTempFileOnly())
    }

    /** Extracts pages [from]..[to] (1-based, inclusive) into a new PDF. */
    fun split(src: File, from: Int, to: Int, out: File) {
        PDDocument.load(src).use { doc ->
            PDDocument().use { result ->
                for (i in (from - 1) until to) result.importPage(doc.getPage(i))
                result.save(out)
            }
        }
    }

    /**
     * Shrinks a PDF by re-rendering each page as a JPEG.
     * Trade-off: text becomes an image (no longer selectable/searchable).
     */
    fun compress(src: File, out: File, level: CompressLevel) {
        val pfd = ParcelFileDescriptor.open(src, ParcelFileDescriptor.MODE_READ_ONLY)
        PdfRenderer(pfd).use { renderer ->
            PDDocument().use { doc ->
                for (i in 0 until renderer.pageCount) {
                    renderer.openPage(i).use { p ->
                        val wPt = p.width.toFloat()
                        val hPt = p.height.toFloat()
                        val bmp = Bitmap.createBitmap(
                            (p.width * level.scale).toInt().coerceAtLeast(1),
                            (p.height * level.scale).toInt().coerceAtLeast(1),
                            Bitmap.Config.ARGB_8888
                        )
                        bmp.eraseColor(Color.WHITE)
                        p.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

                        val page = PDPage(PDRectangle(wPt, hPt))
                        doc.addPage(page)
                        val image = JPEGFactory.createFromImage(doc, bmp, level.quality)
                        PDPageContentStream(doc, page).use { it.drawImage(image, 0f, 0f, wPt, hPt) }
                        bmp.recycle()
                    }
                }
                doc.save(out)
            }
        }
    }
}
