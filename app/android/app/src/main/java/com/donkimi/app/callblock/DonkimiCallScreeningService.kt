package com.donkimi.app.callblock

import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log

/**
 * 안드로이드 통화 스크리닝 서비스.
 * 앱이 "통화 스크리닝 역할(ROLE_CALL_SCREENING)"을 부여받으면,
 * 모든 수신 전화가 벨이 울리기 전에 이 서비스를 먼저 거친다.
 * 차단 목록에 있는 번호면 즉시 거절(벨도 안 울림).
 */
class DonkimiCallScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        // 발신 전화는 건드리지 않음 (수신만 심사)
        if (callDetails.callDirection != Call.Details.DIRECTION_INCOMING) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val rawNumber = callDetails.handle?.schemeSpecificPart
        val blocked = CallBlockStore.isBlocked(this, rawNumber)
        Log.i("DonkimiCallBlock", "수신 전화 심사: ${CallBlockStore.normalize(rawNumber)} → ${if (blocked) "차단" else "허용"}")

        val response = if (blocked) {
            CallResponse.Builder()
                .setDisallowCall(true)      // 통화 차단
                .setRejectCall(true)        // 거절 처리
                .setSkipNotification(true)  // 부재중 알림도 남기지 않음
                .build()
        } else {
            CallResponse.Builder().build() // 정상 수신
        }
        respondToCall(callDetails, response)
    }
}
