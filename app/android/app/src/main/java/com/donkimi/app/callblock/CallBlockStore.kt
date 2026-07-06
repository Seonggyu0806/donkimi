package com.donkimi.app.callblock

import android.content.Context

/**
 * 차단 번호 저장소.
 * SharedPreferences(StringSet)에 정규화된 번호를 저장하며,
 * CallScreeningService(전화 수신 시)와 RN 모듈(앱 UI)이 함께 사용한다.
 */
object CallBlockStore {
    private const val PREFS = "donkimi_callblock"
    private const val KEY = "blocked_numbers"

    /**
     * 번호 정규화: 숫자만 남기고, 한국 국가번호(+82)를 0으로 변환.
     * 예) "+82 10-1234-5678" → "01012345678", "010-1234-5678" → "01012345678"
     */
    fun normalize(raw: String?): String {
        if (raw == null) return ""
        var digits = raw.filter { it.isDigit() }
        if (digits.startsWith("82") && digits.length >= 9) {
            digits = "0" + digits.substring(2)
        }
        return digits
    }

    fun getBlocked(context: Context): Set<String> =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getStringSet(KEY, emptySet()) ?: emptySet()

    fun isBlocked(context: Context, raw: String?): Boolean {
        val n = normalize(raw)
        return n.isNotEmpty() && getBlocked(context).contains(n)
    }

    fun add(context: Context, raw: String): Boolean {
        val n = normalize(raw)
        if (n.isEmpty()) return false
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val set = HashSet(getBlocked(context))
        val added = set.add(n)
        prefs.edit().putStringSet(KEY, set).apply()
        return added
    }

    fun remove(context: Context, raw: String): Boolean {
        val n = normalize(raw)
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val set = HashSet(getBlocked(context))
        val removed = set.remove(n)
        prefs.edit().putStringSet(KEY, set).apply()
        return removed
    }
}
