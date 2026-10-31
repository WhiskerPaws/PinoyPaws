package com.whiskerpaws.pdf

import android.content.Context
import java.time.LocalDate

/**
 * Free-tier gate: N scans per day unless Pro.
 * Replace the isPro flag with a RevenueCat entitlement check once billing is wired up.
 */
class UsageLimiter(context: Context) {
    private val prefs = context.getSharedPreferences("usage", Context.MODE_PRIVATE)

    var isPro: Boolean
        get() = prefs.getBoolean("pro", false)
        set(v) = prefs.edit().putBoolean("pro", v).apply()

    fun remainingToday(): Int {
        val today = LocalDate.now().toString()
        if (prefs.getString("day", "") != today) return FREE_SCANS_PER_DAY
        return (FREE_SCANS_PER_DAY - prefs.getInt("count", 0)).coerceAtLeast(0)
    }

    fun recordScan() {
        val today = LocalDate.now().toString()
        val count = if (prefs.getString("day", "") == today) prefs.getInt("count", 0) else 0
        prefs.edit().putString("day", today).putInt("count", count + 1).apply()
    }

    companion object {
        const val FREE_SCANS_PER_DAY = 3
        const val FREE_MERGE_LIMIT = 3
    }
}
